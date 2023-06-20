import Packet from '../packet'

export enum Types {
    Data = 3,
}

export interface DefaultOptions {
    type:Types;
}

export interface DataOptions extends DefaultOptions {
    sequence?:number;
    nextSequence?:number;
    unknown1?:number
    unknown2?:number
    dataSize?:number
    totalPackets?:number
    dataOffset?:number
    data?:Buffer
}

export default class Rtp97 extends Packet {
    type:Types
    sequence?:number
    nextSequence?:number
    unknown1?:number
    unknown2?:number
    dataSize?:number
    totalPackets?:number
    dataOffset?:number
    data?:Buffer

    constructor(packet:Buffer | DefaultOptions | DataOptions){
        super('40')

        if(packet instanceof Buffer){
            this.setPacket(packet)
            this.readHeader()

            this.type = this.read('uint16')

            if(this.type === Types.Data) {
                this.sequence = this.read('uint16')
                this.unknown1 = this.read('uint32')
                this.unknown2 = this.read('uint32')
                this.dataSize = this.read('uint32')
                this.totalPackets = this.read('uint32')
                this.dataOffset = this.read('uint32')
                const dataLength = this.read('uint32')
                this.data = this.read('bytes', dataLength)
                this.nextSequence = this.read('uint16')
                
            } else {
                throw Error('RTP40: Packet type not supported: '+this.type)
            }
            
        } else {
            this.type = packet.type || Types.Data

            if(this.type == Types.Data) {
                this.sequence = (packet as DataOptions).sequence || 0
                this.nextSequence = (packet as DataOptions).nextSequence || 0
                this.unknown1 = (packet as DataOptions).unknown1 || 0
                this.unknown2 = (packet as DataOptions).unknown2 || 1
                this.dataSize = (packet as DataOptions).dataSize || 0
                this.totalPackets = (packet as DataOptions).totalPackets || 0
                this.dataOffset = (packet as DataOptions).dataOffset || 0
                this.data = (packet as DataOptions).data || Buffer.from('')

            } else {
                throw Error('RTP40: Packet type not supported: '+this.type)
            }

        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))
        this.write('uint16', this.type)

        if(this.type == Types.Data) {
            this.write('uint16', this.sequence)
            this.write('uint32', this.unknown1)
            this.write('uint32', this.unknown2)
            this.write('uint32', this.dataSize)
            this.write('uint32', this.totalPackets)
            this.write('uint32', this.dataOffset)
            this.write('uint32', this.data.length)
            this.write('bytes', this.data)
            this.write('uint16', this.nextSequence)

        } else {
            throw Error('RTP40: Packet type not supported: '+this.type)
        }

        // this.write('bytes', Buffer.from('0000', 'hex')) // null padding
        return this.getPacket().slice(0, this.getOffset())
    }
}