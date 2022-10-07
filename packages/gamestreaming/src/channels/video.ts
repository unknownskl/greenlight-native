import { OpenChannelPacket, OpenChannelResponsePacket, DataPacket, ConfigPacket } from '../packets/video'
import BaseChannel from './base'

export default class VideoChannel extends BaseChannel {

    _sessionHandshakeInterval

    constructor(application) {
        super(application)

        this.application.events.on('packet_video_openchannel', (data) => {

            const response = new OpenChannelResponsePacket({ payload: data.model.payload })
            this.application.send(this.packHeader(response.toPacket(), {
                confirm: this.application.getServerSequence(),
                sequence: this.application.getClientSequence(),
                timestamp: this.application.getMs(),
            }), 1026, 97)
        })

        this.application.events.on('packet_video_config', (data) => {
            console.log('[VIDEO] !!!!!! Config packet', data)
            const response = new ConfigPacket({
                payload_type: 2,
                timestamp: 823738637,
                fps: 60,
                width: 1280,
                height: 720,
                next_sequence: 0
            })
            this.application.send(this.packHeader(response.toPacket(), {
                confirm: this.application.getServerSequence(),
                sequence: this.application.getClientSequence(),
            }), 1026, 35)

            const payload2 = this.packHeader(Buffer.from('0500000000000000030000000100000004000000300000000100', 'hex'), {
                // confirm: this._session._serverSequence,
                confirm: this.application.getServerSequence(),
                sequence: this.application.getClientSequence()
            })
            this.application.send(payload2, 1026, 35)
        })

        this.application.events.on('packet_video_unknown', (data) => {
            console.log('[VIDEO] !!!!!! Unknown packet', data)
        })

        // this.application.events.on('packet_video_data', (data) => {
        //     console.log('[VIDEO] !!!!!! Data packet:', data)
        // })
    }

    route(packet, payload, rinfo){
        const header = this.readHeader(payload)
        // console.log('[VIDEO] pkt', header)


        if(packet.header.payloadType === 97 && (header.payload[0] == 0x02)){
            const model = new OpenChannelPacket(header.payload)
            this.application.events.emit('packet_video_openchannel', {
                packet: packet,
                header: header,
                model: model
            })

        } else if(packet.header.payloadType === 36 && (header.payload[0] == 0x02)){
            const model = new OpenChannelPacket(header.payload)
            this.application.events.emit('packet_video_openchannel_ack', {
                packet: packet,
                header: header,
                model: model
            })

        } else if(packet.header.payloadType === 35 && (header.payload[0] == 0x04)){
            const model = new ConfigPacket(header.payload)
            this.application.events.emit('packet_video_config', {
                packet: packet,
                header: header,
                model: model
            })

        } else if((packet.header.payloadType === 35 || packet.header.payloadType === 162) && (header.payload[0] == 0x00 || header.payload[0] == 0x01 || header.payload[0] == 0x05)){
            // Payloadtype 162 == 35, but greenlight-rtp has an bug that marks it as 162 so we use this as a workaround for now.
            // @TODO: Add tests for marker type with payloadtype 35.
            
            const model = new DataPacket(header.payload)
            this.application.events.emit('packet_video_data', {
                packet: packet,
                header: header,
                model: model
            })
        } else {
            this.application.events.emit('packet_video_unknown', {
                packet: packet,
                header: header,
                model: undefined
            })
        }
    }

}