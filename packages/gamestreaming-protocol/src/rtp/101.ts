import Packet from '../packet'

export enum Types {
    None = 0,
    Disconnect = 4,
    Request = 9,
    Confirm = 18,
}

export interface DefaultOptions {
    type:Types;
    header?:number;
}
export interface RequestOptions extends DefaultOptions {
    unknown1?:number
    unknown2?:number
    unknown3?:number
    unknown4?:number
    unknown5?:number
    unknown6?:number
    unknown7?:number
    unknown8?:number
}

// export interface AckOptions extends DisconnectOptions {
//     custom_binary?:Buffer
// }

export default class Rtp102 extends Packet {
    header:number
    type:Types
    unknown1?:number
    unknown2?:number
    unknown3?:number
    unknown4?:number
    unknown5?:number
    unknown6?:number
    unknown7?:number
    unknown8?:number

    constructor(packet:Buffer | DefaultOptions | RequestOptions){
        super('101')

        if(packet instanceof Buffer){
            this.setPacket(packet)
            
            this.header = this.read('uint32')
            this.type = this.read('uint32')

            if(this.type == Types.Request) {
                this.unknown1 = this.read('uint32')
                this.unknown2 = this.read('uint32')
                this.unknown3 = this.read('uint32')
                this.unknown4 = this.read('uint32')
                this.unknown5 = this.read('uint32')
                this.unknown6 = this.read('uint32')
                this.unknown7 = this.read('uint32')
                this.unknown8 = this.read('uint32')

            } else if(this.type === Types.Disconnect) {
                // Do nothing

            } else if(this.type === Types.None) {
                // Do nothing

            } else if(this.type === Types.Confirm) {
                // Do nothing
                
            } else {
                throw Error('RTP101: Packet type not supported: '+this.type)
            }

            this.read('uint16') // Read 2 null bytes
            
        } else {
            this.header = packet.header || 0
            this.type = packet.type || 0

            if(this.type == Types.Request) {
                this.unknown1 = (packet as RequestOptions).unknown1 || 100
                this.unknown2 = (packet as RequestOptions).unknown2 || 0
                this.unknown3 = (packet as RequestOptions).unknown3 || 8000
                this.unknown4 = (packet as RequestOptions).unknown4 || 0
                this.unknown5 = (packet as RequestOptions).unknown5 || 10
                this.unknown6 = (packet as RequestOptions).unknown6 || 100
                this.unknown7 = (packet as RequestOptions).unknown7 || 5000
                this.unknown8 = (packet as RequestOptions).unknown8 || 0
            }
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        if(this.type === Types.Disconnect) {
            this.write('uint32', 4294967295) // Disconnect header is usually FF FF FF FF
        } else {
            this.write('uint32', this.header)
        }
        this.write('uint32', this.type)

        if(this.type === Types.Request) {
            this.write('uint32', this.unknown1)
            this.write('uint32', this.unknown2)
            this.write('uint32', this.unknown3)
            this.write('uint32', this.unknown4)
            this.write('uint32', this.unknown5)
            this.write('uint32', this.unknown6)
            this.write('uint32', this.unknown7)
            this.write('uint32', this.unknown8)

        } else if(this.type === Types.Disconnect) {
            // Do nothing

        } else if(this.type === Types.None) {
            // Do nothing

        } else if(this.type === Types.Confirm) {
            // Do nothing

        } else {
            throw Error('RTP101: Packet type not supported: '+this.type)
        }

        this.write('bytes', Buffer.from('0000', 'hex')) // null padding
        return this.getPacket().slice(0, this.getOffset())
    }
}