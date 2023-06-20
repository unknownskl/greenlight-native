import * as assert from 'assert'
import * as fs from 'fs'

import Rtp35, { Types, PacketTypes, DataTypes, AckTypes, HandshakeTypes, SynTypes, MessageKeyValueOptions } from '../src/rtp/35'

describe('RTP 35', function () {
    describe('None', function () {
        it('should be able to decode (none)', function () {
            const data = fs.readFileSync('tests/data/35/none.bin')
            const decoded = new Rtp35(data)

            assert.equal(decoded.type, Types.None)
        });

        // Not supported yet (Header problem)
        // it('should be able to decode (none2)', function () {
        //     const data = fs.readFileSync('tests/data/35/none2.bin')
        //     const decoded = new Rtp35(data)

        //     console.log(decoded)

        //     assert.equal(decoded.type, Types.None)
        // });
    });

    describe('Data', function () {
        it('should be able to decode (messaging)', function () {
            const data = fs.readFileSync('tests/data/35/messaging.bin')
            const decoded = new Rtp35(data)

            assert.equal(decoded.type, Types.Data)
            assert.equal(decoded.packetFormat, PacketTypes.Message)
            assert.equal(decoded.dataType, DataTypes.KeyValue)
            assert.equal(decoded.ackType, AckTypes.NoAck)
            assert.equal(decoded.frameId, 2331526927)
            assert.equal(decoded.key, '/streaming/characteristics/orientationchanged')
            assert.equal(decoded.value, '{"orientation":0}')
            assert.equal(decoded.nextSequence, 4)
        });

        it('should be able to encode (messaging)', function () {
            const data = fs.readFileSync('tests/data/35/messaging.bin')
            const encoded = new Rtp35({
                type: Types.Data,
                sequence: 3,
                packetFormat: PacketTypes.Message,
                dataType: DataTypes.KeyValue,
                ackType: AckTypes.NoAck,
                frameId: 2331526927,
                key: '/streaming/characteristics/orientationchanged',
                value: '{"orientation":0}',
                nextSequence: 4,
            } as MessageKeyValueOptions)

            assert.deepEqual(encoded.toPacket(), data.slice(4))
        });
    });

    describe('Handshake', function () {
        it('should be able to decode (control_handshake)', function () {
            const data = fs.readFileSync('tests/data/35/control_handshake.bin')
            const decoded = new Rtp35(data)

            assert.equal(decoded.type, Types.Handshake)
            assert.equal(decoded.sequence, 0)
            assert.equal(decoded.handshakeType, HandshakeTypes.Syn)
            assert.equal(decoded.synType, SynTypes.None)
            assert.equal(decoded.udid, '4BDB3609-C1F1-4195-9B37-FEFF45DA8B8E')
        });

        it('should be able to encode (control_handshake)', function () {
            const data = fs.readFileSync('tests/data/35/control_handshake.bin')
            const encoded = new Rtp35({
                type: Types.Handshake,
                handshakeType: HandshakeTypes.Syn,
                synType: SynTypes.None,
                udid: Buffer.from('4BDB3609-C1F1-4195-9B37-FEFF45DA8B8E'),
            })

            assert.deepEqual(encoded.toPacket(), data.slice(14))
        });

        it('should be able to decode (control_handshakeresponse)', function () {
            const data = fs.readFileSync('tests/data/35/control_handshakeresponse.bin')
            const decoded = new Rtp35(data)

            assert.equal(decoded.type, Types.Handshake)
            assert.equal(decoded.sequence, 0)
            assert.equal(decoded.handshakeType, HandshakeTypes.Ack)
            assert.deepEqual(decoded.udid, Buffer.from('6273c8c67c3f7a479d4e4c2f0ab1896d01000000', 'hex'))
        });

        it('should be able to encode (control_handshakeresponse)', function () {
            const data = fs.readFileSync('tests/data/35/control_handshakeresponse.bin')
            const encoded = new Rtp35({
                type: Types.Handshake,
                handshakeType: HandshakeTypes.Ack,
                udid: Buffer.from('6273c8c67c3f7a479d4e4c2f0ab1896d01000000', 'hex'),
            })

            assert.deepEqual(encoded.toPacket(), data.slice(13))
        });

        it('should be able to decode (handshake_messaging)', function () {
            const data = fs.readFileSync('tests/data/35/handshake_messaging.bin')
            const decoded = new Rtp35(data)

            assert.equal(decoded.type, Types.Handshake)
            assert.equal(decoded.sequence, 0)
            assert.equal(decoded.handshakeType, HandshakeTypes.Syn)
            assert.equal(decoded.synType, SynTypes.Unknown)
        });

        it('should be able to encode (handshake_messaging)', function () {
            const data = fs.readFileSync('tests/data/35/handshake_messaging.bin')
            const encoded = new Rtp35({
                type: Types.Handshake,
                sequence: 0,
                handshakeType: HandshakeTypes.Syn,
                synType: SynTypes.Unknown,
                unknown5: 1,
            })

            assert.deepEqual(encoded.toPacket(), data.slice(13))
        });
    });

    // describe('Data', function () {
    //     it('should be able to decode (video_ack)', function () {
    //         const data = fs.readFileSync('tests/data/35/video_ack.bin')
    //         const decoded = new Rtp40(data)

    //         assert.equal(decoded.type, Types.Data)
    //         assert.equal(decoded.unknown1, 0)
    //         assert.equal(decoded.unknown2, 1)
    //         assert.equal(decoded.sequence, 0)
    //         assert.equal(decoded.dataSize, 12372)
    //         assert.equal(decoded.totalPackets, 10)
    //         assert.equal(decoded.dataOffset, 0)
    //         assert.equal(decoded.nextSequence, 1)
    //     });

    //     // it('should be able to encode (video_ack)', function () {
    //     //     const data = fs.readFileSync('tests/data/35/video_ack.bin')
    //     //     const encoded = new Rtp40({
    //     //         type: Types.Data,
    //     //         sequence: 0,
    //     //         dataSize: 12372,
    //     //         totalPackets: 10,
    //     //         dataOffset: 0,
    //     //         nextSequence: 1,
    //     //         data: data.slice(41, -2)
    //     //     })

    //     //     assert.deepEqual(encoded.toPacket(), data.slice(13))
    //     // });
    // });
});