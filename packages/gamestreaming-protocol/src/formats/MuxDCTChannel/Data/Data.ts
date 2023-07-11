import Packet from '../../../packet'
import DataDataVideoFormat from './Data/Video'

export const Formats = {
    Video: DataDataVideoFormat,
}

export interface DefaultOptions {
    unknown1?:number
    data:DataDataVideoFormat
}

enum Types {
    Video = 1,
}

export default class DataDataFormat extends Packet {
    unknown1:number
    data:any

    constructor(packet:Buffer | DefaultOptions){
        super('DataDataFormat')

        if(packet instanceof Buffer){
            this.setPacket(packet)

            this.unknown1 = this.read('uint16')

            const packetType = this.read('uint32')
            if(packetType === Types.Video){
                this.data = new DataDataVideoFormat(this.read('remainder'))

            } else {
                throw Error(__filename+'[constructor()]: Packet type not supported: '+packetType)
            }

            this.checkReadAllBytes(this)

        } else {
            this.unknown1 = packet.unknown1 || 0
            this.data = packet.data
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        this.write('uint16', this.unknown1)

        if(this.data instanceof Formats.Video){
            this.write('uint32', Types.Video)
            this.write('bytes', this.data.toPacket())

        } else {
            throw Error(__filename+'[toPacket()]: Packet type not supported: '+(typeof this.data))
        }

        return this.getPacket().slice(0, this.getOffset())
    }
}