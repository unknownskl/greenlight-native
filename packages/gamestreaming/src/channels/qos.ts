import { OpenChannelPacket, OpenChannelResponsePacket, DataPacket, MessagePacket } from '../packets/qos'
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

            const handshake = new OpenChannelPacket({ channelName: '', payload: Buffer.from('0000000002000000000000000000', 'hex').toString() })
            this.application.send(this.packHeader(handshake.toPacket(), {
                confirm: this.application.getServerSequence(),
                sequence: this.application.getClientSequence(),
            }), 1025, 37)
        })

        this.application.events.on('packet_qos_data', (data) => {
            // console.log('[QOS] !!!!!! Data packet', data)

            // Receive policy
            if(data.model.type === 1) {
                const fullPolicy = this.processFragment(data)
                if(fullPolicy !== false){
                    try {
                        fullPolicy.data = JSON.parse(fullPolicy.data.toString())
                    } catch(error){
                        console.log('[QOS] WARNING: Unable to parse JSON policy:', error)
                    }
                    this.application.events.emit('application_qos_policy', { policy: fullPolicy })
                    console.log('[QOS] Policy retrieved:', fullPolicy)

                    // Send ack on policy retrieval
                    const handshake = new OpenChannelResponsePacket({ payload: Buffer.from('0000000001000000'+'0100', 'hex').toString() })
                    this.application.send(this.packHeader(handshake.toPacket(), {
                        confirm: this.application.getServerSequence(),
                        sequence: this.application.getClientSequence(),
                    }), 1025, 41)
                }
            } else {
                console.log('[QOS] Unknown data packet type:', data.model.type)
            }
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

        } else if(packet.header.payloadType === 40 && (header.payload[0] == 0x03)){
            const model = new MessagePacket(header.payload)
            this.application.events.emit('packet_qos_data', {
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

    _fragments = {}

    processFragment(data){
        if(this._fragments[data.model.fragment_totalsize] === undefined){
            // Create new
            this._fragments[data.model.fragment_totalsize] = {
                totalsize: data.model.fragment_totalsize,
                data: Buffer.allocUnsafe(data.model.fragment_totalsize-1),
                byteswrote: 0,
            }
        }

        // this._fragments[data.model.fragment_totalsize].data.
        data.model.fragment_data.copy(this._fragments[data.model.fragment_totalsize].data, data.model.fragment_offset)
        this._fragments[data.model.fragment_totalsize].byteswrote += data.model.fragment_size

        // Check if commpleted
        if(this._fragments[data.model.fragment_totalsize].byteswrote >= data.model.fragment_totalsize)
            return this._fragments[data.model.fragment_totalsize]
        else
            return false
    }

}