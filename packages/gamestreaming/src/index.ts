import { Socket } from "dgram"
import RtpPacket from 'greenlight-rtp'
import Events from './events'

import CoreChannel from './channels/core'
import ControlChannel from './channels/control'
import QosChannel from './channels/qos'
import VideoChannel from './channels/video'
import AudioChannel from './channels/audio'
import MessagingChannel from './channels/messaging'
import ChatAudioChannel from './channels/chataudio'
import InputChannel from './channels/input'
import InputFeedbackChannel from './channels/inputfeedback'

import GameStreamingProtocol from 'greenlight-gamestreaming-protocol'
import MuxDCTChannel from 'greenlight-gamestreaming-protocol/dist/packets/MuxDCTChannel'

enum ChannelSsrc {
    core = 0,
    control = 1024
}

interface targetObject {
    address:string;
    port:number;
    srtpkey:string;
}
export default class GameStreaming {

    socket:Socket
    target:targetObject

    events:Events = new Events(this)
    channels = {
        core: new CoreChannel(this),
        control: new ControlChannel(this),
        qos: new QosChannel(this),
        video: new VideoChannel(this),
        audio: new AudioChannel(this),
        messaging: new MessagingChannel(this),
        chataudio: new ChatAudioChannel(this),
        input: new InputChannel(this),
        inputfeedback: new InputFeedbackChannel(this),
    }
    gsProtocol = new GameStreamingProtocol()

    _rtpSequence = 0
    _clientSequence = 99 // Next one will be 100.
    _serverSequence = 99
    _serverRoc = 0
    _serverSequenceChanged = false
    _ms = 0
    _referenceTimestamp = process.hrtime.bigint()

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

        // Setup message handler
        this.socket.on('message', (msg, rinfo) => { this.onMessage(msg, rinfo) })

        this.start()
    }

    exit(exitcode:number = 0){
        process.exit(exitcode)
    }

    close(exitcode:number = 0){
        this.events.close()

        setTimeout(() => this.exit(exitcode), 1000);
    }

    onMessage(msg, rinfo){
        // console.log(__filename+'[onMessage()] Received packet: ', msg, rinfo)
        // console.log(msg, rinfo)

        const rtpPacket:RtpPacket = new RtpPacket(msg)
        let decrypted_payload
        try {
            const SrtpCrypto = rtpPacket.getSrtpCrypto()
            const crypto = new SrtpCrypto(this.target.srtpkey)

            decrypted_payload = crypto.decrypt(rtpPacket, this._serverRoc)

            if(rtpPacket.header.sequence === 65535){
                // We have to roll over.. Next packet starts with sequence 0 again and roc with 1
                this._serverRoc++;
                console.log('Rolling over Server ROC...')
            }

        } catch(error) {
            console.log('RTP ERROR: Failed to decode: ', msg, this, error)
            return;
        }

        const gsPayload = this.gsProtocol.lookup(rtpPacket.header.payloadTypeReal, rtpPacket.header.ssrc, decrypted_payload)
        // this.events.emit('protocol_message_received', {
        //     rtp: rtpPacket,
        //     gsPayload: gsPayload
        // })

        // console.log(__filename+'[onMessage()] Received packet: ['+rtpPacket.header.ssrc+']', gsPayload)

        if((gsPayload as MuxDCTChannel)._headers && (gsPayload as MuxDCTChannel)._headers.sequence && (gsPayload as MuxDCTChannel)._headers.sequence > this._serverSequence){
            this.setServerSequence((gsPayload as MuxDCTChannel)._headers.sequence)
        }

        // Forward to channel
        switch(rtpPacket.header.ssrc){
            case 1024:
                this.channels.control.onMessage(rtpPacket, gsPayload)
                break;

            case 1025:
                this.channels.qos.onMessage(rtpPacket, gsPayload)
                break;

            case 1026:
                this.channels.video.onMessage(rtpPacket, gsPayload)
                break;

            case 1027:
                this.channels.audio.onMessage(rtpPacket, gsPayload)
                break;

            case 1028:
                this.channels.messaging.onMessage(rtpPacket, gsPayload)
                break;

            case 1029:
                this.channels.chataudio.onMessage(rtpPacket, gsPayload)
                break;

            case 1030:
                this.channels.input.onMessage(rtpPacket, gsPayload)
                break;

            case 1031:
                this.channels.inputfeedback.onMessage(rtpPacket, gsPayload)
                break;

            default:
                this.channels.core.onMessage(rtpPacket, gsPayload)
                break;
        }
    }

    start(){
        // We can still set integers like sequences etc here.

        // We assume that the application is ready and set all the starting integers etc at this point. Lets send out a handshake probe
        this.channels.core.startHandshake()
    }

    sendPayload(payload, ssrc, payloadType, marker = 0){
        payload = payload.packHeader(payload.toPacket(), {
            confirm: this.getServerSequence(),
            sequence: this.getClientSequence(),
            timestamp: this.getMs()/1000,
        })

        this.send(payload, ssrc, payloadType, marker)
    }

    send(decoded_payload, ssrc, payloadType, marker = 0){

        if(!(decoded_payload instanceof Buffer)){
            decoded_payload = (decoded_payload as any).toPacket()
        }

        const rtpPacket:RtpPacket = new RtpPacket()
        rtpPacket.header.payloadType = payloadType
        rtpPacket.header.marker = marker
        rtpPacket.header.sequence = this._rtpSequence % 65536
        rtpPacket.header.ssrc = ssrc

        const clientRoc = Math.floor(this._rtpSequence / 65536)

        // Encrypt packet
        const SrtpCrypto = rtpPacket.getSrtpCrypto()
        rtpPacket.payload = decoded_payload
        const crypto = new SrtpCrypto(this.target.srtpkey)
        const encrypted_payload = crypto.encrypt(rtpPacket, clientRoc)
        rtpPacket.payload = encrypted_payload

        // Send packet
        const packet = rtpPacket.serialize()
        // console.log(__filename+'[send()] Sending packet: ', packet)
        this.socket.send(packet, this.target.port, this.target.address)

        this._rtpSequence++
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

    getReferenceTimestamp():number{
        // const end = process.hrtime.bigint()-this._referenceTimestamp;
        // return (end[0] * 1000000 + end[1] / 1000)*1000
        const end = process.hrtime.bigint()-this._referenceTimestamp;
        const ns = end.toString()
        return Math.ceil(parseInt(ns)/1000)
    }
}