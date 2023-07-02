import DCTPacket from '../DCTPacket'
import OpenChannelFormat, { Formats as OpenChannelFormats } from '../formats/MuxDCTChannel/Openchannel'
import DataFormat, { Formats as DataFormats } from '../formats/MuxDCTChannel/Data'
import FrameFormat, { Formats as FrameFormats } from '../formats/MuxDCTChannel/Frame'
import ConfigFormat, { Formats as ConfigFormats } from '../formats/MuxDCTChannel/Config'
import ConfigAckFormat, { Formats as ConfigAckFormats } from '../formats/MuxDCTChannel/ConfigAck'
import DataDataAudioFormat from '../formats/MuxDCTChannel/Data/Data/Audio'

export const Formats = {
    OpenChannel: OpenChannelFormat,
    OpenChannelFormats: OpenChannelFormats,
    Data: DataFormat,
    DataFormats: DataFormats,
    Config: ConfigFormat,
    ConfigFormats: ConfigFormats,
    ConfigAck: ConfigAckFormat,
    ConfigAckFormats: ConfigAckFormats,
    Frame: FrameFormat,
    FrameFormats: FrameFormats,
    DataAudio: DataDataAudioFormat,
}

export enum Types {
    None = 0,
    Frame = 1,
    OpenChannel = 2,
    Data = 3,
    Config = 4,
    ConfigAck = 5,
}

export interface DefaultOptions {
    type:Types;
    nextSequence?:number;
    sequence?:number;
    data?:OpenChannelFormat | DataFormat | ConfigFormat | ConfigAckFormat | FrameFormat;
}

export default class MuxDCTChannel extends DCTPacket {

    private _rtpPayloadType
    private _ssrc

    type:Types;
    nextSequence:number;
    sequence:number;
    unknown1:number;
    data:any;

    constructor(packet:Buffer | DefaultOptions, rtpPayloadType, ssrc){
        super('MuxDCTChannel')

        this._rtpPayloadType = rtpPayloadType
        this._ssrc = ssrc

        if(packet instanceof Buffer){
            this.setPacket(packet)
            this.readHeader()

            this.type = this.read('uint16')

            if(this.type === Types.None){
                // We have no payload.
                this.setOffset(this.getOffset()-2)

                // Hack for audio data as type is always 0..
                if((this.getPacket().length-2) !== this.getOffset()){
                    this.sequence = this.read('uint16')
                    this.unknown1 = this.read('uint32')

                    this.data = new DataDataAudioFormat(this.read('remainder', -2))
                }

            } else if(this.type === Types.Frame){
                this.sequence = this.read('uint16')
                this.unknown1 = this.read('uint32')

                this.data = new FrameFormat(this.read('remainder', -2))

            } else if(this.type === Types.OpenChannel){
                this.sequence = this.read('uint16')
                this.unknown1 = this.read('uint32')

                this.data = new OpenChannelFormat(this.read('remainder', -2))

            } else if(this.type === Types.Data){
                this.sequence = this.read('uint16')
                this.unknown1 = this.read('uint32')

                this.data = new DataFormat(this.read('remainder', -2))

            } else if(this.type === Types.Config){
                this.sequence = this.read('uint16')
                this.unknown1 = this.read('uint32')

                this.data = new ConfigFormat(this.read('remainder', -2))

            } else if(this.type === Types.ConfigAck){
                this.sequence = this.read('uint16')
                this.unknown1 = this.read('uint32')

                this.data = new ConfigAckFormat(this.read('remainder', -2))

            } else {
                throw Error('src/formats/MuxDCTChannel.ts[constructor()]: Packet type not supported: '+this.type)
            }

            this.nextSequence = this.read('uint16')
            this.checkReadAllBytes(this)
        } else {
            this.type = packet.type || Types.None
            this.nextSequence = packet.nextSequence || 0
            this.sequence = packet.sequence || 0
            this.data = packet.data
        }
 
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        if(this.type === Types.None){
            // Do nothing

            if(this.data !== undefined){
                this.write('uint16', this.sequence)
                this.write('uint32', this.unknown1)
                this.write('bytes', this.data.toPacket())
            }

        } else if(this.data instanceof FrameFormat){
            this.write('uint16', this.type)
            this.write('uint16', this.sequence)
            this.write('uint32', this.unknown1)
            this.write('bytes', this.data.toPacket())

        } else if(this.data instanceof OpenChannelFormat){
            this.write('uint16', this.type)
            this.write('uint16', this.sequence)
            this.write('uint32', this.unknown1)
            this.write('bytes', this.data.toPacket())

        } else if(this.data instanceof DataFormat){
            this.write('uint16', this.type)
            this.write('uint16', this.sequence)
            this.write('uint32', this.unknown1)
            this.write('bytes', this.data.toPacket())

        } else if(this.data instanceof ConfigFormat){
            this.write('uint16', this.type)
            this.write('uint16', this.sequence)
            this.write('uint32', this.unknown1)
            this.write('bytes', this.data.toPacket())

        } else if(this.data instanceof ConfigAckFormat){
            this.write('uint16', this.type)
            this.write('uint16', this.sequence)
            this.write('uint32', this.unknown1)
            this.write('bytes', this.data.toPacket())

        } else {
            throw Error('src/formats/MuxDCTChannel.ts[toPacket()]: Packet type not supported: '+this.type)
        }


        this.write('uint16', this.nextSequence) // Null padding
        return this.getPacket().slice(0, this.getOffset())
    }
}