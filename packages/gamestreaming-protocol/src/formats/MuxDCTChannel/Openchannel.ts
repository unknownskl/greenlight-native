import Packet from '../../packet'
import HandshakeRequestFormat from './Handshake/Request'
import HandshakeResponseFormat from './Handshake/Response'
import HandshakeAudioFormat, { AudioType as HandshakeAudioTypes } from './Handshake/Audio'
import HandshakeAudioAckFormat, { Formats as HandshakeAudioAckFormats, Types as HandshakeAudioAckTypes } from './Handshake/AudioAck'

export const Formats = {
    Request: HandshakeRequestFormat,
    Response: HandshakeResponseFormat,
    Audio: HandshakeAudioFormat,
    AudioTypes: HandshakeAudioTypes,
    AudioAck: HandshakeAudioAckFormat,
    AudioAckFormats: HandshakeAudioAckFormats,
}

enum handshakeTypes {
    Request = 1,
    Response = 2,
    Audio = 7,
    AudioAck = 256,

    MaxValue = 255,

}

export interface DefaultOptions {
    data:HandshakeRequestFormat | HandshakeResponseFormat | HandshakeAudioFormat | HandshakeAudioAckFormat
}

export default class OpenChannelFormat extends Packet {
    data:any

    constructor(packet:Buffer | DefaultOptions){
        super('OpenChannelFormat')

        if(packet instanceof Buffer){
            this.setPacket(packet)

            const handshakeType = this.read('uint16')
            if(handshakeType === handshakeTypes.Request){
                this.data = new HandshakeRequestFormat(this.read('remainder'))

            } else if(handshakeType === handshakeTypes.Response){
                this.data = new HandshakeResponseFormat(this.read('remainder'))

            } else if(handshakeType === handshakeTypes.Audio){
                this.data = new HandshakeAudioFormat(this.read('remainder'))
            
            } else if(handshakeType > handshakeTypes.MaxValue) {
                this.setOffset(this.getOffset()-2)
                this.data = new HandshakeAudioAckFormat(this.read('remainder'))

            } else {
                throw Error(__filename+'[constructor()]: Packet type not supported: '+handshakeType)
            }

            this.checkReadAllBytes(this)

        } else {
            this.data = packet.data
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        if(this.data instanceof HandshakeRequestFormat){
            this.write('uint16', handshakeTypes.Request)
            this.write('bytes', this.data.toPacket())

        } else if(this.data instanceof HandshakeResponseFormat){
            this.write('uint16', handshakeTypes.Response)
            this.write('bytes', this.data.toPacket())

        } else if(this.data instanceof HandshakeAudioFormat){
            this.write('uint16', handshakeTypes.Audio)
            this.write('bytes', this.data.toPacket())

        } else if(this.data instanceof HandshakeAudioAckFormat){
            this.write('bytes', this.data.toPacket())

        } else {
            throw Error(__filename+'[toPacket()]: Packet type not supported: '+(typeof this.data))
        }

        return this.getPacket().slice(0, this.getOffset())
    }
}