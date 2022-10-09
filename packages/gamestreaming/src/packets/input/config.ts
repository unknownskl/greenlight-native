import DataPacket, { DataOptions } from '../data'
import Packet from '../packet'

export interface ConfigOptions extends DataOptions {
    payload_type:number
    min_version?:number
    max_version?:number
    width?:number
    height?:number
    max_touches?:number
    frame_reference?:number
    frame_timestamp?:BigInt
    next_sequence:number
    // @TODO: Need to configure the optional params
}

export default class ConfigPacket extends DataPacket {
    payload_type:number
    min_version:number
    max_version:number
    width:number
    height:number
    max_touches:number
    frame_reference:number
    frame_timestamp:BigInt
    next_sequence:number

    constructor(packet:Buffer | ConfigOptions){
        super(packet)

        if(packet instanceof Buffer){
            const payload = new Packet(this.payload)

            this.payload_type = payload.read('uint32')

            if(this.payload_type === 5){
                const frame_size = payload.read('uint32')
                this.min_version = payload.read('uint32')
                this.max_version = payload.read('uint32')
                this.width = payload.read('uint32')
                this.height = payload.read('uint32')
                this.max_touches = payload.read('uint32')
                this.frame_reference = payload.read('uint32')
            }

            if(this.payload_type === 6){
                const frame_size = payload.read('uint32')
                this.min_version = payload.read('uint32')
                this.max_version = payload.read('uint32')
                this.max_touches = payload.read('uint32')
                this.width = payload.read('uint32')
                this.height = payload.read('uint32')
                this.frame_timestamp = payload.read('uint64')
            }

            this.next_sequence = payload.read('uint16')
            
        } else {
            this.payload_type = packet.payload_type || 0

            if(this.payload_type === 5){
                this.min_version = packet.min_version || 4
                this.max_version = packet.max_version || 11
                this.width = packet.width || 3840
                this.height = packet.height || 2160
                this.max_touches = packet.max_touches || 0
                this.frame_reference = packet.frame_reference || 0
            }

            if(this.payload_type === 6){
                this.min_version = packet.min_version || 4
                this.max_version = packet.max_version || 11
                this.max_touches = packet.max_touches || 0
                this.width = packet.width || 1280 //3840
                this.height = packet.height || 720 //2160
                this.frame_timestamp = packet.frame_timestamp || BigInt(0)
            }

            this.next_sequence = packet.next_sequence || 0
        }
    }

    toPacket() {
        const payload = new Packet(Buffer.allocUnsafe(2048))

        payload.write('uint32', this.payload_type)

        if(this.payload_type === 5){
            payload.write('uint32', 24)

            payload.write('uint32', this.min_version)
            payload.write('uint32', this.max_version)
            payload.write('uint32', this.width)
            payload.write('uint32', this.height)
            payload.write('uint32', this.max_touches)
            payload.write('uint32', this.frame_reference)
        }

        if(this.payload_type === 6){
            payload.write('uint32', 20)

            payload.write('uint32', this.min_version)
            payload.write('uint32', this.max_version)
            payload.write('uint32', this.max_touches)
            payload.write('uint64', this.frame_timestamp)
        }

        payload.write('uint16', this.next_sequence) // Next control

        this.header_type = 4
        this.payload = payload.getPacket().slice(0, payload.getOffset())
        return this._toPacket()
    }
}