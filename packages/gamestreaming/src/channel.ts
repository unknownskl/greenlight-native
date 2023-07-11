import GameStreamingProtocol, { PacketFormats } from 'greenlight-gamestreaming-protocol'
import GameStreaming from './index'

export class Channel {
    application:GameStreaming

    constructor(application:GameStreaming){
        this.application = application
    }

    handleOpenChannel(rtp, payload, channelData = Buffer.from('')){

        if(payload instanceof PacketFormats.MuxDCTControl && payload.type === PacketFormats.MuxDCTControlTypes.OpenChannel){
            this.application.sendPayload(new PacketFormats.MuxDCTControl({
                type: PacketFormats.MuxDCTControlTypes.Confirm,
                data: channelData
            }), rtp.header.ssrc, 97)

        } else {
            console.log('Non-openchanel packet:', payload)
            throw new Error(__filename+'[handleOpenChannel()] Payload is not an OpenChannel packet')
        }
    }
}