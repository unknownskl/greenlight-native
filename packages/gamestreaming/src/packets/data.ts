import Packet from './packet'

export interface DataOptions {
    unk1?:number
    format:number
    type:number
    payload:string
}

export default class DataPacket extends Packet {
    unk1:number
    format:number
    type:number
    payload:string

    constructor(packet:Buffer | DataOptions){
        super('Data')

        if(packet instanceof Buffer){
            this.setPacket(packet)
            this.read('bytes', 2) // Read first 2 bytes
            // this.read('bytes', 2) // Read first 2 bytes
            this.unk1 = this.read('uint32')
            this.format = this.read('uint32')
            this.type = this.read('uint32')


            this.payload = this.read('remainder', -2)
            
        } else {
            this.unk1 = packet.unk1 || 0
            this.format = packet.format || 0
            this.type = packet.type || 0
            this.payload = packet.payload || Buffer.from('').toString()
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        this.write('bytes', Buffer.from('03000000', 'hex'))

        this.write('bytes', this.payload)
        return this.getPacket().slice(0, this.getOffset())
    }
}