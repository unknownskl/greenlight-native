import Packet from '../../packet'
import VideoServerFormat from './Config/VideoServer'
import VideoClientFormat from './Config/VideoClient'

export const Formats = {
    VideoServer: VideoServerFormat,
    VideoClient: VideoClientFormat,
}

enum dataTypes {
    VideoServer = 1,
    VideoClient = 2,
    // VideoAck = 3,
    // VideoFrame = 4,
    // Input = 5,
    // InputAck = 6,
}

export interface DefaultOptions {
    data:VideoServerFormat|VideoClientFormat
}

export default class ConfigFormat extends Packet {
    data:any

    constructor(packet:Buffer | DefaultOptions){
        super('ConfigFormat')

        if(packet instanceof Buffer){
            this.setPacket(packet)

            const handshakeType = this.read('uint16')
            if(handshakeType === dataTypes.VideoServer){
                this.data = new VideoServerFormat(this.read('remainder'))

            } else if(handshakeType === dataTypes.VideoClient){
                this.data = new VideoClientFormat(this.read('remainder'))

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

        if(this.data instanceof Formats.VideoServer){
            this.write('uint16', dataTypes.VideoServer)
            this.write('bytes', this.data.toPacket())

        } else if(this.data instanceof Formats.VideoClient){
            this.write('uint16', dataTypes.VideoClient)
            this.write('bytes', this.data.toPacket())

        } else {
            throw Error(__filename+'[toPacket()]: Packet type not supported: '+(typeof this.data))
        }

        return this.getPacket().slice(0, this.getOffset())
    }
}