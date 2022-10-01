import Packet from '../packet'

export interface PingOptions {
    unk1:number
    unk2:number
}

export default class PingPacket extends Packet {
    unk1:number
    unk2:number

    constructor(packet:Buffer | PingOptions){
        super('Ping')

        if(packet instanceof Buffer){
            this.setPacket(packet)
            this.read('bytes', 2) // Read first 2 bytes

            this.unk1 = this.read('uint32')
            this.unk2 = this.read('uint32')
            
        } else {
            this.unk1 = packet.unk1 || 0
            this.unk2 = packet.unk2 || 0
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        this.write('bytes', Buffer.from('0800', 'hex'))
        this.write('uint32', this.unk1)
        this.write('uint32', this.unk2)

        this.write('bytes', Buffer.from('0000', 'hex')) // null padding
        return this.getPacket().slice(0, this.getOffset())
    }
}