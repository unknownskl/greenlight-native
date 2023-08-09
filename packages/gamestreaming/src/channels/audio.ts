import GameStreamingProtocol, { PacketFormats } from 'greenlight-gamestreaming-protocol'
import { Channel } from '../channel'

export default class AudioChannel extends Channel {

    _messageParts = {}
    _frameId = 42537843

    _qosPolicy = {}

    onMessage(rtp, payload){

        if(payload instanceof PacketFormats.MuxDCTControl && payload.type === PacketFormats.MuxDCTControlTypes.OpenChannel){
            console.log(__filename+'[onMessage()] Console requested to open Audio channel')
            this.handleOpenChannel(rtp, payload)
        
        } else if(payload instanceof PacketFormats.MuxDCTChannel && payload.type === PacketFormats.MuxDCTChannelTypes.OpenChannel && payload.data.data instanceof PacketFormats.MuxDCTChannelFormats.OpenChannelFormats.Audio){
        
            this.application.sendPayload(new PacketFormats.MuxDCTChannel({
                type: PacketFormats.MuxDCTChannelTypes.OpenChannel,
                data: new PacketFormats.MuxDCTChannelFormats.OpenChannel({
                    data: new PacketFormats.MuxDCTChannelFormats.OpenChannelFormats.AudioAck({
                        frameId: this.getFrameId(),
                        data: new PacketFormats.MuxDCTChannelFormats.OpenChannelFormats.AudioAckFormats.Audio({})
                    })
                })
            }, 37, rtp.header.ssrc), rtp.header.ssrc, 37)

            this.application.sendPayload(new PacketFormats.MuxDCTChannel({
                type: PacketFormats.MuxDCTChannelTypes.Data,
                nextSequence: 1,
                data: new PacketFormats.MuxDCTChannelFormats.Data({
                    data: new PacketFormats.MuxDCTChannelFormats.DataFormats.Ack({ })
                })
            }, 38, rtp.header.ssrc), rtp.header.ssrc, 38)

            console.log(__filename+'[onMessage()] Audio channel opened')

        } else if(payload instanceof PacketFormats.MuxDCTChannel && payload.type === PacketFormats.MuxDCTChannelTypes.None && payload.data instanceof PacketFormats.MuxDCTChannelFormats.DataAudio){
            // console.log(__filename+'[onMessage()]: Received audio frame:', payload.data.frameId, '['+payload.data.data.length+']')
        
            this.application.events.emit('audio_frame', {
                data: payload.data
            })

        } else {
            console.log(__filename+'[onMessage()]: [audio] Unknown packet to process: ', payload)
        }
    }

    getFrameId(){
        this._frameId++;
        return this._frameId;
    }
}