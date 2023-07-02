import Packet from '../../packet'
import VideoFormat from './ConfigAck/Video'
import FrameVideoFormat, { Formats as FrameVideoFormats } from './Frame/Video'

export const Formats = {
    Video: VideoFormat,
    Frame: FrameVideoFormat,
    FrameFormats: FrameVideoFormats,
}

enum dataTypes {
    // VideoServer = 1,
    // VideoClient = 2,
    Video = 3,
    Frame = 4,
    // Input = 5,
    // InputAck = 6,
}

export interface DefaultOptions {
    data?:VideoFormat | FrameVideoFormat
    unknown1?:number
}

export default class ConfigAckFormat extends Packet {
    data:any
    unknown1:number

    constructor(packet:Buffer | DefaultOptions){
        super('ConfigAckFormat')

        if(packet instanceof Buffer){
            this.setPacket(packet)

            const handshakeType = this.read('uint16')
            if(handshakeType === dataTypes.Video){
                this.data = new VideoFormat(this.read('remainder'))

            } else if(handshakeType === dataTypes.Frame){
                this.unknown1 = this.read('uint16')
                this.data = new FrameVideoFormat(this.read('remainder'))

            } else {
                console.log(handshakeType)
                throw Error(__filename+'[constructor()]: Packet type not supported: '+handshakeType)
            }

            this.checkReadAllBytes(this)

        } else {
            this.data = packet.data
            this.unknown1 = packet.unknown1 || 0
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        if(this.data instanceof Formats.Video){
            this.write('uint16', dataTypes.Video)
            this.write('bytes', this.data.toPacket())

        } else if(this.data instanceof Formats.Frame){
            this.write('uint16', dataTypes.Frame)
            this.write('uint16', this.unknown1)
            this.write('bytes', this.data.toPacket())

        } else {
            throw Error(__filename+'[toPacket()]: Packet type not supported: '+(typeof this.data))
        }

        return this.getPacket().slice(0, this.getOffset())
    }
}