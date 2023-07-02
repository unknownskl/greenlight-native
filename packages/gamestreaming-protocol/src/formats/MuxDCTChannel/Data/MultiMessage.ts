import Packet from '../../../packet'

export interface DefaultOptions {
    unknown1?:number
}

export interface DataOptions extends DefaultOptions {
    totalSize:number
    totalPackets:number
    dataOffset:number
    data:Buffer
}

export default class DataMultiMessageFormat extends Packet {
    unknown1:number
    totalSize:number
    totalPackets:number
    dataOffset:number
    data:Buffer

    constructor(packet:Buffer | DefaultOptions | DataOptions){
        super('DataMultiMessageFormat')

        if(packet instanceof Buffer){
            this.setPacket(packet)

            this.unknown1 = this.read('uint16')
                    
            if(this.getOffset() < this.getPacket().length){
                this.totalSize = this.read('uint32')
                this.totalPackets = this.read('uint32')
                this.dataOffset = this.read('uint32')
                const dataLength = this.read('uint32')
                this.data = this.read('bytes', dataLength)
            }

            this.checkReadAllBytes(this)

        } else {
            this.unknown1 = packet.unknown1 || 0
            
            this.totalPackets = (packet as DataOptions).totalPackets || 0
            this.totalSize = (packet as DataOptions).totalSize || 0
            this.dataOffset = (packet as DataOptions).dataOffset || 0
            this.data = (packet as DataOptions).data || Buffer.from('')
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        this.write('uint16', this.unknown1)

        if(this.totalSize > 0){
            this.write('uint32', this.totalSize)
            this.write('uint32', this.totalPackets)
            this.write('uint32', this.dataOffset)
            this.write('uint32', this.data.length)
            this.write('bytes', this.data)
        }

        return this.getPacket().slice(0, this.getOffset())
    }
}