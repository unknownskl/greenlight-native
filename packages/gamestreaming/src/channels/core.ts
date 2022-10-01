import SynPacket from '../packets/core/syn'
import AckPacket from '../packets/core/ack'
import BaseChannel from './base'

export default class CoreChannel extends BaseChannel {

    _sessionHandshakeInterval

    constructor(application) {
        super(application)

        this.application.events.once('packet_core_syn', (data) => {
            console.log('GOT SYN PACKET:', data)
            const ack = new AckPacket({ mtu_size: data.model.mtu_size })
            this.application.send(ack.toPacket(), 0)
        })

        this.application.events.once('packet_core_ack', (data) => {
            console.log('GOT ACK PACKET:', data)
            clearInterval(this._sessionHandshakeInterval)
        })

        this.application.events.once('packet_core_ack_complete', (data) => {
            console.log('HANDSHAKE COMPLETED')

            // Set connection settings?
            const payload1 = Buffer.from('000003000c6400000000000000050000000000', 'hex') // Set payloadType = 100
            this.application.send(payload1, 0, 100)

            // Confirmation of stage of some sort (Maybe device type?)
            const payload2 = Buffer.from('28000000120000000000', 'hex') // Set marker = 1, payloadType = 100
            this.application.send(payload2, 0, 100, 1)

            // Syn finished?
            const payload3 = Buffer.from('01001879000000000000', 'hex') // Set payloadType = 100
            this.application.send(payload3, 0, 100)
        })
    }

    route(packet, payload, rinfo){
        // console.log('[CORE] pkt')

        if(payload[0] == 0x00 && payload[1] == 0x00){
            // const model = new SynPacket(payload)
            this.application.events.emit('packet_core_ack_complete', {
                packet: packet,
                model: undefined
            })

        } else if(payload[0] == 0x01 && payload[1] == 0x00){
            const model = new SynPacket(payload)
            this.application.events.emit('packet_core_syn', {
                packet: packet,
                model: model
            })

        } else if(payload[0] == 0x02 && payload[1] == 0x00){
            const model = new AckPacket(payload)
            this.application.events.emit('packet_core_ack', {
                packet: packet,
                model: model
            })

        } else {
            this.application.events.emit('packet_core_unknown', {
                packet: packet,
                model: undefined
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
                this.application.send(payload.slice(0, mtuSize), 0)
            }

            if(mtuSize <= 1207){
                if(this._sessionHandshakeInterval !== undefined)
                    clearInterval(this._sessionHandshakeInterval)
            }
        }, 10) // Use an interval instead of an while loop to have concurrency
    }

}