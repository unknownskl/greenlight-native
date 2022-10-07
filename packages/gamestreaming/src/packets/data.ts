import Packet from './packet'

export interface DataOptions {
    header_type?:number
    frameid?:number
    format?:number
    type?:number
    payload?:Buffer
}

export default class DataPacket extends Packet {
    header_type:number
    frameid:number
    format:number
    type:number
    payload:Buffer

    constructor(packet:Buffer | DataOptions){
        super('Data')

        if(packet instanceof Buffer){
            this.setPacket(packet)
            this.header_type = this.read('uint16')
            this.frameid = this.read('uint16')
            this.format = this.read('uint16')
            this.type = this.read('uint16')


            this.payload = this.read('remainder')
            
        } else {
            this.header_type = packet.header_type || 3
            this.frameid = packet.frameid || 0
            this.format = packet.format || 0
            this.type = packet.type || 0
            this.payload = packet.payload || Buffer.from('')
        }
    }

    toPacket() {
        return this._toPacket()
    }

    _toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        this.write('uint16', this.header_type)
        this.write('uint16', this.frameid)
        this.write('uint16', this.format)
        this.write('uint16', this.type)

        this.write('bytes', this.payload)

        console.log('debugheight, ', this)
        return this.getPacket().slice(0, this.getOffset())
    }
}