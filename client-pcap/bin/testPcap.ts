import * as pcapp from 'pcap-parser'
import RtpPacket from 'greenlight-rtp';
import GameStreamingProtocol from 'greenlight-gamestreaming-protocol';
import PcapIP from '../main/helpers/pcap/ip';
import PcapUDP from '../main/helpers/pcap/udp';
import * as fs from 'fs';

import { AckTypes as DataMessageAckTypes } from 'greenlight-gamestreaming-protocol/dist/src/formats/MuxDCTChannel/Data/Message';

class testPcap {

    pcapSession
    gsProtocol = new GameStreamingProtocol()
    packetId = 0

    clientip

    constructor(){
        // this.pcapSession = pcapp.parse('/Volumes/Data/poc/xcloud-streaming-node/pcaps/ios_local_21052022_filtered.pcap')
        this.pcapSession = pcapp.parse('/Volumes/Data/poc/xcloud-streaming-node/pcaps/button_test_02072022.pcap')

        this.pcapSession.on('packet', (packet) => ( this.processPacket(packet) ))

        this.pcapSession.on('end', () => {
            console.log('main/ipc/pcap.ts: Pcap file loaded.')
            this.endProcessVideo()
            this.endProcessAudio()
        })

        this.pcapSession.on('error', (error) => {
            console.log('main/ipc/pcap.ts: Error loading pcap file:', error)
        })
    }

    processPacket(packet){

        this.packetId++

        // if (this.packetId == 99)
        //     return 
            
        packet = this.readPacket(packet)
    }

    readPacket(packet){
        let offset = 0 // 14 if you have ether frames. 0 if your capture does not (in case of ios)

        // Check if we have an ipv4 header. If not we assume we have ether frames and skip those.
        if(packet.data[0] !== 0x45) {
            offset = 14
        }
        
        packet.ip = new PcapIP(packet.data.slice(offset+0, offset+20))
        packet.udp = new PcapUDP(packet.data.slice(offset+20, offset+28))
        offset = offset+28

        // We have a Teredo header.
        if(packet.data[offset] === 0x60) {
            offset = offset+48
        }

        if(packet.data[offset] === 0x80){
            const rtpData = packet.data.slice(offset)

            if(this.clientip === undefined){
                this.clientip = packet.ip.src_address
            }

            const rtpHandler = new RtpPacket()
            rtpHandler.load(rtpData)
            const SrtpCrypto = rtpHandler.getSrtpCrypto()
            // const crypto = new SrtpCrypto('/WKQp0Dcu2QFMHdHuH7JkyiW6ijkhLzGlaYY8gxv') // ios_local_21052022_filtered
            const crypto = new SrtpCrypto('vV9cuxwCpZ2iKGVFJhdLBcQ2mfSRzFvPj7+vTQbq') // button_test_02072022
            const payload = crypto.decrypt(rtpHandler)
            packet.rtp_packet = rtpHandler
            packet.decrypted_payload = payload

            // Read decrypted data using new library
            packet.gs_payload = this.gsProtocol.lookup(packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc, payload)
            const output = this.processEnginePacket(packet)
            // console.log(packet.gs_payload)
            if(output !== undefined)
                console.log('['+((packet.ip.src_address === this.clientip) ? '->' : '<-')+']' + output)
        }

        return packet
    }

    processEnginePacket(packet){
        const typeTree = this.buildFormatTree(packet.gs_payload)

        // Collect Video Data
        if(packet.rtp_packet.header.ssrc == 1026){
            this.processVideoPacket(packet.gs_payload)
        }

        if(packet.rtp_packet.header.ssrc == 1027){
            this.processAudioPacket(packet.gs_payload)
        }

        return '['+this.packetId+'] [SSRC='+packet.rtp_packet.header.ssrc+'] [H'+
            ((packet.gs_payload._headers?.timestamp) ? ' ts=' + packet.gs_payload._headers.timestamp : '            ')+
            ((packet.gs_payload._headers?.confirm) ? ' con=' + packet.gs_payload._headers.confirm : '         ')+
            ((packet.gs_payload._headers?.sequence) ? ' seq=' + packet.gs_payload._headers.sequence : '         ')+
        '] '+typeTree
    }

    buildFormatTree(payload){
        if(payload !== undefined){
            // ((payload._type !== undefined) && payload._type === 'MuxDCTControl') ? console.log(payload) : ''

            return '<'+((payload._type !== undefined) ? payload._type : 'Buffer['+payload.length+']')+(
                ((payload._type !== undefined) && payload._type === 'MuxDCTControl') ? ((payload.name && payload.name.length > 0) ? ' name=' + payload.name : '') :
                // ((payload._type !== undefined) && payload._type === 'MuxDCTChannel') ? ((payload.timestamp !== undefined) ? ' ts=' + payload.timestamp : '') :
                ((payload._type !== undefined) && payload._type === 'DataMessageFormat') ? ' #'+payload.frameId+' ackType='+DataMessageAckTypes[payload.ackType]+' key='+payload.key+' value['+payload.value.length+']' :
                ((payload._type !== undefined) && payload._type === 'FrameVideoFormat') ? ' #'+payload.frameId+' ts='+payload.relativeTimestamp+((payload.metadata.length > 0) ? ' [metadata]' : '' )+'' :
                ((payload._type !== undefined) && payload._type === 'DataDataVideoFormat') ? ' #'+payload.frameId+' ts='+payload.relativeTimestamp+'' :
                ((payload._type !== undefined) && payload._type === 'DataDataAudioFormat') ? ' #'+payload.frameId+' ts='+payload.relativeTimestamp+'' : ''
            )+'> ' + this.buildFormatTree(payload.data)
        } else {
            return ''
        }
    }

    processVideoPacket(payload){
        // if(payload.data?.data === undefined &&payload.data?.data?.data?.getType === undefined && payload.data?.data?.data?.getType() === 'DataDataVideoFormat'){
        //     console.log('\/-- Has video data')
        // }

        if((!(payload.data instanceof Buffer)) && (payload.data.getType() === 'ConfigAckFormat' || payload.data.getType() === 'FrameFormat')){
            if(payload.data.data.getType() === 'FrameVideoFormat'){
                if(payload.data.data.data instanceof Buffer){
                    // console.log('\\/-- Has video data')
                    this.processVideoData(payload.data.data)
                }
            }
        }
    }

    processAudioPacket(payload){
        // if(payload.data?.data === undefined &&payload.data?.data?.data?.getType === undefined && payload.data?.data?.data?.getType() === 'DataDataVideoFormat'){
        //     console.log('\/-- Has audio data')
        // }

        if((!(payload.data instanceof Buffer)) && (payload.data.getType() === 'DataDataAudioFormat')){
            if(payload.data.data instanceof Buffer){
                // console.log('\\/-- Has audio data')
                this.processAudioData(payload.data)
            }
        }
    }



    // Video Dumper
    videoFrameBuffer = {}
    multiFrameBuffer = {}
    collectVideoData = false

    processVideoData(payload){
        // console.log(payload)

        if(payload.totalPackets > 1){

            if(! this.multiFrameBuffer[payload.frameId]){
                this.multiFrameBuffer[payload.frameId] = {
                    data: Buffer.alloc(payload.totalSize, Buffer.from('00', 'hex')),
                    metadata: '',
                    size: payload.totalSize,
                    bytesWrote: 0
                }
            }

            payload.metadata.copy(this.multiFrameBuffer[payload.frameId].data, 0)
            payload.data.copy(this.multiFrameBuffer[payload.frameId].data, payload.metadata.length+payload.dataOffset)
            this.multiFrameBuffer[payload.frameId].bytesWrote = this.multiFrameBuffer[payload.frameId].bytesWrote+payload.data.length
            
            if(payload.metadata.length > 0){
                this.multiFrameBuffer[payload.frameId].metadata = payload.metadata
            }

            // Check if packet is complete, then lets move it into the framebuffer
            if(this.multiFrameBuffer[payload.frameId].bytesWrote >= this.multiFrameBuffer[payload.frameId].size){

                if(this.collectVideoData === false && payload.unknown2 > 5){
                    this.collectVideoData = true
                    // this.videoFrameBuffer = []
                }

                this.videoFrameBuffer[payload.frameId] = {
                    metadata: this.multiFrameBuffer[payload.frameId].metadata,
                    data: Buffer.concat([this.multiFrameBuffer[payload.frameId].data])
                }
                delete this.multiFrameBuffer[payload.frameId]
            }
        } else {
            if(this.collectVideoData === true){
                this.videoFrameBuffer[payload.frameId] = {
                    metadata: payload.metadata,
                    data: Buffer.concat([payload.metadata, payload.data])
                }
            }
        }
    }

    endProcessVideo(){

        const videoFile = fs.openSync('../video.pcap.mp4', 'w+')

        for(const frame in this.videoFrameBuffer){
            fs.writeSync(videoFile, Buffer.concat([this.videoFrameBuffer[frame].data]))
        }

        fs.closeSync(videoFile);
        console.log(__filename+'[endProcessVideo] video.pcap.mp4 has been written.')
    }



    // Audio Dumper
    audioFrameBuffer = {}

    processAudioData(payload){
        this.audioFrameBuffer[payload.frameId] = {
            data: payload.data
        }
    }

    endProcessAudio(){

        const audioFile = fs.openSync('../audio.pcap.ogg', 'w+')

        for(const frame in this.audioFrameBuffer){
            fs.writeSync(audioFile, Buffer.concat([this.audioFrameBuffer[frame].data]))
        }

        fs.closeSync(audioFile);
        console.log(__filename+'[endProcessVideo] audio.pcap.ogg has been written.')
    }
}

new testPcap()