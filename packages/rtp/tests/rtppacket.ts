import RtpPacket from '../src/index'
import { expect } from 'chai'
import * as fs from 'fs'

const rtp_init = fs.readFileSync('./tests/testdata/rtp_init.bin')
const rtp_sequence = fs.readFileSync('./tests/testdata/rtp_sequence.bin')
const rtp_marker = fs.readFileSync('./tests/testdata/rtp_marker.bin')

describe('RtpPacket', () => {

    describe('rtp_init.bin', () => {
    
        it('should read rtp_init.bin', function(){
            const packet = new RtpPacket()
            packet.load(rtp_init)

            expect(packet.header.version).equal(2)
            expect(packet.header.padding).equal(0)
            expect(packet.header.extension).equal(0)
            expect(packet.header.csrc).equal(0)

            expect(packet.header.marker).equal(0)
            expect(packet.header.sequence).equal(0)
            expect(packet.header.timestamp).equal(0)
            expect(packet.header.ssrc).equal(0)
        })

        it('should recreate rtp_init.bin from scratch', function(){
            const packet = new RtpPacket()

            packet.header.payloadType = 102
            packet.header.sequence = 13
            packet.payload = Buffer.from('55fe006ce26a73b5699e0d96cae4772ad5b71e441a89', 'hex')
            
            expect(packet.serialize()).deep.equal(rtp_sequence)
        })

    })

    describe('rtp_sequence.bin', () => {

        it('should read rtp_sequence.bin', function(){
            const packet = new RtpPacket()
            packet.load(rtp_sequence)

            expect(packet.header.version).equal(2)
            expect(packet.header.padding).equal(0)
            expect(packet.header.extension).equal(0)
            expect(packet.header.csrc).equal(0)

            expect(packet.header.marker).equal(0)
            expect(packet.header.sequence).equal(13)
            expect(packet.header.timestamp).equal(0)
            expect(packet.header.ssrc).equal(0)

            expect(packet.payload).deep.equal(Buffer.from('55fe006ce26a73b5699e0d96cae4772ad5b71e441a89', 'hex'))
        })
    })

    describe('rtp_marker.bin', () => {

        it('should read rtp_marker.bin', function(){
            const packet = new RtpPacket()
            packet.load(rtp_marker)

            expect(packet.header.version).equal(2)
            expect(packet.header.padding).equal(0)
            expect(packet.header.extension).equal(0)
            expect(packet.header.csrc).equal(0)

            expect(packet.header.marker).equal(1)
            expect(packet.header.payloadType).equal(163)
            expect(packet.header.payloadTypeReal).equal(35)
        })
    })
})