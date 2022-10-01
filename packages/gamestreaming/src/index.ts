import { Socket } from "dgram"
import RtpPacket from 'greenlight-rtp'
import SynPacket from './packets/core/syn'

export default class GameStreaming {

    socket:Socket
    target

    constructor(socket:Socket, address:string, port:number, srtpkey:string){
        this.socket = socket
        this.target = {
            address: address,
            port: port,
            srtpkey: srtpkey
        }

        console.log('---[ GameStreaming Client ]------------------------------------------')
        console.log('- Connecting to:', address +':'+ port)
        console.log('- Srtp key:', srtpkey)
        console.log('---[ Starting connection... ]----------------------------------------')

        this.startHandshake()
    }

    _sessionHandshakeInterval

    startHandshake(){
        console.log('[CORE] Starting UDP MTU handshake')

        let mtuSize = 1436+16
        this._sessionHandshakeInterval = setInterval(() => {
            const payload = new SynPacket({ mtu_size: 1436 }).toPacket()
            mtuSize = mtuSize-16

            if(payload !== undefined){
                console.log('[CORE] Sending mtu syn:', mtuSize)
                this.send(payload.slice(0, mtuSize))
            }

            if(mtuSize <= 1207){
                if(this._sessionHandshakeInterval !== undefined)
                    clearInterval(this._sessionHandshakeInterval)
            }
        }, 1) // Use an interval instead of an while loop to have concurrency
    }

    _rtpSequence = 0

    send(decoded_payload:Buffer, ssrc = 0, payloadType = 102, marker = 0){
        const rtpPacket:RtpPacket = new RtpPacket()
        rtpPacket.header.payloadType = payloadType
        rtpPacket.header.marker = marker
        rtpPacket.header.sequence = this._rtpSequence
        rtpPacket.header.ssrc = ssrc

        // Encrypt packet
        const SrtpCrypto = rtpPacket.getSrtpCrypto()
        rtpPacket.payload = decoded_payload
        // console.log('SRTPKEY:', this.target.srtpkey)
        const crypto = new SrtpCrypto(this.target.srtpkey)
        const encrypted_payload = crypto.encrypt(rtpPacket)
        rtpPacket.payload = encrypted_payload

        // Send packet
        const packet = rtpPacket.serialize()
        this.socket.send(packet, this.target.port, this.target.address)

        this._rtpSequence++
    }
}