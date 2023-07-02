import Packet from '../../packet'
import FrameVideoFormat, { Formats as FrameVideoFormats } from './Frame/Video'

export const Formats = {
    Video: FrameVideoFormat,
    VideoFormats: FrameVideoFormats,
}

enum Types {
    Video = 4
}

export interface DefaultOptions {
    data:FrameVideoFormat
}

export default class FrameFormat extends Packet {
    data:any

    constructor(packet:Buffer | DefaultOptions){
        super('FrameFormat')

        if(packet instanceof Buffer){
            this.setPacket(packet)

            const type = this.read('uint32')
            if(type === Types.Video){
                this.data = new FrameVideoFormat(this.read('remainder'))

            // } else if(handshakeType === dataTypes.FrameData){
            //     this.data = new DataFrameFormat(this.read('remainder'))

            // } else if(handshakeType === dataTypes.MultiMessage){
            //     this.data = new DataMultiMessageFormat(this.read('remainder'))

            // } else if(handshakeType === dataTypes.Message){
            //     this.data = new DataMessageFormat(this.read('remainder'))

            // } else if(handshakeType === dataTypes.Data){
            //     this.data = new DataDataFormat(this.read('remainder'))

            // } else if(handshakeType === dataTypes.Ack){
            //     this.data = new DataAckFormat(this.read('remainder'))

            } else {
                throw Error(__filename+'[constructor()]: Packet type not supported: '+type)
            }

            this.checkReadAllBytes(this)

        } else {
            this.data = packet.data
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        if(this.data instanceof Formats.Video){
            this.write('uint32', Types.Video)
            this.write('bytes', this.data.toPacket())

        // } else if(this.data instanceof Formats.Frame){
        //     this.write('uint16', dataTypes.FrameData)
        //     this.write('bytes', this.data.toPacket())

        // } else if(this.data instanceof Formats.MultiMessage){
        //     this.write('uint16', dataTypes.MultiMessage)
        //     this.write('bytes', this.data.toPacket())

        // } else if(this.data instanceof Formats.Message){
        //     this.write('uint16', dataTypes.Message)
        //     this.write('bytes', this.data.toPacket())

        // } else if(this.data instanceof Formats.Data){
        //     this.write('uint16', dataTypes.Data)
        //     this.write('bytes', this.data.toPacket())

        // } else if(this.data instanceof Formats.Ack){
        //     this.write('uint16', dataTypes.Ack)
        //     this.write('bytes', this.data.toPacket())

        } else {
            throw Error(__filename+'[toPacket()]: Packet type not supported: '+(typeof this.data))
        }

        return this.getPacket().slice(0, this.getOffset())
    }
}