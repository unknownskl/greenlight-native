import GameStreamingProtocol, { PacketFormats } from 'greenlight-gamestreaming-protocol'
import { Channel } from '../channel'
import * as fs from 'fs'

export default class VideoChannel extends Channel {

    _messageParts = {}
    _qosPolicy = {}

    constructor(application){
        super(application)

        this.application.events.once('app_quit', (data) => {
            const videoFile = fs.openSync('../video.pcap.mp4', 'w+')

            for(const frame in this.videoFrameBuffer){
                fs.writeSync(videoFile, Buffer.concat([this.videoFrameBuffer[frame].data]))
            }

            fs.closeSync(videoFile);
            console.log(__filename+'[constructor]: video.pcap.mp4 has been written.')
        })
    }

    onMessage(rtp, payload){

        if(payload instanceof PacketFormats.MuxDCTControl && payload.type === PacketFormats.MuxDCTControlTypes.OpenChannel){
            console.log(__filename+'[onMessage()] Console requested to open Video channel')
            this.handleOpenChannel(rtp, payload)
        
        } else if(payload instanceof PacketFormats.MuxDCTChannel && payload.type === PacketFormats.MuxDCTChannelTypes.Config && payload.data.data instanceof PacketFormats.MuxDCTChannelFormats.ConfigFormats.VideoServer){
            this.application.sendPayload(new PacketFormats.MuxDCTChannel({
                type: PacketFormats.MuxDCTChannelTypes.Config,
                data: new PacketFormats.MuxDCTChannelFormats.Config({
                    data: new PacketFormats.MuxDCTChannelFormats.ConfigFormats.VideoClient({
                        frameId: 823738637
                    })
                })
            }, 35, rtp.header.ssrc), rtp.header.ssrc, 35)

            this.application.sendPayload(new PacketFormats.MuxDCTChannel({
                type: PacketFormats.MuxDCTChannelTypes.ConfigAck,
                nextSequence: 1,
                data: new PacketFormats.MuxDCTChannelFormats.ConfigAck({
                    data: new PacketFormats.MuxDCTChannelFormats.ConfigAckFormats.Video({})
                })
            }, 35, rtp.header.ssrc), rtp.header.ssrc, 35)

            console.log(__filename+'[onMessage()] Video channel opened')

        } else if(payload instanceof PacketFormats.MuxDCTChannel && payload.type === PacketFormats.MuxDCTChannelTypes.Frame && payload.data.data instanceof PacketFormats.MuxDCTChannelFormats.FrameFormats.Video){
            console.log(__filename+'[onMessage()]: Received video frame:', payload.data.data.frameId, '['+payload.data.data.data.length+']')
            this.processVideoData(payload.data.data)
        
        } else if(payload instanceof PacketFormats.MuxDCTChannel && payload.type === PacketFormats.MuxDCTChannelTypes.ConfigAck && payload.data.data instanceof PacketFormats.MuxDCTChannelFormats.FrameFormats.Video){
            console.log(__filename+'[onMessage()]: Received video key frame:', payload.data.data.frameId, '['+payload.data.data.data.length+']')
            this.processVideoData(payload.data.data)

        } else {
            console.log(__filename+'[onMessage()]: [video] Unknown packet to process: ', payload)
        }
    }

    // Video Dumper
    videoFrameBuffer = {}
    multiFrameBuffer = {}
    collectVideoData = false

    processVideoData(payload){
        // console.log(payload)

        if(payload.totalPackets > 1){

            if(! this.multiFrameBuffer[payload.frameId]){
                this.multiFrameBuffer[payload.frameId] = {
                    data: Buffer.alloc(payload.totalSize, Buffer.from('00', 'hex')),
                    metadata: '',
                    size: payload.totalSize,
                    bytesWrote: 0
                }
            }

            payload.metadata.copy(this.multiFrameBuffer[payload.frameId].data, 0)
            payload.data.copy(this.multiFrameBuffer[payload.frameId].data, payload.metadata.length+payload.dataOffset)
            this.multiFrameBuffer[payload.frameId].bytesWrote = this.multiFrameBuffer[payload.frameId].bytesWrote+payload.data.length
            
            if(payload.metadata.length > 0){
                this.multiFrameBuffer[payload.frameId].metadata = payload.metadata
            }

            // Check if packet is complete, then lets move it into the framebuffer
            if(this.multiFrameBuffer[payload.frameId].bytesWrote >= this.multiFrameBuffer[payload.frameId].size){

                if(this.collectVideoData === false && payload.unknown2 > 5){
                    this.collectVideoData = true
                    // this.videoFrameBuffer = []
                }

                this.videoFrameBuffer[payload.frameId] = {
                    metadata: this.multiFrameBuffer[payload.frameId].metadata,
                    data: Buffer.concat([this.multiFrameBuffer[payload.frameId].data])
                }
                delete this.multiFrameBuffer[payload.frameId]
            }
        } else {
            if(this.collectVideoData === true){
                this.videoFrameBuffer[payload.frameId] = {
                    metadata: payload.metadata,
                    data: Buffer.concat([payload.metadata, payload.data])
                }
            }
        }
    }
}