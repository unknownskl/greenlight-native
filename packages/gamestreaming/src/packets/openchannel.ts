import Packet from './packet'

export interface OpenChannelOptions {
    channelName:string;
    payload?:string
}

export default class OpenChannelPacket extends Packet {
    channelName:string
    payload:string

    constructor(packet:Buffer | OpenChannelOptions){
        super('OpenChannel')

        if(packet instanceof Buffer){
            this.setPacket(packet)
            this.read('bytes', 2) // Read first 2 bytes
            this.read('bytes', 2) // Read first 2 bytes
            this.channelName = this.read('sgstring').toString()

            this.read('bytes', 2) // Read first 2 bytes
            this.payload = this.read('remainder')
            
        } else {
            this.channelName = packet.channelName || ''
            this.payload = packet.payload || Buffer.from('', 'hex').toString()
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        this.write('bytes', Buffer.from('02000000', 'hex'))
        this.write('sgstring', this.channelName)
        this.write('bytes', Buffer.from('0000', 'hex')) // null padding

        this.write('bytes', this.payload)
        return this.getPacket().slice(0, this.getOffset())
    }
}