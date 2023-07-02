import Packet from '../packet'

export enum Types {
    None = 0,
    Disconnect = 4,
    Config = 9,
    ConfigAck = 18,
}

export interface DefaultOptions {
    type:Types;
    header?:number;
}
export interface ConfigOptions extends DefaultOptions {
    unknown1?:number
    unknown2?:number
    unknown3?:number
    unknown4?:number
    unknown5?:number
    unknown6?:number
    unknown7?:number
    unknown8?:number
}

export default class UDPKeepAlive extends Packet {
    header:number
    type:Types
    custom_binary?:Buffer
    unknown1?:number
    unknown2?:number
    unknown3?:number
    unknown4?:number
    unknown5?:number
    unknown6?:number
    unknown7?:number
    unknown8?:number

    constructor(packet:Buffer | DefaultOptions | ConfigOptions){
        super('UDPKeepAlive')

        if(packet instanceof Buffer){
            this.setPacket(packet)
            
            this.header = this.read('uint32')
            this.type = this.read('uint32')

            if(this.type == Types.Config) {
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

            } else if(this.type === Types.ConfigAck) {
                // Do nothing
                
            } else {
                throw Error('RTP101: Packet type not supported: '+this.type)
            }

            const remainder = this.read('uint16') // Null padding or remainder

            if(remainder != 0){
                this.setOffset(this.getOffset()-2)
                this.custom_binary = this.read('remainder', -2)

                this.read('uint16') // Null padding
            }
            
        } else {
            this.header = packet.header || 0
            this.type = packet.type || 0

            if(this.type == Types.Config) {
                this.unknown1 = (packet as ConfigOptions).unknown1 || 100
                this.unknown2 = (packet as ConfigOptions).unknown2 || 0
                this.unknown3 = (packet as ConfigOptions).unknown3 || 8000
                this.unknown4 = (packet as ConfigOptions).unknown4 || 0
                this.unknown5 = (packet as ConfigOptions).unknown5 || 10
                this.unknown6 = (packet as ConfigOptions).unknown6 || 100
                this.unknown7 = (packet as ConfigOptions).unknown7 || 5000
                this.unknown8 = (packet as ConfigOptions).unknown8 || 0
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

        if(this.type === Types.Config) {
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

        } else if(this.type === Types.ConfigAck) {
            // Do nothing

        } else {
            throw Error('RTP101: Packet type not supported: '+this.type)
        }

        this.write('bytes', Buffer.from('0000', 'hex')) // Null padding
        return this.getPacket().slice(0, this.getOffset())
    }
}