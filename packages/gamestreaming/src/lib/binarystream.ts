export default class BinaryStream {

    _buffer:Buffer
    _offset:number = 0

    constructor(buffer:Buffer){
        this._buffer = buffer
    }

    readBytes(length){
        const offset = this._offset
        this._offset += length
        return this._buffer.slice(offset, this._offset)
    }

    writeBytes(data:Buffer){
        const offset = this._offset
        this._offset += data.length
        // return this._buffer.writeUInt16LE(data, offset)
        return data.copy(this._buffer, offset, 0)
    }

    readUInt8(){
        const offset = this._offset
        this._offset += 1
        return this._buffer.readUInt8(offset)
    }

    writeUInt8(data:number){
        const offset = this._offset
        this._offset += 1
        return this._buffer.writeUInt8(data, offset)
    }

    readUInt16(){
        const offset = this._offset
        this._offset += 2
        return this._buffer.readUInt16LE(offset)
    }

    writeUInt16(data:number){
        const offset = this._offset
        this._offset += 2
        return this._buffer.writeUInt16LE(data, offset)
    }

    readUInt24(){
        const offset = this._offset
        this._offset += 3
        return this._buffer.readUIntLE(offset, 3)
    }

    writeUInt24(data:number){
        const offset = this._offset
        this._offset += 3
        return this._buffer.writeUIntLE(data, offset, 3)
    }

    readUInt32(){
        const offset = this._offset
        this._offset += 4
        return this._buffer.readUInt32LE(offset)
    }

    writeUInt32(data:number){
        const offset = this._offset
        this._offset += 4
        return this._buffer.writeUInt32LE(data, offset)
    }

    readUInt64(){
        const offset = this._offset
        this._offset += 8
        return this._buffer.readBigUInt64LE(offset).toString()
    }

    writeUInt64(data:bigint){
        const offset = this._offset
        this._offset += 8
        return this._buffer.writeBigUInt64LE(data, offset)
    }






    readUInt(length:number){
        const offset = this._offset
        this._offset += length
        return this._buffer.readUIntLE(offset, length)
    }

    writeUInt(data:number, length:number){
        const offset = this._offset
        this._offset += length
        return this._buffer.writeUIntLE(data, offset, length)
    }

}