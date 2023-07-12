import GameStreamingProtocol, { PacketFormats } from 'greenlight-gamestreaming-protocol'
import { Channel } from '../channel'

export default class InputChannel extends Channel {

    _messageParts = {}
    _qosPolicy = {}

    _frameId = 0
    _sequence = 0

    _frameInterval
    _frameIntervalActive = false

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
                            stats_data: new PacketFormats.MuxDCTChannelFormats.FrameFormats.InputFormats.Stats({})
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

        // } else if(payload instanceof PacketFormats.MuxDCTChannel && payload.type === PacketFormats.MuxDCTChannelTypes.Data && payload.data.data instanceof PacketFormats.MuxDCTChannelFormats.DataFormats.MultiMessage){
        //     if(this._messageParts[payload.data.data.totalSize] === undefined){
        //         this._messageParts[payload.data.data.totalSize] = {
        //             totalSize: payload.data.data.totalSize,
        //             data: Buffer.alloc(payload.data.data.totalSize),
        //             writtenBytes: 0
        //         }
        //     }

        //     const bytesWrote = (payload.data.data.data as Buffer).copy(this._messageParts[payload.data.data.totalSize].data, payload.data.data.dataOffset)
        //     this._messageParts[payload.data.data.totalSize].writtenBytes += bytesWrote

        //     if(this._messageParts[payload.data.data.totalSize].writtenBytes >= payload.data.data.totalSize){
        //         this._qosPolicy = JSON.parse(this._messageParts[payload.data.data.totalSize].data.slice(0, -1).toString())
        //         console.log(__filename+'[onMessage()]: [qos] Received policy:', this._qosPolicy)
        //     }

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