import Packet from '../packet'

export enum Types {
    Config = 0,
    Accepted = 1,
    Finished = 2
}

export interface DefaultOptions {
    type:Types;
}
export interface ConfigOptions extends DefaultOptions {
    unknown1?:number;
    unknown2?:number;
    unknown3?:number;
    sequence?:number;
}

export interface AcceptOptions extends DefaultOptions {
    unknown1?:number;
    unknown2?:number;
}

export default class URCPControl extends Packet {
    type:Types
    unknown1?:number
    unknown2?:number
    unknown3?:number
    sequence?:number

    constructor(packet:Buffer | DefaultOptions | ConfigOptions | AcceptOptions){
        super('URCPControl')

        if(packet instanceof Buffer){
            this.setPacket(packet)
            this.type = this.read('uint16')

            if(this.type === Types.Config) {
                this.unknown1 = this.read('uint24')
                this.unknown2 = this.read('uint32')
                this.unknown3 = this.read('uint32')
                this.sequence = this.read('uint32')

            } else if(this.type === Types.Accepted) {
                this.unknown1 = this.read('uint16')
                this.unknown2 = this.read('uint32')

            } else if(this.type === Types.Finished) {
                // Do nothing

            } else {
                throw Error('RTP100: Packet type not supported: '+this.type)
            }

            this.read('uint16')
            
        } else {
            this.type = packet.type || Types.Config

            if(this.type == Types.Config) {
                this.unknown1 = (packet as ConfigOptions).unknown1 || 786435
                this.unknown2 = (packet as ConfigOptions).unknown2 || 100
                this.unknown3 = (packet as ConfigOptions).unknown3 || 0
                this.sequence = (packet as ConfigOptions).sequence || 5

            } else if(this.type == Types.Accepted) {
                this.unknown1 = (packet as AcceptOptions).unknown1 || 1
                this.unknown2 = (packet as AcceptOptions).unknown2 || 0
            }

        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))
        this.write('uint16', this.type)

        if(this.type == Types.Config) {
            this.write('uint24', this.unknown1)
            this.write('uint32', this.unknown2)
            this.write('uint32', this.unknown3)
            this.write('uint32', this.sequence)

        } else if(this.type == Types.Accepted) {
            this.write('uint16', this.unknown1)
            this.write('uint32', this.unknown2)
            
        } else if(this.type === Types.Finished) {
            // Do nothing

        } else {
            throw Error('RTP100: Packet type not supported: '+this.type)
        }

        this.write('bytes', Buffer.from('0000', 'hex')) // null padding
        return this.getPacket().slice(0, this.getOffset())
    }
}