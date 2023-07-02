import Packet from '../../../packet'

enum HandshakeTypes {
    Ack = 1,
    Syn = 2
}

export interface DefaultOptions {
    udid?:Buffer
    unknown1?:number
}

export default class HandshakeResponseFormat extends Packet {
    udid:Buffer
    unknown1:number

    constructor(packet:Buffer | DefaultOptions){
        super('HandshakeResponseFormat')

        if(packet instanceof Buffer){
            this.setPacket(packet)

            const hasUdid = this.read('uint16')
            if(hasUdid > 0){
                this.setOffset(this.getOffset()-2)
                this.udid = this.read('bytes', 16)
            }
            this.unknown1 = this.read('uint32')

            this.checkReadAllBytes(this)

        } else {
            this.udid = packet.udid
            this.unknown1 = packet.unknown1 || 1
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        if(this.udid){
            this.write('bytes', this.udid)
        } else {
            this.write('uint16', 0)
        }
        this.write('uint32', this.unknown1)

        return this.getPacket().slice(0, this.getOffset())
    }
}