import GameStreamingProtocol, { PacketFormats } from 'greenlight-gamestreaming-protocol'
import { Channel } from '../channel'

console.log(GameStreamingProtocol)

export default class CoreChannel extends Channel {

    _sessionHandshakeInterval
    _mtu = 0

    startHandshake(){
        const packetData = new PacketFormats.UDPConnectionProbing({
            type: PacketFormats.UDPConnectionProbingTypes.Syn,
            length: 1024
        })

        console.log(packetData)

        console.log('[CORE] Starting UDP MTU handshake')

        let mtuSize = 1436+16
        this._sessionHandshakeInterval = setInterval(() => {
            // const payload = new SynPacket({ mtu_size: 1436 }).toPacket()
            mtuSize = mtuSize-16

            // if(payload !== undefined){
            //     console.log('[CORE] Sending mtu syn:', mtuSize)
            //     this.application.send(payload.slice(0, mtuSize), 0, 102)
            // }
            const packetData = new PacketFormats.UDPConnectionProbing({
                type: PacketFormats.UDPConnectionProbingTypes.Syn,
                length: mtuSize
            })
            this.application.send(packetData.toPacket(), 0, 102)

            if(mtuSize <= 1207){
                if(this._sessionHandshakeInterval !== undefined)
                    clearInterval(this._sessionHandshakeInterval)
            }
        }, 10) // Use an interval instead of an while loop to have concurrency
    }

    onMessage(rtp, payload){
        // Set MTU size
        if(this._mtu === 0){
            this._mtu = payload.length
            clearInterval(this._sessionHandshakeInterval)

            this.application.send(new PacketFormats.UDPConnectionProbing({
                type: PacketFormats.UDPConnectionProbingTypes.Ack,
                length: payload.length,
            }), 0, 102)

            console.log(__filename+'[onMessage()] MTU negotiated at', payload.length)

        } else if(payload instanceof PacketFormats.UDPKeepAlive) {
            if(payload.type === PacketFormats.UDPKeepAliveTypes.Config){
                console.log(__filename+'[onMessage()] Received config:', payload)

                this.application.send(new PacketFormats.URCPControl({
                    type: PacketFormats.URCPControlTypes.Config,
                }), 0, 100)

                this.application.send(new PacketFormats.UDPKeepAlive({
                    type: PacketFormats.UDPKeepAliveTypes.ConfigAck,
                    header: 40,
                }), 0, 101)
            }

        } else if(payload.type === PacketFormats.URCPControlTypes.Config){
            this.application.send(new PacketFormats.URCPControl({
                type: PacketFormats.URCPControlTypes.Accepted,
            }), 0, 100)

            console.log(__filename+'[onMessage()] Core channel negotiation finished')

        }

    }
    
}