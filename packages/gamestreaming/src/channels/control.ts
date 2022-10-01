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

        } else {
            this.application.events.emit('packet_core_unknown', {
                packet: packet,
                header: header,
                model: undefined
            })
        }
    }

}