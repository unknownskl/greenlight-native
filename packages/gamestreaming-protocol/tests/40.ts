import * as assert from 'assert'
import * as fs from 'fs'

import Rtp40, { Types } from '../src/rtp/40'

describe('RTP 40', function () {
    describe('Data', function () {
        it('should be able to decode (qos1)', function () {
            const data = fs.readFileSync('tests/data/40/qos1.bin')
            const decoded = new Rtp40(data)

            assert.equal(decoded.type, Types.Data)
            assert.equal(decoded.unknown1, 0)
            assert.equal(decoded.unknown2, 1)
            assert.equal(decoded.sequence, 0)
            assert.equal(decoded.dataSize, 12372)
            assert.equal(decoded.totalPackets, 10)
            assert.equal(decoded.dataOffset, 0)
            assert.equal(decoded.nextSequence, 1)
        });

        it('should be able to encode (qos1)', function () {
            const data = fs.readFileSync('tests/data/40/qos1.bin')
            const encoded = new Rtp40({
                type: Types.Data,
                sequence: 0,
                dataSize: 12372,
                totalPackets: 10,
                dataOffset: 0,
                nextSequence: 1,
                data: data.slice(41, -2)
            })

            assert.deepEqual(encoded.toPacket(), data.slice(13))
        });

        it('should be able to decode (qos2)', function () {
            const data = fs.readFileSync('tests/data/40/qos2.bin')
            const decoded = new Rtp40(data)

            assert.equal(decoded.type, Types.Data)
            assert.equal(decoded.unknown1, 0)
            assert.equal(decoded.unknown2, 1)
            assert.equal(decoded.sequence, 1)
            assert.equal(decoded.dataSize, 12372)
            assert.equal(decoded.totalPackets, 10)
            assert.equal(decoded.dataOffset, 1321)
            assert.equal(decoded.nextSequence, 2)
        });

        it('should be able to encode (qos2)', function () {
            const data = fs.readFileSync('tests/data/40/qos2.bin')
            const encoded = new Rtp40({
                type: Types.Data,
                sequence: 1,
                dataSize: 12372,
                totalPackets: 10,
                dataOffset: 1321,
                nextSequence: 2,
                data: data.slice(32, -2)
            })

            assert.deepEqual(encoded.toPacket(), data.slice(4))
        });

        it('should be able to merge 10 packets and parse JSON', function () {

            let jsonData = Buffer.allocUnsafeSlow(12371)

            for(let i=1; i<=10; i++){
                const data = fs.readFileSync('tests/data/40/qos'+i+'.bin')
                const decoded = new Rtp40(data)

                decoded.data?.copy(jsonData, decoded.dataOffset)
            }

            const policy = JSON.parse(jsonData.toString())
            assert.equal(policy.policy.version, 1)
        });
    });
});