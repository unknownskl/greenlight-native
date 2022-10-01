import { Socket } from "dgram"
import RtpPacket from 'greenlight-rtp'
import channels from './channels'
import Events from './events'
import SynPacket from './packets/core/syn'

export default class GameStreaming {

    socket:Socket
    target

    events:Events
    channels = {
        CoreChannel: undefined,
        ControlChannel: undefined,
        QosChannel: undefined,
        VideoChannel: undefined,
        AudioChannel: undefined,
        MessagingChannel: undefined,
        ChatAudioChannel: undefined,
        InputChannel: undefined,
        InputFeedbackChannel: undefined,
    }

    constructor(socket:Socket, address:string, port:number, srtpkey:string){
        this.socket = socket
        this.target = {
            address: address,
            port: port,
            srtpkey: srtpkey
        }
        this.events = new Events(this)

        console.log('---[ GameStreaming Client ]------------------------------------------')
        console.log('- Connecting to:', address +':'+ port)
        console.log('- Srtp key:', srtpkey)
        console.log('---[ Starting connection... ]----------------------------------------')

        this.setupEvents()
        this.startHandshake()
    }

    setupEvents(){
        this.socket.on('message', (msg, rinfo) => { this.onMessage(msg, rinfo) })

        for(const channel in channels){
            this.channels[channel] = new channels[channel](this)
        }
    }

    onMessage(buffer, rinfo){
        if(buffer[1] === 0x01)
            return

        if(buffer[0] === 0x80){
            const packet = new RtpPacket()
            packet.load(buffer)
            const SrtpCrypto = packet.getSrtpCrypto()
            const crypto = new SrtpCrypto(this.target.srtpkey)
            const payload = crypto.decrypt(packet)

            this.routePacket(packet, payload, rinfo)

        } else {
            console.log('[CLIENT] Received non-gamestreaming packet:', buffer.toString('hex'))
        }
    }

    routePacket(packet, payload, rinfo){
        console.log('[CLIENT] recv [ssrc='+packet.header.ssrc+', seq='+packet.header.sequence+', pt='+packet.header.payloadType+']', payload)

        switch(packet.header.ssrc){
            case 0:
                this.channels.CoreChannel.route(packet, payload, rinfo)
                break

            case 1024:
                this.channels.ControlChannel.route(packet, payload, rinfo)
                break

            // case 1025:
            //     this.channels.QosChannel.route()
            //     break

            // case 1026:
            //     this.channels.VideoChannel.route()
            //     break

            // case 1027:
            //     this.channels.AudioChannel.route()
            //     break

            // case 1028:
            //     this.channels.MessagingChannel.route()
            //     break

            // case 1029:
            //     this.channels.ChatAudioChannel.route()
            //     break

            // case 1030:
            //     this.channels.InputChannel.route()
            //     break

            // case 1031:
            //     this.channels.InputFeedbackChannel.route()
            //     break

            default:
                console.log('[CLIENT] Unknown SSRC channel:', packet.header.ssrc)
                break
        }
    }

    _sessionHandshakeInterval

    startHandshake(){
        this.channels.CoreChannel.startHandshake()
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