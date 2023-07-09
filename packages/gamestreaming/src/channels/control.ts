import GameStreamingProtocol, { PacketFormats } from 'greenlight-gamestreaming-protocol'
import { Channel } from '../channel'

export default class ControlChannel extends Channel {

    onMessage(rtp, payload){
        console.log('Control received message:', payload)

        if(payload instanceof PacketFormats.MuxDCTControl && payload.type === PacketFormats.MuxDCTControlTypes.OpenChannel){
            console.log('openchannel packet')
            this.handleOpenChannel(rtp, payload)


        }
    }
    
}