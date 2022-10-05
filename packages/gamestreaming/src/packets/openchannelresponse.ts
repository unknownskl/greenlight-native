import Packet from './packet'

export interface OpenChannelResponseOptions {
    payload:string
}

export default class OpenChannelResponsePacket extends Packet {
    payload:string

    constructor(packet:Buffer | OpenChannelResponseOptions){
        super('OpenChannelResponse')

        if(packet instanceof Buffer){
            this.setPacket(packet)
            this.read('bytes', 2) // Read first 2 bytes
            this.read('bytes', 2) // Read first 2 bytes
            this.payload = this.read('remainder')
            
        } else {
            this.payload = packet.payload || Buffer.from('', 'hex').toString()
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        this.write('bytes', Buffer.from('03000000', 'hex'))

        this.write('bytes', this.payload)
        return this.getPacket().slice(0, this.getOffset())
    }
}