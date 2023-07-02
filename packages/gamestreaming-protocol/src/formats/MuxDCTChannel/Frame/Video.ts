import Packet from '../../../packet'

export const Formats = {
}

export interface DefaultOptions {
    unknown1?:number
    unknown2?:number
    unknown3?:number
    frameId:number
    relativeTimestamp:number
    totalSize:number
    totalPackets?:number
    dataOffset?:number
    metadata?:Buffer
    data:Buffer
}

export default class FrameVideoFormat extends Packet {
    unknown1:number
    unknown2:number
    unknown3:number
    frameId:number
    relativeTimestamp:number
    totalSize:number
    totalPackets:number
    dataOffset:number
    metadata:Buffer
    data:Buffer

    constructor(packet:Buffer | DefaultOptions){
        super('FrameVideoFormat')

        if(packet instanceof Buffer){
            this.setPacket(packet)

            this.unknown1 = this.read('uint32')
            const frameSize = this.read('uint32')
            this.unknown2 = this.read('uint32')
            this.frameId = this.read('uint32')
            this.relativeTimestamp = this.read('long')
            this.unknown3 = this.read('uint32')
            this.totalSize = this.read('uint32')
            this.totalPackets = this.read('uint32')
            this.dataOffset = this.read('uint32')
            const metadataSize = this.read('uint32')
            const dataSize = this.read('uint32')
            this.metadata = this.read('bytes', metadataSize)
            this.data = this.read('bytes', dataSize)

            this.checkReadAllBytes(this)

        } else {
            this.unknown1 = packet.unknown1 || 1
            this.unknown2 = packet.unknown2 || 4
            this.unknown3 = packet.unknown3 || 9
            this.frameId = packet.frameId
            this.relativeTimestamp = packet.relativeTimestamp
            this.totalSize = packet.totalSize || 0
            this.totalPackets = packet.totalPackets || 1
            this.dataOffset = packet.dataOffset || 0
            this.metadata = packet.metadata || Buffer.from('')
            this.data = packet.data
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        this.write('uint32', this.unknown1)
        this.write('uint32', 40+(this.metadata.length+this.data.length))
        this.write('uint32', this.unknown2)
        this.write('uint32', this.frameId)
        this.write('long', this.relativeTimestamp)
        this.write('uint32', this.unknown3)
        this.write('uint32', this.totalSize)
        this.write('uint32', this.totalPackets)
        this.write('uint32', this.dataOffset)
        this.write('uint32', this.metadata.length)
        this.write('uint32', this.data.length)
        this.write('bytes', this.metadata)
        this.write('bytes', this.data)

        return this.getPacket().slice(0, this.getOffset())
    }
}