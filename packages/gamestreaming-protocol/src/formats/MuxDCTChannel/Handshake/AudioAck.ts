import Packet from '../../../packet'
import HandshakeAudioAckAudioFormat from './AudioAck/Audio'
import HandshakeAudioAckChatAudioFormat from './AudioAck/ChatAudio'

export const Formats = {
    Audio: HandshakeAudioAckAudioFormat,
    ChatAudio: HandshakeAudioAckChatAudioFormat,
}

export interface DefaultOptions {
}

export enum Types {
    ChatAudio = 1,
    Audio = 2,    
}

export interface EmptyOptions extends DefaultOptions {
    isEmpty:number
}

export interface AudioAckOptions extends DefaultOptions {
    frameId:number
    data:HandshakeAudioAckAudioFormat | HandshakeAudioAckChatAudioFormat
}

export default class HandshakeAudioAckFormat extends Packet {
    isEmpty:number
    frameId:number
    data:any

    constructor(packet:Buffer | EmptyOptions | AudioAckOptions){
        super('HandshakeAudioAckFormat')

        if(packet instanceof Buffer){
            this.setPacket(packet)

            const isEmpty = this.read('uint16')

            if(isEmpty <= 2){
                this.isEmpty = this.read('uint16')
                
            } else {
                this.setOffset(this.getOffset()-2)
                this.frameId = this.read('uint32')
                const format = this.read('uint32')

                if(format == Types.ChatAudio){
                    this.data = new HandshakeAudioAckChatAudioFormat(this.read('remainder'))

                } else if(format === Types.Audio) {
                    this.data = new HandshakeAudioAckAudioFormat(this.read('remainder'))

                } else {
                    throw Error(__filename+'[constructor()]: Packet type not supported: '+(typeof this.data))
                }
            }

            this.checkReadAllBytes(this)

        } else {
            if((packet as AudioAckOptions).frameId !== undefined){
                this.frameId = (packet as AudioAckOptions).frameId
                this.data = (packet as AudioAckOptions).data

            } else {
                this.isEmpty = (packet as EmptyOptions).isEmpty || 0
            }
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        if(this.isEmpty){
            this.write('uint16', this.isEmpty)

        } else {
            this.write('uint32', this.frameId)

            if(this.data instanceof HandshakeAudioAckAudioFormat){
                this.write('uint32', Types.Audio)
                this.write('bytes', this.data.toPacket())
    
            } else if(this.data instanceof HandshakeAudioAckChatAudioFormat){
                this.write('uint32', Types.ChatAudio)
                this.write('bytes', this.data.toPacket())
    
            } else {
                throw Error(__filename+'[toPacket()]: Packet type not supported: '+(typeof this.data))
            }
        }

        return this.getPacket().slice(0, this.getOffset())
    }
}