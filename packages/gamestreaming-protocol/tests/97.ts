import * as assert from 'assert'
import * as fs from 'fs'

import Rtp97, { Types } from '../src/rtp/97'

describe('RTP 97', function () {
    describe('OpenChannel', function () {
        it('should be able to decode (control)', function () {
            const data = fs.readFileSync('tests/data/97/openchannel_control.bin')
            const decoded = new Rtp97(data)

            assert.equal(decoded.type, Types.OpenChannel)
            assert.deepEqual(decoded.name, 'Microsoft::Basix::Dct::Channel::Class::Control')
            assert.deepEqual(decoded.data, Buffer.from('0300', 'hex'))
        });

        it('should be able to encode (control)', function () {
            const data = fs.readFileSync('tests/data/97/openchannel_control.bin')
            const encoded = new Rtp97({
                type: Types.OpenChannel,
                name: 'Microsoft::Basix::Dct::Channel::Class::Control',
                data: Buffer.from('0300', 'hex'),
            })

            assert.deepEqual(encoded.toPacket(), data.slice(9)) // Remove first 11 bytes as we dont check for the header
        });

        it('should be able to decode (qos)', function () {
            const data = fs.readFileSync('tests/data/97/openchannel_qos.bin')
            const decoded = new Rtp97(data)

            assert.equal(decoded.type, Types.OpenChannel)
            assert.deepEqual(decoded.name, 'Microsoft::Basix::Dct::Channel::Class::QoS')
            assert.deepEqual(decoded.data, Buffer.from('', 'hex'))
        });

        it('should be able to encode (qos)', function () {
            const data = fs.readFileSync('tests/data/97/openchannel_qos.bin')
            const encoded = new Rtp97({
                type: Types.OpenChannel,
                name: 'Microsoft::Basix::Dct::Channel::Class::QoS',
            })

            assert.deepEqual(encoded.toPacket(), data.slice(12)) // Remove first 11 bytes as we dont check for the header
        });

        it('should be able to decode (video)', function () {
            const data = fs.readFileSync('tests/data/97/openchannel_video.bin')
            const decoded = new Rtp97(data)

            assert.equal(decoded.type, Types.OpenChannel)
            assert.deepEqual(decoded.name, 'Microsoft::Basix::Dct::Channel::Class::Video')
            assert.deepEqual(decoded.data, Buffer.from('', 'hex'))
        });

        it('should be able to encode (video)', function () {
            const data = fs.readFileSync('tests/data/97/openchannel_video.bin')
            const encoded = new Rtp97({
                type: Types.OpenChannel,
                name: 'Microsoft::Basix::Dct::Channel::Class::Video',
            })

            assert.deepEqual(encoded.toPacket(), data.slice(4)) // Remove first 11 bytes as we dont check for the header
        });

        it('should be able to decode (audio)', function () {
            const data = fs.readFileSync('tests/data/97/openchannel_audio.bin')
            const decoded = new Rtp97(data)

            assert.equal(decoded.type, Types.OpenChannel)
            assert.deepEqual(decoded.name, 'Microsoft::Basix::Dct::Channel::Class::Audio')
            assert.deepEqual(decoded.data, Buffer.from('', 'hex'))
        });

        it('should be able to encode (audio)', function () {
            const data = fs.readFileSync('tests/data/97/openchannel_audio.bin')
            const encoded = new Rtp97({
                type: Types.OpenChannel,
                name: 'Microsoft::Basix::Dct::Channel::Class::Audio',
            })

            assert.deepEqual(encoded.toPacket(), data.slice(4)) // Remove first 11 bytes as we dont check for the header
        });

        it('should be able to decode (messaging)', function () {
            const data = fs.readFileSync('tests/data/97/openchannel_messaging.bin')
            const decoded = new Rtp97(data)

            assert.equal(decoded.type, Types.OpenChannel)
            assert.deepEqual(decoded.name, 'Microsoft::Basix::Dct::Channel::Class::Messaging')
            assert.deepEqual(decoded.data, Buffer.from('', 'hex'))
        });

        it('should be able to encode (messaging)', function () {
            const data = fs.readFileSync('tests/data/97/openchannel_messaging.bin')
            const encoded = new Rtp97({
                type: Types.OpenChannel,
                name: 'Microsoft::Basix::Dct::Channel::Class::Messaging',
            })

            assert.deepEqual(encoded.toPacket(), data.slice(4)) // Remove first 11 bytes as we dont check for the header
        });

        it('should be able to decode (chataudio)', function () {
            const data = fs.readFileSync('tests/data/97/openchannel_chataudio.bin')
            const decoded = new Rtp97(data)

            assert.equal(decoded.type, Types.OpenChannel)
            assert.deepEqual(decoded.name, 'Microsoft::Basix::Dct::Channel::Class::ChatAudio')
            assert.deepEqual(decoded.data, Buffer.from('', 'hex'))
        });

        it('should be able to encode (chataudio)', function () {
            const data = fs.readFileSync('tests/data/97/openchannel_chataudio.bin')
            const encoded = new Rtp97({
                type: Types.OpenChannel,
                name: 'Microsoft::Basix::Dct::Channel::Class::ChatAudio',
            })

            assert.deepEqual(encoded.toPacket(), data.slice(4)) // Remove first 11 bytes as we dont check for the header
        });

        it('should be able to decode (input)', function () {
            const data = fs.readFileSync('tests/data/97/openchannel_input.bin')
            const decoded = new Rtp97(data)

            assert.equal(decoded.type, Types.OpenChannel)
            assert.deepEqual(decoded.name, 'Microsoft::Basix::Dct::Channel::Class::Input')
            assert.deepEqual(decoded.data, Buffer.from('\"\"\n  version \"1\"\n  index \"0\"\n'))
        });

        it('should be able to encode (input)', function () {
            const data = fs.readFileSync('tests/data/97/openchannel_input.bin')
            const encoded = new Rtp97({
                type: Types.OpenChannel,
                name: 'Microsoft::Basix::Dct::Channel::Class::Input',
                data: Buffer.from('\"\"\n  version \"1\"\n  index \"0\"\n')
            })

            assert.deepEqual(encoded.toPacket(), data.slice(12)) // Remove first 11 bytes as we dont check for the header
        });

        it('should be able to decode (inputfeedback)', function () {
            const data = fs.readFileSync('tests/data/97/openchannel_inputfeedback.bin')
            const decoded = new Rtp97(data)

            assert.equal(decoded.type, Types.OpenChannel)
            assert.deepEqual(decoded.name, 'Microsoft::Basix::Dct::Channel::Class::Input Feedback')
            assert.deepEqual(decoded.data, Buffer.from('\"\"\n  version \"1\"\n  index \"0\"\n'))
        });

        it('should be able to encode (inputfeedback)', function () {
            const data = fs.readFileSync('tests/data/97/openchannel_inputfeedback.bin')
            const encoded = new Rtp97({
                type: Types.OpenChannel,
                name: 'Microsoft::Basix::Dct::Channel::Class::Input Feedback',
                data: Buffer.from('\"\"\n  version \"1\"\n  index \"0\"\n')
            })

            assert.deepEqual(encoded.toPacket(), data.slice(4)) // Remove first 11 bytes as we dont check for the header
        });
    });

    describe('Confirm', function () {
        it('should be able to decode (control)', function () {
            const data = fs.readFileSync('tests/data/97/confirm_control.bin')
            const decoded = new Rtp97(data)

            assert.equal(decoded.type, Types.Confirm)
            assert.deepEqual(decoded.data, Buffer.from('0300', 'hex'))
        });

        it('should be able to encode (control)', function () {
            const data = fs.readFileSync('tests/data/97/confirm_control.bin')
            const encoded = new Rtp97({
                type: Types.Confirm,
                data: Buffer.from('0300', 'hex')
            })

            assert.deepEqual(encoded.toPacket(), data.slice(6)) // Remove first 11 bytes as we dont check for the header
        });

        it('should be able to decode (qos)', function () {
            const data = fs.readFileSync('tests/data/97/confirm_qos.bin')
            const decoded = new Rtp97(data)

            assert.equal(decoded.type, Types.Confirm)
            assert.deepEqual(decoded.data, Buffer.from('', 'hex'))
        });

        it('should be able to encode (qos)', function () {
            const data = fs.readFileSync('tests/data/97/confirm_qos.bin')
            const encoded = new Rtp97({
                type: Types.Confirm
            })

            assert.deepEqual(encoded.toPacket(), data.slice(4)) // Remove first 11 bytes as we dont check for the header
        });

        it('should be able to decode (input)', function () {
            const data = fs.readFileSync('tests/data/97/confirm_input.bin')
            const decoded = new Rtp97(data)

            assert.equal(decoded.type, Types.Confirm)
            assert.deepEqual(decoded.data, Buffer.from('\"\"\n  version \"1\"\n  index \"0\"\n'))
        });

        it('should be able to encode (input)', function () {
            const data = fs.readFileSync('tests/data/97/confirm_input.bin')
            const encoded = new Rtp97({
                type: Types.Confirm,
                data: Buffer.from('\"\"\n  version \"1\"\n  index \"0\"\n')
            })

            assert.deepEqual(encoded.toPacket(), data.slice(4)) // Remove first 11 bytes as we dont check for the header
        });
    });
});