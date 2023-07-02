import Packet from '../../../packet'

enum HandshakeTypes {
    Ack = 1,
    Syn = 2
}

export interface DefaultOptions {
    unknown1?:number
}

export interface UnknownOptions extends DefaultOptions {
    unknown2:number
    unknown3?:number
}

export interface UdidOptions extends DefaultOptions {
    unknown2?:number
    unknown3?:number
    unknown4?:number
    unknown5?:number
    udid:string
}

export default class HandshakeRequestFormat extends Packet {
    unknown1?:number
    unknown2?:number
    unknown3?:number
    unknown4?:number
    unknown5?:number
    udid:string

    constructor(packet:Buffer | UnknownOptions | UdidOptions){
        super('HandshakeRequestFormat')

        if(packet instanceof Buffer){
            this.setPacket(packet)

            this.unknown1 = this.read('uint16')
            this.unknown2 = this.read('uint32')

            if(this.unknown2 == 4){
                this.unknown3 = this.read('uint32')

            } else if(this.unknown2 == 0) {
                this.unknown3 = this.read('uint32')
                this.unknown4 = this.read('uint32')
                this.unknown5 = this.read('uint16')
                const dataLength = this.read('uint32')
                this.udid = this.read('bytes', dataLength).toString()

            } else {
                throw Error('src/formats/MuxDCTChannel.ts[constructor()]: unknown2 not supported: '+this.unknown2)
            }

            this.checkReadAllBytes(this)
            
        } else {
            this.unknown1 = packet.unknown1 || 0
            this.unknown2 = packet.unknown2 || 0
            
            if(this.unknown2 == 0) {
                this.unknown3 = packet.unknown3 || 0
                this.unknown4 = (packet as UdidOptions).unknown4 || 0
                this.unknown5 = (packet as UdidOptions).unknown5 || 0
                this.udid = (packet as UdidOptions).udid

            } else if(this.unknown2 == 4) {
                this.unknown3 = packet.unknown3 || 1
            }
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        this.write('uint16', this.unknown1)
        this.write('uint32', this.unknown2)
        if(this.unknown2 == 4){
            this.write('uint32', this.unknown3)

        } else if(this.unknown2 == 0) {
            this.write('uint32', this.unknown3)
            this.write('uint32', this.unknown4)
            this.write('uint16', this.unknown5)
            this.write('uint32', this.udid.length)
            this.write('bytes', this.udid)

        } else {
            throw Error('src/formats/MuxDCTChannel.ts[constructor()]: unknown2 not supported: '+this.unknown2)
        }

        return this.getPacket().slice(0, this.getOffset())
    }
}