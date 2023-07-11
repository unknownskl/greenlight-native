import GameStreamingProtocol, { PacketFormats } from 'greenlight-gamestreaming-protocol'
import { Channel } from '../channel'

export default class AudioChannel extends Channel {

    _messageParts = {}

    _qosPolicy = {}

    onMessage(rtp, payload){

        if(payload instanceof PacketFormats.MuxDCTControl && payload.type === PacketFormats.MuxDCTControlTypes.OpenChannel){
            console.log(__filename+'[onMessage()] Console requested to open Audio channel')
            this.handleOpenChannel(rtp, payload)
        
        // } else if(payload instanceof PacketFormats.MuxDCTChannel && payload.type === PacketFormats.MuxDCTChannelTypes.OpenChannel && payload.data.data instanceof PacketFormats.MuxDCTChannelFormats.OpenChannelFormats.Request){
        //     this.application.sendPayload(new PacketFormats.MuxDCTChannel({
        //         type: PacketFormats.MuxDCTChannelTypes.OpenChannel,
        //         data: new PacketFormats.MuxDCTChannelFormats.OpenChannel({
        //             data: new PacketFormats.MuxDCTChannelFormats.OpenChannelFormats.Response({
        //                 unknown1: 0
        //             })
        //         })
        //     }, 35, rtp.header.ssrc), rtp.header.ssrc, 35)

        //     console.log(__filename+'[onMessage()] Control channel opened')

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
            console.log(__filename+'[onMessage()]: [audio] Unknown packet to process: ', payload)
        }
    }
}