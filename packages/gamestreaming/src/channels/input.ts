import GameStreamingProtocol, { PacketFormats } from 'greenlight-gamestreaming-protocol'
import Gamepad from '../helpers/gamepad'
import { Channel } from '../channel'

export default class InputChannel extends Channel {

    _messageParts = {}
    _qosPolicy = {}

    _frameId = 0
    _sequence = 0

    _frameInterval
    _frameIntervalActive = false

    _gamepad = new Gamepad()

    constructor(application){
        super(application)

        this._frameInterval = setInterval(() => {
            if(this._frameIntervalActive === true){
                this.application.sendPayload(new PacketFormats.MuxDCTChannel({
                    type: PacketFormats.MuxDCTChannelTypes.Frame,
                    data: new PacketFormats.MuxDCTChannelFormats.Frame({
                        data: new PacketFormats.MuxDCTChannelFormats.FrameFormats.Input({
                            frameId: this.getFrameId(),
                            relativeTimestamp: this.application.getReferenceTimestamp(),
                            stats_data: new PacketFormats.MuxDCTChannelFormats.FrameFormats.InputFormats.Stats({ }),
                            gamepad_data: this._gamepad.getState(),
                        })
                    })
                }, 35, 1030), 1030, 35)
            }
        }, 12)
    }

    onMessage(rtp, payload){

        if(payload instanceof PacketFormats.MuxDCTControl && payload.type === PacketFormats.MuxDCTControlTypes.OpenChannel){
            console.log(__filename+'[onMessage()] Console requested to open Input channel')
            this.handleOpenChannel(rtp, payload)
        
        } else if(payload instanceof PacketFormats.MuxDCTChannel && payload.type === PacketFormats.MuxDCTChannelTypes.Config && payload.data.data instanceof PacketFormats.MuxDCTChannelFormats.ConfigFormats.Input){
            this._frameId = payload.data.data.frameId

            this.application.sendPayload(new PacketFormats.MuxDCTChannel({
                type: PacketFormats.MuxDCTChannelTypes.Config,
                data: new PacketFormats.MuxDCTChannelFormats.Config({
                    data: new PacketFormats.MuxDCTChannelFormats.ConfigFormats.InputAck({
                        relativeTimestamp: this.application.getReferenceTimestamp()
                    })
                })
            }, 35, rtp.header.ssrc), rtp.header.ssrc, 35)

            this._frameIntervalActive = true
            console.log(__filename+'[onMessage()] Input channel opened')

            // Lets send a button press after 5 seconds
            // setTimeout(() => {
            //     this._gamepad.sendButton()
            // }, 5000)

        } else {
            // console.log(__filename+'[onMessage()]: [input] Unknown packet to process: ', payload)
        }
    }

    getSequence(){
        this._sequence++;
        return this._sequence;
    }

    getFrameId(){
        this._frameId++;
        return this._frameId;
    }
}