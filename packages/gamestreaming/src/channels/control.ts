import SynPacket from '../packets/core/syn'
import AckPacket from '../packets/core/ack'
import BaseChannel from './base'

export default class ControlChannel extends BaseChannel {

    _sessionHandshakeInterval

    constructor(application) {
        super(application)

        this.application.events.on('packet_control_openchannel', (data) => {
            console.log('GOT CONTROL OPEN CHANNEL:', data)
            // const ack = new AckPacket({ mtu_size: data.model.mtu_size })
            // this.application.send(ack.toPacket(), 0)
        })

        // this.application.events.once('packet_core_ack', (data) => {
        //     console.log('GOT ACK PACKET:', data)
        //     clearInterval(this._sessionHandshakeInterval)
        // })

        // this.application.events.once('packet_core_ack_complete', (data) => {
        //     console.log('HANDSHAKE COMPLETED')

        //     // Set connection settings?
        //     const payload1 = Buffer.from('000003000c6400000000000000050000000000', 'hex') // Set payloadType = 100
        //     this.application.send(payload1, 0, 100)

        //     // Confirmation of stage of some sort (Maybe device type?)
        //     const payload2 = Buffer.from('28000000120000000000', 'hex') // Set marker = 1, payloadType = 100
        //     this.application.send(payload2, 0, 100, 1)

        //     // Syn finished?
        //     const payload3 = Buffer.from('01001879000000000000', 'hex') // Set payloadType = 100
        //     this.application.send(payload3, 0, 100)
        // })
    }

    route(packet, payload, rinfo){
        const header = this.readHeader(payload)
        console.log('[CONTROL] pkt', header)


        if(header.payload[1] == 0x00){
            // const model = new SynPacket(payload)
            this.application.events.emit('packet_control_openchannel', {
                packet: packet,
                header: header,
                model: undefined
            })

        } else if(header.payload[0] == 0x03 && header.payload[1] == 0x00){
            // const model = new SynPacket(payload)
            this.application.events.emit('packet_control_openchannel_open', {
                packet: packet,
                header: header,
                model: undefined
            })

        // } else if(header.payload[0] == 0x02 && header.payload[1] == 0x00){
        //     const model = new AckPacket(payload)
        //     this.application.events.emit('packet_core_ack', {
        //         packet: packet,
        //         model: model
        //     })

        } else {
            this.application.events.emit('packet_core_unknown', {
                packet: packet,
                header: header,
                model: undefined
            })
        }
    }

}