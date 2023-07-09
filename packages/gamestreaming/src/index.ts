import { Socket } from "dgram"
import RtpPacket from 'greenlight-rtp'
import Events from './events'

import CoreChannel from './channels/core'
import ControlChannel from './channels/control'
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
        control: new ControlChannel(this)
    }
    gsProtocol = new GameStreamingProtocol()

    _rtpSequence = 0
    _clientSequence = 99 // Next one will be 100.
    _serverSequence = 99
    _serverSequenceChanged = false
    _ms = 0
    _referenceTimestamp = process.hrtime()

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
    }

    onMessage(msg, rinfo){
        // console.log(__filename+'[onMessage()] Received packet: ', msg, rinfo)
        // console.log(msg, rinfo)

        const rtpPacket:RtpPacket = new RtpPacket(msg)
        const SrtpCrypto = rtpPacket.getSrtpCrypto()
        const crypto = new SrtpCrypto(this.target.srtpkey)
        const decrypted_payload = crypto.decrypt(rtpPacket)
        const gsPayload = this.gsProtocol.lookup(rtpPacket.header.payloadTypeReal, rtpPacket.header.ssrc, decrypted_payload)

        // this.events.emit('protocol_message_received', {
        //     rtp: rtpPacket,
        //     gsPayload: gsPayload
        // })

        console.log(__filename+'[onMessage()] Received packet: ', msg, rinfo)

        if((gsPayload as MuxDCTChannel)._headers && (gsPayload as MuxDCTChannel)._headers.sequence && (gsPayload as MuxDCTChannel)._headers.sequence > this._serverSequence){
            this.setServerSequence((gsPayload as MuxDCTChannel)._headers.sequence)
        }

        // Forward to channel
        switch(rtpPacket.header.ssrc){
            case 1024:
                this.channels.control.onMessage(rtpPacket, gsPayload)
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
            sequence: this.getClientSequence()
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
        rtpPacket.header.sequence = this._rtpSequence
        rtpPacket.header.ssrc = ssrc

        // Encrypt packet
        const SrtpCrypto = rtpPacket.getSrtpCrypto()
        rtpPacket.payload = decoded_payload
        const crypto = new SrtpCrypto(this.target.srtpkey)
        const encrypted_payload = crypto.encrypt(rtpPacket)
        rtpPacket.payload = encrypted_payload

        // Send packet
        const packet = rtpPacket.serialize()
        console.log(__filename+'[send()] Sending packet: ', packet)
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

    getReferenceTimestamp(){
        const end = process.hrtime(this._referenceTimestamp);
        const elapsed = (end[0] * 1) + (end[1] / 1000);
        return end[1]
    }
}