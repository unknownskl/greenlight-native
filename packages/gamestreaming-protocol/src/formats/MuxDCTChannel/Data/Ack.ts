import Packet from '../../../packet'

export interface DefaultOptions {
    unknown1?:number
    
}

export default class DataAckFormat extends Packet {
    unknown1:number
    // data:any

    constructor(packet:Buffer | DefaultOptions){
        super('DataAckFormat')

        if(packet instanceof Buffer){
            this.setPacket(packet)

            this.unknown1 = this.read('uint16')

            this.checkReadAllBytes(this)

        } else {
            this.unknown1 = packet.unknown1 || 0
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        this.write('uint16', this.unknown1)

        return this.getPacket().slice(0, this.getOffset())
    }
}