import Packet from '../../../../packet'

export enum Types {
    Audio = 4,
    QoS = 1,
}

export interface DefaultOptions {
    unknown1?:number
}

export interface AudioOptions extends DefaultOptions {
    unknown2?:number
    frameId:number
    relativeTimestamp:number
    data:Buffer
}

export interface QosOptions extends DefaultOptions {
    unknown3?:number
}

export default class DataDataAudioFormat extends Packet {
    unknown1:number
    unknown2:number
    unknown3:number
    unknown4:number
    unknown5:number
    unknown6:number
    unknown7:number
    unknown8:number
    unknown9:number
    unknown10:number
    frameId:number
    relativeTimestamp:number
    data:Buffer

    constructor(packet:Buffer | AudioOptions | QosOptions){
        super('DataDataAudioFormat')

        if(packet instanceof Buffer){
            this.setPacket(packet)
            this.unknown1 = this.read('uint16')
            const type = this.read('uint32')
            
            if(type === 4){
                this.frameId = this.read('uint32')
                this.relativeTimestamp = this.read('uint32')
                this.unknown2 = this.read('uint32')
                const frameSize = this.read('uint32')
                this.data = this.read('bytes', frameSize)

            } else if(type === 1){
                this.data = this.read('remainder')

            } else {
                throw new Error(__filename+'[constructor()]: Unknown type: '+type)
            }

            this.checkReadAllBytes(this)

        } else {
            this.unknown1 = packet.unknown1 || 0

            if((packet as AudioOptions).frameId){
                this.unknown2 = (packet as AudioOptions).unknown2 || 0
                this.frameId = (packet as AudioOptions).frameId
                this.relativeTimestamp = (packet as AudioOptions).relativeTimestamp
                this.data = (packet as AudioOptions).data
            }
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        this.write('uint16', this.unknown1)

        if(this.frameId){
            this.write('uint32', Types.Audio)
            this.write('uint32', this.frameId)
            this.write('uint32', this.relativeTimestamp)
            this.write('uint32', this.unknown2)
            this.write('uint32', this.data.length)
            this.write('bytes', this.data)

        } else {
            throw new Error(__filename+'[constructor()]: Unable to detect type')
        }
        

        return this.getPacket().slice(0, this.getOffset())
    }
}