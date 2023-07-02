import Packet from '../../../packet'

export interface DefaultOptions {
    isEmpty?:number
}

export default class DataFrameFormat extends Packet {
    isEmpty:number

    constructor(packet:Buffer | DefaultOptions){
        super('DataFrameFormat')

        if(packet instanceof Buffer){
            this.setPacket(packet)

            this.isEmpty = this.read('uint16')

            this.checkReadAllBytes(this)

        } else {
            this.isEmpty = packet.isEmpty || 0
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        this.write('uint16', this.isEmpty)

        return this.getPacket().slice(0, this.getOffset())
    }
}