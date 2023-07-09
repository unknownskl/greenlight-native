import * as assert from 'assert'
import * as fs from 'fs'
import { loadPacket } from './config';

import MuxDCTChannel, { Types, DefaultOptions, Formats } from '../../src/packets/MuxDCTChannel'

describe('MuxDCTChannel', function () {

    describe('None', function () {

        it('should be able to decode (None)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/None.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTChannel), true)
            assert.equal((packet.gs_payload as DefaultOptions).type, Types.None)
        });

        it('should be able to encode (None)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/None.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTChannel({
                type: Types.None,
            }, packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc)
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(15))
        });
    });

    describe('Frame', function () {
        it('should be able to decode (Frame/Video_Start)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Frame/Video_Start.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTChannel), true)
            assert.equal((packet.gs_payload as DefaultOptions).type, Types.Frame)

            assert.equal(((packet.gs_payload as MuxDCTChannel).data instanceof Formats.Frame), true)
            assert.equal(((packet.gs_payload as MuxDCTChannel).data.data instanceof Formats.FrameFormats.Video), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.frameId, 823738637)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.relativeTimestamp, 143644)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.totalSize, 75)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.totalPackets, 1)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.dataOffset, 0)
            assert.deepEqual((packet.gs_payload as MuxDCTChannel).data.data.metadata, packet.payload.slice(71, 80))
            assert.deepEqual((packet.gs_payload as MuxDCTChannel).data.data.data, packet.payload.slice(80, -2))
        });

        it('should be able to encode (Frame/Video_Start)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Frame/Video_Start.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTChannel({
                type: Types.Frame,
                nextSequence: 2,
                data: new Formats.Frame({
                    data: new Formats.FrameFormats.Video({
                        frameId: 823738637,
                        relativeTimestamp: 143644,
                        totalSize: 75,
                        totalPackets: 1,
                        dataOffset: 0,
                        metadata: packet.payload.slice(71, 80),
                        data: packet.payload.slice(80, -2),
                    })
                })
            }, packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc)
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(11))
        });
    });

    describe('Control', function () {

        it('should be able to decode (Control/Openchannel1)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Control/Openchannel1.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTChannel), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).type, Types.OpenChannel)
            assert.equal((packet.gs_payload as MuxDCTChannel).sequence, 0)
            assert.equal((packet.gs_payload as MuxDCTChannel).nextSequence, 0)

            assert.equal(((packet.gs_payload as MuxDCTChannel).data instanceof Formats.OpenChannel), true)
            assert.equal(((packet.gs_payload as MuxDCTChannel).data.data instanceof Formats.OpenChannelFormats.Request), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.udid, '4BDB3609-C1F1-4195-9B37-FEFF45DA8B8E')
        });

        it('should be able to encode (Control/Openchannel1)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Control/Openchannel1.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTChannel({
                type: Types.OpenChannel,
                data: new Formats.OpenChannel({
                    data: new Formats.OpenChannelFormats.Request({
                        udid: '4BDB3609-C1F1-4195-9B37-FEFF45DA8B8E'
                    })
                })
            }, packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc)
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(14))
        });

        it('should be able to decode (Control/Openchannel2)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Control/Openchannel2.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTChannel), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).type, Types.OpenChannel)
            assert.equal((packet.gs_payload as MuxDCTChannel).sequence, 0)
            assert.equal((packet.gs_payload as MuxDCTChannel).nextSequence, 0)

            assert.equal(((packet.gs_payload as MuxDCTChannel).data instanceof Formats.OpenChannel), true)
            assert.equal(((packet.gs_payload as MuxDCTChannel).data.data instanceof Formats.OpenChannelFormats.Response), true)
            assert.deepEqual((packet.gs_payload as MuxDCTChannel).data.data.udid, Buffer.from('6273c8c67c3f7a479d4e4c2f0ab1896d', 'hex'))
        });

        it('should be able to encode (Control/Openchannel2)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Control/Openchannel2.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTChannel({
                type: Types.OpenChannel,
                data: new Formats.OpenChannel({
                    data: new Formats.OpenChannelFormats.Response({
                        udid: Buffer.from('6273c8c67c3f7a479d4e4c2f0ab1896d', 'hex')
                    })
                })
            }, packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc)
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(13))
        });

        it('should be able to decode (Control/Qos)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Control/Qos.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTChannel), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).type, Types.OpenChannel)
            assert.equal((packet.gs_payload as MuxDCTChannel).sequence, 0)
            assert.equal((packet.gs_payload as MuxDCTChannel).nextSequence, 0)

            assert.equal(((packet.gs_payload as MuxDCTChannel).data instanceof Formats.OpenChannel), true)
            assert.equal(((packet.gs_payload as MuxDCTChannel).data.data instanceof Formats.OpenChannelFormats.Response), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.udid, undefined)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.unknown1, 2)
        });

        it('should be able to encode (Control/Qos)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Control/Qos.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTChannel({
                type: Types.OpenChannel,
                data: new Formats.OpenChannel({
                    data: new Formats.OpenChannelFormats.Response({
                        unknown1: 2
                    })
                })
            }, packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc)
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(11))
        });

        it('should be able to decode (Control/Messaging)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Control/Messaging.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTChannel), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).type, Types.OpenChannel)
            assert.equal((packet.gs_payload as MuxDCTChannel).sequence, 0)
            assert.equal((packet.gs_payload as MuxDCTChannel).nextSequence, 0)

            assert.equal(((packet.gs_payload as MuxDCTChannel).data instanceof Formats.OpenChannel), true)
            assert.equal(((packet.gs_payload as MuxDCTChannel).data.data instanceof Formats.OpenChannelFormats.Request), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.unknown2, 4)
        });

        it('should be able to encode (Control/Messaging)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Control/Messaging.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTChannel({
                type: Types.OpenChannel,
                data: new Formats.OpenChannel({
                    data: new Formats.OpenChannelFormats.Request({
                        unknown2: 4
                    })
                })
            }, packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc)
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(13))
        });

        it('should be able to decode (Control/ChatAudio)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Control/ChatAudio.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTChannel), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).type, Types.OpenChannel)
            assert.equal((packet.gs_payload as MuxDCTChannel).sequence, 0)
            assert.equal((packet.gs_payload as MuxDCTChannel).nextSequence, 0)

            assert.equal(((packet.gs_payload as MuxDCTChannel).data instanceof Formats.OpenChannel), true)
            assert.equal(((packet.gs_payload as MuxDCTChannel).data.data instanceof Formats.OpenChannelFormats.Audio), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.audioType, 1)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.relativeTimestamp, 1656776556659)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.rate, 24000)
        });

        it('should be able to encode (Control/ChatAudio)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Control/ChatAudio.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTChannel({
                type: Types.OpenChannel,
                data: new Formats.OpenChannel({
                    data: new Formats.OpenChannelFormats.Audio({
                        audioType: 1,
                        relativeTimestamp: 1656776556659
                    })
                })
            }, packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc)
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(7))
        });

        it('should be able to decode (Control/ChatAudio2)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Control/ChatAudio2.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTChannel), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).type, Types.OpenChannel)
            assert.equal((packet.gs_payload as MuxDCTChannel).sequence, 0)
            assert.equal((packet.gs_payload as MuxDCTChannel).nextSequence, 0)

            assert.equal(((packet.gs_payload as MuxDCTChannel).data instanceof Formats.OpenChannel), true)
            assert.equal(((packet.gs_payload as MuxDCTChannel).data.data instanceof Formats.OpenChannelFormats.AudioAck), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.frameId, 1739731456)

            assert.equal(((packet.gs_payload as MuxDCTChannel).data.data.data instanceof Formats.OpenChannelFormats.AudioAckFormats.ChatAudio), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.data.rate, 24000)
        });

        it('should be able to encode (Control/ChatAudio2)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Control/ChatAudio2.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTChannel({
                type: Types.OpenChannel,
                data: new Formats.OpenChannel({
                    data: new Formats.OpenChannelFormats.AudioAck({
                        frameId: 1739731456,
                        data: new Formats.OpenChannelFormats.AudioAckFormats.ChatAudio({})
                    })
                })
            }, packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc)
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(4))
        });

        it('should be able to decode (Control/Audio)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Control/Audio.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTChannel), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).type, Types.OpenChannel)
            assert.equal((packet.gs_payload as MuxDCTChannel).sequence, 0)
            assert.equal((packet.gs_payload as MuxDCTChannel).nextSequence, 0)

            assert.equal(((packet.gs_payload as MuxDCTChannel).data instanceof Formats.OpenChannel), true)
            assert.equal(((packet.gs_payload as MuxDCTChannel).data.data instanceof Formats.OpenChannelFormats.Audio), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.audioType, 2)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.relativeTimestamp, 1656541958468)
        });

        it('should be able to encode (Control/Audio)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Control/Audio.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTChannel({
                type: Types.OpenChannel,
                data: new Formats.OpenChannel({
                    data: new Formats.OpenChannelFormats.Audio({
                        audioType: 2,
                        relativeTimestamp: 1656541958468,
                    })
                })
            }, packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc)
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(13))
        });

        it('should be able to decode (Control/Audio2)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Control/Audio2.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTChannel), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).type, Types.OpenChannel)
            assert.equal((packet.gs_payload as MuxDCTChannel).sequence, 0)
            assert.equal((packet.gs_payload as MuxDCTChannel).nextSequence, 0)

            assert.equal(((packet.gs_payload as MuxDCTChannel).data instanceof Formats.OpenChannel), true)
            assert.equal(((packet.gs_payload as MuxDCTChannel).data.data instanceof Formats.OpenChannelFormats.AudioAck), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.frameId, 3696306851)

            assert.equal(((packet.gs_payload as MuxDCTChannel).data.data.data instanceof Formats.OpenChannelFormats.AudioAckFormats.Audio), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.data.rate, 48000)
        });

        it('should be able to encode (Control/Audio2)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Control/Audio2.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTChannel({
                type: Types.OpenChannel,
                data: new Formats.OpenChannel({
                    data: new Formats.OpenChannelFormats.AudioAck({
                        frameId: 3696306851,
                        data: new Formats.OpenChannelFormats.AudioAckFormats.Audio({

                        })
                    })
                })
            }, packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc)
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(15))
        });
    });

    describe('Data', function () {

        it('should be able to decode (Data/Control)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Data/Control.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTChannel), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).type, Types.Data)
            assert.equal((packet.gs_payload as MuxDCTChannel).sequence, 0)
            assert.equal((packet.gs_payload as MuxDCTChannel).nextSequence, 1)

            assert.equal(((packet.gs_payload as MuxDCTChannel).data instanceof Formats.Data), true)
            assert.equal(((packet.gs_payload as MuxDCTChannel).data.data instanceof Formats.DataFormats.Control), true)
        });

        it('should be able to encode (Data/Control)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Data/Control.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTChannel({
                type: Types.Data,
                nextSequence: 1,
                data: new Formats.Data({
                    data: new Formats.DataFormats.Control({})
                })
            }, packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc)
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(12))
        });

        it('should be able to decode (Data/Control2)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Data/Control2.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTChannel), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).type, Types.Data)
            assert.equal((packet.gs_payload as MuxDCTChannel).sequence, 1)
            assert.equal((packet.gs_payload as MuxDCTChannel).nextSequence, 2)

            assert.equal(((packet.gs_payload as MuxDCTChannel).data instanceof Formats.Data), true)
            assert.equal(((packet.gs_payload as MuxDCTChannel).data.data instanceof Formats.DataFormats.Frame), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.isEmpty, 1)
        });

        it('should be able to encode (Data/Control2)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Data/Control2.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTChannel({
                type: Types.Data,
                sequence: 1,
                nextSequence: 2,
                data: new Formats.Data({
                    data: new Formats.DataFormats.Frame({
                        isEmpty: 1
                    })
                })
            }, packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc)
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(11))
        });

        it('should be able to decode (Data/Ack)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Data/Ack.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTChannel), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).type, Types.Data)
            assert.equal((packet.gs_payload as MuxDCTChannel).sequence, 0)
            assert.equal((packet.gs_payload as MuxDCTChannel).nextSequence, 1)

            assert.equal(((packet.gs_payload as MuxDCTChannel).data instanceof Formats.Data), true)
            assert.equal(((packet.gs_payload as MuxDCTChannel).data.data instanceof Formats.DataFormats.Ack), true)
        });

        it('should be able to encode (Data/Ack)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Data/Ack.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTChannel({
                type: Types.Data,
                nextSequence: 1,
                data: new Formats.Data({
                    data: new Formats.DataFormats.Ack({})
                })
            }, packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc)
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(4))
        });

        it('should be able to decode (Data/Qos)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Data/Qos.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTChannel), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).type, Types.Data)
            assert.equal((packet.gs_payload as MuxDCTChannel).sequence, 0)
            assert.equal((packet.gs_payload as MuxDCTChannel).nextSequence, 1)

            assert.equal(((packet.gs_payload as MuxDCTChannel).data instanceof Formats.Data), true)
            assert.equal(((packet.gs_payload as MuxDCTChannel).data.data instanceof Formats.DataFormats.MultiMessage), true)
        });

        it('should be able to encode (Data/Qos)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Data/Qos.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTChannel({
                type: Types.Data,
                nextSequence: 1,
                data: new Formats.Data({
                    data: new Formats.DataFormats.MultiMessage({})
                })
            }, packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc)
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(4))
        });
    });

    describe('Audio', function () {
        it('should be able to decode (Data/Audio/Data)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Data/Audio/Data.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTChannel), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).type, Types.None)
            assert.equal((packet.gs_payload as MuxDCTChannel).sequence, 0)
            assert.equal((packet.gs_payload as MuxDCTChannel).nextSequence, 1)

            assert.equal(((packet.gs_payload as MuxDCTChannel).data instanceof Formats.DataAudio), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.frameId, 3696306851)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.relativeTimestamp, 285605)
            assert.deepEqual((packet.gs_payload as MuxDCTChannel).data.data, packet.payload.slice(32, -2))

        });

        it('should be able to encode (Data/Audio/Data)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Data/Audio/Data.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTChannel({
                type: Types.None,
                nextSequence: 1,
                data: new Formats.DataAudio({
                    frameId: 3696306851,
                    relativeTimestamp: 285605,
                    data: packet.payload.slice(32, -2),
                })
            }, packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc)
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(4))
        });
    });

    describe('Video', function () {

        it('should be able to decode (Config/Video)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Config/Video.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTChannel), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).type, Types.Config)
            assert.equal((packet.gs_payload as MuxDCTChannel).sequence, 0)
            assert.equal((packet.gs_payload as MuxDCTChannel).nextSequence, 0)

            assert.equal(((packet.gs_payload as MuxDCTChannel).data instanceof Formats.Config), true)
            assert.equal(((packet.gs_payload as MuxDCTChannel).data.data instanceof Formats.ConfigFormats.VideoServer), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.width, 1280)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.height, 720)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.fps, 60)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.relativeTimestamp, 1656541958468)

            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.videoFormats[0].width, 1280)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.videoFormats[0].height, 720)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.videoFormats[0].fps, 60)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.videoFormats[0].codec, 0)
        });

        it('should be able to encode (Config/Video)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Config/Video.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTChannel({
                type: Types.Config,
                data: new Formats.Config({
                    data: new Formats.ConfigFormats.VideoServer({
                        relativeTimestamp: 1656541958468
                    })
                })
            }, packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc)
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(12))
        });

        it('should be able to decode (Config/Video2)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Config/Video2.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTChannel), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).type, Types.Config)
            assert.equal((packet.gs_payload as MuxDCTChannel).sequence, 0)
            assert.equal((packet.gs_payload as MuxDCTChannel).nextSequence, 0)

            assert.equal(((packet.gs_payload as MuxDCTChannel).data instanceof Formats.Config), true)
            assert.equal(((packet.gs_payload as MuxDCTChannel).data.data instanceof Formats.ConfigFormats.VideoClient), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.width, 1280)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.height, 720)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.fps, 60)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.frameId, 823738637)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.codec, 0)
        });

        it('should be able to encode (Config/Video2)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Config/Video2.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTChannel({
                type: Types.Config,
                data: new Formats.Config({
                    data: new Formats.ConfigFormats.VideoClient({
                        frameId: 823738637
                    })
                })
            }, packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc)
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(4))
        });

        it('should be able to decode (ConfigAck/Video)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/ConfigAck/Video.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTChannel), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).type, Types.ConfigAck)
            assert.equal((packet.gs_payload as MuxDCTChannel).sequence, 0)
            assert.equal((packet.gs_payload as MuxDCTChannel).nextSequence, 1)

            assert.equal(((packet.gs_payload as MuxDCTChannel).data instanceof Formats.ConfigAck), true)
            assert.equal(((packet.gs_payload as MuxDCTChannel).data.data instanceof Formats.ConfigAckFormats.Video), true)
        });

        it('should be able to encode (ConfigAck/Video)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/ConfigAck/Video.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTChannel({
                type: Types.ConfigAck,
                nextSequence: 1,
                data: new Formats.ConfigAck({
                    data: new Formats.ConfigAckFormats.Video({})
                })
            }, packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc)
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(4))
        });

        it('should be able to decode (ConfigAck/Frame)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/ConfigAck/Frame.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTChannel), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).type, Types.ConfigAck)
            assert.equal((packet.gs_payload as MuxDCTChannel).sequence, 6)
            assert.equal((packet.gs_payload as MuxDCTChannel).nextSequence, 7)

            assert.equal(((packet.gs_payload as MuxDCTChannel).data instanceof Formats.ConfigAck), true)
            assert.equal(((packet.gs_payload as MuxDCTChannel).data.data instanceof Formats.ConfigAckFormats.Frame), true)

            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.frameId, 823738639)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.relativeTimestamp, 227061)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.totalSize, 12053)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.totalPackets, 10)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.dataOffset, 4826)
            assert.deepEqual((packet.gs_payload as MuxDCTChannel).data.data.metadata, Buffer.from(''))
            assert.deepEqual((packet.gs_payload as MuxDCTChannel).data.data.data, packet.payload.slice(64, -2))

        });

        it('should be able to encode (ConfigAck/Frame)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/ConfigAck/Frame.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTChannel({
                type: Types.ConfigAck,
                sequence: 6,
                nextSequence: 7,
                data: new Formats.ConfigAck({
                    data: new Formats.ConfigAckFormats.Frame({
                        frameId: 823738639,
                        relativeTimestamp: 227061,
                        totalSize: 12053,
                        totalPackets: 10,
                        dataOffset: 4826,
                        data: packet.payload.slice(64, -2),
                        unknown2: 6, // @TODO: Find out what this does...
                    })
                })
            }, packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc)
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(4))
        });

        it('should be able to decode (Data/Video/Data)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Data/Video/Data.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTChannel), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).type, Types.Data)
            assert.equal((packet.gs_payload as MuxDCTChannel).sequence, 0)
            assert.equal((packet.gs_payload as MuxDCTChannel).nextSequence, 1)

            assert.equal(((packet.gs_payload as MuxDCTChannel).data instanceof Formats.Data), true)
            assert.equal(((packet.gs_payload as MuxDCTChannel).data.data instanceof Formats.DataFormats.Data), true)
            assert.equal(((packet.gs_payload as MuxDCTChannel).data.data.data instanceof Formats.DataFormats.DataFormats.Video), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.data.metadata.unknown6, 1079984128)
        });

        it('should be able to encode (Data/Video/Data)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Data/Video/Data.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTChannel({
                type: Types.Data,
                nextSequence: 1,
                data: new Formats.Data({
                    data: new Formats.DataFormats.Data({
                        data: new Formats.DataFormats.DataFormats.Video({
                            frameId: 0,
                            relativeTimestamp: 0,
                            metadata: {
                                unknown6: 1079984128
                            }
                        })
                    })
                })
            }, packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc)
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(11))
        });

        it('should be able to decode (Data/Video/Data2)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Data/Video/Data2.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTChannel), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).type, Types.Frame)
            assert.equal((packet.gs_payload as MuxDCTChannel).sequence, 81)
            assert.equal((packet.gs_payload as MuxDCTChannel).nextSequence, 2701)

            assert.equal(((packet.gs_payload as MuxDCTChannel).data instanceof Formats.Frame), true)
            assert.equal(((packet.gs_payload as MuxDCTChannel).data.data instanceof Formats.FrameFormats.Video), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.frameId, 823741300)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.relativeTimestamp, 44621525)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.totalSize, 37)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.totalPackets, 1)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.dataOffset, 0)
            assert.deepEqual((packet.gs_payload as MuxDCTChannel).data.data.metadata, packet.payload.slice(86, 95))
            assert.deepEqual((packet.gs_payload as MuxDCTChannel).data.data.data, packet.payload.slice(95, -2))
        });

        it('should be able to encode (Data/Video/Data2)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Data/Video/Data2.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTChannel({
                type: Types.Frame,
                sequence: 81,
                nextSequence: 2701,
                data: new Formats.Frame({
                    data: new Formats.FrameFormats.Video({
                        frameId: 823741300,
                        relativeTimestamp: 44621525,
                        totalSize: 37,
                        totalPackets: 1,
                        dataOffset: 0,
                        metadata: packet.payload.slice(86, 95),
                        data: packet.payload.slice(95, -2)
                    })
                })
            }, packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc)
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(26))
        });

        it('should be able to decode (Data/Video/Start)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Data/Video/Start.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTChannel), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).type, Types.Data)
            assert.equal((packet.gs_payload as MuxDCTChannel).sequence, 1)
            assert.equal((packet.gs_payload as MuxDCTChannel).nextSequence, 2)

            assert.equal(((packet.gs_payload as MuxDCTChannel).data instanceof Formats.Data), true)
            assert.equal(((packet.gs_payload as MuxDCTChannel).data.data instanceof Formats.DataFormats.Data), true)
            assert.equal(((packet.gs_payload as MuxDCTChannel).data.data.data instanceof Formats.DataFormats.DataFormats.Video), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.data.frameId, 823738637)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.data.relativeTimestamp, 823738637)
        });

        it('should be able to encode (Data/Video/Start)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Data/Video/Start.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTChannel({
                type: Types.Data,
                sequence: 1,
                nextSequence: 2,
                data: new Formats.Data({
                    data: new Formats.DataFormats.Data({
                        data: new Formats.DataFormats.DataFormats.Video({
                            frameId: 823738637,
                            relativeTimestamp: 823738637
                        })
                    })
                })
            }, packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc)
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(12))
        });

        it('should be able to decode (Data/Video/Ack)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Data/Video/Ack.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTChannel), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).type, Types.Data)
            assert.equal((packet.gs_payload as MuxDCTChannel).sequence, 2)
            assert.equal((packet.gs_payload as MuxDCTChannel).nextSequence, 3)

            assert.equal(((packet.gs_payload as MuxDCTChannel).data instanceof Formats.Data), true)
            assert.equal(((packet.gs_payload as MuxDCTChannel).data.data instanceof Formats.DataFormats.Data), true)
            assert.equal(((packet.gs_payload as MuxDCTChannel).data.data.data instanceof Formats.DataFormats.DataFormats.Video), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.data.frameId, 823738639)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.data.relativeTimestamp, 602714591)
        });

        it('should be able to encode (Data/Video/Ack)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Data/Video/Ack.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTChannel({
                type: Types.Data,
                sequence: 2,
                nextSequence: 3,
                data: new Formats.Data({
                    data: new Formats.DataFormats.Data({
                        data: new Formats.DataFormats.DataFormats.Video({
                            frameId: 823738639,
                            relativeTimestamp: 602714591,
                            unknown1: 0,
                        })
                    })
                })
            }, packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc)
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(4))
        });

        it('should be able to decode (Data/Video/Ack2)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Data/Video/Ack2.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTChannel), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).type, Types.Data)
            assert.equal((packet.gs_payload as MuxDCTChannel).sequence, 2652)
            assert.equal((packet.gs_payload as MuxDCTChannel).nextSequence, 2653)

            assert.equal(((packet.gs_payload as MuxDCTChannel).data instanceof Formats.Data), true)
            assert.equal(((packet.gs_payload as MuxDCTChannel).data.data instanceof Formats.DataFormats.Data), true)
            assert.equal(((packet.gs_payload as MuxDCTChannel).data.data.data instanceof Formats.DataFormats.DataFormats.Video), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.data.frameId, 823741289)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.data.relativeTimestamp, 823741289)
        });

        // it('should be able to encode (Data/Video/Ack2)', function () {
        //     const data = fs.readFileSync('tests/data/MuxDCTChannel/Data/Video/Ack2.bin')
        //     const packet = loadPacket(data)
        //     const encoded = new MuxDCTChannel({
        //         type: Types.Data,
        //         sequence: 2,
        //         nextSequence: 3,
        //         data: new Formats.Data({
        //             data: new Formats.DataFormats.Data({
        //                 data: new Formats.DataFormats.DataFormats.Video({
        //                     frameId: 823738639,
        //                     relativeTimestamp: 602714591,
        //                     unknown1: 0,
        //                 })
        //             })
        //         })
        //     }, packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc)
            
        //     assert.deepEqual(encoded.toPacket(), packet.payload.slice(4))
        // });
    });

    describe('QoS', function () {

        it('should be able to decode (Data/Qos/Qos1)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Data/Qos/Qos1.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTChannel), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).type, Types.Data)
            assert.equal((packet.gs_payload as MuxDCTChannel).sequence, 0)
            assert.equal((packet.gs_payload as MuxDCTChannel).nextSequence, 1)

            assert.equal(((packet.gs_payload as MuxDCTChannel).data instanceof Formats.Data), true)
            assert.equal(((packet.gs_payload as MuxDCTChannel).data.data instanceof Formats.DataFormats.MultiMessage), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.totalSize, 12372)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.totalPackets, 10)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.dataOffset, 0)
            assert.deepEqual((packet.gs_payload as MuxDCTChannel).data.data.data, packet.payload.slice(41, -2))
        });

        it('should be able to encode (Data/Qos/Qos1)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Data/Qos/Qos1.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTChannel({
                type: Types.Data,
                nextSequence: 1,
                data: new Formats.Data({
                    data: new Formats.DataFormats.MultiMessage({
                        totalSize: 12372,
                        totalPackets: 10,
                        dataOffset: 0,
                        data: packet.payload.slice(41, -2),
                    })
                })
            }, packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc)
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(13))
        });

        it('should be able to decode (Data/Qos/Qos2)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Data/Qos/Qos2.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTChannel), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).type, Types.Data)
            assert.equal((packet.gs_payload as MuxDCTChannel).sequence, 1)
            assert.equal((packet.gs_payload as MuxDCTChannel).nextSequence, 2)

            assert.equal(((packet.gs_payload as MuxDCTChannel).data instanceof Formats.Data), true)
            assert.equal(((packet.gs_payload as MuxDCTChannel).data.data instanceof Formats.DataFormats.MultiMessage), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.totalSize, 12372)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.totalPackets, 10)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.dataOffset, 1321)
            assert.deepEqual((packet.gs_payload as MuxDCTChannel).data.data.data, packet.payload.slice(32, -2))
        });

        it('should be able to encode (Data/Qos/Qos2)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Data/Qos/Qos2.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTChannel({
                type: Types.Data,
                sequence: 1,
                nextSequence: 2,
                data: new Formats.Data({
                    data: new Formats.DataFormats.MultiMessage({
                        totalSize: 12372,
                        totalPackets: 10,
                        dataOffset: 1321,
                        data: packet.payload.slice(32, -2),
                    })
                })
            }, packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc)
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(4))
        });

        it('should be able to merge 10 packets and parse JSON', function () {

            let jsonData = Buffer.allocUnsafeSlow(12371)

            for(let i=1; i<=10; i++){
                const data = fs.readFileSync('tests/data/MuxDCTChannel/Data/Qos/Qos'+i+'.bin')
                const packet = loadPacket(data);

                (packet.gs_payload as MuxDCTChannel).data.data.data.copy(jsonData, (packet.gs_payload as MuxDCTChannel).data.data.dataOffset)
            }

            const policy = JSON.parse(jsonData.toString())
            assert.equal(policy.policy.version, 1)
        });

        it('should be able to decode (Data/Qos/Qos_End)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Data/Qos/Qos_End.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTChannel), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).type, Types.None)
            assert.equal((packet.gs_payload as MuxDCTChannel).sequence, 0)
            assert.equal((packet.gs_payload as MuxDCTChannel).nextSequence, 2)

            // assert.equal(((packet.gs_payload as MuxDCTChannel).data instanceof Formats.Data), true)
            // assert.equal(((packet.gs_payload as MuxDCTChannel).data.data instanceof Formats.DataFormats.MultiMessage), true)
            // assert.equal((packet.gs_payload as MuxDCTChannel).data.data.totalSize, 12372)
            // assert.equal((packet.gs_payload as MuxDCTChannel).data.data.totalPackets, 10)
            // assert.equal((packet.gs_payload as MuxDCTChannel).data.data.dataOffset, 1321)
            // assert.deepEqual((packet.gs_payload as MuxDCTChannel).data.data.data, packet.payload.slice(32, -2))
        });

        // it('should be able to encode (Data/Qos/Qos_End)', function () {
        //     const data = fs.readFileSync('tests/data/MuxDCTChannel/Data/Qos/Qos_End.bin')
        //     const packet = loadPacket(data)
        //     const encoded = new MuxDCTChannel({
        //         type: Types.Data,
        //         sequence: 1,
        //         nextSequence: 2,
        //         data: new Formats.Data({
        //             data: new Formats.DataFormats.MultiMessage({
        //                 totalSize: 12372,
        //                 totalPackets: 10,
        //                 dataOffset: 1321,
        //                 data: packet.payload.slice(32, -2),
        //             })
        //         })
        //     }, packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc)
            
        //     assert.deepEqual(encoded.toPacket(), packet.payload.slice(4))
        // });

        it('should be able to decode (Data/Qos/Qos_End2)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Data/Qos/Qos_End2.bin')
            const packet = loadPacket(data)

            // console.log(packet.gs_payload)

            assert.equal((packet.gs_payload instanceof MuxDCTChannel), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).type, Types.None)
            assert.equal((packet.gs_payload as MuxDCTChannel).sequence, 0)
            assert.equal((packet.gs_payload as MuxDCTChannel).nextSequence, 3)

            // assert.equal(((packet.gs_payload as MuxDCTChannel).data instanceof Formats.Data), true)
            // assert.equal(((packet.gs_payload as MuxDCTChannel).data.data instanceof Formats.DataFormats.MultiMessage), true)
            // assert.equal((packet.gs_payload as MuxDCTChannel).data.data.totalSize, 12372)
            // assert.equal((packet.gs_payload as MuxDCTChannel).data.data.totalPackets, 10)
            // assert.equal((packet.gs_payload as MuxDCTChannel).data.data.dataOffset, 1321)
            // assert.deepEqual((packet.gs_payload as MuxDCTChannel).data.data.data, packet.payload.slice(32, -2))
        });

        // it('should be able to encode (Data/Qos/Qos_End)', function () {
        //     const data = fs.readFileSync('tests/data/MuxDCTChannel/Data/Qos/Qos_End.bin')
        //     const packet = loadPacket(data)
        //     const encoded = new MuxDCTChannel({
        //         type: Types.Data,
        //         sequence: 1,
        //         nextSequence: 2,
        //         data: new Formats.Data({
        //             data: new Formats.DataFormats.MultiMessage({
        //                 totalSize: 12372,
        //                 totalPackets: 10,
        //                 dataOffset: 1321,
        //                 data: packet.payload.slice(32, -2),
        //             })
        //         })
        //     }, packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc)
            
        //     assert.deepEqual(encoded.toPacket(), packet.payload.slice(4))
        // });
    });

    describe('Messaging', function () {

        it('should be able to decode (Data/Messaging/Messaging1)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Data/Messaging/Messaging1.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTChannel), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).type, Types.Data)
            assert.equal((packet.gs_payload as MuxDCTChannel).sequence, 0)
            assert.equal((packet.gs_payload as MuxDCTChannel).nextSequence, 1)

            assert.equal(((packet.gs_payload as MuxDCTChannel).data instanceof Formats.Data), true)
            assert.equal(((packet.gs_payload as MuxDCTChannel).data.data instanceof Formats.DataFormats.Message), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.ackType, 0)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.frameId, 2331526925)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.dataType, 1)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.key, '/streaming/systemUi/configuration')
            assert.deepEqual((packet.gs_payload as MuxDCTChannel).data.data.value, Buffer.from('7b2273797374656d556973223a5b5d2c2276657273696f6e223a5b302c322c305d7d', 'hex'))
        });

        it('should be able to encode (Data/Messaging/Messaging1)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Data/Messaging/Messaging1.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTChannel({
                type: Types.Data,
                nextSequence: 1,
                data: new Formats.Data({
                    data: new Formats.DataFormats.Message({
                        ackType: 0,
                        frameId: 2331526925,
                        dataType: 1,
                        key: '/streaming/systemUi/configuration',
                        value: Buffer.from('7b2273797374656d556973223a5b5d2c2276657273696f6e223a5b302c322c305d7d', 'hex'),
                    })
                })
            }, packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc)
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(4))
        });
    });

    describe('InputFeedback', function () {

        it('should be able to decode (Config/InputFeedback)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Config/InputFeedback.bin')
            const packet = loadPacket(data, 'ios_local_21052022')

            assert.equal((packet.gs_payload instanceof MuxDCTChannel), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).type, Types.Config)
            assert.equal((packet.gs_payload as MuxDCTChannel).sequence, 0)
            assert.equal((packet.gs_payload as MuxDCTChannel).nextSequence, 0)

            assert.equal(((packet.gs_payload as MuxDCTChannel).data instanceof Formats.Config), true)
            assert.equal(((packet.gs_payload as MuxDCTChannel).data.data instanceof Formats.ConfigFormats.Input), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.width, 1280)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.height, 720)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.touchpoints, 0)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.frameId, 3983891764)
        });

        it('should be able to encode (Config/InputFeedback)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Config/InputFeedback.bin')
            const packet = loadPacket(data, 'ios_local_21052022')
            const encoded = new MuxDCTChannel({
                type: Types.Config,
                data: new Formats.Config({
                    data: new Formats.ConfigFormats.Input({
                        frameId: 3983891764,
                    })
                })
            }, packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc)
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(14))
        });

        it('should be able to decode (Config/InputAck)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Config/InputAck.bin')
            const packet = loadPacket(data, 'ios_local_21052022')

            assert.equal((packet.gs_payload instanceof MuxDCTChannel), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).type, Types.Config)
            assert.equal((packet.gs_payload as MuxDCTChannel).sequence, 0)
            assert.equal((packet.gs_payload as MuxDCTChannel).nextSequence, 0)

            assert.equal(((packet.gs_payload as MuxDCTChannel).data instanceof Formats.Config), true)
            assert.equal(((packet.gs_payload as MuxDCTChannel).data.data instanceof Formats.ConfigFormats.InputAck), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.touchpoints, 0)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.relativeTimestamp, 1652909623540)
        });

        it('should be able to encode (Config/InputAck)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Config/InputAck.bin')
            const packet = loadPacket(data, 'ios_local_21052022')
            const encoded = new MuxDCTChannel({
                type: Types.Config,
                data: new Formats.Config({
                    data: new Formats.ConfigFormats.InputAck({
                        relativeTimestamp: 1652909623540,
                    })
                })
            }, packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc)
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(13))
        });

    });

    describe('Input', function () {

        it('should be able to decode (Config/InputAck2)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Config/InputAck2.bin')
            const packet = loadPacket(data, 'ios_local_21052022')

            assert.equal((packet.gs_payload instanceof MuxDCTChannel), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).type, Types.Config)
            assert.equal((packet.gs_payload as MuxDCTChannel).sequence, 0)
            assert.equal((packet.gs_payload as MuxDCTChannel).nextSequence, 0)

            assert.equal(((packet.gs_payload as MuxDCTChannel).data instanceof Formats.Config), true)
            assert.equal(((packet.gs_payload as MuxDCTChannel).data.data instanceof Formats.ConfigFormats.InputAck), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.touchpoints, 10)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.relativeTimestamp, 1652955837192)
        });

        it('should be able to encode (Config/InputAck2)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Config/InputAck2.bin')
            const packet = loadPacket(data, 'ios_local_21052022')
            const encoded = new MuxDCTChannel({
                type: Types.Config,
                data: new Formats.Config({
                    data: new Formats.ConfigFormats.InputAck({
                        relativeTimestamp: 1652955837192,
                        touchpoints: 10,
                    })
                })
            }, packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc)
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(13))
        });

        it('should be able to decode (Frame/Input)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Frame/Input.bin')
            const packet = loadPacket(data, 'ios_local_21052022')

            assert.equal((packet.gs_payload instanceof MuxDCTChannel), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).type, Types.Frame)
            assert.equal((packet.gs_payload as MuxDCTChannel).sequence, 0)
            assert.equal((packet.gs_payload as MuxDCTChannel).nextSequence, 9)

            assert.equal(((packet.gs_payload as MuxDCTChannel).data instanceof Formats.Frame), true)
            assert.equal(((packet.gs_payload as MuxDCTChannel).data.data instanceof Formats.FrameFormats.Input), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.frameId, 2976380527)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.relativeTimestamp, 212915914679)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.stats_data.unknown1, 789502)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.stats_data.unknown5, 147)
        });

        it('should be able to encode (Frame/Input)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Frame/Input.bin')
            const packet = loadPacket(data, 'ios_local_21052022')
            const encoded = new MuxDCTChannel({
                type: Types.Frame,
                nextSequence: 9,
                data: new Formats.Frame({
                    data: new Formats.FrameFormats.Input({
                        frameId: 2976380527,
                        relativeTimestamp: 212915914679,
                        stats_data: new Formats.FrameFormats.InputFormats.Stats({
                            unknown1: 789502,
                            unknown2: 62,
                            unknown3: 1,
                            unknown4: 79,
                            unknown5: 147,
                        })
                    })
                })
            }, packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc)
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(4))
        });

        it('should be able to decode (Frame/Input_Gamepad)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Frame/Input_Gamepad.bin')
            const packet = loadPacket(data)

            console.log((packet.gs_payload as MuxDCTChannel).data.data)

            assert.equal((packet.gs_payload instanceof MuxDCTChannel), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).type, Types.Frame)
            assert.equal((packet.gs_payload as MuxDCTChannel).sequence, 0)
            // assert.equal((packet.gs_payload as MuxDCTChannel).nextSequence, 9)

            // assert.equal(((packet.gs_payload as MuxDCTChannel).data instanceof Formats.Frame), true)
            // assert.equal(((packet.gs_payload as MuxDCTChannel).data.data instanceof Formats.FrameFormats.Input), true)
            // assert.equal((packet.gs_payload as MuxDCTChannel).data.data.frameId, 2976380527)
            // assert.equal((packet.gs_payload as MuxDCTChannel).data.data.relativeTimestamp, 212915914679)
            // assert.equal((packet.gs_payload as MuxDCTChannel).data.data.stats_data.unknown1, 789502)
            // assert.equal((packet.gs_payload as MuxDCTChannel).data.data.stats_data.unknown5, 147)
        });

        // it('should be able to encode (Frame/Input)', function () {
        //     const data = fs.readFileSync('tests/data/MuxDCTChannel/Frame/Input.bin')
        //     const packet = loadPacket(data, 'ios_local_21052022')
        //     const encoded = new MuxDCTChannel({
        //         type: Types.Frame,
        //         nextSequence: 9,
        //         data: new Formats.Frame({
        //             data: new Formats.FrameFormats.Input({
        //                 frameId: 2976380527,
        //                 relativeTimestamp: 212915914679,
        //                 stats_data: new Formats.FrameFormats.InputFormats.Stats({
        //                     unknown1: 789502,
        //                     unknown2: 62,
        //                     unknown3: 1,
        //                     unknown4: 79,
        //                     unknown5: 147,
        //                 })
        //             })
        //         })
        //     }, packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc)
            
        //     assert.deepEqual(encoded.toPacket(), packet.payload.slice(4))
        // });

        it('should be able to decode (Frame/Ack)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Frame/Ack.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTChannel), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).type, Types.Frame)
            assert.equal((packet.gs_payload as MuxDCTChannel).sequence, 0)
            assert.equal((packet.gs_payload as MuxDCTChannel).nextSequence, 1)

            assert.equal(((packet.gs_payload as MuxDCTChannel).data instanceof Formats.Frame), true)
            assert.equal(((packet.gs_payload as MuxDCTChannel).data.data instanceof Formats.FrameFormats.Ack), true)
            assert.equal((packet.gs_payload as MuxDCTChannel).data.data.frameId, 3607612415)
        });

        it('should be able to encode (Frame/Ack)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTChannel/Frame/Ack.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTChannel({
                type: Types.Frame,
                nextSequence: 1,
                data: new Formats.Frame({
                    data: new Formats.FrameFormats.Ack({
                        frameId: 3607612415,
                    })
                })
            }, packet.rtp_packet.header.payloadTypeReal, packet.rtp_packet.header.ssrc)
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(4))
        });
    });
});