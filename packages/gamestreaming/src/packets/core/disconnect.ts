import Packet from '../packet'

export interface DisconnectOptions {
    reason:number
}

export default class DisconnectPacket extends Packet {
    reason:number

    constructor(packet:Buffer | DisconnectOptions){
        super('Disconnect')

        if(packet instanceof Buffer){
            this.setPacket(packet)
            this.read('bytes', 2) // Read first 2 bytes
            this.read('bytes', 2) // Read first 2 bytes

            this.reason = this.read('uint32')
            
        } else {
            this.reason = packet.reason || -1
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        this.write('bytes', Buffer.from('ffff', 'hex'))
        this.write('bytes', Buffer.from('ffff', 'hex'))
        this.write('uint32', this.reason) // 4 = inactive / no connection

        this.write('bytes', Buffer.from('0000', 'hex')) // null padding
        return this.getPacket().slice(0, this.getOffset())
    }
}