import Packet from '../../../../packet'

export enum Types {
    Video = 4096,
    VideoAck2 = 128,
    VideoAck3 = 258,
    VideoAck = 34,
}

interface metadataFormat {
    unknown1?:number
    unknown2?:number
    unknown3?:number
    unknown4?:number
    unknown5?:number
    unknown6?:number
}

export interface DefaultOptions {
    frameId:number
    relativeTimestamp:number
}

export interface VideoOptions extends DefaultOptions {
    metadata:metadataFormat
}

export interface VideoAckOptions extends DefaultOptions {
    unknown1?:number
}

export default class DataDataVideoFormat extends Packet {
    type:Types
    frameId:number
    relativeTimestamp:number
    metadata:metadataFormat
    unknown1:number

    constructor(packet:Buffer | DefaultOptions | VideoOptions | VideoAckOptions){
        super('DataDataVideoFormat')

        if(packet instanceof Buffer){
            this.setPacket(packet)

            const frameSize = this.read('uint32')
            const type = this.read('uint32')
            this.frameId = this.read('uint32')
            this.relativeTimestamp = this.read('uint32')
            
            if(type === Types.Video){
                this.metadata = {}
                this.metadata.unknown1 = this.read('uint32')
                this.metadata.unknown2 = this.read('uint32')
                this.metadata.unknown3 = this.read('uint32')
                this.metadata.unknown4 = this.read('uint32')
                this.metadata.unknown5 = this.read('uint32')
                this.metadata.unknown6 = this.read('uint32')

            } else if(type === Types.VideoAck2){
                this.unknown1 = this.read('uint32')

            } else if(type === Types.VideoAck){
                //

            } else if(type === Types.VideoAck3){
                //

            } else {
                throw Error(__filename+'[constructor()]: Packet type not supported: '+type)
            }

            this.checkReadAllBytes(this)

        } else {
            this.frameId = packet.frameId || 0
            this.relativeTimestamp = packet.relativeTimestamp || 0

            if((packet as VideoOptions).metadata){
                this.type = Types.Video

                this.metadata = {
                    unknown1: (packet as VideoOptions).metadata.unknown1 || 250,
                    unknown2: (packet as VideoOptions).metadata.unknown2 || 0,
                    unknown3: (packet as VideoOptions).metadata.unknown3 || 200,
                    unknown4: (packet as VideoOptions).metadata.unknown4 || 0,
                    unknown5: (packet as VideoOptions).metadata.unknown5 || 0,
                    unknown6: (packet as VideoOptions).metadata.unknown6 || 1079984128,
                }
            } else if((packet as VideoAckOptions).unknown1 !== undefined) {
                this.type = Types.VideoAck2
                this.unknown1 = (packet as VideoAckOptions).unknown1 || 0

            } else {
                this.type = Types.VideoAck
            }

        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        this.write('uint32', (3*4)+((this.type === Types.Video) ? (6*4) : (this.type === Types.VideoAck2) ? 4 : 0))
        this.write('uint32', this.type)
        this.write('uint32', this.frameId)
        this.write('uint32', this.relativeTimestamp)

        if(this.type === Types.Video){
            this.write('uint32', this.metadata.unknown1)
            this.write('uint32', this.metadata.unknown2)
            this.write('uint32', this.metadata.unknown3)
            this.write('uint32', this.metadata.unknown4)
            this.write('uint32', this.metadata.unknown5)
            this.write('uint32', this.metadata.unknown6)

        } else if(this.type === Types.VideoAck){
            //

        } else if(this.type === Types.VideoAck3){
            //

        } else if(this.type === Types.VideoAck2){
            this.write('uint32', this.unknown1)

        } else {
            throw Error(__filename+'[constructor()]: Packet type not supported: '+this.type)
        }

        return this.getPacket().slice(0, this.getOffset())
    }
}