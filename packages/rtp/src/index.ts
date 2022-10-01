import SrtpCrypto from './srtpcrypto'
export default class RtpPacket {

    _buffer?:Buffer

    header = {
        version: 2,
        padding: 0,
        extension: 0,
        csrc: 0,

        marker: 0,
        payloadType: 0,

        sequence: 0,
        timestamp: 0,
        ssrc: 0,
    }
    
    payload:Buffer = Buffer.from('')
    
    load(buffer:Buffer){
        this._buffer = buffer

        this.deserialize()
    }

    deserialize(){
        if(this._buffer === undefined){
            throw new Error('Buffer is empty. Cannot deserialize data')
        }

        this.header.version = (this._buffer[0] >>> 6 & 0x03)
		this.header.padding = (this._buffer[0] >>> 5 & 0x01)
		this.header.extension = (this._buffer[0] >>> 4 & 0x01)
		this.header.csrc = (this._buffer[0] & 0x0F)

        this.header.marker = (this._buffer[1] >>> 7 & 0x01)
		this.header.payloadType = (this._buffer[1]-this.header.marker)
        
        this.header.sequence = this._buffer.readUInt16BE(2)
        this.header.timestamp = this._buffer.readUInt32BE(4)
        this.header.ssrc = this._buffer.readUInt32BE(8)

        this.payload = this._buffer.slice(12)
    }

    serialize(){
        if(this.payload === undefined){
            throw new Error('Payload is empty. Cannot serialize data')
        }

        const header_size = 12
        const payload_size = this.payload.length

        const buffer = Buffer.alloc(header_size+payload_size)

        // Version
        buffer[0] = 0x80

        // type
        // buffer[1] = 0
		// buffer[1] |= this.header.payloadType
		// buffer[1] |= this.header.marker

        buffer[1] = (this.header.marker) << 0 | (this.header.payloadType)

        buffer.writeUInt16BE(this.header.sequence, 2)
        buffer.writeUInt32BE(this.header.timestamp, 4)
        buffer.writeUInt32BE(this.header.ssrc, 8)
        // this.header.ssrc = this._buffer.readUInt32BE(8)

        this.payload.copy(buffer, 12)

        return buffer
    }

    getSrtpCrypto(){
        return SrtpCrypto
    }

}