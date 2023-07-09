import Packet from '../../../packet'

export const Formats = {
}

export interface DefaultOptions {
    unknown1?:number
    frameId:number
}

export default class FrameAckFormat extends Packet {
    unknown1:number
    frameId:number

    constructor(packet:Buffer | DefaultOptions){
        super('FrameAckFormat')

        if(packet instanceof Buffer){
            this.setPacket(packet)

            this.unknown1 = this.read('uint32')
            this.frameId = this.read('uint32')

            this.checkReadAllBytes(this)

        } else {
            this.unknown1 = packet.unknown1 || 4
            this.frameId = packet.frameId || 0
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        this.write('uint32', this.unknown1)
        this.write('uint32', this.frameId)

        return this.getPacket().slice(0, this.getOffset())
    }
}