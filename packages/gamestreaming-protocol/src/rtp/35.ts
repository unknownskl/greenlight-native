import Packet from '../packet'

export enum Types {
    None = 0,
    Handshake = 2,
    Data = 3,
}

export enum PacketTypes {
    Message = 2,
    Ack = 3,
    Framedata = 4,
}

export enum HandshakeTypes {
    Syn = 1,
    Ack = 2,
}

export enum SynTypes {
    None = 0,
    Unknown = 4,
}

export enum DataTypes {
    KeyValue = 1,
    // Ack = 3,
    // Framedata = 4,
}

export enum AckTypes {
    NoAck = 0,
    NeedsAck = 1,
    isAck = 2,
}

export interface DefaultOptions {
    type:Types;
}

// export interface DataOptions extends DefaultOptions {
//     sequence?:number;
//     nextSequence?:number;
//     unknown1?:number
//     unknown2?:number
//     dataSize?:number
//     totalPackets?:number
//     dataOffset?:number
//     data?:Buffer
// }

export interface HandshakeOptions extends DefaultOptions {
    sequence?:number;
    handshakeType:HandshakeTypes;
    udid:Buffer;
    unknown1:number;
    unknown2:number;
    unknown3:number;
    unknown4:number;
    unknown5:number;
    synType?:SynTypes;
}

export interface MessageOptions extends DefaultOptions {
    sequence?:number;
    nextSequence?:number;
    unknown1?:number
    packetFormat:PacketTypes;
    dataType:DataTypes;
    ackType?:AckTypes;
    frameId:number;
}

export interface MessageKeyValueOptions extends MessageOptions {
    unknown2?:number
    key:string;
    value:string;
}

export default class Rtp97 extends Packet {
    type:Types
    sequence?:number
    nextSequence?:number
    packetFormat?:number
    dataType?:number
    ackType?:AckTypes
    frameId:number
    key?:string;
    value?:string;
    handshakeType?:HandshakeTypes;
    udid?:Buffer;
    synType?:SynTypes;
    unknown1?:number;
    unknown2?:number;
    unknown3?:number;
    unknown4?:number;
    unknown5?:number;

    constructor(packet:Buffer | DefaultOptions | MessageOptions | MessageKeyValueOptions | HandshakeOptions){
        super('35')

        if(packet instanceof Buffer){
            this.setPacket(packet)
            this.readHeader()

            this.type = this.read('uint16')

            if(this.type === Types.None) {
                // Do nothing

            } else if(this.type === Types.Handshake) {
                this.sequence = this.read('uint16')
                this.unknown1 = this.read('uint32')
                this.handshakeType = this.read('uint16')

                if(this.handshakeType === HandshakeTypes.Syn) {
                    this.unknown2 = this.read('uint16')
                    this.synType = this.read('uint32')

                    if(this.synType == SynTypes.None) {
                        this.unknown3 = this.read('uint32')
                        this.unknown4 = this.read('uint32')
                        this.unknown5 = this.read('uint16')
                        const udidLength = this.read('uint32')
                        this.udid = this.read('bytes', udidLength).toString()

                    } else if(this.synType == SynTypes.Unknown) {
                        this.unknown5 = this.read('uint32')

                    } else {
                        throw Error('RTP35: Packet synType not supported: '+this.synType)
                    }

                } else if(this.handshakeType === HandshakeTypes.Ack) {
                    this.udid = this.read('bytes', 20)

                } else {
                    throw Error('RTP35: Packet handshakeType not supported: '+this.handshakeType)
                }
                
            } else if(this.type === Types.Data) {
                this.sequence = this.read('uint16')
                this.unknown1 = this.read('uint32')
                this.packetFormat = this.read('uint32')

                if(this.packetFormat === PacketTypes.Message) {
                    const frameSize = this.read('uint32')
                    this.ackType = this.read('uint32')
                    this.frameId = this.read('uint32')
                    this.dataType = this.read('uint32')

                    if(this.dataType === DataTypes.KeyValue){
                        const keyLength = this.read('uint32')
                        const valueLength = this.read('uint32')
                        this.unknown2 = this.read('uint32')
                        const totalKVLength = this.read('uint32')
                        this.key = this.read('bytes', keyLength)
                        this.value = this.read('bytes', valueLength)

                    } else {
                        throw Error('RTP35: Packet dataType not supported: '+this.dataType)
                    }

                } else {
                    throw Error('RTP35: Packet packetFormat not supported: '+this.packetFormat)
                }

                this.nextSequence = this.read('uint16')

            } else {
                throw Error('RTP35: Packet type not supported: '+this.type)
            }
            
        } else {
            this.type = packet.type || Types.None

            if(this.type == Types.None) {
                // Do nothing

            } else if(this.type === Types.Handshake) {
                this.sequence = (packet as HandshakeOptions).sequence || 0
                this.unknown1 = (packet as HandshakeOptions).unknown1 || 0
                this.handshakeType = (packet as HandshakeOptions).handshakeType || HandshakeTypes.Syn

                if(this.handshakeType === HandshakeTypes.Syn) {
                    this.unknown2 = (packet as HandshakeOptions).unknown2 || 0
                    this.synType = (packet as HandshakeOptions).synType || SynTypes.None

                    if(this.synType == SynTypes.None) {
                        this.unknown3 = (packet as HandshakeOptions).unknown3 || 0
                        this.unknown4 = (packet as HandshakeOptions).unknown4 || 0
                        this.unknown5 = (packet as HandshakeOptions).unknown5 || 0
                        this.udid = (packet as HandshakeOptions).udid || Buffer.from('')

                    } else if(this.synType == SynTypes.Unknown) {
                        this.unknown5 = (packet as HandshakeOptions).unknown5 || 1

                    }

                } else if(this.handshakeType === HandshakeTypes.Ack) {
                    this.udid = (packet as HandshakeOptions).udid || Buffer.from('')
                }

            } else if(this.type === Types.Data) {
                this.sequence = (packet as MessageOptions).sequence || 0
                this.unknown1 = (packet as MessageOptions).unknown1 || 0
                this.packetFormat = (packet as MessageOptions).packetFormat || PacketTypes.Message

                if(this.packetFormat === PacketTypes.Message) {
                    this.ackType = (packet as MessageOptions).ackType || AckTypes.NoAck
                    this.frameId = (packet as MessageOptions).frameId || 0
                    this.dataType = (packet as MessageOptions).dataType || DataTypes.KeyValue

                    if(this.dataType === DataTypes.KeyValue){
                        this.unknown2 = (packet as MessageKeyValueOptions).unknown2 || 0
                        this.key = (packet as MessageKeyValueOptions).key || ''
                        this.value = (packet as MessageKeyValueOptions).value || ''
                    }

                }

                this.nextSequence = (packet as MessageKeyValueOptions).nextSequence
            }
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))
        this.write('uint16', this.type)

        if(this.type == Types.None) {
            // Do nothing

        } else if(this.type == Types.Handshake) {
            this.write('uint16', this.sequence)
            this.write('uint32', this.unknown1)
            this.write('uint16', this.handshakeType)

            if(this.handshakeType === HandshakeTypes.Syn) {
                this.write('uint16', this.unknown2)
                this.write('uint32', this.synType)

                if(this.synType == SynTypes.None) {
                    this.write('uint32', this.unknown3)
                    this.write('uint32', this.unknown4)
                    this.write('uint16', this.unknown5)
                    this.write('uint32', this.udid.length)
                    this.write('bytes', this.udid)

                } else if(this.synType == SynTypes.Unknown) {
                    this.write('uint32', this.unknown5)

                } else {
                    throw Error('RTP35: Packet synType not supported: '+this.synType)
                }

            } else if(this.handshakeType === HandshakeTypes.Ack) {
                this.write('bytes', this.udid)

            }

        } else if(this.type == Types.Data) {
            this.write('uint16', this.sequence)
            this.write('uint32', this.unknown1)
            this.write('uint32', this.packetFormat)

            if(this.packetFormat === PacketTypes.Message) {
                this.write('uint32', ((7*4)+this.key.length+this.value.length))
                this.write('uint32', this.ackType)
                this.write('uint32', this.frameId)
                this.write('uint32', this.dataType)

                if(this.dataType === DataTypes.KeyValue){
                    this.write('uint32', this.key.length)
                    this.write('uint32', this.value.length)
                    this.write('uint32', this.unknown2)
                    this.write('uint32', this.key.length+this.value.length)
                    this.write('bytes', this.key)
                    this.write('bytes', this.value)

                } else {
                    throw Error('RTP35: dataType not supported: '+this.dataType)
                }

            } else {
                throw Error('RTP35: Packet format not supported: '+this.packetFormat)
            }


        } else {
            throw Error('RTP35: Packet type not supported: '+this.type)
        }

        this.write('uint16', this.nextSequence)
        return this.getPacket().slice(0, this.getOffset())
    }
}