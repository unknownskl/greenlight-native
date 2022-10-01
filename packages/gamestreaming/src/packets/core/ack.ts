import Packet from '../packet'

export interface AckOptions {
    mtu_size:number;
}

export default class AckPacket extends Packet {
    mtu_size:number

    constructor(packet:Buffer | AckOptions){
        super('Ack')

        if(packet instanceof Buffer){
            this.setPacket(packet)
            this.read('bytes', 2) // Read first 2 bytes

            this.mtu_size = this.read('uint16')
            
        } else {
            this.mtu_size = packet.mtu_size || 0
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        this.write('bytes', Buffer.from('0200', 'hex'))
        this.write('uint16', this.mtu_size)

        this.write('bytes', Buffer.from('0000', 'hex')) // null padding
        return this.getPacket().slice(0, this.getOffset())
    }
}