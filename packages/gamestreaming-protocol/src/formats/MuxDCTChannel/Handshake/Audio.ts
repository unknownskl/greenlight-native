import Packet from '../../../packet'

export enum AudioType {
    ChatAudio = 1,
    Audio = 2,
}

export interface DefaultOptions {
    relativeTimestamp?:number
    rate?:number
    unknown1?:number
    unknown2?:number
    audioType:number
    unknown3?:number
    unknown4?:number
    unknown5?:number
}

export default class HandshakeAudioFormat extends Packet {
    unknown1:number
    unknown2:number
    audioType:number
    unknown3:number
    unknown4:number
    unknown5:number
    relativeTimestamp:number
    rate:number

    constructor(packet:Buffer | DefaultOptions){
        super('HandshakeAudioFormat')

        if(packet instanceof Buffer){
            this.setPacket(packet)

            this.unknown1 = this.read('uint16')
            this.relativeTimestamp = this.read('long')
            this.unknown2 = this.read('uint32')
            this.audioType = this.read('uint32')
            if(this.audioType === AudioType.ChatAudio){
                this.rate = this.read('uint32')
                this.unknown3 = this.read('uint32')
                this.unknown4 = this.read('uint32')
                this.unknown5 = this.read('uint32')

            } else if(this.audioType === AudioType.Audio){
                this.rate = this.read('uint32')
                this.unknown5 = this.read('uint32')
            }

            this.checkReadAllBytes(this)

        } else {
            this.unknown1 = packet.unknown1 || 0
            this.relativeTimestamp = packet.relativeTimestamp
            this.unknown2 = packet.unknown2 || 1
            this.audioType = packet.audioType || 1

            this.rate = packet.rate || (this.audioType === AudioType.ChatAudio) ? 24000 : 48000

            if(this.audioType === AudioType.ChatAudio){
                this.unknown3 = packet.unknown3 || 1
                this.unknown4 = packet.unknown4 || 2
            }

            this.unknown5 = packet.unknown5 || 0
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        this.write('uint16', this.unknown1)
        this.write('long', this.relativeTimestamp)
        this.write('uint32', this.unknown2)
        this.write('uint32', this.audioType)
        this.write('uint32', this.rate)
        if(this.audioType === AudioType.ChatAudio){
            this.write('uint32', this.unknown3)
            this.write('uint32', this.unknown4)
        }
        this.write('uint32', this.unknown5)

        return this.getPacket().slice(0, this.getOffset())
    }
}