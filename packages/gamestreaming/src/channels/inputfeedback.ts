import { OpenChannelPacket, OpenChannelResponsePacket, ConfigPacket, MessagePacket } from '../packets/inputfeedback'
import BaseChannel from './base'

export default class InputFeedbackChannel extends BaseChannel {

    _sessionHandshakeInterval
    _sequence = 0

    constructor(application) {
        super(application)

        this.application.events.on('packet_inputfeedback_openchannel', (data) => {
            console.log('[INPUTFEEDBACK] !!!!!! Openchannel packet', data)

            const response = new OpenChannelResponsePacket({ payload: Buffer.from('000000000000', 'hex').toString() })
            this.application.send(this.packHeader(response.toPacket(), {
                confirm: this.application.getServerSequence(),
                sequence: this.application.getClientSequence(),
                timestamp: this.application.getMs(),
            }), 1031, 97)

            const config = new ConfigPacket({ 
                payload_type: 5,
                frame_reference: 2134489808,
                max_touches: 10,
                next_sequence: 0
            })
            this.application.send(this.packHeader(config.toPacket(), {
                confirm: this.application.getServerSequence(),
                sequence: this.application.getClientSequence(),
                timestamp: this.application.getMs(),
            }), 1031, 35)

            // const config = new OpenChannelPacket({ channelName: '', payload: data.model.payload })
            // this.application.send(this.packHeader(config.toPacket(), {
            //     confirm: this.application.getServerSequence(),
            //     sequence: this.application.getClientSequence(),
            // }), 1030, 36)
        })

        this.application.events.on('packet_inputfeedback_data', (data) => {
            console.log('[INPUTFEEDBACK] !!!!!! Data packet:', data)

            {
                const controlSequence = this.getSequence()
                const prevSequence = controlSequence-1

                let sequencePrev = Buffer.from('0000', 'hex')
                sequencePrev.writeUInt16LE(prevSequence, 0)

                let sequenceNow = Buffer.from('0000', 'hex')
                sequenceNow.writeUInt16LE(controlSequence, 0)

                let frameid = Buffer.from('00000000', 'hex')
                frameid.writeUInt32LE(data.model.frame_num, 0)

                console.log('frameid:', frameid)

                const feedbackAck = Buffer.concat([
                    Buffer.from('0100', 'hex'),
                    sequencePrev,
                    Buffer.from('000000000300000004000000', 'hex'),
                    frameid,
                    sequenceNow
                ])

                const payload2 = this.packHeader(feedbackAck, {
                    confirm: this.application.getServerSequence(),
                    sequence: this.application.getClientSequence(),
                    timestamp: this.application.getMs()
                })
                this.application.send(payload2, 1031, 35)
            }
        })

        this.application.events.on('packet_inputfeedback_unknown', (data) => {
            console.log('[INPUTFEEDBACK] !!!!!! Unknown packet', data)
        })
    }

    route(packet, payload, rinfo){
        const header = this.readHeader(payload)
        // console.log('[INPUTFEEDBACK] pkt', header)


        if(packet.header.payloadType === 97 && (header.payload[0] == 0x03)){
            const model = new OpenChannelPacket(header.payload)
            this.application.events.emit('packet_inputfeedback_openchannel', {
                packet: packet,
                header: header,
                model: model
            })

        } else if(packet.header.payloadType === 35 && (header.payload[0] == 0x01)){
            const model = new MessagePacket(header.payload)
            this.application.events.emit('packet_inputfeedback_data', {
                packet: packet,
                header: header,
                model: model
            })

        } else {
            this.application.events.emit('packet_inputfeedback_unknown', {
                packet: packet,
                header: header,
                model: undefined
            })
        }
    }

    getSequence(){
        this._sequence++
        return this._sequence
    }

}