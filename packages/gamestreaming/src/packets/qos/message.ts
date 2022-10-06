import DataPacket, { DataOptions } from '../data'
import Packet from '../packet'

export interface MessageOptions extends DataOptions {
    type:number
    fragment_totalsize:number
    fragment_count:number
    fragment_offset:number
    fragment_size:number
    fragment_data:Buffer
    // @TODO: Need to configure the optional params
}

export default class MessagePacket extends DataPacket {

    type:number
    fragment_totalsize:number
    fragment_count:number
    fragment_offset:number
    fragment_size:number
    fragment_data:Buffer

    constructor(packet:Buffer | MessageOptions){
        super(packet)

        if(packet instanceof Buffer){
            const payload = new Packet(this.payload)

            this.type = payload.read('uint32')

            if(this.type === 1){
                this.fragment_totalsize = payload.read('uint32')
                this.fragment_count = payload.read('uint32')
                this.fragment_offset = payload.read('uint32')
                this.fragment_size = payload.read('uint32')
                this.fragment_data = payload.read('remainder')
            }
            
        } else {
            
            this.type = packet.type || 0

            if(this.type === 1){
                this.fragment_totalsize = packet.fragment_totalsize || 0
                this.fragment_count = packet.fragment_count || 0
                this.fragment_offset = packet.fragment_offset || 0
                this.fragment_size = packet.fragment_size || 0
                this.fragment_data = packet.fragment_data || Buffer.from('')
            }
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        this.write('uint32', this.type)
        if(this.type === 1){
            this.write('uint32', this.fragment_totalsize)
            this.write('uint32', this.fragment_count)
            this.write('uint32', this.fragment_offset)
            this.write('uint32', this.fragment_size)
            this.write('bytes', this.fragment_data)
        }

        this.payload = this.getPacket().toString().slice(0, this.getOffset())
        return this._toPacket()
    }
}