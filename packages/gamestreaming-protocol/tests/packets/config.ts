import RTPPacket from 'greenlight-rtp'
import GamestreamingProtocol from '../../src/index'

export const keys = {
    'default': 'vV9cuxwCpZ2iKGVFJhdLBcQ2mfSRzFvPj7+vTQbq'
}

const gsProtocol = new GamestreamingProtocol()

export function loadPacket(data:Buffer, key:string = 'default'){
    const packet = new RTPPacket(data)

    const SrtpCrypto = packet.getSrtpCrypto()
    const crypto = new SrtpCrypto(keys[key])
    const payload = crypto.decrypt(packet)

    const gs_payload = gsProtocol.lookup(packet.header.payloadTypeReal, packet.header.ssrc, payload)

    // Length checks
    if(gs_payload.getPacket().length !== gs_payload.getOffset())
        gsProtocol.log('Warning: Packet length is bigger then offset. Remaining bytes:', (gs_payload.getPacket().length-gs_payload.getOffset()))
    
    return {
        rtp_packet: packet,
        payload: payload,
        gs_payload: gs_payload
    }
}