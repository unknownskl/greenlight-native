import Packet from '../packet'

interface videoFormats {
    fps:number
    width:number
    height:number
    codec:number
}

export enum Types {
    None = 0,
    Handshake = 2,
    Data = 3,
    Config = 4,
    ConfigAck = 5,
}

export enum PacketTypes {
    Message = 2,
    Data = 3,
    Framedata = 4,
    UnknownControl = 7,
}

export enum HandshakeTypes {
    Syn = 1,
    Ack = 2,
}

export enum ConfigTypes {
    VideoServer = 1,
    VideoClient = 2,
    VideoAck = 3,
    VideoFrame = 4,
    Input = 5,
    InputAck = 6,

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

export interface ConfigOptions extends DefaultOptions {
    sequence?:number;
    nextSequence:number
    packetFormat:PacketTypes;
    unknown1:number;
    unknown2:number;
    unknown3:number;
    unknown4:number;
    unknown5:number;
    unknown6:number;
    unknown7:number;
    unknown8:number;
}

export interface ChannelConfigOptions extends DefaultOptions {
    sequence?:number;
    unknown1?:number;
    nextSequence?:number
    configType:ConfigTypes
}

export interface ConfigAckOptions extends ChannelConfigOptions {
    unknown2?:number
    unknown3?:number
    unknown4?:number
}

export interface VideoServerChannelConfigOptions extends ChannelConfigOptions {
    unknown2?:number
    unknown3?:number
    width:number;
    height:number;
    fps:number;
    relativeTimestamp:number;
    videoFormats:Array<videoFormats>;
}

export interface VideoClientChannelConfigOptions extends ChannelConfigOptions {
    unknown2?:number
    unknown3?:number
    width:number;
    height:number;
    fps:number;
    frameId:number;
}

export interface FramedataEmptyOptions extends DefaultOptions {
    sequence?:number;
    nextSequence?:number;
    packetFormat:PacketTypes;
    empty:number;
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
    empty?:number;
    configType:ConfigTypes;
    width:number;
    height:number;
    fps:number;
    relativeTimestamp:number;
    videoFormats:Array<videoFormats>;
    dataSize?:number
    totalPackets?:number
    dataOffset?:number
    data?:Buffer
    metadata?:Buffer
    unknown1?:number;
    unknown2?:number;
    unknown3?:number;
    unknown4?:number;
    unknown5?:number;
    unknown6?:number;
    unknown7?:number;
    unknown8?:number;
    unknown9?:number;
    unknown10?:number;
    unknown11?:number;

    constructor(packet:Buffer | DefaultOptions | MessageOptions | MessageKeyValueOptions | HandshakeOptions | ConfigOptions | FramedataEmptyOptions | ChannelConfigOptions | VideoServerChannelConfigOptions | VideoClientChannelConfigOptions | ConfigAckOptions){
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
                this.packetFormat = this.read('uint16')

                if(this.packetFormat === PacketTypes.Message) {
                    this.read('uint16')
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

                } else if(this.packetFormat === PacketTypes.Data) {
                    this.read('uint16')
                    this.unknown2 = this.read('uint32')
                    const datasize = this.read('uint32')
                    this.unknown3 = this.read('uint32')
                    this.unknown4 = this.read('uint32')
                    this.unknown5 = this.read('uint32')
                    this.unknown6 = this.read('uint32')
                    this.unknown7 = this.read('uint32')
                    this.unknown8 = this.read('uint32')
                    this.unknown9 = this.read('uint32')
                    this.unknown10 = this.read('uint32')
                    this.unknown11 = this.read('uint32')


                } else if(this.packetFormat === PacketTypes.Framedata) {
                    this.empty = this.read('uint16')

                } else if(this.packetFormat === PacketTypes.UnknownControl) {
                    this.unknown2 = this.read('uint32')
                    this.unknown3 = this.read('uint16')
                    this.unknown4 = this.read('uint32')
                    this.unknown5 = this.read('uint32')
                    this.unknown6 = this.read('uint32')
                    this.unknown7 = this.read('uint32')
                    this.unknown8 = this.read('uint24')

                } else {
                    throw Error('RTP35: Packet packetFormat not supported: '+this.packetFormat)
                }

                this.nextSequence = this.read('uint16')

            } else if(this.type === Types.Config) {
                this.sequence = this.read('uint16')
                this.unknown1 = this.read('uint32')
                this.configType = this.read('uint32')

                if(this.configType === ConfigTypes.VideoServer) {
                    this.unknown2 = this.read('uint32')
                    const dataSize = this.read('uint32')
                    this.unknown3 = this.read('uint32')
                    this.width = this.read('uint32')
                    this.height = this.read('uint32')
                    this.fps = this.read('uint32')
                    this.relativeTimestamp = this.read('long')
                    const formatCount = this.read('uint32')
                    this.videoFormats = []
                    for(let i=1; i<=formatCount;i++){
                        const format = {
                            fps: this.read('uint32'),
                            width: this.read('uint32'),
                            height: this.read('uint32'),
                            codec: this.read('uint32'),
                        }
                        this.videoFormats.push(format)
                    }

                } else if(this.configType === ConfigTypes.VideoClient) {
                    this.unknown2 = this.read('uint32')
                    const dataSize = this.read('uint32')
                    this.frameId = this.read('uint32')
                    this.fps = this.read('uint32')
                    this.width = this.read('uint32')
                    this.height = this.read('uint32')
                    this.unknown3 = this.read('uint32')

                } else {
                    throw Error('RTP35: Config type not supported: '+this.configType)
                }
                    
                this.nextSequence = this.read('uint16')

            } else if(this.type === Types.ConfigAck) {
                this.sequence = this.read('uint16')
                this.unknown1 = this.read('uint32')
                this.configType = this.read('uint32')

                if(this.configType === ConfigTypes.VideoAck) {
                    this.unknown2 = this.read('uint32')
                    this.unknown3 = this.read('uint32')
                    this.unknown4 = this.read('uint32')

                } else if(this.configType === ConfigTypes.VideoFrame) {
                    this.unknown2 = this.read('uint32')
                    const dataSize = this.read('uint32')
                    this.unknown3 = this.read('uint32')
                    this.frameId = this.read('uint32')
                    this.relativeTimestamp = this.read('long')
                    this.unknown4 = this.read('uint32')
                    this.dataSize = this.read('uint32')
                    this.totalPackets = this.read('uint32')
                    this.dataOffset = this.read('uint32')
                    const metadataSize = this.read('uint32')
                    const frameSize = this.read('uint32')
                    this.data = this.read('bytes', frameSize)
                    this.metadata = this.read('bytes', metadataSize)


                } else {
                    throw Error('RTP35: ConfigAck type not supported: '+this.configType)
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

                this.nextSequence = (packet as MessageKeyValueOptions).nextSequence

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

                } else if(this.packetFormat === PacketTypes.Framedata) {
                    this.empty = (packet as FramedataEmptyOptions).empty || 0

                } else if(this.packetFormat === PacketTypes.UnknownControl) {
                    this.unknown2 = (packet as ConfigOptions).unknown2 || 5000000
                    this.unknown3 = (packet as ConfigOptions).unknown3 || 1
                    this.unknown4 = (packet as ConfigOptions).unknown4 || 3489660933
                    this.unknown5 = (packet as ConfigOptions).unknown5 || 2
                    this.unknown6 = (packet as ConfigOptions).unknown6 || 50331648
                    this.unknown7 = (packet as ConfigOptions).unknown7 || 0
                    this.unknown8 = (packet as ConfigOptions).unknown8 || 0
                    
                }

                this.nextSequence = (packet as MessageKeyValueOptions).nextSequence

            } else if(this.type === Types.Config) {
                this.sequence = (packet as ChannelConfigOptions).sequence || 0
                this.unknown1 = (packet as ChannelConfigOptions).unknown1 || 0
                this.configType = (packet as ChannelConfigOptions).configType || ConfigTypes.VideoServer

                if(this.configType == ConfigTypes.VideoServer){
                    this.unknown2 = (packet as VideoServerChannelConfigOptions).unknown2 || 1
                    this.unknown3 = (packet as VideoServerChannelConfigOptions).unknown3 || 6
                    this.width = (packet as VideoServerChannelConfigOptions).width || 1280
                    this.height = (packet as VideoServerChannelConfigOptions).height || 720
                    this.fps = (packet as VideoServerChannelConfigOptions).fps || 60
                    this.relativeTimestamp = (packet as VideoServerChannelConfigOptions).relativeTimestamp || 0
                    this.videoFormats = (packet as VideoServerChannelConfigOptions).videoFormats || []

                } else if(this.configType == ConfigTypes.VideoClient){
                    this.unknown2 = (packet as VideoClientChannelConfigOptions).unknown2 || 1
                    this.width = (packet as VideoClientChannelConfigOptions).width || 1280
                    this.height = (packet as VideoClientChannelConfigOptions).height || 720
                    this.fps = (packet as VideoClientChannelConfigOptions).fps || 60
                    this.frameId = (packet as VideoClientChannelConfigOptions).frameId || 0
                }

                this.nextSequence = (packet as MessageKeyValueOptions).nextSequence

            } else if(this.type === Types.ConfigAck) {
                this.sequence = (packet as ChannelConfigOptions).sequence || 0
                this.unknown1 = (packet as ChannelConfigOptions).unknown1 || 0
                this.configType = (packet as ChannelConfigOptions).configType || ConfigTypes.VideoAck

                this.unknown2 = (packet as ConfigAckOptions).unknown2 || 1
                this.unknown3 = (packet as ConfigAckOptions).unknown3 || 4
                this.unknown4 = (packet as ConfigAckOptions).unknown4 || 48

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
            this.write('uint16', this.packetFormat)

            if(this.packetFormat === PacketTypes.Message) {
                this.write('uint16', 0)
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

            // } else if(this.packetFormat === PacketTypes.Data) {
            //     //

            } else if(this.packetFormat === PacketTypes.Framedata) {
                this.write('uint16', this.empty)

            } else if(this.packetFormat === PacketTypes.UnknownControl) {
                this.write('uint32', this.unknown2)
                this.write('uint16', this.unknown3)
                this.write('uint32', this.unknown4)
                this.write('uint32', this.unknown5)
                this.write('uint32', this.unknown6)
                this.write('uint32', this.unknown7)
                this.write('uint24', this.unknown8)

            } else {
                throw Error('RTP35: Packet format not supported: '+this.packetFormat)
            }


        } else if(this.type == Types.Config) {
            this.write('uint16', this.sequence)
            this.write('uint32', this.unknown1)
            this.write('uint32', this.configType)

            if(this.configType === ConfigTypes.VideoServer) {
                this.write('uint32', this.unknown2)
                this.write('uint32', (28+(this.videoFormats.length*16)))
                this.write('uint32', this.unknown3)
                this.write('uint32', this.width)
                this.write('uint32', this.height)
                this.write('uint32', this.fps)
                this.write('long', this.relativeTimestamp)
                this.write('uint32', this.videoFormats.length)

                for(const format in this.videoFormats){
                    this.write('uint32', this.videoFormats[format].fps)
                    this.write('uint32', this.videoFormats[format].width)
                    this.write('uint32', this.videoFormats[format].height)
                    this.write('uint32', this.videoFormats[format].codec)
                }

            } else if(this.configType === ConfigTypes.VideoClient) {
                this.write('uint32', this.unknown2)
                this.write('uint32', 20)
                this.write('uint32', this.frameId)
                this.write('uint32', this.fps)
                this.write('uint32', this.width)
                this.write('uint32', this.height)
                this.write('uint32', this.unknown3)

            } else {
                throw Error('RTP35: Config type not supported: '+this.configType)
            }

        } else if(this.type === Types.ConfigAck) {
            this.write('uint16', this.sequence)
            this.write('uint32', this.unknown1)
            this.write('uint32', this.configType)

            if(this.configType === ConfigTypes.VideoAck) {
                this.write('uint32', this.unknown2)
                this.write('uint32', this.unknown3)
                this.write('uint32', this.unknown4)

            // } else if(this.configType === ConfigTypes.VideoFrame) {
            //     //

            } else {
                throw Error('RTP35: ConfigAck type not supported: '+this.type)
            }

        } else {
            throw Error('RTP35: Packet type not supported: '+this.type)
        }

        this.write('uint16', this.nextSequence)
        return this.getPacket().slice(0, this.getOffset())
    }
}