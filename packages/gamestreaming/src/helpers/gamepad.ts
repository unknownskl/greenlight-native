import GameStreamingProtocol, { PacketFormats } from 'greenlight-gamestreaming-protocol'

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
    nexus:number
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

enum buttonMasks {
    a = 0x1000,
    b = 0x2000,
    x = 0x4000,
    y = 0x8000,
    thumbstick_left = 0x0040,
    thumbstick_right = 0x0080,
    dpad_up = 0x0001,
    dpad_down = 0x0002,
    dpad_left = 0x0004,
    dpad_right = 0x0008,
    start = 0x0010,
    select = 0x0020,
    nexus = 0x0100,
}
const buttonMasksKeys = Object.keys(buttonMasks)

export default class Gamepad {
    _sequence:GamepadButtons = {
        dpad_up: 0,
        dpad_down: 0,
        dpad_left: 0,
        dpad_right: 0,
        start: 0,
        select: 0,
        thumbstick_left: 0,
        thumbstick_right: 0,
        bumper_left: 0,
        bumper_right: 0,
        nexus: 0,
        unknown2: 0,
        a: 0,
        b: 0,
        x: 0,
        y: 0
    }
    _value:GamepadValues = {
        trigger_left: 0,
        trigger_right: 0,
        axis_left_x: 0,
        axis_left_y: 0,
        axis_right_x: 0,
        axis_right_y: 0,
        unknown1: 0,
        unknown2: 0,
        unknown3: 0,
        unknown4: 0,
        buttonmask: 0,
        axesmask: 0,
        unknown5: 0,
        unknown6: 0
    }

    _lastGamepadUpdate = process.hrtime.bigint()
    _lastFrameUpdate = process.hrtime.bigint()

    getState(){
        if(this._lastGamepadUpdate > this._lastFrameUpdate){
            this._lastFrameUpdate = this._lastGamepadUpdate

            return new PacketFormats.MuxDCTChannelFormats.FrameFormats.InputFormats.Gamepad({
                sequence: this._sequence,
                value: this._value,
            })
        } else {
            return undefined
        }
    }

    sendButton(button:string){

        if(! buttonMasksKeys.includes(button)){
            throw new Error('Unknown button type: '+button)
        }

        this._value.buttonmask = buttonMasks[button]
        this._sequence[button]++

        this._lastGamepadUpdate = process.hrtime.bigint()

        setTimeout(() => {
            this._value.buttonmask = 0
            this._sequence[button]++
    
            this._lastGamepadUpdate = process.hrtime.bigint()
        }, 50)
    }

    _currentButtonState = 0

    sendButtonState(button:string, pressed = false){

        if(! buttonMasksKeys.includes(button)){
            throw new Error('Unknown button type: '+button)
        }

        const oldButtonState = this._currentButtonState

        if(pressed){
            this._currentButtonState |= buttonMasks[button]
        } else {
            this._currentButtonState &= ~buttonMasks[button]
        }
        this._value.buttonmask = this._currentButtonState

        if(oldButtonState !== this._currentButtonState){
            this._sequence[button]++
            this._lastGamepadUpdate = process.hrtime.bigint()
        }
    }
}