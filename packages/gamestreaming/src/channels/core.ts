// import SynPacket from '../packets/core/syn'
// import AckPacket from '../packets/core/ack'

import { AckPacket, SynPacket, PingPacket, DisconnectPacket } from '../packets/core'
import BaseChannel from './base'

export default class CoreChannel extends BaseChannel {

    _sessionHandshakeInterval
    _sessionConfirmInterval

    constructor(application) {
        super(application)

        this.application.events.once('packet_core_syn', (data) => {
            const ack = new AckPacket({ mtu_size: data.model.mtu_size })
            this.application.setMtu(data.model.mtu_size)
            this.application.send(ack.toPacket(), 0, 102)
        })

        this.application.events.once('packet_core_ack', (data) => {
            clearInterval(this._sessionHandshakeInterval)
        })

        this.application.events.once('packet_core_ack_complete', (data) => {
            // Ack is completed, setup heartbeat agreement
            console.log('HANDSHAKE COMPLETED')

            // Set connection settings?
            const payload1 = Buffer.from('000003000c6400000000000000050000000000', 'hex')
            this.application.send(payload1, 0, 100)

            // Confirmation of stage of some sort (Maybe device type?)
            const payload2 = Buffer.from('28000000120000000000', 'hex')
            this.application.send(payload2, 0, 101)
        
            this.application.events.on('packet_core_ack_stage2', (data) => {
                // Syn finished?
                const payload3 = Buffer.from('01005c09000000000000', 'hex')
                this.application.send(payload3, 0, 100)
            })

            this.application.events.once('packet_core_ack_stage3', (data) => {
                const payload4 = Buffer.from('51c16400fe0a0000002700f40164000000', 'hex')
                this.application.send(payload4, 0, 35)
            })
        })

        this.application.events.on('packet_core_ping', (data) => {
            console.log('[CORE] packet_core_ping:', data)

            const mtuPong = Buffer.alloc(this.application.getMtu())
            mtuPong.writeInt16LE(this.application.getMtu())
            this.application.send(mtuPong, 0, 101)
        })

        this.application.events.on('packet_core_disconnect', (data) => {
            console.log('[CORE] packet_core_disconnect:', data)
            // @TODO: Implement disconnect logics

            this.application.events.emit('application_disconnect', data)
        })

        this.application.events.on('packet_core_unknown', (data) => {
            // console.log('[CORE] Unknown packet:', data)
        })

        this.application.events.once('packet_core_ack_reconfig', (data) => {
            const mtuPong = Buffer.alloc(10)
            mtuPong.writeInt16LE(this.application.getMtu())
            mtuPong.writeInt16LE(18, 4)
            this.application.send(mtuPong, 0, 101)
        })

        // Confirm sequence
        this.application._ms = this.application.getMs(true)
        this._sessionConfirmInterval = setInterval(() => {
            // Check every 10 ms for a core ack packet.

            // console.log('cycle ack:', this.application.getMs(true), 'ms:', this.application.getMs())
            if(this.application._serverSequenceChanged === true){
                // console.log('send ack:', this.application.getMs(true), 'ms:', this.application.getMs())

                // const sequence = Buffer.from('0000', 'hex')
                // sequence.writeUInt16LE(this.application.getServerSequence())
                // const timestamp = Buffer.from('000000', 'hex')
                // timestamp.writeUIntLE(this.application.getMs(), 0, 3)

                // this.application.send(Buffer.concat([
                //     Buffer.from('01c0', 'hex'),
                //     sequence,
                //     timestamp,
                //     Buffer.from('0000' + '0000', 'hex')
                // ]), 0, 35)

                this.application.send(this.packHeader(Buffer.from('0000', 'hex'), {
                    sequence: this.application.getClientSequence(),
                    confirm: this.application.getServerSequence(),
                    timestamp: this.application.getMs()
                }), 0, 35)
            }

        }, 50)
    }

    route(packet, payload, rinfo){
        // console.log('[CORE] pkt', packet)

        // payloadType 101
        if(packet.header.payloadType === 101 && (payload[0] == 0x00 && payload[1] == 0x00)){
            // const model = new SynPacket(payload)
            this.application.events.emit('packet_core_ack_complete', {
                packet: packet,
                model: undefined
            })
        } else if(packet.header.payloadType === 101 && (payload[0] == 0xff && payload[1] == 0xff)){
            const model = new DisconnectPacket(payload)
            this.application.events.emit('packet_core_disconnect', {
                packet: packet,
                model: model
            })
        } else if(packet.header.payloadType === 101 && payload.length > 1300 ){
            const model = new PingPacket(payload)
            this.application.events.emit('packet_core_ping', {
                packet: packet,
                model: model
            })

        } else if(packet.header.payloadType === 101 && payload[4] === 0x09 ){
            const model = new PingPacket(payload)
            this.application.events.emit('packet_core_ack_reconfig', {
                packet: packet,
                model: model
            })

        // payloadType 102
        } else if(packet.header.payloadType === 102 && (payload[0] == 0x01 && payload[1] == 0x00)){
            const model = new SynPacket(payload)
            this.application.events.emit('packet_core_syn', {
                packet: packet,
                model: model
            })
        } else if(packet.header.payloadType === 102 && (payload[0] == 0x02 && payload[1] == 0x00)){
            const model = new AckPacket(payload)
            this.application.events.emit('packet_core_ack', {
                packet: packet,
                model: model
            })

        } else if(packet.header.payloadType === 100 && (payload[0] == 0x00)){
            // const model = new AckPacket(payload)
            this.application.events.emit('packet_core_ack_stage2', {
                packet: packet,
                model: false
            })

        } else if(packet.header.payloadType === 100 && (payload[0] == 0x02)){
            // const model = new AckPacket(payload)
            this.application.events.emit('packet_core_ack_stage3', {
                packet: packet,
                model: false
            })

        // payloadType 35
        } else if(packet.header.payloadType === 35 && (payload[0] == 0x01 && payload[1] == 0xc0)){
            const model = {
                header: this.readHeader(payload)
            }
            this.application.events.emit('packet_core_packet_ack', {
                packet: packet,
                model: model
            })

        // other
        } else {
            this.application.events.emit('packet_core_unknown', {
                packet: packet,
                model: undefined,
                debug: {
                    payloadType: packet.header.payloadType
                }
            })
        }
    }

    startHandshake(){
        console.log('[CORE] Starting UDP MTU handshake')

        let mtuSize = 1436+16
        this._sessionHandshakeInterval = setInterval(() => {
            const payload = new SynPacket({ mtu_size: 1436 }).toPacket()
            mtuSize = mtuSize-16

            if(payload !== undefined){
                console.log('[CORE] Sending mtu syn:', mtuSize)
                this.application.send(payload.slice(0, mtuSize), 0, 102)
            }

            if(mtuSize <= 1207){
                if(this._sessionHandshakeInterval !== undefined)
                    clearInterval(this._sessionHandshakeInterval)
            }
        }, 10) // Use an interval instead of an while loop to have concurrency
    }

    sendChannelsCompletedAck(){
        this.application.send(Buffer.from('52050000000000000000', 'hex'), 0, 101)
        this.application.send(Buffer.from('20010000000000000000', 'hex'), 0, 101)
    }

}