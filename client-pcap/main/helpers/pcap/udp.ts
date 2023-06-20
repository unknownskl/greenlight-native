export default class PcapUDP {

    _buffer?:Buffer

    src_port:number
    dst_port:number

    constructor(buffer:Buffer){
        this._buffer = buffer

        if(this._buffer === undefined){
            throw new Error('Buffer is empty. Cannot deserialize data')
        }

        this.src_port = buffer.readUInt16BE(0)
        this.dst_port = buffer.readUInt16BE(2)
    }

}