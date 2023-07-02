import * as assert from 'assert'
import * as fs from 'fs'

import URCPControl, { Types } from '../../src/packets/URCPControl'
import { loadPacket } from './config';

describe('URCPControl', function () {

    describe('Config', function () {
        it('should be able to decode', function () {
            const data = fs.readFileSync('tests/data/URCPControl/Config.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof URCPControl), true)
            assert.equal((packet.gs_payload as URCPControl).type, Types.Config)
            assert.equal((packet.gs_payload as URCPControl).unknown1, 786435)
            assert.equal((packet.gs_payload as URCPControl).unknown2, 100)
            assert.equal((packet.gs_payload as URCPControl).unknown3, 0)
            assert.equal((packet.gs_payload as URCPControl).sequence, 5)
        });

        it('should be able to encode', function () {
            const data = fs.readFileSync('tests/data/URCPControl/Config.bin')
            const packet = loadPacket(data)
            const encoded = new URCPControl({
                type: Types.Config,
                sequence: 5,
            })

            assert.deepEqual(encoded.toPacket(), packet.payload)
        });
    });

    describe('Accepted', function () {
        it('should be able to decode', function () {
            const data = fs.readFileSync('tests/data/URCPControl/Config_Accepted.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof URCPControl), true)
            assert.equal((packet.gs_payload as URCPControl).type, Types.Accepted)
            assert.equal((packet.gs_payload as URCPControl).unknown1, 2966)
            assert.equal((packet.gs_payload as URCPControl).unknown2, 0)
        });

        it('should be able to encode', function () {
            const data = fs.readFileSync('tests/data/URCPControl/Config_Accepted.bin')
            const packet = loadPacket(data)
            const encoded = new URCPControl({
                type: Types.Accepted,
                unknown1: 2966,
                unknown2: 0,
            })

            assert.deepEqual(encoded.toPacket(), packet.payload)
        });
    });

    describe('Finished', function () {
        it('should be able to decode', function () {
            const data = fs.readFileSync('tests/data/URCPControl/Config_Finished.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof URCPControl), true)
            assert.equal((packet.gs_payload as URCPControl).type, Types.Finished)
        });

        it('should be able to encode', function () {
            const data = fs.readFileSync('tests/data/URCPControl/Config_Finished.bin')
            const packet = loadPacket(data)
            const encoded = new URCPControl({
                type: Types.Finished,
            })

            assert.deepEqual(encoded.toPacket(), packet.payload)
        });
    });
});