import { OpenChannelPacket, OpenChannelResponsePacket, ConfigPacket } from '../packets/input'
import BaseChannel from './base'

export default class InputChannel extends BaseChannel {

    _sessionHandshakeInterval
    _InputSenderInterval
    _sequence = 0

    _referenceNum = -1
    _referenceTimestamp = process.hrtime()

    constructor(application) {
        super(application)

        this.application.events.on('packet_input_openchannel', (data) => {

            const response = new OpenChannelResponsePacket({ payload: Buffer.from('000000000000', 'hex').toString() })
            this.application.send(this.packHeader(response.toPacket(), {
                confirm: this.application.getServerSequence(),
                sequence: this.application.getClientSequence(),
                timestamp: this.application.getMs(),
            }), 1030, 97)

            // const config = new OpenChannelPacket({ channelName: '', payload: data.model.payload })
            // this.application.send(this.packHeader(config.toPacket(), {
            //     confirm: this.application.getServerSequence(),
            //     sequence: this.application.getClientSequence(),
            // }), 1030, 36)
        })

        // this.application.events.on('packet_input_data', (data) => {
        //     console.log('[INPUT] !!!!!! Data packet:', data)
        // })

        this.application.events.on('packet_input_config', (data) => {
            console.log('[INPUT] !!!!!! Config packet:', data)

            this._referenceNum = data.model.frame_reference

            // Send config ack
            const response = new ConfigPacket({ 
                payload_type: 6,
                frame_timestamp: BigInt(Date.now()),
                max_touches: 10,
                next_sequence: 0
            })
            console.log('response', response)
            this.application.send(this.packHeader(response.toPacket(), {
                confirm: this.application.getServerSequence(),
                sequence: this.application.getClientSequence(),
                timestamp: this.application.getMs(),
            }), 1030, 35)

            // Start input loop
            this._InputSenderInterval = setInterval(() => {
                let sequenceNow = Buffer.from('0000', 'hex')
                sequenceNow.writeUInt16LE(this.getSequence(), 0)

                let referenceFrame = Buffer.from('00000000', 'hex')
                referenceFrame.writeUInt32LE(this.getReferenceFrame(), 0)

                let referenceTimestamp = Buffer.from('0000000000000000', 'hex')
                referenceTimestamp.writeBigUInt64LE(BigInt(this.getReferenceTimestamp()), 0)
                // console.log('timestamp:', (this.getReferenceTimestamp()))

                let wireTimestamp = Buffer.from('00000000', 'hex')
                wireTimestamp.writeUInt32LE(this.application.getReferenceTimestamp(), 0)
                // console.log('timestamp:', (this.getReferenceTimestamp()))

                // this._inputSequence
                // buffer, data size, frame reference, timmestamp?, unk, gamepad frames, gamepad index?, timestamp?, unk
                // const payload2 = this.packHeader(Buffer.from('010000000000000007000000' + '27000000' + referenceFrame.toString('hex') + referenceTimestamp.toString('hex') + '0000' + '0000' + '01' + wireTimestamp.toString('hex') + '17000000'+'02000000'+'28010000'+'65010000'+'0000' + sequenceNow.toString('hex'), 'hex'), {
                const payload2 = this.packHeader(Buffer.from('010000000000000007000000' + '27000000' + referenceFrame.toString('hex') + referenceTimestamp.toString('hex') + '0000' + '0000' + '01' + wireTimestamp.toString('hex') + '00000000'+'00000000'+'28010000'+'65010000'+'0000' + sequenceNow.toString('hex'), 'hex'), {
                    // confirm: this._session._serverSequence,
                    confirm: this.application.getServerSequence(),
                    sequence: this.application.getClientSequence()
                })
                this.application.send(payload2, 1030, 35)
            }, 12) // Use an interval instead of an while loop to have concurrency

            this.application.events.once('application_disconnect', (data) => {
                clearInterval(this._InputSenderInterval)
            })
        })

        this.application.events.on('packet_input_unknown', (data) => {
            console.log('[INPUT] !!!!!! Unknown packet', data)
        })
    }

    route(packet, payload, rinfo){
        const header = this.readHeader(payload)
        // console.log('[INPUT] pkt', header)


        if(packet.header.payloadType === 97 && (header.payload[0] == 0x03)){
            const model = new OpenChannelPacket(header.payload)
            this.application.events.emit('packet_input_openchannel', {
                packet: packet,
                header: header,
                model: model
            })

        } else if(packet.header.payloadType === 35 && (header.payload[0] == 0x04)){
            const model = new ConfigPacket(header.payload)
            this.application.events.emit('packet_input_config', {
                packet: packet,
                header: header,
                model: model
            })

        } else {
            this.application.events.emit('packet_input_unknown', {
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

    getReferenceFrame(){
        this._referenceNum++
        return this._referenceNum
    }

    getReferenceTimestamp(){
        const end = process.hrtime(this._referenceTimestamp);
        const elapsed = (end[0] * 1) + (end[1] / 1000);
        return end[1]
    }

}