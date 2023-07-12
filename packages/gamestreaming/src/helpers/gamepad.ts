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
        unknown1: 0,
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
        buttonmask: 4096,
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

    sendButton(){
        this._value.buttonmask = 4096
        this._sequence.a++

        this._lastGamepadUpdate = process.hrtime.bigint()

        setTimeout(() => {
            this._value.buttonmask = 0
            this._sequence.a++
    
            this._lastGamepadUpdate = process.hrtime.bigint()
        }, 50)
    }
}