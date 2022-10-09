import { OpenChannelPacket, OpenChannelResponsePacket, DataPacket, ConfigPacket, FramePacket } from '../packets/video'
import BaseChannel from './base'
import Videobuffer from '../lib/videobuffer'

import * as fs from 'fs'
export default class VideoChannel extends BaseChannel {

    _sessionHandshakeInterval
    _videoBuffer:Videobuffer
    _videoBufferRunning = false
    _referenceTimestamp = process.hrtime()

    _sequence = 0

    constructor(application) {
        super(application)

        this._videoBuffer = new Videobuffer()

        this.application.events.on('packet_video_openchannel', (data) => {

            const response = new OpenChannelResponsePacket({ payload: data.model.payload })
            this.application.send(this.packHeader(response.toPacket(), {
                confirm: this.application.getServerSequence(),
                sequence: this.application.getClientSequence(),
                timestamp: this.application.getMs(),
            }), 1026, 97)
        })

        this.application.events.on('packet_video_config', (data) => {
            console.log('[VIDEO] !!!!!! Config packet', data)
            const response = new ConfigPacket({
                payload_type: 2,
                timestamp: 823738637,
                fps: 60,
                width: 1280,
                height: 720,
                next_sequence: 0
            })
            this.application.send(this.packHeader(response.toPacket(), {
                confirm: this.application.getServerSequence(),
                sequence: this.application.getClientSequence(),
            }), 1026, 35)

            const payload2 = this.packHeader(Buffer.from('0500000000000000030000000100000004000000300000000100', 'hex'), {
                // confirm: this._session._serverSequence,
                confirm: this.application.getServerSequence(),
                sequence: this.application.getClientSequence()
            })
            this.application.send(payload2, 1026, 35)


            const payload3 = this.packHeader(Buffer.from('030001000000000003000000010000000c000000220000000d4119310d4119310200', 'hex'), {
                // confirm: this._session._serverSequence,
                confirm: this.application.getServerSequence(),
                sequence: this.application.getClientSequence()
            })
            this.application.send(payload3, 1026, 35)
        })

        this.application.events.on('packet_video_unknown', (data) => {
            console.log('[VIDEO] !!!!!! Unknown packet', data)
        })

        this.application.events.on('packet_video_data', (data) => {
            // console.log('[VIDEO] !!!!!! Data packet:', data)

            if(data.model.header_type === 5){
                this._videoBufferRunning = true
            }

            if(this._videoBufferRunning === true){
                this._videoBuffer.addFrame({
                    frameId: data.model.frame_num,
                    totalSize: data.model.frame_totalsize,
                    offset: data.model.frame_offset,
                    data: data.model.framedata,
                    metadata: data.model.metadata,
                })
            }

            // Ack video packet if metadata is present
            if(data.model.metadata.length > 0){
                const controlSequence = this.getSequence()
                const prevSequence = controlSequence-1

                let sequencePrev = Buffer.from('0000', 'hex')
                sequencePrev.writeUInt16LE(prevSequence, 0)

                let sequenceNow = Buffer.from('0000', 'hex')
                sequenceNow.writeUInt16LE(controlSequence, 0)

                let frameid = Buffer.from('00000000', 'hex')
                frameid.writeUInt32LE(data.model.frame_num, 0)

                let rendertime = Buffer.from('00000000', 'hex')
                rendertime.writeUInt32LE(this.getReferenceTimestamp(), 0)

                console.log('frameid:', frameid)

                const videoAck = Buffer.concat([
                    Buffer.from('0300', 'hex'),
                    sequencePrev,
                    Buffer.from('0000000003000000010000001000000080000000', 'hex'),
                    frameid,
                    rendertime, // Buffer.from('00000000', 'hex'), // unknown, try null?
                    Buffer.from('00000000', 'hex'),
                    sequenceNow
                ])

                const payload2 = this.packHeader(videoAck, {
                    confirm: this.application.getServerSequence(),
                    sequence: this.application.getClientSequence()
                })
                this.application.send(payload2, 1026, 35)
            }
        })



        this.application.events.on('application_disconnect', (data) => {
            console.log('[VIDEO] Dumping videobuffer to file...', data)

            fs.writeFileSync('./video.mp4', this._videoBuffer.getBuffer(), { flag: 'w+' })

            console.log('[VIDEO] File has been written: video.mp4')

        })
    }

    route(packet, payload, rinfo){
        const header = this.readHeader(payload)
        // console.log('[VIDEO] pkt', header)


        if(packet.header.payloadType === 97 && (header.payload[0] == 0x02)){
            const model = new OpenChannelPacket(header.payload)
            this.application.events.emit('packet_video_openchannel', {
                packet: packet,
                header: header,
                model: model
            })

        } else if(packet.header.payloadType === 36 && (header.payload[0] == 0x02)){
            const model = new OpenChannelPacket(header.payload)
            this.application.events.emit('packet_video_openchannel_ack', {
                packet: packet,
                header: header,
                model: model
            })

        } else if(packet.header.payloadType === 35 && (header.payload[0] == 0x04)){
            const model = new ConfigPacket(header.payload)
            this.application.events.emit('packet_video_config', {
                packet: packet,
                header: header,
                model: model
            })

        } else if((packet.header.payloadType === 35 || packet.header.payloadType === 162) && (header.payload[0] == 0x00 || header.payload[0] == 0x01 || header.payload[0] == 0x05)){
            // Payloadtype 162 == 35, but greenlight-rtp has an bug that marks it as 162 so we use this as a workaround for now.
            // @TODO: Add tests for marker type with payloadtype 35.

            const model = new FramePacket(header.payload)
            this.application.events.emit('packet_video_data', {
                packet: packet,
                header: header,
                model: model
            })
        } else {
            this.application.events.emit('packet_video_unknown', {
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

    getReferenceTimestamp(){
        const end = process.hrtime(this._referenceTimestamp);
        const elapsed = (end[0] * 1) + (end[1] / 1000);
        return end[1]
    }

}