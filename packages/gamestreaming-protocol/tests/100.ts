import * as assert from 'assert'
import * as fs from 'fs'

import Rtp100, { Types } from '../src/rtp/100'

describe('RTP 100', function () {
    describe('Handshake', function () {
        it('should be able to decode', function () {
            const data = fs.readFileSync('tests/data/100/handshake.bin')
            const decoded = new Rtp100(data)

            assert.equal(decoded.type, Types.Handshake)
            assert.equal(decoded.unknown1, 786435)
            assert.equal(decoded.unknown2, 100)
            assert.equal(decoded.unknown3, 0)
            assert.equal(decoded.sequence, 5)
        });

        it('should be able to encode', function () {
            const data = fs.readFileSync('tests/data/100/handshake.bin')
            const encoded = new Rtp100({
                type: Types.Handshake,
                sequence: 5,
            })

            assert.deepEqual(encoded.toPacket(), data)
        });
    });

    describe('Accepted', function () {
        it('should be able to decode', function () {
            const data = fs.readFileSync('tests/data/100/accepted.bin')
            const decoded = new Rtp100(data)

            assert.equal(decoded.type, Types.Accepted)
            assert.equal(decoded.unknown1, 2966)
            assert.equal(decoded.unknown2, 0)
        });

        it('should be able to encode', function () {
            const data = fs.readFileSync('tests/data/100/accepted.bin')
            const encoded = new Rtp100({
                type: Types.Accepted,
                unknown1: 2966,
                unknown2: 0,
            })

            assert.deepEqual(encoded.toPacket(), data)
        });
    });

    describe('Finished', function () {
        it('should be able to decode', function () {
            const data = fs.readFileSync('tests/data/100/finished.bin')
            const decoded = new Rtp100(data)

            assert.equal(decoded.type, Types.Finished)
        });

        it('should be able to encode', function () {
            const data = fs.readFileSync('tests/data/100/finished.bin')
            const encoded = new Rtp100({
                type: Types.Finished,
            })

            assert.deepEqual(encoded.toPacket(), data) // Only compare first 8 bytes. Rest is garbage
        });
    });
});