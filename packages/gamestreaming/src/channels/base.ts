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