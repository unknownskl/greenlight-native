import Packet from '../../../packet'

export interface DefaultOptions {
    unknown1?:number
    unknown2?:number
    unknown3?:number
    touchpoints?:number
    relativeTimestamp:number
}

export default class ConfigInputAckFormat extends Packet {
    unknown1:number
    unknown2:number
    unknown3:number
    touchpoints:number
    relativeTimestamp:number

    constructor(packet:Buffer | DefaultOptions){
        super('ConfigInputAckFormat')

        if(packet instanceof Buffer){
            this.setPacket(packet)

            this.unknown1 = this.read('uint16')
            const dataSize = this.read('uint32')
            this.unknown2 = this.read('uint32')
            this.unknown3 = this.read('uint32')
            this.touchpoints = this.read('uint32')
            this.relativeTimestamp = this.read('long')

            this.checkReadAllBytes(this)

        } else {
            this.unknown1 = packet.unknown1 || 0
            this.unknown2 = packet.unknown2 || 4
            this.unknown3 = packet.unknown3 || 11
            this.touchpoints = packet.touchpoints || 0
            this.relativeTimestamp = packet.relativeTimestamp
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        this.write('uint16', this.unknown1)
        this.write('uint32', 20)
        this.write('uint32', this.unknown2)
        this.write('uint32', this.unknown3)
        this.write('uint32', this.touchpoints)
        this.write('long', this.relativeTimestamp)

        return this.getPacket().slice(0, this.getOffset())
    }
}