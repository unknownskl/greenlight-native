import * as assert from 'assert'
import * as fs from 'fs'

import Rtp102, { Types } from '../src/rtp/102'

describe('RTP 102', function () {
    describe('Syn', function () {
        it('should be able to decode', function () {

            const data = fs.readFileSync('tests/data/102/syn.bin')
            const decoded = new Rtp102(data)

            assert.equal(decoded.type, Types.Syn)
            assert.equal(decoded.length, 1386)
        });

        it('should be able to encode', function () {

            const data = fs.readFileSync('tests/data/102/syn.bin')
            const encoded = new Rtp102({
                type: Types.Syn,
                length: 1386,
                custom_binary: data.slice(2, -2)
            })

            assert.deepEqual(encoded.toPacket(), data)
        });
    });

    describe('Ack', function () {
        it('should be able to decode', function () {

            const data = fs.readFileSync('tests/data/102/ack.bin')
            const decoded = new Rtp102(data)

            assert.equal(decoded.type, Types.Ack)
            assert.equal(decoded.length, 1382)
        });

        it('should be able to encode', function () {

            const data = fs.readFileSync('tests/data/102/ack.bin')
            const encoded = new Rtp102({
                type: Types.Ack,
                length: 1382
            })

            assert.deepEqual(encoded.toPacket(), data)
        });
    });
});