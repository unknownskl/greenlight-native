import { ipcMain } from 'electron';
import pcapp from 'pcap-parser';
import RtpPacket from 'greenlight-rtp';
import GameStreamingProtocol from 'greenlight-gamestreaming-protocol';

import PcapIP from '../helpers/pcap/ip';
import PcapUDP from '../helpers/pcap/udp';

export default class IpcPcap {
    IpcHandler
    pcapData = [];
    gsProtocol = new GameStreamingProtocol()

    constructor(IpcHandler) {
        this.IpcHandler = IpcHandler

        ipcMain.on('pcap', (event, arg) => {
            console.log('main/ipc/pcap.ts: Received IPC [app] event:', arg)

            if(arg.type == 'openFile'){
                this.loadFile(arg.path).then(() => {

                    event.sender.send('app', {
                        type: 'loadFileData'
                    })
                    console.log('main/ipc/pcap.ts: Sent IPC [app] event response')

                }).catch((error) => {
                    console.log('main/ipc/pcap.ts: Reject from promise:', error)
                })

            } else if(arg.type == 'openPacketList'){
                this.generatePacketList().then((list) => {

                    event.sender.send('packetlist', {
                        type: 'loadPacketList',
                        data: list
                    })
                    console.log('main/ipc/pcap.ts: Sent IPC [packetlist] event response')

                }).catch((error) => {
                    console.log('main/ipc/pcap.ts: Reject from promise:', error)
                })

            } else if(arg.type == 'openPacketId'){
                this.loadPacketId(arg.id).then((packet) => {

                    event.sender.send('packetpanel', {
                        type: 'loadPacket',
                        id: arg.id,
                        data: packet
                    })
                    console.log('main/ipc/pcap.ts: Sent IPC [packetpanel] event response')

                }).catch((error) => {
                    console.log('main/ipc/pcap.ts: Reject from promise:', error)
                })

            }
        })
    }

    loadFile(path) {
        return new Promise((resolve, reject) => {
            console.log('main/ipc/pcap.ts: Loading pcap file:', path)
            this.pcapData = []
            const session = pcapp.parse(path)

            session.on('packet', (packet) => (this.processPacket(packet)))

            session.on('end', () => {
                console.log('main/ipc/pcap.ts: Pcap file loaded:', path)
                console.log('main/ipc/pcap.ts:  Loaded', this.pcapData.length, 'packets')
                resolve(true)
            })

            session.on('error', (error) => {
                console.log('main/ipc/pcap.ts: Error loading pcap file:', error)
                reject(true)
            })
        })
    }

    loadPacketId(id) {
        return new Promise((resolve, reject) => {
            if(this.pcapData[id]){
                if(this.pcapData[id].rtp_packet){
                    // const rtpHandler = new RtpPacket()
                    // rtpHandler.load(rtpData)
                    const SrtpCrypto = this.pcapData[id].rtp_packet.getSrtpCrypto()
                    const crypto = new SrtpCrypto('vV9cuxwCpZ2iKGVFJhdLBcQ2mfSRzFvPj7+vTQbq')
                    const payload = crypto.decrypt(this.pcapData[id].rtp_packet)
                    // packet.rtp_packet = rtpHandler
                    this.pcapData[id].decrypted_payload = payload

                    // Decode using new protocol code
                    this.pcapData[id].gs_payload = this.gsProtocol.lookup(this.pcapData[id].rtp_packet.header.payloadTypeReal, this.pcapData[id].rtp_packet.header.ssrc, payload)
                }

                resolve(this.pcapData[id])
            } else {
                reject('Packet id does not exist: '+id)
            }
        })
    }
    
    generatePacketList() {
        return new Promise((resolve, reject) => {
            const packetList = []

            for(const packet in this.pcapData){
                // console.log(this.pcapData[packet])
                packetList.push({
                    id: packet,
                    text: (this.pcapData[packet].is_teredo === true ? '<Teredo> ' : '') +
                        (this.pcapData[packet].rtp_packet !== undefined ? '<RTP pt='+ this.pcapData[packet].rtp_packet.header.payloadTypeReal +' seq='+ this.pcapData[packet].rtp_packet.header.sequence +' ssrc='+ this.pcapData[packet].rtp_packet.header.ssrc +'>' : '') + 
                        'Packet 1',
                    is_from_console: this.pcapData[packet].is_from_console
                })
            }

            resolve(packetList)
        })
    }

    processPacket(packet) {
        packet.is_teredo = false
        packet.rtp_packet = undefined
        packet.is_from_console = false

        let offset = 0 // 14 if you have ether frames. 0 if your capture does not (in case of ios)

        // Check if we have an ipv4 header. If not we assume we have ether frames and skip those.
        if(packet.data[0] !== 0x45) {
            offset = 14
        }
        
        packet.ip = new PcapIP(packet.data.slice(offset+0, offset+20))
        packet.udp = new PcapUDP(packet.data.slice(offset+20, offset+28))
        offset = offset+28

        console.log(packet.ip, packet.udp)

        if((packet.udp.src_port === 3074 || packet.udp.src_port === 4835)){
            packet.is_from_console = true
        }

        // We have a Teredo header.
        if(packet.data[offset] === 0x60) {
            packet.is_teredo = true
            offset = offset+48
        }

        if(packet.data[offset] === 0x80){
            const rtpData = packet.data.slice(offset)

            const rtpHandler = new RtpPacket()
            rtpHandler.load(rtpData)
            // const SrtpCrypto = rtpHandler.getSrtpCrypto()
            // const crypto = new SrtpCrypto('lC0ksH7p/7grrb4WJOOSdxybmMILwa6QAscIYJEX')
            // const payload = crypto.decrypt(rtpHandler)
            packet.rtp_packet = rtpHandler
            // packet.decrypted_payload = payload
        }

        console.log(RtpPacket, packet)
        this.pcapData.push(packet)
    }
}