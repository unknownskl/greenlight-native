import Packet from '../../../../packet'

export const Formats = {
}

export interface DefaultOptions {
    unknown1?:number
    sequence?:number
    unknown2?:number
    unknown3?:number
    unknown4?:number
    unknown5?:number
}

export default class FrameInputStatsFormat extends Packet {
    unknown1:number
    sequence:number
    unknown2:number
    unknown3:number
    unknown4:number
    unknown5:number

    constructor(packet:Buffer | DefaultOptions){
        super('FrameInputGamepadFormat')

        if(packet instanceof Buffer){
            this.setPacket(packet)

            this.unknown1 = this.read('uint16')
            this.sequence = this.read('uint16')
            this.unknown2 = this.read('uint32')
            this.unknown3 = this.read('uint32')
            this.unknown4 = this.read('uint32')
            this.unknown5 = this.read('uint32')

            this.checkReadAllBytes(this)

        } else {
            this.unknown1 = packet.unknown1 || 0
            this.sequence = packet.sequence || 1
            this.unknown2 = packet.unknown2 || 2
            this.unknown3 = packet.unknown3 || 8
            this.unknown4 = packet.unknown4 || 799
            this.unknown5 = packet.unknown5 || 836
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        this.write('uint32', this.unknown1)
        this.write('uint32', this.unknown2)
        this.write('uint32', this.unknown3)
        this.write('uint32', this.unknown4)
        this.write('uint32', this.unknown5)

        return this.getPacket().slice(0, this.getOffset())
    }
}