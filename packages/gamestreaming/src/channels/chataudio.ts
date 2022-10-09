import { OpenChannelPacket, OpenChannelResponsePacket, DataPacket, ConfigPacket } from '../packets/audio'
import BaseChannel from './base'

export default class ChatAudioChannel extends BaseChannel {

    _sessionHandshakeInterval

    constructor(application) {
        super(application)

        this.application.events.on('packet_chataudio_openchannel', (data) => {

            const response = new OpenChannelResponsePacket({ payload: Buffer.from('000000000000', 'hex').toString() })
            this.application.send(this.packHeader(response.toPacket(), {
                confirm: this.application.getServerSequence(),
                sequence: this.application.getClientSequence(),
                timestamp: this.application.getMs(),
            }), 1029, 97)

            const config = new OpenChannelPacket({ channelName: '', payload: Buffer.from('0000000007000000730094bf810100000100000001000000c05d00000100000002000000000000000000', 'hex') })
            this.application.send(this.packHeader(config.toPacket(), {
                confirm: this.application.getServerSequence(),
                sequence: this.application.getClientSequence(),
            }), 1029, 36)

            // Assume we received all channels..
            this.application.channels.ControlChannel.sendChannelsAck()
        })

        this.application.events.on('packet_chataudio_config', (data) => {
            console.log('[AUDIO] !!!!!! Config packet', data.model)

            // const config = new OpenChannelPacket({ channelName: '', payload: Buffer.from('00000000a32a51dc0200000080bb0000000000000000', 'hex') })
            // this.application.send(this.packHeader(config.toPacket(), {
            //     confirm: this.application.getServerSequence(),
            //     sequence: this.application.getClientSequence(),
            //     timestamp: this.application.getMs(),
            // }), 1029, 37)

            // const response = new OpenChannelResponsePacket({ payload: Buffer.from('00000000100000000100', 'hex').toString() })
            // this.application.send(this.packHeader(response.toPacket(), {
            //     confirm: this.application.getServerSequence(),
            //     sequence: this.application.getClientSequence(),
            //     timestamp: this.application.getMs(),
            // }), 1029, 38)
        })

        // this.application.events.on('packet_chataudio_data', (data) => {
        //     console.log('[CHATAUDIO] !!!!!! Data packet:', data)
        // })

        this.application.events.on('packet_chataudio_unknown', (data) => {
            console.log('[CHATAUDIO] !!!!!! Unknown packet', data)
        })
    }

    route(packet, payload, rinfo){
        const header = this.readHeader(payload)
        // console.log('[CHATAUDIO] pkt', header)


        if(packet.header.payloadType === 97 && (header.payload[0] == 0x02)){
            const model = new OpenChannelPacket(header.payload)
            this.application.events.emit('packet_chataudio_openchannel', {
                packet: packet,
                header: header,
                model: model
            })

        // } else if(packet.header.payloadType === 36 && (header.payload[0] == 0x02)){
        //     const model = new ConfigPacket(header.payload)
        //     this.application.events.emit('packet_chataudio_config', {
        //         packet: packet,
        //         header: header,
        //         model: model
        //     })

        } else {
            this.application.events.emit('packet_chataudio_unknown', {
                packet: packet,
                header: header,
                model: undefined
            })
        }
    }

}