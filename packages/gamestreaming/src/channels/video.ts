import { OpenChannelPacket, OpenChannelResponsePacket, DataPacket } from '../packets/control'
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

        this.application.events.on('packet_video_data', (data) => {
            console.log('[VIDEO] !!!!!! Data packet', data)
        })

        this.application.events.on('packet_video_unknown', (data) => {
            console.log('[VIDEO] !!!!!! Unknown packet', data)
        })
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
        } else {
            this.application.events.emit('packet_video_unknown', {
                packet: packet,
                header: header,
                model: undefined
            })
        }
    }

}