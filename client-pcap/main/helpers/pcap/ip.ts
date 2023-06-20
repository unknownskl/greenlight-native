export default class PcapIP {

    _buffer?:Buffer

    src_address:string
    dst_address:string

    constructor(buffer:Buffer){
        this._buffer = buffer

        if(this._buffer === undefined){
            throw new Error('Buffer is empty. Cannot deserialize data')
        }

        this.src_address = buffer.readUInt8(12)+'.'+buffer.readUInt8(13)+'.'+buffer.readUInt8(14)+'.'+buffer.readUInt8(15)
        this.dst_address = buffer.readUInt8(16)+'.'+buffer.readUInt8(17)+'.'+buffer.readUInt8(18)+'.'+buffer.readUInt8(19)
    }

}