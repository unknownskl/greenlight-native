import DataPacket, { DataOptions } from '../data'
import Packet from '../packet'

export interface MessageOptions extends DataOptions {
    payload_type:number
    payload_unk1?:number
    payload_timestamp?:Buffer
    payload_key:string
    payload_value:Buffer
    next_sequence:number
    // @TODO: Need to configure the optional params
}

export default class MessagePacket extends DataPacket {

    payload_type:number
    payload_unk1?:number
    payload_timestamp?:Buffer
    payload_key:string
    payload_value:Buffer
    next_sequence:number

    constructor(packet:Buffer | MessageOptions){
        super(packet)

        if(packet instanceof Buffer){
            const payload = new Packet(this.payload)

            this.payload_type = payload.read('uint32')

            if(this.payload_type === 2){
                const payload_length = payload.read('uint32')
                this.payload_unk1 = payload.read('uint32')
                this.payload_timestamp = payload.read('bytes', 8)
                const key_length = payload.read('uint32')
                const value_length = payload.read('uint32')
                const unk1_length = payload.read('uint32')
                const total_length = payload.read('uint32')
                this.payload_key = payload.read('bytes', key_length).toString()
                this.payload_value = payload.read('bytes', value_length)

            }

            // this.next_sequence = payload.read('uint16')
            this.next_sequence = 0
            
        } else {
            this.payload_type = packet.payload_type || 0

            if(this.payload_type === 2){
                this.payload_unk1 = packet.payload_unk1 || 0
                this.payload_timestamp = packet.payload_timestamp || Buffer.from('0000000000000000', 'hex')
                this.payload_key = packet.payload_key || Buffer.from('').toString()
                this.payload_value = packet.payload_value || Buffer.from('')
            }

            this.next_sequence = packet.next_sequence || 0
        }
    }

    toPacket() {
        const payload = new Packet(Buffer.allocUnsafe(2048))

        payload.write('uint32', this.payload_type)
        if(this.payload_type === 2){
            payload.write('uint32', this.payload_key.length+this.payload_value.length+28)
            payload.write('uint32', this.payload_unk1)
            payload.write('bytes', this.payload_timestamp)
            payload.write('uint32', this.payload_key.length)
            payload.write('uint32', this.payload_value.length)
            payload.write('uint32', 0)
            payload.write('uint32', this.payload_key.length+this.payload_value.length)
            payload.write('bytes', this.payload_key)
            payload.write('bytes', this.payload_value)
        }
        payload.write('uint16', this.next_sequence) // Next control

        this.payload = payload.getPacket().toString().slice(0, payload.getOffset())
        return this._toPacket()
    }
}