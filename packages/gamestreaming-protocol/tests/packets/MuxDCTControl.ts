import * as assert from 'assert'
import * as fs from 'fs'

import MuxDCTControl, { Types } from '../../src/packets/MuxDCTControl'
import { loadPacket } from './config';

describe('MuxDCTControl', function () {

    describe('Control', function () {
        const ChannelName = 'Microsoft::Basix::Dct::Channel::Class::Control'
        const ChannelData = Buffer.from('0300', 'hex')

        it('should be able to decode (Open_Control)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Open_Control.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTControl), true)
            assert.equal((packet.gs_payload as MuxDCTControl).type, Types.OpenChannel)
            assert.deepEqual((packet.gs_payload as MuxDCTControl).name, ChannelName)
            assert.deepEqual((packet.gs_payload as MuxDCTControl).data, ChannelData)
        });

        it('should be able to encode (Open_Control)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Open_Control.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTControl({
                type: Types.OpenChannel,
                name: ChannelName,
                data: ChannelData,
            })
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(9))
        });

        it('should be able to decode (Data_Control)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Data_Control.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTControl), true)
            assert.equal((packet.gs_payload as MuxDCTControl).type, Types.Confirm)
            assert.deepEqual((packet.gs_payload as MuxDCTControl).data, ChannelData)
        });

        it('should be able to encode (Data_Control)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Data_Control.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTControl({
                type: Types.Confirm,
                data: ChannelData,
            })

            assert.deepEqual(encoded.toPacket(), packet.payload.slice(6))
        });

        it('should be able to decode (Confirm_Control)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Confirm_Control.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTControl), true)
            assert.equal((packet.gs_payload as MuxDCTControl).type, Types.Confirm)
            assert.deepEqual((packet.gs_payload as MuxDCTControl).data, ChannelData)
        });

        it('should be able to encode (Confirm_Control)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Confirm_Control.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTControl({
                type: Types.Confirm,
                data: ChannelData,
            })

            assert.deepEqual(encoded.toPacket(), packet.payload.slice(6))
        });
    });

    describe('Qos', function () {
        const ChannelName = 'Microsoft::Basix::Dct::Channel::Class::QoS'
        const ChannelData = Buffer.from('', 'hex')

        it('should be able to decode (Open_Qos)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Open_Qos.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTControl), true)
            assert.equal((packet.gs_payload as MuxDCTControl).type, Types.OpenChannel)
            assert.deepEqual((packet.gs_payload as MuxDCTControl).name, ChannelName)
            assert.deepEqual((packet.gs_payload as MuxDCTControl).data, ChannelData)
        });

        it('should be able to encode (Open_Qos)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Open_Qos.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTControl({
                type: Types.OpenChannel,
                name: ChannelName,
            })
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(12))
        });

        it('should be able to decode (Data_Qos)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Data_Qos.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTControl), true)
            assert.equal((packet.gs_payload as MuxDCTControl).type, Types.Confirm)
            assert.deepEqual((packet.gs_payload as MuxDCTControl).data, ChannelData)
        });

        it('should be able to encode (Data_Qos)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Data_Qos.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTControl({
                type: Types.Confirm,
            })

            assert.deepEqual(encoded.toPacket(), packet.payload.slice(4))
        });

        it('should be able to decode (Confirm_Qos)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Confirm_Qos.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTControl), true)
            assert.equal((packet.gs_payload as MuxDCTControl).type, Types.Confirm)
            assert.deepEqual((packet.gs_payload as MuxDCTControl).data, ChannelData)
        });

        it('should be able to encode (Confirm_Qos)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Confirm_Qos.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTControl({
                type: Types.Confirm,
            })

            assert.deepEqual(encoded.toPacket(), packet.payload.slice(12))
        });
    });

    describe('Video', function () {
        const ChannelName = 'Microsoft::Basix::Dct::Channel::Class::Video'
        const ChannelData = Buffer.from('', 'hex')

        it('should be able to decode (Open_Video)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Open_Video.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTControl), true)
            assert.equal((packet.gs_payload as MuxDCTControl).type, Types.OpenChannel)
            assert.deepEqual((packet.gs_payload as MuxDCTControl).name, ChannelName)
            assert.deepEqual((packet.gs_payload as MuxDCTControl).data, ChannelData)
        });

        it('should be able to encode (Open_Video)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Open_Video.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTControl({
                type: Types.OpenChannel,
                name: ChannelName,
            })
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(4))
        });

        it('should be able to decode (Data_Video)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Data_Video.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTControl), true)
            assert.equal((packet.gs_payload as MuxDCTControl).type, Types.Confirm)
            assert.deepEqual((packet.gs_payload as MuxDCTControl).data, ChannelData)
        });

        it('should be able to encode (Data_Video)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Data_Video.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTControl({
                type: Types.Confirm,
            })

            assert.deepEqual(encoded.toPacket(), packet.payload.slice(4))
        });

        it('should be able to decode (Confirm_Video)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Confirm_Video.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTControl), true)
            assert.equal((packet.gs_payload as MuxDCTControl).type, Types.Confirm)
            assert.deepEqual((packet.gs_payload as MuxDCTControl).data, ChannelData)
        });

        it('should be able to encode (Confirm_Video)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Confirm_Video.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTControl({
                type: Types.Confirm,
            })

            assert.deepEqual(encoded.toPacket(), packet.payload.slice(13))
        });
    });

    describe('Audio', function () {
        const ChannelName = 'Microsoft::Basix::Dct::Channel::Class::Audio'
        const ChannelData = Buffer.from('', 'hex')

        it('should be able to decode (Open_Audio)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Open_Audio.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTControl), true)
            assert.equal((packet.gs_payload as MuxDCTControl).type, Types.OpenChannel)
            assert.deepEqual((packet.gs_payload as MuxDCTControl).name, ChannelName)
            assert.deepEqual((packet.gs_payload as MuxDCTControl).data, ChannelData)
        });

        it('should be able to encode (Open_Audio)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Open_Audio.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTControl({
                type: Types.OpenChannel,
                name: ChannelName,
            })
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(4))
        });

        it('should be able to decode (Data_Audio)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Data_Audio.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTControl), true)
            assert.equal((packet.gs_payload as MuxDCTControl).type, Types.Confirm)
            assert.deepEqual((packet.gs_payload as MuxDCTControl).data, ChannelData)
        });

        it('should be able to encode (Data_Audio)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Data_Audio.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTControl({
                type: Types.Confirm,
            })

            assert.deepEqual(encoded.toPacket(), packet.payload.slice(4))
        });

        it('should be able to decode (Confirm_Audio)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Confirm_Audio.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTControl), true)
            assert.equal((packet.gs_payload as MuxDCTControl).type, Types.Confirm)
            assert.deepEqual((packet.gs_payload as MuxDCTControl).data, ChannelData)
        });

        it('should be able to encode (Confirm_Audio)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Confirm_Audio.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTControl({
                type: Types.Confirm,
            })

            assert.deepEqual(encoded.toPacket(), packet.payload.slice(4))
        });
    });

    describe('Messaging', function () {
        const ChannelName = 'Microsoft::Basix::Dct::Channel::Class::Messaging'
        const ChannelData = Buffer.from('', 'hex')

        it('should be able to decode (Open_Messaging)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Open_Messaging.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTControl), true)
            assert.equal((packet.gs_payload as MuxDCTControl).type, Types.OpenChannel)
            assert.deepEqual((packet.gs_payload as MuxDCTControl).name, ChannelName)
            assert.deepEqual((packet.gs_payload as MuxDCTControl).data, ChannelData)
        });

        it('should be able to encode (Open_Messaging)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Open_Messaging.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTControl({
                type: Types.OpenChannel,
                name: ChannelName,
            })
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(4))
        });

        it('should be able to decode (Data_Messaging)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Data_Messaging.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTControl), true)
            assert.equal((packet.gs_payload as MuxDCTControl).type, Types.Confirm)
            assert.deepEqual((packet.gs_payload as MuxDCTControl).data, ChannelData)
        });

        it('should be able to encode (Data_Messaging)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Data_Messaging.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTControl({
                type: Types.Confirm,
            })

            assert.deepEqual(encoded.toPacket(), packet.payload.slice(4))
        });

        it('should be able to decode (Confirm_Messaging)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Confirm_Messaging.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTControl), true)
            assert.equal((packet.gs_payload as MuxDCTControl).type, Types.Confirm)
            assert.deepEqual((packet.gs_payload as MuxDCTControl).data, ChannelData)
        });

        it('should be able to encode (Confirm_Messaging)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Confirm_Messaging.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTControl({
                type: Types.Confirm,
            })

            assert.deepEqual(encoded.toPacket(), packet.payload.slice(12))
        });
    });

    describe('ChatAudio', function () {
        const ChannelName = 'Microsoft::Basix::Dct::Channel::Class::ChatAudio'
        const ChannelData = Buffer.from('', 'hex')

        it('should be able to decode (Open_ChatAudio)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Open_ChatAudio.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTControl), true)
            assert.equal((packet.gs_payload as MuxDCTControl).type, Types.OpenChannel)
            assert.deepEqual((packet.gs_payload as MuxDCTControl).name, ChannelName)
            assert.deepEqual((packet.gs_payload as MuxDCTControl).data, ChannelData)
        });

        it('should be able to encode (Open_ChatAudio)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Open_ChatAudio.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTControl({
                type: Types.OpenChannel,
                name: ChannelName,
            })
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(4))
        });

        it('should be able to decode (Data_ChatAudio)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Data_ChatAudio.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTControl), true)
            assert.equal((packet.gs_payload as MuxDCTControl).type, Types.Confirm)
            assert.deepEqual((packet.gs_payload as MuxDCTControl).data, ChannelData)
        });

        it('should be able to encode (Data_ChatAudio)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Data_ChatAudio.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTControl({
                type: Types.Confirm,
            })

            assert.deepEqual(encoded.toPacket(), packet.payload.slice(4))
        });

        it('should be able to decode (Confirm_ChatAudio)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Confirm_ChatAudio.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTControl), true)
            assert.equal((packet.gs_payload as MuxDCTControl).type, Types.Confirm)
            assert.deepEqual((packet.gs_payload as MuxDCTControl).data, ChannelData)
        });

        it('should be able to encode (Confirm_ChatAudio)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Confirm_ChatAudio.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTControl({
                type: Types.Confirm,
            })

            assert.deepEqual(encoded.toPacket(), packet.payload.slice(12))
        });
    });

    describe('Input', function () {
        const ChannelName = 'Microsoft::Basix::Dct::Channel::Class::Input'
        const ChannelData = Buffer.from('\"\"\n  version \"1\"\n  index \"0\"\n')

        it('should be able to decode (Open_Input)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Open_Input.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTControl), true)
            assert.equal((packet.gs_payload as MuxDCTControl).type, Types.OpenChannel)
            assert.deepEqual((packet.gs_payload as MuxDCTControl).name, ChannelName)
            assert.deepEqual((packet.gs_payload as MuxDCTControl).data, ChannelData)
        });

        it('should be able to encode (Open_Input)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Open_Input.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTControl({
                type: Types.OpenChannel,
                name: ChannelName,
                data: ChannelData,
            })
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(12))
        });

        it('should be able to decode (Data_Input)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Data_Input.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTControl), true)
            assert.equal((packet.gs_payload as MuxDCTControl).type, Types.Confirm)
            assert.deepEqual((packet.gs_payload as MuxDCTControl).data, ChannelData)
        });

        it('should be able to encode (Data_Input)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Data_Input.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTControl({
                type: Types.Confirm,
                data: ChannelData,
            })

            assert.deepEqual(encoded.toPacket(), packet.payload.slice(4))
        });

        it('should be able to decode (Confirm_Input)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Confirm_Input.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTControl), true)
            assert.equal((packet.gs_payload as MuxDCTControl).type, Types.Confirm)
            assert.deepEqual((packet.gs_payload as MuxDCTControl).data, Buffer.from(''))
        });

        it('should be able to encode (Confirm_Input)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Confirm_Input.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTControl({
                type: Types.Confirm,
            })

            assert.deepEqual(encoded.toPacket(), packet.payload.slice(12))
        });
    });

    describe('Input Feedback', function () {
        const ChannelName = 'Microsoft::Basix::Dct::Channel::Class::Input Feedback'
        const ChannelData = Buffer.from('\"\"\n  version \"1\"\n  index \"0\"\n')

        it('should be able to decode (Open_InputFeedback)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Open_InputFeedback.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTControl), true)
            assert.equal((packet.gs_payload as MuxDCTControl).type, Types.OpenChannel)
            assert.deepEqual((packet.gs_payload as MuxDCTControl).name, ChannelName)
            assert.deepEqual((packet.gs_payload as MuxDCTControl).data, ChannelData)
        });

        it('should be able to encode (Open_InputFeedback)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Open_InputFeedback.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTControl({
                type: Types.OpenChannel,
                name: ChannelName,
                data: ChannelData,
            })
            
            assert.deepEqual(encoded.toPacket(), packet.payload.slice(4))
        });

        it('should be able to decode (Data_InputFeedback)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Data_InputFeedback.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTControl), true)
            assert.equal((packet.gs_payload as MuxDCTControl).type, Types.Confirm)
            assert.deepEqual((packet.gs_payload as MuxDCTControl).data, ChannelData)
        });

        it('should be able to encode (Data_InputFeedback)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Data_InputFeedback.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTControl({
                type: Types.Confirm,
                data: ChannelData,
            })

            assert.deepEqual(encoded.toPacket(), packet.payload.slice(4))
        });

        it('should be able to decode (Confirm_InputFeedback)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Confirm_InputFeedback.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof MuxDCTControl), true)
            assert.equal((packet.gs_payload as MuxDCTControl).type, Types.Confirm)
            assert.deepEqual((packet.gs_payload as MuxDCTControl).data, Buffer.from(''))
        });

        it('should be able to encode (Confirm_InputFeedback)', function () {
            const data = fs.readFileSync('tests/data/MuxDCTControl/Confirm_InputFeedback.bin')
            const packet = loadPacket(data)
            const encoded = new MuxDCTControl({
                type: Types.Confirm,
            })

            assert.deepEqual(encoded.toPacket(), packet.payload.slice(13))
        });
    });
});