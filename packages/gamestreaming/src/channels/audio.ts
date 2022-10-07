import { OpenChannelPacket, OpenChannelResponsePacket, DataPacket, ConfigPacket } from '../packets/audio'
import BaseChannel from './base'

export default class AudioChannel extends BaseChannel {

    _sessionHandshakeInterval

    constructor(application) {
        super(application)

        this.application.events.on('packet_audio_openchannel', (data) => {

            const response = new OpenChannelResponsePacket({ payload: data.model.payload })
            this.application.send(this.packHeader(response.toPacket(), {
                confirm: this.application.getServerSequence(),
                sequence: this.application.getClientSequence(),
                timestamp: this.application.getMs(),
            }), 1027, 97)
        })

        this.application.events.on('packet_audio_config', (data) => {
            console.log('[AUDIO] !!!!!! Config packet', data.model)

            const config = new OpenChannelPacket({ channelName: '', payload: Buffer.from('00000000a32a51dc0200000080bb0000000000000000', 'hex') })
            this.application.send(this.packHeader(config.toPacket(), {
                confirm: this.application.getServerSequence(),
                sequence: this.application.getClientSequence(),
                timestamp: this.application.getMs(),
            }), 1027, 37)

            const response = new OpenChannelResponsePacket({ payload: Buffer.from('00000000100000000100', 'hex').toString() })
            this.application.send(this.packHeader(response.toPacket(), {
                confirm: this.application.getServerSequence(),
                sequence: this.application.getClientSequence(),
                timestamp: this.application.getMs(),
            }), 1027, 38)
        })

        // this.application.events.on('packet_audio_data', (data) => {
        //     console.log('[AUDIO] !!!!!! Data packet:', data)
        // })

        this.application.events.on('packet_audio_unknown', (data) => {
            console.log('[AUDIO] !!!!!! Unknown packet', data)
        })
    }

    route(packet, payload, rinfo){
        const header = this.readHeader(payload)
        // console.log('[AUDIO] pkt', header)


        if(packet.header.payloadType === 97 && (header.payload[0] == 0x02)){
            const model = new OpenChannelPacket(header.payload)
            this.application.events.emit('packet_audio_openchannel', {
                packet: packet,
                header: header,
                model: model
            })

        } else if(packet.header.payloadType === 36 && (header.payload[0] == 0x02)){
            const model = new ConfigPacket(header.payload)
            this.application.events.emit('packet_audio_config', {
                packet: packet,
                header: header,
                model: model
            })

        } else if(packet.header.payloadType === 39){
            // const model = new ConfigPacket(header.payload)
            this.application.events.emit('packet_audio_data', {
                packet: packet,
                header: header,
                model: false
            })
        } else {
            this.application.events.emit('packet_audio_unknown', {
                packet: packet,
                header: header,
                model: undefined
            })
        }
    }

}