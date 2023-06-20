export interface Header {
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

export default class Packet {

    private _packet?:Buffer
    private _type = 'Unknown'
    private _headers = {}

    private _offset = 0

    constructor(type:string|Buffer){
        if(type instanceof Buffer){
            this._packet = type
        } else {
            this._type = type
        }
    }

    getType(){
        return this._type
    }

    getOffset(){
        return this._offset
    }

    setPacket(packet:Buffer){
        this._packet = packet
    }

    getPacket(){
        if(this._packet !== undefined){
            return this._packet
        } else {
            throw Error('Could not get empty packet')
        }
    }

    write(type:string, data){
        if(this._packet === undefined){
            throw Error('Cannot write data to an empty data set (_packet:'+this.getPacket()+')')
        }

        let writeLength = 0

        switch(type){
            case 'bytes':
                if(!(data instanceof Buffer)){
                    data = Buffer.from(data)
                }
                data.copy(this._packet, this._offset, 0)
                writeLength = data.length
                break
            case 'long':
                this._packet.writeBigUInt64LE(BigInt(data), this._offset)
                writeLength = 8
                break
            case 'uint8':
                this._packet.writeUInt8(data, this._offset)
                writeLength = 1
                break
            case 'uint16':
                this._packet.writeUInt16LE(data, this._offset)
                writeLength = 2
                break
            case 'uint24':
                this.write('bytes', this.writeUInt24LE(data))
                break
            case 'uint32':
                this._packet.writeUInt32LE(data, this._offset)
                writeLength = 4
                break
            case 'uint32be':
                this._packet.writeUInt32BE(data, this._offset)
                writeLength = 4
                break
            case 'boolean':
                if(data === true){
                    this._packet.writeUInt8(1, this._offset)
                } else {
                    this._packet.writeUInt8(0, this._offset)
                }
                writeLength = 1
                break
            case 'sgstring':
                this._packet.writeUInt16LE(data.length, this._offset)
                Buffer.from(data).copy(this._packet, this._offset + 2, 0)

                writeLength = data.length
                break
            default:
                throw Error('Unknown read type:'+type)
        }
        
        this._offset += writeLength
    }

    read(type:string, length?:number){
        if(this._packet === undefined){
            throw Error('Packet does not have any data set. (_packet:'+this.getPacket()+')')
        }

        let value:any
        let readLength = 0

        switch(type){
            case 'bytes':
                if(length !== undefined){
                    value = this._packet.slice(this._offset, length+this._offset)
                    readLength = length
                } else {
                    throw Error('Length is required when reading bytes from packet data')
                }
                break
            case 'long':
                value = Number(this._packet.readBigUInt64LE(this._offset))
                readLength = 8
                break
            case 'uint8':
                value = this._packet.readUInt8(this._offset)
                readLength = 1
                break
            case 'uint16':
                value = this._packet.readUInt16LE(this._offset)
                readLength = 2
                break
            case 'uint24':
                value = this.readUInt24LE(this._packet, this._offset)
                readLength = 3
                break
            case 'uint32':
                value = this._packet.readUInt32LE(this._offset)
                readLength = 4
                break
            case 'uint32be':
                value = this._packet.readUInt32BE(this._offset)
                readLength = 4
                break
            case 'boolean':
                value = (this._packet.readUInt8(this._offset) === 0) ? false : true
                readLength = 1
                break
            case 'remainder':
                value = this._packet.slice(this._offset)
                readLength = value.length
                break
            case 'sgstring':
                length = this._packet.readUInt16LE(this._offset)
                value = this._packet.slice(this._offset + 2, length+this._offset + 2)
                readLength = length+2
                break
            default:
                throw Error('Unknown read type:' + type)
        }

        this._offset += readLength
        return value
    }

    readUInt24BE(data, offset){
        let value
        value = data[offset] << 16
        value |= data[offset + 1] << 8
        value |= data[offset + 2]

        return value
    }

    readUInt24LE(data, offset) {
        let value
        value = data[offset + 2] << 16
        value |= data[offset + 1] << 8
        value |= data[offset]

        return value
    }

    writeUInt24LE(data) {
        const buffer = Buffer.allocUnsafe(3)
        buffer[2] = (data & 0xff0000) >>> 16
        buffer[1] = (data & 0x00ff00) >>> 8
        buffer[0] = data & 0x0000ff

        return buffer
    }

    readHeader() {
        const headerBytes = this.read('bytes', 2)
        const header:Header = {
            bitflags: this._toBits(headerBytes)
        }

        if(header.bitflags[0].substr(7, 1) > 0) {
            header.confirm = this.read('uint16')
            header.timestamp = this.read('uint24')
            const headerFlags = this.read('bytes', 2)
            header.headerLength = parseInt(headerFlags.toString('hex').substr(-1))

            if(header.headerLength > 0){
                header.headerBytes = this.read('bytes', header.headerLength)
            }
        }

        if(header.bitflags[1].substr(7, 1) > 0) {
            // Has Padding set
            header.c1Value = this.read('uint24')
        }

        if(header.bitflags[0].substr(1, 1) > 0) {
            // Has Padding set
            header.unkPadding1 = this.read('uint8')
        }

        if(header.bitflags[0].substr(3, 1) > 0) {
            // Has Padding set
            header.confirm = this.read('uint16')
        }

        if(header.bitflags[0].substr(5, 1) > 0) {
            // Has Sequence set
            header.sequence = this.read('uint16')
        }

        const headerSize = this._offset
        const dataSize = this._packet.length-headerSize-2

        const nextSequence = this._packet.slice(-2).readInt16LE()
        if(nextSequence > 0){
            header.nextSequence = nextSequence
        }

        if((headerSize+dataSize+2) != this._packet.length){
            console.log('DATA SIZE ERROR')
        }

        this._headers = header
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