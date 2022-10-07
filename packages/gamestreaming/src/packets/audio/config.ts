import DataPacket, { DataOptions } from '../data'
import Packet from '../packet'

export interface ConfigOptions extends DataOptions {
    payload_type:number
    codec?:number
    timestamp:number
    next_sequence:number
    formats?
    // @TODO: Need to configure the optional params
}

export default class ConfigPacket extends DataPacket {
    payload_type:number
    codec:number
    timestamp:number
    formats
    next_sequence:number

    constructor(packet:Buffer | ConfigOptions){
        super(packet)

        if(packet instanceof Buffer){
            const payload = new Packet(this.payload)

            this.payload_type = payload.read('uint32')

            if(this.payload_type === 7){
                this.timestamp = payload.read('bytes', 8)
                const format_count = payload.read('uint32')

                this.formats = []

                for(let i=0; i < format_count; i++){
                    const channels = payload.read('uint32')
                    const frequency = payload.read('uint32')
                    const codec = payload.read('uint32')
                    this.formats.push({
                        channels: channels,
                        frequency: frequency,
                        codec: codec,
                    })
                }
            }

            this.next_sequence = payload.read('uint16')
            
        } else {
            this.payload_type = packet.payload_type || 0

            if(this.payload_type === 7){
                this.timestamp = packet.timestamp || 0
                this.formats = packet.formats || []
            }

            this.next_sequence = packet.next_sequence || 0
        }
    }

    toPacket() {
        const payload = new Packet(Buffer.allocUnsafe(2048))

        payload.write('uint32', this.payload_type)

        if(this.payload_type === 7){
            payload.write('uint32', this.timestamp)
            payload.write('uint32', this.formats.length)

            for(const codec in this.formats){
                payload.write('uint32', this.formats[codec].channels)
                payload.write('uint32', this.formats[codec].frequency)
                payload.write('uint32', this.formats[codec].codec)
            }
        }

        payload.write('uint16', this.next_sequence) // Next control

        this.header_type = 4

        this.payload = payload.getPacket().slice(0, payload.getOffset())
        return this._toPacket()
    }
}