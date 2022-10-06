import Packet from './packet'

export interface DataOptions {
    frameid?:number
    format?:number
    type?:number
    payload?:string
}

export default class DataPacket extends Packet {
    frameid:number
    format:number
    type:number
    payload:string

    constructor(packet:Buffer | DataOptions){
        super('Data')

        if(packet instanceof Buffer){
            this.setPacket(packet)
            this.read('bytes', 2) // Read first 2 bytes
            // this.read('bytes', 2) // Read first 2 bytes
            this.frameid = this.read('uint16')
            this.format = this.read('uint16')
            this.type = this.read('uint16')


            this.payload = this.read('remainder')
            
        } else {
            this.frameid = packet.frameid || 0
            this.format = packet.format || 0
            this.type = packet.type || 0
            this.payload = packet.payload || Buffer.from('').toString()
        }
    }

    toPacket() {
        return this._toPacket()
    }

    _toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        this.write('bytes', Buffer.from('0300', 'hex'))
        this.write('uint16', this.frameid)
        this.write('uint16', this.format)
        this.write('uint16', this.type)

        this.write('bytes', this.payload)
        return this.getPacket().slice(0, this.getOffset())
    }
}