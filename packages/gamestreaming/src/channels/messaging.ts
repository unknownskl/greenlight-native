import { OpenChannelPacket, OpenChannelResponsePacket, DataPacket, MessagePacket } from '../packets/messaging'
import BaseChannel from './base'

export default class MessagingChannel extends BaseChannel {

    _sessionHandshakeInterval

    constructor(application) {
        super(application)

        this.application.events.on('packet_messaging_openchannel', (data) => {

            const response = new OpenChannelResponsePacket({ payload: data.model.payload.slice(0, -2) })
            this.application.send(this.packHeader(response.toPacket(), {
                confirm: this.application.getServerSequence(),
                sequence: this.application.getClientSequence(),
                timestamp: this.application.getMs(),
            }), 1028, 97)

            const handshake = new OpenChannelPacket({ channelName: '', payload: Buffer.from('000000000100000004000000010000000000', 'hex').toString() })
            this.application.send(this.packHeader(handshake.toPacket(), {
                confirm: this.application.getServerSequence(),
                sequence: this.application.getClientSequence(),
                timestamp: this.application.getMs(),
            }), 1028, 35)
        })

        this.application.events.on('packet_messaging_openchannel_ack', (data) => {
            const handshake = new MessagePacket({
                payload_type: 2,
                payload_key: '/streaming/systemUi/configuration',
                payload_value: Buffer.from('{"systemUis":[],"version":[0,2,0]}'),
                next_sequence: 1,
            })
            this.application.send(this.packHeader(handshake.toPacket(), {
                confirm: this.application.getServerSequence(),
                sequence: this.application.getClientSequence(),
                timestamp: this.application.getMs(),
            }), 1028, 35)
        })

        this.application.events.on('packet_messaging_data', (data) => {
            console.log('[MESSAGING] !!!!!! Data packet', data)

            if(data.model.type === 2) {

            }
        })

        this.application.events.on('packet_messaging_unknown', (data) => {
            console.log('[MESSAGING] !!!!!! Unknown packet', data)
        })
    }

    route(packet, payload, rinfo){
        const header = this.readHeader(payload)
        // console.log('[MESSAGING] pkt', header)


        if(packet.header.payloadType === 97 && (header.payload[0] == 0x02)){
            const model = new OpenChannelPacket(header.payload)
            this.application.events.emit('packet_messaging_openchannel', {
                packet: packet,
                header: header,
                model: model
            })

        } else if(packet.header.payloadType === 35 && (header.payload[0] == 0x02)){
            const model = new OpenChannelPacket(header.payload)
            this.application.events.emit('packet_messaging_openchannel_ack', {
                packet: packet,
                header: header,
                model: model
            })

        } else if(packet.header.payloadType === 35 && (header.payload[0] == 0x03)){
            const model = new MessagePacket(header.payload)
            this.application.events.emit('packet_messaging_data', {
                packet: packet,
                header: header,
                model: model
            })


        } else {
            this.application.events.emit('packet_messaging_unknown', {
                packet: packet,
                header: header,
                model: undefined
            })
        }
    }

}