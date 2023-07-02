import Packet from '../../../packet'

export interface DefaultOptions {
    unknown1?:number
    unknown2?:number
    unknown3?:number
    unknown4?:number
}

export default class ConfigAckVideoFormat extends Packet {
    unknown1:number
    unknown2:number
    unknown3:number
    unknown4:number

    constructor(packet:Buffer | DefaultOptions){
        super('ConfigAckVideoFormat')

        if(packet instanceof Buffer){
            this.setPacket(packet)

            this.unknown1 = this.read('uint16')
            this.unknown2 = this.read('uint32')
            this.unknown3 = this.read('uint32')
            this.unknown4 = this.read('uint32')

            this.checkReadAllBytes(this)

        } else {
            this.unknown1 = packet.unknown1 || 0
            this.unknown2 = packet.unknown2 || 1
            this.unknown3 = packet.unknown3 || 4
            this.unknown4 = packet.unknown4 || 48
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        this.write('uint16', this.unknown1)
        this.write('uint32', this.unknown2)
        this.write('uint32', this.unknown3)
        this.write('uint32', this.unknown4)

        return this.getPacket().slice(0, this.getOffset())
    }
}