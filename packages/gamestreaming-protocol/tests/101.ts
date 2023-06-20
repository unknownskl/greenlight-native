import * as assert from 'assert'
import * as fs from 'fs'

import Rtp101, { Types } from '../src/rtp/101'

describe('RTP 101', function () {
    describe('ChannelRequest', function () {
        it('should be able to decode', function () {
            const data = fs.readFileSync('tests/data/101/channelrequest.bin')
            const decoded = new Rtp101(data)

            assert.equal(decoded.type, Types.Request)
            assert.equal(decoded.unknown1, 100)
            assert.equal(decoded.unknown2, 0)
            assert.equal(decoded.unknown3, 8000)
            assert.equal(decoded.unknown4, 0)
            assert.equal(decoded.unknown5, 10)
            assert.equal(decoded.unknown6, 100)
            assert.equal(decoded.unknown7, 5000)
            assert.equal(decoded.unknown8, 0)
        });

        it('should be able to encode', function () {
            const data = fs.readFileSync('tests/data/101/channelrequest.bin')
            const encoded = new Rtp101({
                type: Types.Request,
            })

            assert.deepEqual(encoded.toPacket(), data)
        });
    });

    describe('ChannelConfirm', function () {
        it('should be able to decode', function () {
            const data = fs.readFileSync('tests/data/101/channelconfirm.bin')
            const decoded = new Rtp101(data)

            assert.equal(decoded.type, Types.Confirm)
        });

        it('should be able to encode', function () {
            const data = fs.readFileSync('tests/data/101/channelconfirm.bin')
            const encoded = new Rtp101({
                type: Types.Confirm,
                header: 40,
            })

            assert.deepEqual(encoded.toPacket(), data)
        });
    });

    describe('Ping', function () {
        it('should be able to decode', function () {
            const data = fs.readFileSync('tests/data/101/ping.bin')
            const decoded = new Rtp101(data)

            assert.equal(decoded.type, Types.None)
        });

        it('should be able to encode', function () {
            const data = fs.readFileSync('tests/data/101/ping.bin')
            const encoded = new Rtp101({
                type: Types.None,
                header: 1382,
            })

            assert.deepEqual(encoded.toPacket(), data)
        });
    });

    describe('Ping (big)', function () {
        it('should be able to decode', function () {
            const data = fs.readFileSync('tests/data/101/ping_big.bin')
            const decoded = new Rtp101(data)

            assert.equal(decoded.type, Types.None)
        });

        it('should be able to encode', function () {
            const data = fs.readFileSync('tests/data/101/ping_big.bin')
            const encoded = new Rtp101({
                type: Types.None,
                header: 1386,
            })

            assert.deepEqual(encoded.toPacket().slice(0, 8), data.slice(0, 8))
        });
    });

    describe('Diconnect', function () {
        it('should be able to decode', function () {
            const data = fs.readFileSync('tests/data/101/disconnect.bin')
            const decoded = new Rtp101(data)

            assert.equal(decoded.type, Types.Disconnect)
        });

        it('should be able to encode', function () {
            const data = fs.readFileSync('tests/data/101/disconnect.bin')
            const encoded = new Rtp101({
                type: Types.Disconnect,
            })

            assert.deepEqual(encoded.toPacket(), data) // Only compare first 8 bytes. Rest is garbage
        });
    });
});