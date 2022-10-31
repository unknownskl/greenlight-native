import { Socket } from "dgram"
import RtpPacket from 'greenlight-rtp'
import channels from './channels'
import Events from './events'

import * as fs from 'fs'
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

    _rtpSequence = 0
    _clientSequence = 99 // Next one will be 100.
    _serverSequence = 99
    _serverSequenceChanged = false
    _mtu = 0

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

        // Events:
        // application_qos_policy -> QOS Policy retrieved
        // application_messaging_message -> On message
        // application_disconnect -> on disconnect [todo]

        setInterval(() => {
            console.log('-- 1 sec interval. SRTP:', this.target.srtpkey)
        }, 1000)

        let callAmount = 0;
        process.on('SIGINT', () => {
            if(callAmount < 1) {
                // this.emit('application_disconnect', {})
                fs.writeFileSync('./video.mp4', this.channels.VideoChannel._videoBuffer.getBuffer(), { flag: 'w+' })

                setTimeout(() => process.exit(0), 1000);
            }
        });
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
        // console.log('[CLIENT] recv [ssrc='+packet.header.ssrc+', seq='+packet.header.sequence+', pt='+packet.header.payloadType+']', payload)

        // // if(packet.header.sequence > this._serverSequence){
        //     this._serverSequence = packet.header.sequence
        //     this._serverSequenceChanged = true
        // // }

        switch(packet.header.ssrc){
            case 0:
                this.channels.CoreChannel.route(packet, payload, rinfo)
                break

            case 1024:
                this.channels.ControlChannel.route(packet, payload, rinfo)
                break

            case 1025:
                this.channels.QosChannel.route(packet, payload, rinfo)
                break

            case 1026:
                this.channels.VideoChannel.route(packet, payload, rinfo)
                break

            case 1027:
                this.channels.AudioChannel.route(packet, payload, rinfo)
                break

            case 1028:
                this.channels.MessagingChannel.route(packet, payload, rinfo)
                break

            case 1029:
                this.channels.ChatAudioChannel.route(packet, payload, rinfo)
                break

            case 1030:
                this.channels.InputChannel.route(packet, payload, rinfo)
                break

            case 1031:
                this.channels.InputFeedbackChannel.route(packet, payload, rinfo)
                break

            default:
                console.log('[CLIENT] Unknown SSRC channel:', packet.header.ssrc)
                break
        }
    }

    _sessionHandshakeInterval

    startHandshake(){
        this.channels.CoreChannel.startHandshake()
    }

    getClientSequence(){
        this._clientSequence++
        return this._clientSequence
    }

    getServerSequence(){
        const seq = this._serverSequenceChanged ? this._serverSequence : undefined
        this._serverSequenceChanged = false
        return seq
    }

    setServerSequence(sequence){
        if(sequence > this._serverSequence){
            this._serverSequence = sequence
            this._serverSequenceChanged = true

            return true
        }

        return false
    }

    _ms = 0

    getMs(absolute = false){

        var hrTime = process.hrtime()
        const currentMs = (hrTime[0] * 1000000 + hrTime[1] / 1000)

        if(absolute === true){
            return currentMs
        } else {
            const ts = Math.floor((currentMs - this._ms)/10)
            return ts
        }
    }

    _referenceTimestamp = process.hrtime()

    getReferenceTimestamp(){
        const end = process.hrtime(this._referenceTimestamp);
        const elapsed = (end[0] * 1) + (end[1] / 1000);
        return end[1]
    }

    setMtu(size:number){
        this._mtu = size
    }

    getMtu(){
        return this._mtu
    }

    send(decoded_payload:Buffer, ssrc, payloadType, marker = 0){
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