import * as assert from 'assert'
import * as fs from 'fs'

import UDPConnectionProbing, { Types } from '../../src/packets/UDPConnectionProbing'
import { loadPacket } from './config';

describe('UDPConnectionProbing', function () {
    describe('Syn', function () {
        it('should be able to decode', function () {
            const data = fs.readFileSync('tests/data/UDPConnectionProbing/Syn.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof UDPConnectionProbing), true)
            assert.equal((packet.gs_payload as UDPConnectionProbing).type, Types.Syn)
            assert.equal((packet.gs_payload as UDPConnectionProbing).length, 1386)
        });

        it('should be able to encode', function () {
            const data = fs.readFileSync('tests/data/UDPConnectionProbing/Syn.bin')
            const packet = loadPacket(data)
            const encoded = new UDPConnectionProbing({
                type: Types.Syn,
                length: 1386,
                custom_binary: packet.payload.slice(2, -2)
            })

            assert.deepEqual(encoded.toPacket(), packet.payload)
        });
    });

    describe('Ack', function () {
        it('should be able to decode', function () {

            const data = fs.readFileSync('tests/data/UDPConnectionProbing/Ack.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof UDPConnectionProbing), true)
            assert.equal((packet.gs_payload as UDPConnectionProbing).type, Types.Ack)
            assert.equal((packet.gs_payload as UDPConnectionProbing).length, 1386)
        });

        it('should be able to encode', function () {

            const data = fs.readFileSync('tests/data/UDPConnectionProbing/Ack.bin')
            const packet = loadPacket(data)
            const encoded = new UDPConnectionProbing({
                type: Types.Ack,
                length: 1386
            })

            assert.deepEqual(encoded.toPacket(), packet.payload)
        });
    });
});