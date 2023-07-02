import * as pcapp from 'pcap-parser'
import RtpPacket from 'greenlight-rtp';
import GameStreamingProtocol from 'greenlight-gamestreaming-protocol';
import PcapIP from '../main/helpers/pcap/ip';
import PcapUDP from '../main/helpers/pcap/udp';

class testPcap {

    pcapSession
    gsProtocol = new GameStreamingProtocol()
    packetId = 0

    constructor(){
        console.log(pcapp)
        // this.pcapSession = pcapp.parse('/Volumes/Data/poc/xcloud-streaming-node/pcaps/ios_local_21052022_filtered.pcap')
        this.pcapSession = pcapp.parse('/Volumes/Data/poc/xcloud-streaming-node/pcaps/button_test_02072022.pcap')

        this.pcapSession.on('packet', (packet) => ( this.processPacket(packet) ))

        this.pcapSession.on('end', () => {
            console.log('main/ipc/pcap.ts: Pcap file loaded.')
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

            const rtpHandler = new RtpPacket()
            rtpHandler.load(rtpData)
            const SrtpCrypto = rtpHandler.getSrtpCrypto()
            // const crypto = new SrtpCrypto('/WKQp0Dcu2QFMHdHuH7JkyiW6ijkhLzGlaYY8gxv') // ios_local_21052022_filtered
            const crypto = new SrtpCrypto('vV9cuxwCpZ2iKGVFJhdLBcQ2mfSRzFvPj7+vTQbq') // button_test_02072022
            const payload = crypto.decrypt(rtpHandler)
            packet.rtp_packet = rtpHandler
            packet.decrypted_payload = payload

            // console.log('Reading packet id:', this.packetId)

            if(rtpHandler.header.ssrc == 1031)
                return {}

            if(rtpHandler.header.ssrc == 1030)
                return {}

            // Read decrypted data using new library
            packet.gs_payload = this.gsProtocol.lookup(packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc, payload)

            this.processEnginePacket(packet)
        }

        return packet
    }

    processEnginePacket(packet){

        // console.log(packet.gs_payload)

        let typeTree = ''
        if(packet.gs_payload.data !== undefined){ typeTree += '<'+packet.gs_payload.data._type+'>'}
        if(packet.gs_payload.data?.data !== undefined){ typeTree += '<'+((packet.gs_payload.data.data._type !== undefined) ? packet.gs_payload.data.data._type : 'Buffer['+packet.gs_payload.data.data.length+']')+'>'}
        if(packet.gs_payload.data?.data?.data !== undefined){ typeTree += '<'+((packet.gs_payload.data.data.data._type !== undefined) ? packet.gs_payload.data.data.data._type : 'Buffer['+packet.gs_payload.data.data.data.length+']')+'>'}
        if(packet.gs_payload.data?.data?.data?.data !== undefined){ typeTree += '<'+((packet.gs_payload.data.data.data.data._type !== undefined) ? packet.gs_payload.data.data.data.data._type : 'Buffer['+packet.gs_payload.data.data.data.data.length+']')+'>'}

        console.log('['+this.packetId+'] [SSRC='+packet.rtp_packet.header.ssrc+'] '+packet.gs_payload.getType()+' '+typeTree)

    }
}

new testPcap()