import UDPConnectionProbing from './packets/UDPConnectionProbing'
import UDPKeepAlive from './packets/UDPKeepAlive'
import URCPControl from './packets/URCPControl'
import MuxDCTControl from './packets/MuxDCTControl'
import MuxDCTChannel from './packets/MuxDCTChannel'

export default class GameStreamingProtocol {

    lookup(rtpPayloadType:number, rtpSsrc:number, payload:Buffer){
        // this.log('index.ts:lookup() Lookup data:', rtpPayloadType, rtpSsrc, payload)

        switch(true){
            // case 127: // MockUDPDctCtrl
            //     return new Rtp102(payload)
            //     break;
            // case 104: // URCPDummyPacket
            //     return new Rtp102(payload)
            //     break;
            case rtpPayloadType == 102: // UDPConnectionProbing
                return new UDPConnectionProbing(payload)
                break;
            case rtpPayloadType == 101: // UDPKeepAlive
                return new UDPKeepAlive(payload)
                break;
            case rtpPayloadType == 100: // URCPControl
                return new URCPControl(payload)
                break;
            // case 99: // SecurityLayerCtrl
            //     return new Rtp97(payload)
            //     break;
            // case 98: // FECControl
            //     return new Rtp97(payload)
            //     break;
            case rtpPayloadType == 97: // MuxDCTControl
                return new MuxDCTControl(payload)
                break;
            // case rtpPayloadType == 96: // BaseLinkControl
            //     return new Rtp97(payload)
            //     break;
            case rtpPayloadType <= 63 && rtpPayloadType >= 35: // MuxDCTChannel RangeEnd
                return new MuxDCTChannel(payload, rtpPayloadType, rtpSsrc)
                break;
            default:
                this.log('src/index.ts: RTP Payload type is unknown: ' + rtpPayloadType)
                this.log('src/index.ts: Trying to decode using MuxDCTChannel format...')
                return new MuxDCTChannel(payload, rtpPayloadType, rtpSsrc) //, rtpPayloadType, rtpSsrc)
                break;
        }
    }

    log(...args) {
        args[0] = '[GameStreamingProtocol] '+args[0]
        console.log(args[0], args[1], args[2], args[3], args[4], args[5])
    }
}