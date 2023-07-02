import Packet from '../../../packet'

export interface DefaultOptions {
    unknown1?:number
    unknown2?:number
    unknown3?:number
    frameId:number
    fps?:number
    width?:number
    height?:number
    codec?:number
}

export default class ConfigVideoClientFormat extends Packet {
    unknown1:number
    unknown2:number
    frameId:number
    fps:number
    width:number
    height:number
    codec:number

    constructor(packet:Buffer | DefaultOptions){
        super('ConfigVideoClientFormat')

        if(packet instanceof Buffer){
            this.setPacket(packet)

            this.unknown1 = this.read('uint16')
            this.unknown2 = this.read('uint32')
            const dataSize = this.read('uint32')
            this.frameId = this.read('uint32')
            this.fps = this.read('uint32')
            this.width = this.read('uint32')
            this.height = this.read('uint32')
            this.codec = this.read('uint32')

            this.checkReadAllBytes(this)

        } else {
            this.unknown1 = packet.unknown1 || 0
            this.unknown2 = packet.unknown2 || 1
            this.frameId = packet.frameId
            this.fps = packet.fps || 60
            this.width = packet.width || 1280
            this.height = packet.height || 720
            this.codec = packet.unknown3 || 0
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        this.write('uint16', this.unknown1)
        this.write('uint32', this.unknown2)
        this.write('uint32', 20)
        this.write('uint32', this.frameId)
        this.write('uint32', this.fps)
        this.write('uint32', this.width)
        this.write('uint32', this.height)
        this.write('uint32', this.codec)

        return this.getPacket().slice(0, this.getOffset())
    }
}