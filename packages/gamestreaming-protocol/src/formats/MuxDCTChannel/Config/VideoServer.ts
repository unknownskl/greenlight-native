import Packet from '../../../packet'

export interface videoFormats {
    fps:number
    width:number
    height:number
    codec:number
}

export interface DefaultOptions {
    unknown1?:number
    unknown2?:number
    unknown3?:number
    width?:number
    height?:number
    fps?:number
    relativeTimestamp:number
    videoFormats?:Array<videoFormats>
}

export default class ConfigVideoServerFormat extends Packet {
    unknown1?:number
    unknown2?:number
    unknown3?:number
    width:number
    height:number
    fps:number
    relativeTimestamp:number
    videoFormats:Array<videoFormats>

    constructor(packet:Buffer | DefaultOptions){
        super('ConfigVideoServerFormat')

        if(packet instanceof Buffer){
            this.setPacket(packet)

            this.unknown1 = this.read('uint16')
            this.unknown2 = this.read('uint32')
            const dataSize = this.read('uint32')
            this.unknown3 = this.read('uint32')
            this.width = this.read('uint32')
            this.height = this.read('uint32')
            this.fps = this.read('uint32')
            this.relativeTimestamp = this.read('long')
            const formatCount = this.read('uint32')
            this.videoFormats = []
            for(let i=1; i<=formatCount;i++){
                const format = {
                    fps: this.read('uint32'),
                    width: this.read('uint32'),
                    height: this.read('uint32'),
                    codec: this.read('uint32'),
                }
                this.videoFormats.push(format)
            }

            this.checkReadAllBytes(this)

        } else {
            this.unknown1 = packet.unknown1 || 0
            this.unknown2 = packet.unknown2 || 1
            this.unknown3 = packet.unknown3 || 6
            this.width = packet.width || 1280
            this.height = packet.height || 720
            this.fps = packet.fps || 60
            this.relativeTimestamp = packet.relativeTimestamp
            this.videoFormats = packet.videoFormats || [{
                width: 1280,
                height: 720,
                fps: 60,
                codec: 0,
            }]
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        this.write('uint16', this.unknown1)
        this.write('uint32', this.unknown2)
        this.write('uint32', (28+(this.videoFormats.length*16)))
        this.write('uint32', this.unknown3)
        this.write('uint32', this.width)
        this.write('uint32', this.height)
        this.write('uint32', this.fps)
        this.write('long', this.relativeTimestamp)
        this.write('uint32', this.videoFormats.length)

        for(const format in this.videoFormats){
            this.write('uint32', this.videoFormats[format].fps)
            this.write('uint32', this.videoFormats[format].width)
            this.write('uint32', this.videoFormats[format].height)
            this.write('uint32', this.videoFormats[format].codec)
        }

        return this.getPacket().slice(0, this.getOffset())
    }
}