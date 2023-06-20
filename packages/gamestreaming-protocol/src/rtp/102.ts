import Packet from '../packet'

export enum Types {
    Syn = 1,
    Ack = 2
}

export interface SynOptions {
    type:Types;
    length:number;
}
export interface AckOptions extends SynOptions {
    custom_binary?:Buffer
}

export default class Rtp102 extends Packet {
    type:Types
    length:number
    custom_binary?:Buffer

    constructor(packet:Buffer | AckOptions | SynOptions){
        super('102')

        if(packet instanceof Buffer){
            this.setPacket(packet)
            this.type = this.read('uint16') // Read first 2 bytes

            if(this.type === Types.Syn) {
                this.length = this.read('remainder').length
            } else if(this.type === Types.Ack) {
                this.length = this.read('uint16')
            } else {
                throw Error('RTP102: Packet type not supported: '+this.type)
            }
            
        } else {
            this.type = packet.type || Types.Syn
            this.length = packet.length || 0

            if(this.type !== Types.Syn && this.type !== Types.Ack)
                throw new Error('packet.type needs to be 1 (syn) or 2 (ack)')

        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))
        this.write('uint16', this.type)

        if(this.type == Types.Syn) {
            this.write('uint16', 1)
            this.write('bytes', Buffer.from('00'.repeat(this.length-4), 'hex'))

        } else if(this.type == Types.Ack) {
            this.write('uint16', this.length)
        } else {
            throw Error('RTP102: Packet type not supported: '+this.type)
        }

        this.write('bytes', Buffer.from('0000', 'hex')) // null padding
        return this.getPacket().slice(0, this.getOffset())
    }
}