import Packet from '../../../../packet'

export const Formats = {
}

export interface GamepadButtons {
    dpad_up:number
    dpad_down:number
    dpad_left:number
    dpad_right:number
    start:number
    select:number
    thumbstick_left:number
    thumbstick_right:number
    bumper_left:number
    bumper_right:number
    unknown1:number
    unknown2:number
    a:number
    b:number
    x:number
    y:number
}

export interface GamepadValues {
    trigger_left:number
    trigger_right:number
    axis_left_x:number
    axis_left_y:number
    axis_right_x:number
    axis_right_y:number
    unknown1:number
    unknown2:number
    unknown3:number
    unknown4:number
    buttonmask:number
    axesmask:number
    unknown5:number
    unknown6:number
}

export interface DefaultOptions {
    unknown1?:number
    unknown2?:number
    frameId:number
    relativeTimestamp:number
    sequence:GamepadButtons
    value:GamepadValues
}

export default class FrameInputGamepadFormat extends Packet {
    unknown1:number
    unknown2:number
    frameId:number
    relativeTimestamp:number
    sequence:GamepadButtons
    value:GamepadValues

    constructor(packet:Buffer | DefaultOptions){
        super('FrameInputGamepadFormat')

        if(packet instanceof Buffer){
            this.setPacket(packet)

            this.unknown1 = this.read('uint8')

            this.sequence = {
                dpad_up: this.read('uint8'),
                dpad_down: this.read('uint8'),
                dpad_left: this.read('uint8'),
                dpad_right: this.read('uint8'),
                start: this.read('uint8'),
                select: this.read('uint8'),
                thumbstick_left: this.read('uint8'),
                thumbstick_right: this.read('uint8'),
                bumper_left: this.read('uint8'),
                bumper_right: this.read('uint8'),
                unknown1: this.read('uint8'),
                unknown2: this.read('uint8'),
                a: this.read('uint8'),
                b: this.read('uint8'),
                x: this.read('uint8'),
                y: this.read('uint8'),
            }

            this.value = {
                trigger_left: this.read('uint8'),
                trigger_right: this.read('uint8'),
                axis_left_x: this.read('uint16'),
                axis_left_y: this.read('uint16'),
                axis_right_x: this.read('uint16'),
                axis_right_y: this.read('uint16'),
                unknown1: this.read('uint16'),
                unknown2: this.read('uint16'),
                unknown3: this.read('uint16'),
                unknown4: this.read('uint16'),
                buttonmask: this.read('uint16'),
                axesmask: this.read('uint16'),
                unknown5: this.read('uint16'),
                unknown6: this.read('uint16'),
            }

            this.checkReadAllBytes(this)

        } else {
            this.unknown1 = packet.unknown1 || 0
            this.sequence = packet.sequence
            this.value = packet.value
        }
    }

    toPacket() {
        this.setPacket(Buffer.allocUnsafe(2048))

        // this.write('uint32', 39)

        return this.getPacket().slice(0, this.getOffset())
    }
}