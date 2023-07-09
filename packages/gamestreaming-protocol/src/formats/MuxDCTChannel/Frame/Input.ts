import Packet from '../../../packet'
import GamepadFormat, { Formats as GamepadFormats } from './Input/Gamepad'
import StatsFormat from './Input/Stats'

export const Formats = {
    Gamepad: GamepadFormat,
    GamepadFormats: GamepadFormats,
    Stats: StatsFormat,
}

export interface DefaultOptions {
    unknown1?:number
    unknown2?:number
    frameId:number
    relativeTimestamp:number
    gamepad_data?:GamepadFormat
    stats_data:StatsFormat
}

export default class FrameInputFormat extends Packet {
    unknown1:number
    unknown2:number
    unknown3:number
    unknown4:number
    unknown5:number
    frameId:number
    relativeTimestamp:number
    gamepad_data:GamepadFormat
    stats_data:StatsFormat

    constructor(packet:Buffer | DefaultOptions){
        super('FrameInputFormat')

        if(packet instanceof Buffer){
            this.setPacket(packet)

            const framesize = this.read('uint32')
            this.frameId = this.read('uint32')
            this.relativeTimestamp = this.read('long')
            this.unknown1 = this.read('uint16')
            const gamepadFrames = this.read('uint16')
            if(gamepadFrames > 0) {
                this.gamepad_data = new GamepadFormat(this.read('bytes', 43))
            }
            const videostatsFrames = this.read('uint8')
            if(videostatsFrames > 0) {
                this.stats_data = new StatsFormat(this.read('bytes', 20))
            }
            this.unknown2 = this.read('uint16')
            
            if(gamepadFrames == 0 && this.unknown2 == 1){
                this.unknown3 = this.read('uint16')
                this.unknown4 = this.read('uint32')
                this.unknown5 = this.read('uint32')
            }

            this.checkReadAllBytes(this)

        } else {
            this.unknown1 = packet.unknown1 || 0
            this.unknown2 = packet.unknown2 || 0
            this.frameId = packet.frameId
            this.relativeTimestamp = packet.relativeTimestamp
            this.gamepad_data = packet.gamepad_data
            this.stats_data = packet.stats_data

        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        this.write('uint32', 39)
        this.write('uint32', this.frameId)
        this.write('long', this.relativeTimestamp)
        this.write('uint16', this.unknown1)
        
        console.log(this.gamepad_data)
        if(this.gamepad_data !== undefined){
            this.write('uint16', 1)
            this.write('bytes', this.gamepad_data.toPacket())

        } else {
            this.write('uint16', 0)
        }

        this.write('uint8', 1)
        this.write('bytes', this.stats_data.toPacket())
        this.write('uint16', this.unknown2)

        return this.getPacket().slice(0, this.getOffset())
    }
}