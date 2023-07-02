import * as assert from 'assert'
import * as fs from 'fs'

import UDPKeepAlive, { Types } from '../../src/packets/UDPKeepAlive'
import { loadPacket } from './config';

describe('UDPKeepAlive', function () {

    describe('Config', function () {
        it('should be able to decode', function () {
            const data = fs.readFileSync('tests/data/UDPKeepAlive/Config_Request.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof UDPKeepAlive), true)
            assert.equal((packet.gs_payload as UDPKeepAlive).type, Types.Config)
            assert.equal((packet.gs_payload as UDPKeepAlive).unknown1, 100)
            assert.equal((packet.gs_payload as UDPKeepAlive).unknown2, 0)
            assert.equal((packet.gs_payload as UDPKeepAlive).unknown3, 8000)
            assert.equal((packet.gs_payload as UDPKeepAlive).unknown4, 0)
            assert.equal((packet.gs_payload as UDPKeepAlive).unknown5, 10)
            assert.equal((packet.gs_payload as UDPKeepAlive).unknown6, 100)
            assert.equal((packet.gs_payload as UDPKeepAlive).unknown7, 5000)
            assert.equal((packet.gs_payload as UDPKeepAlive).unknown8, 0)
        });

        it('should be able to encode', function () {
            const data = fs.readFileSync('tests/data/UDPKeepAlive/Config_Request.bin')
            const packet = loadPacket(data)
            const encoded = new UDPKeepAlive({
                type: Types.Config,
            })

            assert.deepEqual(encoded.toPacket(), packet.payload)
        });
    });

    describe('Config_Ack', function () {
        it('should be able to decode', function () {
            const data = fs.readFileSync('tests/data/UDPKeepAlive/Config_Response.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof UDPKeepAlive), true)
            assert.equal((packet.gs_payload as UDPKeepAlive).type, Types.ConfigAck)
        });

        it('should be able to encode', function () {
            const data = fs.readFileSync('tests/data/UDPKeepAlive/Config_Response.bin')
            const packet = loadPacket(data)
            const encoded = new UDPKeepAlive({
                type: Types.ConfigAck,
                header: 40,
            })

            assert.deepEqual(encoded.toPacket(), packet.payload)
        });
    });

    describe('Ping', function () {
        it('should be able to decode', function () {
            const data = fs.readFileSync('tests/data/UDPKeepAlive/KeepAlive.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof UDPKeepAlive), true)
            assert.equal((packet.gs_payload as UDPKeepAlive).type, Types.None)
        });

        it('should be able to encode', function () {
            const data = fs.readFileSync('tests/data/UDPKeepAlive/KeepAlive.bin')
            const packet = loadPacket(data)
            const encoded = new UDPKeepAlive({
                type: Types.None,
                header: 1382,
            })

            assert.deepEqual(encoded.toPacket(), packet.payload)
        });
    });

    describe('Ping (full)', function () {
        it('should be able to decode', function () {
            const data = fs.readFileSync('tests/data/UDPKeepAlive/KeepAlive_full.bin')
            const packet = loadPacket(data)
            const decoded = new UDPKeepAlive(packet.payload)

            assert.equal((packet.gs_payload instanceof UDPKeepAlive), true)
            assert.equal((packet.gs_payload as UDPKeepAlive).type, Types.None)
        });

        it('should be able to encode', function () {
            const data = fs.readFileSync('tests/data/UDPKeepAlive/KeepAlive_full.bin')
            const packet = loadPacket(data)
            const encoded = new UDPKeepAlive({
                type: Types.None,
                header: 1386,
            })

            assert.deepEqual(encoded.toPacket().slice(0, 8), packet.payload.slice(0, 8))
        });
    });

    describe('Diconnect', function () {
        it('should be able to decode', function () {
            const data = fs.readFileSync('tests/data/UDPKeepAlive/Disconnect.bin')
            const packet = loadPacket(data)

            assert.equal((packet.gs_payload instanceof UDPKeepAlive), true)
            assert.equal((packet.gs_payload as UDPKeepAlive).type, Types.Disconnect)
        });

        it('should be able to encode', function () {
            const data = fs.readFileSync('tests/data/UDPKeepAlive/Disconnect.bin')
            const packet = loadPacket(data)
            const encoded = new UDPKeepAlive({
                type: Types.Disconnect,
            })

            assert.deepEqual(encoded.toPacket(), packet.payload)
        });
    });
});