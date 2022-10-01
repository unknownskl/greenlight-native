import Packet from '../packet'

export interface SynOptions {
    mtu_size:number;
}

export default class SynPacket extends Packet {
    unk1?:number
    mtu_size:number

    constructor(packet:Buffer | SynOptions){
        super('Syn')

        if(packet instanceof Buffer){
            this.setPacket(packet)
            this.read('bytes', 2) // Read first 2 bytes
            
            this.mtu_size = packet.length
            
        } else {
            this.mtu_size = packet.mtu_size || 0
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        this.write('bytes', Buffer.from('010001', 'hex'))
        this.write('bytes', Buffer.from('00'.repeat(this.mtu_size-3), 'hex'))

        return this.getPacket().slice(0, this.getOffset())
    }
}