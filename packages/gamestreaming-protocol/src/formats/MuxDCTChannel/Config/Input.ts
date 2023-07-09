import Packet from '../../../packet'

export interface DefaultOptions {
    unknown1?:number
    unknown2?:number
    unknown3?:number
    width?:number
    height?:number
    touchpoints?:number
    frameId:number
}

export default class ConfigInputFormat extends Packet {
    unknown1:number
    unknown2:number
    unknown3:number
    width:number
    height:number
    touchpoints:number
    frameId:number

    constructor(packet:Buffer | DefaultOptions){
        super('ConfigInputFormat')

        if(packet instanceof Buffer){
            this.setPacket(packet)

            this.unknown1 = this.read('uint16')
            const dataSize = this.read('uint32')
            this.unknown2 = this.read('uint32')
            this.unknown3 = this.read('uint32')
            this.width = this.read('uint32')
            this.height = this.read('uint32')
            this.touchpoints = this.read('uint32')
            this.frameId = this.read('uint32')

            this.checkReadAllBytes(this)

        } else {
            this.unknown1 = packet.unknown1 || 0
            this.unknown2 = packet.unknown2 || 4
            this.unknown3 = packet.unknown3 || 11
            this.width = packet.width || 1280
            this.height = packet.height || 720
            this.frameId = packet.frameId
            this.touchpoints = packet.touchpoints || 0
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        this.write('uint16', this.unknown1)
        this.write('uint32', 24)
        this.write('uint32', this.unknown2)
        this.write('uint32', this.unknown3)
        this.write('uint32', this.width)
        this.write('uint32', this.height)
        this.write('uint32', this.touchpoints)
        this.write('uint32', this.frameId)

        return this.getPacket().slice(0, this.getOffset())
    }
}