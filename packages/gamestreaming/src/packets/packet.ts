export default class Packet {

    private _packet?:Buffer
    private _type = 'Unknown'

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
        if(this._packet!== undefined){
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
}