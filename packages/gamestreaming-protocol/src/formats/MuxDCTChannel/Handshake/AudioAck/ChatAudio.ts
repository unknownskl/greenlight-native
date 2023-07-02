import Packet from '../../../../packet'

export interface DefaultOptions {
    rate?:number
    unknown1?:number
    unknown2?:number
    unknown3?:number
}

export default class HandshakeAudioAckChatAudioFormat extends Packet {
    rate:number
    unknown1:number
    unknown2:number
    unknown3:number

    constructor(packet:Buffer | DefaultOptions){
        super('HandshakeAudioAckChatAudioFormat')

        if(packet instanceof Buffer){
            this.setPacket(packet)

            this.rate = this.read('uint32')
            this.unknown1 = this.read('uint32')
            this.unknown2 = this.read('uint32')
            this.unknown3 = this.read('uint32')

            this.checkReadAllBytes(this)

        } else {
            this.rate = packet.rate || 24000
            this.unknown1 = packet.unknown1 || 1
            this.unknown2 = packet.unknown2 || 2
            this.unknown3 = packet.unknown3 || 0
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        this.write('uint32', this.rate)
        this.write('uint32', this.unknown1)
        this.write('uint32', this.unknown2)
        this.write('uint32', this.unknown3)

        return this.getPacket().slice(0, this.getOffset())
    }
}