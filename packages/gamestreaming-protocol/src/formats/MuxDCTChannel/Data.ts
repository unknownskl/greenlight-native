import Packet from '../../packet'
import DataControlFormat from './Data/Control'
import DataFrameFormat from './Data/Frame'
import DataMultiMessageFormat from './Data/MultiMessage'
import DataMessageFormat from './Data/Message'
import DataDataFormat, { Formats as DataDataFormats } from './Data/Data'
import DataAckFormat from './Data/Ack'

export const Formats = {
    Control: DataControlFormat,
    Frame: DataFrameFormat,
    MultiMessage: DataMultiMessageFormat,
    Message: DataMessageFormat,
    Data: DataDataFormat,
    DataFormats: DataDataFormats,
    Ack: DataAckFormat,
}

enum dataTypes {
    MultiMessage = 1,
    Message = 2,
    Data = 3,
    FrameData = 4,
    Control = 7,
    Ack = 16,
}

export interface DefaultOptions {
    data:DataControlFormat | DataFrameFormat | DataMultiMessageFormat | DataMessageFormat | DataDataFormat | DataAckFormat
}

export default class DataFormat extends Packet {
    data:any

    constructor(packet:Buffer | DefaultOptions){
        super('DataFormat')

        if(packet instanceof Buffer){
            this.setPacket(packet)

            const handshakeType = this.read('uint16')
            if(handshakeType === dataTypes.Control){
                this.data = new DataControlFormat(this.read('remainder'))

            } else if(handshakeType === dataTypes.FrameData){
                this.data = new DataFrameFormat(this.read('remainder'))

            } else if(handshakeType === dataTypes.MultiMessage){
                this.data = new DataMultiMessageFormat(this.read('remainder'))

            } else if(handshakeType === dataTypes.Message){
                this.data = new DataMessageFormat(this.read('remainder'))

            } else if(handshakeType === dataTypes.Data){
                this.data = new DataDataFormat(this.read('remainder'))

            } else if(handshakeType === dataTypes.Ack){
                this.data = new DataAckFormat(this.read('remainder'))

            } else {
                throw Error(__filename+'[constructor()]: Packet type not supported: '+handshakeType)
            }

            this.checkReadAllBytes(this)

        } else {
            this.data = packet.data
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        if(this.data instanceof Formats.Control){
            this.write('uint16', dataTypes.Control)
            this.write('bytes', this.data.toPacket())

        } else if(this.data instanceof Formats.Frame){
            this.write('uint16', dataTypes.FrameData)
            this.write('bytes', this.data.toPacket())

        } else if(this.data instanceof Formats.MultiMessage){
            this.write('uint16', dataTypes.MultiMessage)
            this.write('bytes', this.data.toPacket())

        } else if(this.data instanceof Formats.Message){
            this.write('uint16', dataTypes.Message)
            this.write('bytes', this.data.toPacket())

        } else if(this.data instanceof Formats.Data){
            this.write('uint16', dataTypes.Data)
            this.write('bytes', this.data.toPacket())

        } else if(this.data instanceof Formats.Ack){
            this.write('uint16', dataTypes.Ack)
            this.write('bytes', this.data.toPacket())

        } else {
            throw Error(__filename+'[toPacket()]: Packet type not supported: '+(typeof this.data))
        }

        return this.getPacket().slice(0, this.getOffset())
    }
}