import DataPacket, { DataOptions } from '../data'
import Packet from '../packet'

export interface ConfigOptions extends DataOptions {
    payload_type:number
    width:number
    height:number
    fps:number
    codec?:number
    timestamp:number
    next_sequence:number
    formats?
    // @TODO: Need to configure the optional params
}

export default class ConfigPacket extends DataPacket {
    payload_type:number
    width:number
    height:number
    fps:number
    codec:number
    timestamp:number
    formats
    next_sequence:number

    constructor(packet:Buffer | ConfigOptions){
        super(packet)

        if(packet instanceof Buffer){
            const payload = new Packet(this.payload)

            this.payload_type = payload.read('uint32')

            if(this.payload_type === 1){
                const unk1 = payload.read('uint32')
                const payload_length = payload.read('uint32')
                const unk2 = payload.read('uint32')
                this.width = payload.read('uint32')
                this.height = payload.read('uint32')
                this.fps = payload.read('uint32')
                this.timestamp = payload.read('bytes', 8)
                const format_count = payload.read('uint32')

                this.formats = []

                for(let i=0; i< format_count; i++){
                    const fps = payload.read('uint32')
                    const width = payload.read('uint32')
                    const height = payload.read('uint32')
                    const codec = payload.read('uint32')
                    this.formats.push({
                        fps: fps,
                        width: width,
                        height: height,
                        codec: codec,
                    })
                }

            }

            if(this.payload_type === 2){
                const unk1 = payload.read('uint32')
                const payload_length = payload.read('uint32')
                this.timestamp = payload.read('uint32')
                this.fps = payload.read('uint32')
                this.width = payload.read('uint32')
                this.height = payload.read('uint32')
                this.codec = payload.read('uint32')
            }

            this.next_sequence = payload.read('uint16')
            
        } else {
            this.payload_type = packet.payload_type || 0

            if(this.payload_type === 1){
                this.width = packet.width || 1280
                this.height = packet.height || 720
                this.fps = packet.fps || 60
                this.timestamp = packet.timestamp || 0
                this.formats = packet.formats || []
            }

            if(this.payload_type === 2){
                this.width = packet.width || 1280
                this.height = packet.height || 720
                this.fps = packet.fps || 60
                this.codec = packet.codec || 0
                this.timestamp = packet.timestamp || 0
            }

            this.next_sequence = packet.next_sequence || 0
        }
    }

    toPacket() {
        const payload = new Packet(Buffer.allocUnsafe(2048))

        payload.write('uint32', this.payload_type)

        if(this.payload_type === 1){
            // payload.write('uint32', this.payload_key.length+this.payload_value.length+28)
            // payload.write('uint32', this.payload_unk1)
            // payload.write('bytes', this.payload_timestamp)
            // payload.write('uint32', this.payload_key.length)
            // payload.write('uint32', this.payload_value.length)
            // payload.write('uint32', 0)
            // payload.write('uint32', this.payload_key.length+this.payload_value.length)
            // payload.write('bytes', this.payload_key)
            // payload.write('bytes', this.payload_value)

        } else  if(this.payload_type === 2){
            payload.write('uint32', 1)
            payload.write('uint32', 20) // payload length
            payload.write('uint32', this.timestamp)
            payload.write('uint32', this.fps)
            payload.write('uint32', this.width)
            payload.write('uint32', this.height)
            payload.write('uint32', this.codec)
        }
        payload.write('uint16', this.next_sequence) // Next control

        this.header_type = 4

        this.payload = payload.getPacket().slice(0, payload.getOffset())
        return this._toPacket()
    }
}