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

export default class UDPConnectionProbing extends Packet {
    type:Types
    length:number
    custom_binary?:Buffer

    constructor(packet:Buffer | AckOptions | SynOptions){
        super('UDPConnectionProbing')

        if(packet instanceof Buffer){
            this.setPacket(packet)
            this.type = this.read('uint16')

            if(this.type === Types.Syn) {
                this.length = this.read('remainder', -2).length+2
                
            } else if(this.type === Types.Ack) {
                this.length = this.read('uint16')
                
            } else {
                throw Error('UDPConnectionProbing: packet.type not supported: '+this.type)
            }

            this.read('uint16') // Null padding
            
        } else {

            this.type = packet.type || Types.Syn
            this.length = packet.length || 0

            if((packet as AckOptions).custom_binary)
                this.custom_binary = (packet as AckOptions).custom_binary

            if(! Object.values(Types).includes(this.type))
                throw new Error('UDPConnectionProbing: packet.type needs to be one of: '+ Object.keys(Types).join(', '))
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))
        this.write('uint16', this.type)

        if(this.type == Types.Syn) {
            if(this.custom_binary){
                this.write('bytes', this.custom_binary)
            } else {
                this.write('bytes', Buffer.from('00'.repeat(this.length-2), 'hex'))
            }

        } else if(this.type == Types.Ack) {
            this.write('uint16', this.length)
        } else {
            throw Error('UDPConnectionProbing: packet.type not supported: '+this.type)
        }

        this.write('bytes', Buffer.from('0000', 'hex')) // Null padding
        return this.getPacket().slice(0, this.getOffset())
    }
}