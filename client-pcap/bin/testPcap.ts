import * as pcapp from 'pcap-parser'
import RtpPacket from 'greenlight-rtp';
import GameStreamingProtocol from 'greenlight-gamestreaming-protocol';
import PcapIP from '../main/helpers/pcap/ip';
import PcapUDP from '../main/helpers/pcap/udp';

class testPcap {

    pcapSession
    gsProtocol = new GameStreamingProtocol()
    packetId = 1

    constructor(){
        console.log(pcapp)
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
            const crypto = new SrtpCrypto('vV9cuxwCpZ2iKGVFJhdLBcQ2mfSRzFvPj7+vTQbq')
            const payload = crypto.decrypt(rtpHandler)
            packet.rtp_packet = rtpHandler
            packet.decrypted_payload = payload

            console.log('Reading packet id:', this.packetId)

            // Read decrypted data using new library
            packet.gs_payload = this.gsProtocol.lookup(packet.rtp_packet.header.payloadType, packet.rtp_packet.header.ssrc, payload)
        }

        this.packetId++

        return packet
    }
}

new testPcap()