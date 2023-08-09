import GameStreamingProtocol, { PacketFormats } from 'greenlight-gamestreaming-protocol'
import { Channel } from '../channel'
import DCTPacket from 'greenlight-gamestreaming-protocol/dist/DCTPacket'

// console.log(GameStreamingProtocol)

export default class CoreChannel extends Channel {

    _sessionHandshakeInterval
    _sessionConfirmInterval
    _mtu = 0

    startHandshake(){
        console.log('[CORE] Starting UDP MTU handshake')

        let mtuSize = 1436+16
        this._sessionHandshakeInterval = setInterval(() => {
            mtuSize = mtuSize-16
            const packetData = new PacketFormats.UDPConnectionProbing({
                type: PacketFormats.UDPConnectionProbingTypes.Syn,
                length: mtuSize
            })
            this.application.send(packetData.toPacket(), 0, 102)

            if(mtuSize <= 1207){
                if(this._sessionHandshakeInterval !== undefined)
                    clearInterval(this._sessionHandshakeInterval)
            }
        }, 10)

        // Sequence confirm ACK messages (no-data)
        this._sessionConfirmInterval = setInterval(() => {
            if(this.application._serverSequenceChanged === true){
                // console.log('send ack:', this.application.getMs(true), 'ms:', this.application.getMs())

                const dummy = new DCTPacket(Buffer.from('0000', 'hex'))
                this.application.send(dummy.packHeader(Buffer.from('0000', 'hex'), {
                    // sequence: this.application.getClientSequence(),
                    confirm: this.application.getServerSequence(),
                    timestamp: this.application.getMs()
                }), 0, 35)
            }

        }, 50)
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
            
            } else if(payload.type === PacketFormats.UDPKeepAliveTypes.Disconnect){
                console.log('Received disconnect from console. Exiting client...')
                this.application.close(1)

            } else if(payload.type === PacketFormats.UDPKeepAliveTypes.None){
                console.log(__filename+'[onMessage()] Core ping:', payload)
                const packet = new PacketFormats.UDPKeepAlive({
                    type: PacketFormats.UDPKeepAliveTypes.None,
                    header: 1382,
                }).toPacket()
                const newBuffer = Buffer.alloc(this._mtu)
                packet.copy(newBuffer, 0)
                this.application.send(newBuffer, 0, 101)
            }

        } else if(payload instanceof PacketFormats.URCPControl && payload.type === PacketFormats.URCPControlTypes.Config){
            this.application.send(new PacketFormats.URCPControl({
                type: PacketFormats.URCPControlTypes.Accepted,
            }), 0, 100)

            console.log(__filename+'[onMessage()] Core channel negotiation finished')

        } else {
            // console.log(__filename+'[onMessage()]: [core] Unknown packet to process: ', payload)
        }

    }

    sendChannelsReady(){
        this.application.send(new PacketFormats.UDPKeepAlive({
            type: PacketFormats.UDPKeepAliveTypes.None,
            header: 1362,
        }), 0, 101)

        this.application.send(new PacketFormats.UDPKeepAlive({
            type: PacketFormats.UDPKeepAliveTypes.None,
            header: 288,
        }), 0, 101)

        console.log(__filename+'[onMessage()] All channels are ready. Preparing Input channels...')
    }
    
}