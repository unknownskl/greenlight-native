import Packet from '../../../packet'

export interface DefaultOptions {
    unknown1?:number
    unknown2?:number
    ackType?:AckTypes
    frameId:number
    dataType:DataTypes
    key:string
    value:Buffer
}

export enum AckTypes {
    NoAck = 0,
    NeedsAck = 1,
    isAck = 2,
}

export enum DataTypes {
    KeyValue = 1,
}

export default class DataMessageFormat extends Packet {
    unknown1:number
    unknown2:number
    ackType:AckTypes
    frameId:number
    dataType:DataTypes
    key:string
    value:Buffer

    constructor(packet:Buffer | DefaultOptions){
        super('DataMessageFormat')

        if(packet instanceof Buffer){
            this.setPacket(packet)

            this.unknown1 = this.read('uint16')
                    
            const frameSize = this.read('uint32')
            this.ackType = this.read('uint32')
            this.frameId = this.read('uint32')
            this.dataType = this.read('uint32')

            if(this.dataType === DataTypes.KeyValue){
                const keyLength = this.read('uint32')
                const valueLength = this.read('uint32')
                this.unknown2 = this.read('uint32')
                const totalKVLength = this.read('uint32')
                this.key = this.read('bytes', keyLength).toString()
                this.value = this.read('bytes', valueLength)

            } else {
                throw Error(__filename+'[constructor()]: Packet type not supported: '+this.dataType)
            }

            this.checkReadAllBytes(this)

        } else {
            this.unknown1 = packet.unknown1 || 0
            this.ackType = packet.ackType || AckTypes.NoAck
            this.frameId = packet.frameId || 0
            this.dataType = packet.dataType || DataTypes.KeyValue

            if(this.dataType === DataTypes.KeyValue){
                this.unknown2 = packet.unknown2 || 0
                this.key = packet.key || ''
                this.value = packet.value || Buffer.from('')
            }
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        this.write('uint16', this.unknown1)
        this.write('uint32', ((7*4)+this.key.length+this.value.length))
        this.write('uint32', this.ackType)
        this.write('uint32', this.frameId)
        this.write('uint32', this.dataType)

        if(this.dataType === DataTypes.KeyValue){
            this.write('uint32', this.key.length)
            this.write('uint32', this.value.length)
            this.write('uint32', this.unknown2)
            this.write('uint32', this.key.length+this.value.length)
            this.write('bytes', this.key)
            this.write('bytes', this.value)

        } else {
                throw Error(__filename+'[constructor()]: Packet type not supported: '+this.dataType)
        }

        return this.getPacket().slice(0, this.getOffset())
    }
}