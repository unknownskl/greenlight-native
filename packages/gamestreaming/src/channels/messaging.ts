import GameStreamingProtocol, { PacketFormats } from 'greenlight-gamestreaming-protocol'
import { Channel } from '../channel'

export default class MessagingChannel extends Channel {

    _messageParts = {}
    _sequence = 0
    _frameId = 2331526925

    _qosPolicy = {}

    onMessage(rtp, payload){

        if(payload instanceof PacketFormats.MuxDCTControl && payload.type === PacketFormats.MuxDCTControlTypes.OpenChannel){
            console.log(__filename+'[onMessage()] Console requested to open Messaging channel')
            this.handleOpenChannel(rtp, payload)
        
        } else if(payload instanceof PacketFormats.MuxDCTChannel && payload.type === PacketFormats.MuxDCTChannelTypes.OpenChannel && payload.data.data instanceof PacketFormats.MuxDCTChannelFormats.OpenChannelFormats.Request){
            console.log(payload)

            this.application.sendPayload(new PacketFormats.MuxDCTChannel({
                type: PacketFormats.MuxDCTChannelTypes.OpenChannel,
                data: new PacketFormats.MuxDCTChannelFormats.OpenChannel({
                    data: new PacketFormats.MuxDCTChannelFormats.OpenChannelFormats.Request({
                        unknown2: 4,
                        unknown3: 1,
                    })
                })
            }, 35, rtp.header.ssrc), rtp.header.ssrc, 35)

            console.log(__filename+'[onMessage()] Messaging channel opened')

            this.application.sendPayload(new PacketFormats.MuxDCTChannel({
                type: PacketFormats.MuxDCTChannelTypes.Data,
                nextSequence: 1,
                data: new PacketFormats.MuxDCTChannelFormats.Data({
                    data: new PacketFormats.MuxDCTChannelFormats.DataFormats.Message({
                        dataType: PacketFormats.MuxDCTChannelFormats.DataFormats.MessageDataTypes.KeyValue,
                        frameId: this.getFrameId(),
                        key: '/streaming/systemUi/configuration',
                        value: Buffer.from('{"systemUis":[],"version":[0,2,0]}')
                    })
                })
            }, 35, rtp.header.ssrc), rtp.header.ssrc, 35)

            // const sequence = this.getSequence()
            // this.application.sendPayload(new PacketFormats.MuxDCTChannel({
            //     type: PacketFormats.MuxDCTChannelTypes.Data,
            //     sequence: sequence,
            //     nextSequence: sequence+1,
            //     data: new PacketFormats.MuxDCTChannelFormats.Data({
            //         data: new PacketFormats.MuxDCTChannelFormats.DataFormats.Message({
            //             dataType: PacketFormats.MuxDCTChannelFormats.DataFormats.MessageDataTypes.KeyValue,
            //             ackType: PacketFormats.MuxDCTChannelFormats.DataFormats.MessageAckTypes.isAck,
            //             frameId: payload.data.data.frameId,
            //             key: '/streaming/characteristics/dimensionschanged',
            //             value: Buffer.from('{"horizontal":130,"preferredHeight":1170,"preferredWidth":2532,"safeAreaBottom":1107,"safeAreaLeft":141,"safeAreaRight":2391,"safeAreaTop":0,"supportsCustomResolution":false,"vertical":73}')
            //         })
            //     })
            // }, 35, rtp.header.ssrc), rtp.header.ssrc, 35)

            this.sendKeyValue(rtp, '/streaming/characteristics/dimensionschanged', {"horizontal":130,"preferredHeight":1170,"preferredWidth":2532,"safeAreaBottom":1107,"safeAreaLeft":141,"safeAreaRight":2391,"safeAreaTop":0,"supportsCustomResolution":false,"vertical":73})
            this.sendKeyValue(rtp, '/streaming/characteristics/orientationchanged', {"orientation":0})
            this.sendKeyValue(rtp, '/streaming/social/partyChatAudioCoordination/setPartyChatActive', {"partyChatActive":false}, PacketFormats.MuxDCTChannelFormats.DataFormats.MessageAckTypes.NeedsAck)
            this.sendKeyValue(rtp, '/streaming/properties/clientappinstallidchanged', {"clientAppInstallId":"66354ea190f8a47031fff981236fac55"})
            this.sendKeyValue(rtp, '/streaming/characteristics/touchinputenabledchanged', {"touchInputEnabled":false})
            this.sendKeyValue(rtp, '/streaming/characteristics/touchBundleMetadataChanged', null)
            this.sendKeyValue(rtp, '/streaming/characteristics/clientdevicecapabilities', {"maxTouchBundleLayoutVersion":"3.4.1.0","maxTouchBundleManifestVersion":"2.0.0.0"}, PacketFormats.MuxDCTChannelFormats.DataFormats.MessageAckTypes.NeedsAck)

        } else if(payload instanceof PacketFormats.MuxDCTChannel && payload.type === PacketFormats.MuxDCTChannelTypes.Data && payload.data.data instanceof PacketFormats.MuxDCTChannelFormats.DataFormats.Message){
            console.log(__filename+'[onMessage]: [messaging] KeyValue received:', payload.data.data.key, ' Value: ', payload.data.data.value.toString())

            if(payload.data.data.ackType === PacketFormats.MuxDCTChannelFormats.DataFormats.MessageAckTypes.NeedsAck){
                const sequence = this.getSequence()
                this.application.sendPayload(new PacketFormats.MuxDCTChannel({
                    type: PacketFormats.MuxDCTChannelTypes.Data,
                    sequence: sequence,
                    nextSequence: sequence+1,
                    data: new PacketFormats.MuxDCTChannelFormats.Data({
                        data: new PacketFormats.MuxDCTChannelFormats.DataFormats.Message({
                            dataType: PacketFormats.MuxDCTChannelFormats.DataFormats.MessageDataTypes.KeyValue,
                            ackType: PacketFormats.MuxDCTChannelFormats.DataFormats.MessageAckTypes.isAck,
                            frameId: payload.data.data.frameId,
                            key: '',
                            value: Buffer.from('')
                        })
                    })
                }, 35, rtp.header.ssrc), rtp.header.ssrc, 35)
            }

        } else {
            // console.log(__filename+'[onMessage()]: [messaging] Unknown packet to process: ', payload)
        }
    }

    getSequence(){
        this._sequence++;
        return this._sequence;
    }

    getFrameId(){
        this._frameId++;
        return this._frameId;
    }

    sendKeyValue(rtp, key, value, ackType = PacketFormats.MuxDCTChannelFormats.DataFormats.MessageAckTypes.NoAck){
        const sequence = this.getSequence()
        this.application.sendPayload(new PacketFormats.MuxDCTChannel({
            type: PacketFormats.MuxDCTChannelTypes.Data,
            sequence: sequence,
            nextSequence: sequence+1,
            data: new PacketFormats.MuxDCTChannelFormats.Data({
                data: new PacketFormats.MuxDCTChannelFormats.DataFormats.Message({
                    dataType: PacketFormats.MuxDCTChannelFormats.DataFormats.MessageDataTypes.KeyValue,
                    ackType: ackType,
                    frameId: this.getFrameId(),
                    key: key,
                    value: (typeof value === 'object') ? Buffer.from(JSON.stringify(value)) : value
                })
            })
        }, 35, rtp.header.ssrc), rtp.header.ssrc, 35)
    }
}