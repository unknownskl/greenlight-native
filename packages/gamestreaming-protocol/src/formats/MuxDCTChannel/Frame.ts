import Packet from '../../packet'
import VideoFormat, { Formats as VideoFormats } from './Frame/Video'
import InputFormat, { Formats as InputFormats } from './Frame/Input'
import AckFormat from './Frame/Ack'

export const Formats = {
    Video: VideoFormat,
    VideoFormats: VideoFormats,
    Input: InputFormat,
    InputFormats: InputFormats,
    Ack: AckFormat,
}

enum Types {
    Ack = 3,
    Video = 4,
    Input = 7,
}

export interface DefaultOptions {
    data:VideoFormat | InputFormat | AckFormat
}

export default class FrameFormat extends Packet {
    data:any

    constructor(packet:Buffer | DefaultOptions){
        super('FrameFormat')

        if(packet instanceof Buffer){
            this.setPacket(packet)

            const type = this.read('uint32')
            if(type === Types.Video){
                this.data = new VideoFormat(this.read('remainder'))

            } else if(type === Types.Input){
                this.data = new InputFormat(this.read('remainder'))

            } else if(type === Types.Ack){
                this.data = new AckFormat(this.read('remainder'))

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

        } else if(this.data instanceof Formats.Input){
            this.write('uint32', Types.Input)
            this.write('bytes', this.data.toPacket())

        } else if(this.data instanceof Formats.Ack){
            this.write('uint32', Types.Ack)
            this.write('bytes', this.data.toPacket())

        } else {
            throw Error(__filename+'[toPacket()]: Packet type not supported: '+(typeof this.data))
        }

        return this.getPacket().slice(0, this.getOffset())
    }
}