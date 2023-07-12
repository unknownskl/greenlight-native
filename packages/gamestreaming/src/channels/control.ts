import GameStreamingProtocol, { PacketFormats } from 'greenlight-gamestreaming-protocol'
import { Channel } from '../channel'

export default class ControlChannel extends Channel {

    onMessage(rtp, payload){

        if(payload instanceof PacketFormats.MuxDCTControl && payload.type === PacketFormats.MuxDCTControlTypes.OpenChannel){
            console.log(__filename+'[onMessage()] Console requested to open Control channel')
            this.handleOpenChannel(rtp, payload, Buffer.from('0300', 'hex'))

            this.application.sendPayload(new PacketFormats.MuxDCTChannel({
                type: PacketFormats.MuxDCTChannelTypes.OpenChannel,
                data: new PacketFormats.MuxDCTChannelFormats.OpenChannel({
                    data: new PacketFormats.MuxDCTChannelFormats.OpenChannelFormats.Request({
                        udid: '4BDB3609-C1F1-4195-9B37-FEFF45DA8B8E'
                    })
                })
            }, 35, rtp.header.ssrc), rtp.header.ssrc, 35)
        
        } else if(payload instanceof PacketFormats.MuxDCTChannel && payload.data instanceof PacketFormats.MuxDCTChannelFormats.OpenChannel && payload.data.data instanceof PacketFormats.MuxDCTChannelFormats.OpenChannelFormats.Response ){
            const packetdata = new PacketFormats.MuxDCTChannel({
                type: PacketFormats.MuxDCTChannelTypes.Data,
                data: new PacketFormats.MuxDCTChannelFormats.Data({
                    data: new PacketFormats.MuxDCTChannelFormats.DataFormats.Control({ })
                })
            }, 35, 1024)

            console.log(__filename+'[onMessage()] Received UDID from console:', payload.data.data.udid)

            this.application.sendPayload(new PacketFormats.MuxDCTChannel({
                type: PacketFormats.MuxDCTChannelTypes.Data,
                nextSequence: 1,
                data: new PacketFormats.MuxDCTChannelFormats.Data({
                    data: new PacketFormats.MuxDCTChannelFormats.DataFormats.Control({ })
                })
            }, 35, rtp.header.ssrc), rtp.header.ssrc, 35)

            console.log(__filename+'[onMessage()] Control channel opened')
        } else {
            // console.log(__filename+'[onMessage()]: [control] Unknown packet to process: ', payload)
        }
    }

    sendChannelsReady(){
        this.application.sendPayload(new PacketFormats.MuxDCTChannel({
            type: PacketFormats.MuxDCTChannelTypes.Data,
            sequence: 1,
            nextSequence: 2,
            data: new PacketFormats.MuxDCTChannelFormats.Data({
                data: new PacketFormats.MuxDCTChannelFormats.DataFormats.Frame({ 
                    isEmpty: 1
                })
            })
        }, 35, 1024), 1024, 35)

        console.log(__filename+'[onMessage()] All channels are ready. Preparing Input channels...')
    }
}