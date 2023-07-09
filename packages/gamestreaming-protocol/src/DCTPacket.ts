import Packet from "./packet"

export interface Header {
    bitflags?: any
    confirm?: number
    timestamp?: number
    sequence?:number

    headerLength?:number
    headerBytes?:Buffer
    c1Value?:number
    nextSequence?:number

    delayTimestamp?:number

    unkPadding1?:number
    unkPadding2?:number
}

export default class DCTPacket extends Packet {
    _headers:Header = {}

    readHeader() {
        const headerBytes = this.read('bytes', 2)
        const header:Header = {
            bitflags: this._toBits(headerBytes)
        }

        if(header.bitflags[0].substr(7, 1) > 0) {
            header.confirm = this.read('uint16')
            header.timestamp = this.read('uint24')
            const headerFlags = this.read('bytes', 2)
            const hLength = headerFlags.toString('hex').substr(-1)
            const hLengthConvert = {
                0: 0,
                1: 1,
                2: 2,
                3: 3,
                4: 4,
                5: 5,
                6: 6,
                7: 7,
                8: 8,
                9: 9,
                a: 10,
                b: 11,
                c: 12,
                d: 13,
                e: 14,
                f: 15,
            }
            header.headerLength = parseInt(hLengthConvert[hLength])

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

        if(header.bitflags[0].substr(4, 1) > 0) {
            // Has Dropped connection header
            header.confirm = this.read('uint16')

            const headerFlags = this.read('uint8')

            header.timestamp = this.read('uint24')

            if(headerFlags === 129){
                header.delayTimestamp = this.read('uint16')

            } else if(headerFlags === 130){
                header.delayTimestamp = this.read('uint24')

            // } else if(headerFlags === 57){
            //     header.headerBytes = this.read('bytes', 3)

            // } else if(headerFlags === 51){
            //     header.headerBytes = this.read('bytes', 2)

            // } else if(headerFlags === 9){
            //     header.headerBytes = this.read('bytes', 2)

            } else {
                console.log(this, header)
                throw new Error('src/packet.ts: Unknown headerbyte flag: '+headerFlags)
            }

        }

        const headerSize = this.getOffset()
        const dataSize = this.getPacket().length-headerSize-2

        // Read nextSequence
        const nextSequence = this.getPacket().slice(-2).readInt16LE()
        if(nextSequence > 0){
            header.nextSequence = nextSequence
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