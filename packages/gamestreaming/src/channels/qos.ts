import { OpenChannelPacket, OpenChannelResponsePacket, DataPacket } from '../packets/control'
import BaseChannel from './base'

export default class QosChannel extends BaseChannel {

    _sessionHandshakeInterval

    constructor(application) {
        super(application)

        this.application.events.on('packet_qos_openchannel', (data) => {

            const response = new OpenChannelResponsePacket({ payload: data.model.payload })
            this.application.send(this.packHeader(response.toPacket(), {
                confirm: this.application.getServerSequence(),
                sequence: this.application.getClientSequence(),
                timestamp: this.application.getMs(),
            }), 1025, 97)
        })

        this.application.events.on('packet_qos_openchannel_ack', (data) => {

            const handshake = new OpenChannelPacket({ channelName: '', payload: Buffer.from('0000000002000000000000000000', 'hex').toString() })
            this.application.send(this.packHeader(handshake.toPacket(), {
                confirm: this.application.getServerSequence(),
                sequence: this.application.getClientSequence(),
            }), 1025, 37)
        })

        this.application.events.on('packet_qos_data', (data) => {
            console.log('[QOS] !!!!!! Data packet', data)
        })

        this.application.events.on('packet_qos_unknown', (data) => {
            console.log('[QOS] !!!!!! Unknown packet', data)
        })
    }

    route(packet, payload, rinfo){
        const header = this.readHeader(payload)
        // console.log('[QOS] pkt', header)


        if(packet.header.payloadType === 97 && (header.payload[0] == 0x02)){
            const model = new OpenChannelPacket(header.payload)
            this.application.events.emit('packet_qos_openchannel', {
                packet: packet,
                header: header,
                model: model
            })

        } else if(packet.header.payloadType === 97 && (header.payload[0] == 0x03)){
            // Is this ping?
            const model = new OpenChannelResponsePacket(header.payload)
            this.application.events.emit('packet_qos_openchannel_ping', {
                packet: packet,
                header: header,
                model: model
            })

        } else if(packet.header.payloadType === 36 && (header.payload[0] == 0x02)){
            const model = new OpenChannelPacket(header.payload)
            this.application.events.emit('packet_qos_openchannel_ack', {
                packet: packet,
                header: header,
                model: model
            })
        } else {
            this.application.events.emit('packet_qos_unknown', {
                packet: packet,
                header: header,
                model: undefined
            })
        }
    }

}