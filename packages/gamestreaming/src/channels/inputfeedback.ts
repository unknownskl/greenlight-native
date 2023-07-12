import GameStreamingProtocol, { PacketFormats } from 'greenlight-gamestreaming-protocol'
import { Channel } from '../channel'

export default class InputFeedbackChannel extends Channel {

    _messageParts = {}
    _qosPolicy = {}
    _frameId = 2134489808
    _sequence = -1

    onMessage(rtp, payload){

        if(payload instanceof PacketFormats.MuxDCTControl && payload.type === PacketFormats.MuxDCTControlTypes.OpenChannel){
            console.log(__filename+'[onMessage()] Console requested to open InputFeedback channel')
            this.handleOpenChannel(rtp, payload)

            this.application.sendPayload(new PacketFormats.MuxDCTChannel({
                type: PacketFormats.MuxDCTChannelTypes.Config,
                data: new PacketFormats.MuxDCTChannelFormats.Config({
                    data: new PacketFormats.MuxDCTChannelFormats.ConfigFormats.Input({
                        frameId: this.getFrameId()
                    })
                })
            }, 35, rtp.header.ssrc), rtp.header.ssrc, 35)

            console.log(__filename+'[onMessage()] InputFeedback channel opened')

        } else if(payload instanceof PacketFormats.MuxDCTChannel && payload.type === PacketFormats.MuxDCTChannelTypes.Frame && payload.data.data instanceof PacketFormats.MuxDCTChannelFormats.FrameFormats.Input){
            const sequence = this.getSequence()
            this.application.sendPayload(new PacketFormats.MuxDCTChannel({
                type: PacketFormats.MuxDCTChannelTypes.Frame,
                sequence: sequence,
                nextSequence: sequence+1,
                data: new PacketFormats.MuxDCTChannelFormats.Frame({
                    data: new PacketFormats.MuxDCTChannelFormats.FrameFormats.Ack({
                        frameId: payload.data.data.frameId
                    })
                })
            }, 35, rtp.header.ssrc), rtp.header.ssrc, 35)

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
            console.log(__filename+'[onMessage()]: [inputfeedback] Unknown packet to process: ', payload)
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