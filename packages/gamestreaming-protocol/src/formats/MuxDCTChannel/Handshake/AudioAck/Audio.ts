import Packet from '../../../../packet'

export interface DefaultOptions {
    rate?:number
    unknown1?:number
}

export default class HandshakeAudioAckAudioFormat extends Packet {
    rate:number
    unknown1:number

    constructor(packet:Buffer | DefaultOptions){
        super('HandshakeAudioAckAudioFormat')

        if(packet instanceof Buffer){
            this.setPacket(packet)

            this.rate = this.read('uint32')
            this.unknown1 = this.read('uint32')

            this.checkReadAllBytes(this)

        } else {
            this.rate = packet.rate || 48000
            this.unknown1 = packet.unknown1 || 0
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        this.write('uint32', this.rate)
        this.write('uint32', this.unknown1)

        return this.getPacket().slice(0, this.getOffset())
    }
}