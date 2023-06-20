import Packet from '../packet'

export enum Types {
    OpenChannel = 2,
    Confirm = 3,
}

export interface DefaultOptions {
    type:Types;
}
export interface OpenChannelOptions extends DefaultOptions {
    name:string;
    data?:Buffer
}

export interface ConfirmOptions extends DefaultOptions {
    data?:Buffer
}

export default class Rtp97 extends Packet {
    type:Types
    name?:string
    data?:Buffer

    constructor(packet:Buffer | DefaultOptions | OpenChannelOptions){
        super('97')

        if(packet instanceof Buffer){
            this.setPacket(packet)
            this.readHeader()

            this.type = this.read('uint32')

            if(this.type === Types.OpenChannel) {
                const nameLength = this.read('uint16')
                this.name = this.read('bytes', nameLength).toString()
                this.read('uint32')
                const dataLength = this.read('uint32')
                this.data = this.read('bytes', dataLength)

            } else if(this.type === Types.Confirm) {
                const dataLength = this.read('uint32')
                this.data = this.read('bytes', dataLength)
                
            } else {
                throw Error('RTP97: Packet type not supported: '+this.type)
            }
            
        } else {
            this.type = packet.type || Types.Confirm

            if(this.type == Types.OpenChannel) {
                this.name = (packet as OpenChannelOptions).name || ''
                this.data = (packet as OpenChannelOptions).data || Buffer.from('')

            } else if(this.type == Types.Confirm) {
                this.data = (packet as OpenChannelOptions).data || Buffer.from('')

            } else {
                throw Error('RTP97: Packet type not supported: '+this.type)
            }

        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))
        this.write('uint32', this.type)

        if(this.type == Types.OpenChannel) {
            this.write('uint16', this.name.length)
            this.write('bytes', this.name)
            this.write('bytes', Buffer.from('00000000', 'hex'))
            this.write('uint32', this.data.length)
            this.write('bytes', this.data)

        } else if(this.type == Types.Confirm) {
            this.write('uint32', this.data.length)
            this.write('bytes', this.data)

        } else {
            throw Error('RTP97: Packet type not supported: '+this.type)
        }

        this.write('bytes', Buffer.from('0000', 'hex')) // null padding
        return this.getPacket().slice(0, this.getOffset())
    }
}