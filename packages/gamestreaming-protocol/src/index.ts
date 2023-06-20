import Rtp35 from "./rtp/35"
import Rtp40 from "./rtp/40"
import Rtp97 from "./rtp/97"
import Rtp100 from "./rtp/100"
import Rtp101 from "./rtp/101"
import Rtp102 from "./rtp/102"

export default class GameStreamingProtocol {

    lookup(rtpPayloadType, rtpSsrc, payload){
        this.log('index.ts:lookup() Lookup data:', rtpPayloadType, rtpSsrc, payload)

        switch(rtpPayloadType){
            case 102:
                return new Rtp102(payload)
                break;
            case 101:
                return new Rtp101(payload)
                break;
            case 100:
                return new Rtp100(payload)
                break;
            case 97:
                return new Rtp97(payload)
                break;
            case 40:
                return new Rtp40(payload)
                break;
            case 35:
                return new Rtp35(payload)
                break;
            default:
                return { type: 'unknown' }
        }
    }

    log(...args) {
        args[0] = '[GameStreamingProtocol] '+args[0]
        console.log(args[0], args[1], args[2], args[3], args[4], args[5])
    }
}