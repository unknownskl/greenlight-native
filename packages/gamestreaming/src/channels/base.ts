import GameStreaming from '..'
import BinaryStream from '../lib/binarystream'

export interface PayloadHeader {
    bitflags: any
    confirm?: number
    timestamp?: number
    sequence?:number

    headerLength?:number
    headerBytes?:Buffer
    c1Value?:number
    nextSequence?:number

    unkPadding1?:number
    unkPadding2?:number
}

export interface HeaderOptions {
    sequence?:number
    confirm?: number
    timestamp?: number
    header?: Buffer
}

export default class BaseChannel {
    application:GameStreaming

    constructor(application){
        this.application = application
    }

    readHeader(payload:Buffer){
        const payloadData = new BinaryStream(payload)
        const header:PayloadHeader = {
            bitflags: this._toBits(payloadData.readBytes(2)),
            // bitflags: payloadData.readBytes(2),
            // sequence: payloadData.readUInt16(),
            // confirm: payloadData.readUInt16()
        }

        // hasHeader flags
        if(header.bitflags[0].substr(7, 1) > 0) {
        // if(header.bitflags[0] & (1 << 6)){
            // confirm
            // timestamp

            header.confirm = payloadData.readUInt16()
            header.timestamp = payloadData.readUInt24()
            const headerFlags = payloadData.readBytes(2)
            header.headerLength = parseInt(headerFlags.toString('hex').substr(-1))

            if(header.headerLength > 0){
                header.headerBytes = payloadData.readBytes(header.headerLength)
            }
        }

        if(header.bitflags[1].substr(7, 1) > 0) {
            // Has Padding set
            header.c1Value = payloadData.readUInt24()
        }

        if(header.bitflags[0].substr(1, 1) > 0) {
            // Has Padding set
            header.unkPadding1 = payloadData.readUInt8()
        }

        if(header.bitflags[0].substr(3, 1) > 0) {
            // Has Padding set
            header.confirm = payloadData.readUInt16()
        }

        // if xCloudHeader._buffer(0, 1):bitfield(5, 1) > 0 then
        // console.log('bitflag value:', header.bitflags[0], header.bitflags[0] & (1 << 4))
        if(header.bitflags[0].substr(5, 1) > 0) {
            // Has Sequence set
            header.sequence = payloadData.readUInt16()
            this.application.setServerSequence(header.sequence)
        }

        const headerSize = payloadData._offset
        const dataSize = payloadData._buffer.length-headerSize-2

        const nextSequence = payloadData._buffer.slice(-2).readInt16LE()
        if(nextSequence > 0){
            header.nextSequence = nextSequence
        }

        if((headerSize+dataSize+2) != payloadData._buffer.length){
            console.log('DATA SIZE ERROR')
        }

        // console.log({
        //     header: header,
        //     data: payload,
        //     payload: payload.slice(payloadData._offset)
        // })

        return {
            header: header,
            data: payload,
            payload: payload.slice(payloadData._offset)
        }
    }

    packHeader(payload:Buffer, options:HeaderOptions){
        // 14c068006a00 03000000000000000000

        const data = new BinaryStream(Buffer.alloc(2048))

        let type = 'unknown'

        if(options.confirm !== undefined && options.timestamp !== undefined && options.sequence !== undefined){
            type = 'confirm_ms_header_sequence'
            data.writeBytes(Buffer.from('05c0', 'hex'))

        } else if(options.confirm !== undefined && options.sequence !== undefined){
            type = 'confirm_sequence'
            data.writeBytes(Buffer.from('14c0', 'hex'))

        } else if(options.confirm !== undefined && options.timestamp !== undefined){
            type = 'confirm_ms_header'
            data.writeBytes(Buffer.from('01c0', 'hex'))

        } else if(options.sequence !== undefined){
            type = 'sequence'
            data.writeBytes(Buffer.from('04c0', 'hex'))
        }
        // 14c0 = confirm + sequence
        // 04c0 = sequence 
        // 45c0 = confirm + ms + header + unk_uint8 + sequence
        // 51c0 = confirm + ms + header + unk_uint8 + sequence
        // 05c0 = confirm + ms + header (null) + sequence
        // 01c0 = confirm + ms + header (null)

        if(type === 'unknown')
            throw new Error('Unable to craft packet header. Fatal error, exiting...')

        if(type.includes('confirm'))
            data.writeUInt16(options.confirm)

        if(type.includes('ms'))
            data.writeUInt(options.timestamp, 3)

        if(type.includes('header')){
            // data.writeBytes(options.header)
            data.writeBytes(Buffer.from('0000', 'hex'))
        }

        if(type.includes('sequence'))
            data.writeUInt16(options.sequence)

        data.writeBytes(payload)

        return data._buffer.slice(0, data._offset)

    }

    _toBits(payload:Buffer){
        return [
            this._hex2bin(payload.toString('hex').slice(0, 2)),
            this._hex2bin(payload.toString('hex').slice(2, 4))
        ]
    }

    _hex2bin(hex){
        return (parseInt(hex, 16).toString(2)).padStart(8, '0');
    }
}