import { OpenChannelPacket, OpenChannelResponsePacket, DataPacket } from '../packets/control'
import BaseChannel from './base'

export default class ControlChannel extends BaseChannel {

    _sessionHandshakeInterval

    constructor(application) {
        super(application)

        this.application.events.on('packet_control_openchannel', (data) => {
            const minVersion = data.model.payload.readUInt32LE(0)
            const maxVersion = data.model.payload.readUInt32LE(4)

            const response = new OpenChannelResponsePacket({ payload: data.model.payload.slice(2) })
            this.application.send(this.packHeader(response.toPacket(), {
                confirm: this.application.getServerSequence(),
                sequence: this.application.getClientSequence()
            }), 1024, 97)

            const payload2 = this.packHeader(Buffer.from('02000000000000000100000000000000000000000000000000002400000034424442333630392d433146312d343139352d394233372d4645464634354441384238450000', 'hex'), {
                confirm: this.application.getServerSequence(),
                sequence: this.application.getClientSequence()
            })
            this.application.send(payload2, 1024, 35)
        })

        this.application.events.on('packet_control_openchannel_ack', (data) => {
            const payload3 = this.packHeader(Buffer.from('03000000000000000700404b4c000100050000d00200000000000003000000000000000100', 'hex'), {
                confirm: this.application.getServerSequence(),
                sequence: this.application.getClientSequence()
            })
            this.application.send(payload3, 1024, 35)
        })

        this.application.events.on('packet_control_data', (data) => {
            console.log('[CONTROL] !!!!!! Data packet', data)
        })
    }

    sendChannelsAck(){
        const payload4 = this.packHeader(Buffer.from('0300010000000000040001000200', 'hex'), {
            confirm: this.application.getServerSequence(),
            sequence: this.application.getClientSequence(),
            timestamp: this.application.getMs()
        })
        this.application.send(payload4, 1024, 35)
    }

    route(packet, payload, rinfo){
        const header = this.readHeader(payload)
        // console.log('[CONTROL] pkt', header)


        if(packet.header.payloadType === 97 && (header.payload[0] == 0x02)){
            const model = new OpenChannelPacket(header.payload)
            this.application.events.emit('packet_control_openchannel', {
                packet: packet,
                header: header,
                model: model
            })
        } else if(packet.header.payloadType === 35 && (header.payload[0] == 0x02)){
            const model = new OpenChannelPacket(header.payload)
            this.application.events.emit('packet_control_openchannel_ack', {
                packet: packet,
                header: header,
                model: model
            })
        } else {
            this.application.events.emit('packet_control_unknown', {
                packet: packet,
                header: header,
                model: undefined
            })
        }
    }

}