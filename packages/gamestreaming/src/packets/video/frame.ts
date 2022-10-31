import DataPacket, { DataOptions } from '../data'
import Packet from '../packet'

export interface FrameOptions extends DataOptions {
    payload_type:number
    frame_num:number
    frame_timestamp:number
    frame_totalsize:number
    frame_offset:number
    framedata:Buffer
    metadata:Buffer

    next_sequence:number
}

export default class FramePacket extends DataPacket {
    payload_type:number
    frame_num:number
    frame_timestamp:number
    frame_totalsize:number
    frame_offset:number
    framedata:Buffer
    metadata:Buffer

    next_sequence:number

    constructor(packet:Buffer | FrameOptions){
        super(packet)

        if(packet instanceof Buffer){
            const payload = new Packet(this.payload)

            this.payload_type = payload.read('uint32')
            const unk1 = payload.read('uint32')
            const frame_size = payload.read('uint32')
            const unk2 = payload.read('uint32')
            this.frame_num = payload.read('uint32')
            this.frame_timestamp = payload.read('uint32')
            const unk3 = payload.read('uint32')
            const metadata_length = payload.read('uint32')
            this.frame_totalsize = payload.read('uint32')
            const unk4 = payload.read('uint32')
            this.frame_offset = payload.read('uint32')
            const metadata_size = payload.read('uint32')
            const videoframe_size = payload.read('uint32')
            this.metadata = payload.read('bytes', metadata_size)
            this.framedata = payload.read('remainder', 2)

            this.next_sequence = payload.read('uint16')
            
        } else {
            this.payload_type = packet.payload_type || 0

            this.frame_num = packet.frame_num || 0
            this.frame_timestamp = packet.frame_timestamp || 0
            this.frame_totalsize = packet.frame_totalsize || 0
            this.frame_offset = packet.frame_offset || 0
            this.framedata = packet.framedata || Buffer.from('')
            this.metadata = packet.metadata || Buffer.from('')

            this.next_sequence = packet.next_sequence || 0
        }
    }

    // toPacket() {
    //     const payload = new Packet(Buffer.allocUnsafe(2048))

    //     payload.write('uint32', this.payload_type)

    //     payload.write('uint16', this.next_sequence) // Next control

    //     this.header_type = 4

    //     this.payload = payload.getPacket().slice(0, payload.getOffset())
    //     return this._toPacket()
    // }
}