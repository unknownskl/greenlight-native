import Packet from '../../../packet'

export interface DefaultOptions {
    unknown1?:number
    unknown2?:number
    unknown3?:number
    unknown4?:number
    unknown5?:number
    unknown6?:number
    unknown7?:number
}

export default class DataControlFormat extends Packet {
    unknown1:number
    unknown2:number
    unknown3:number
    unknown4:number
    unknown5:number
    unknown6:number
    unknown7:number

    constructor(packet:Buffer | DefaultOptions){
        super('DataControlFormat')

        if(packet instanceof Buffer){
            this.setPacket(packet)

            this.unknown1 = this.read('uint32')
            this.unknown2 = this.read('uint16')
            this.unknown3 = this.read('uint32')
            this.unknown4 = this.read('uint32')
            this.unknown5 = this.read('uint32')
            this.unknown6 = this.read('uint32')
            this.unknown7 = this.read('uint24')

            this.checkReadAllBytes(this)

        } else {
            this.unknown1 = packet.unknown1 || 5000000
            this.unknown2 = packet.unknown2 || 1
            this.unknown3 = packet.unknown3 || 3489660933
            this.unknown4 = packet.unknown4 || 2
            this.unknown5 = packet.unknown5 || 50331648
            this.unknown6 = packet.unknown6 || 0
            this.unknown7 = packet.unknown7 || 0
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        this.write('uint32', this.unknown1)
        this.write('uint16', this.unknown2)
        this.write('uint32', this.unknown3)
        this.write('uint32', this.unknown4)
        this.write('uint32', this.unknown5)
        this.write('uint32', this.unknown6)
        this.write('uint24', this.unknown7)

        return this.getPacket().slice(0, this.getOffset())
    }
}