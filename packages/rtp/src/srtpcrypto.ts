import * as crypto from 'crypto'
import RtpPacket from "./index"

export default class SrtpCrypto {

    srtpKey:Buffer

    masterKey:Buffer;
    masterSalt:Buffer;

    keys: {
        cryptKey?:Buffer,
        authKey?:Buffer,
        saltKey?:Buffer,
    }

    _crypto?:any

    _sequence = 0
    _roc = 0

    // sessionKeys?:any

    constructor(srtpKey:string){
        const key = Buffer.from(srtpKey, 'base64')
        this.srtpKey = key

        this.masterKey = key.slice(0,16)
        this.masterSalt = key.slice(16)

        this.keys = {}

        if(this.masterKey.length != 16){
            throw Error('Masterkey is incorrect size')
        }
        if(this.masterSalt.length != 14){
            throw Error('Mastersalt is incorrect size')
        }

        this._derive_session_keys(this.masterKey, this.masterSalt)

        if(this.keys.cryptKey === undefined){
            throw Error('Cannot init crypto. No Cryptkey found')
        }
    }

    decrypt(rtpPacket:RtpPacket){
        return this._crypt_packet(rtpPacket, false)
    }

    encrypt(rtpPacket:RtpPacket){
        return this._crypt_packet(rtpPacket, true)
    }

    _crypt_packet(rtpPacket:RtpPacket, encrypt:boolean){
        // console.log(rtpPacket)

        if(rtpPacket.header.sequence < this._sequence){
            this._roc += 1
        }

        this._sequence = rtpPacket.header.sequence

        const pkt_i = this._sequence + (this._roc << 16)
        const iv = this._calc_iv(this.keys.saltKey?.slice(2), rtpPacket.header.ssrc, pkt_i)

        if(this.keys.cryptKey === undefined){
            throw Error('Cannot init crypto. No Cryptkey found')
        }

        if(rtpPacket.payload === undefined){
            throw Error('No payload in input')
        }

        if(encrypt === false){
            const cryptoContext = crypto.createDecipheriv('aes-128-gcm', this.keys.cryptKey, iv, {
                authTagLength: 16
            })

            const tagLength = 16
            const packetBuffer = rtpPacket.payload
            const tag = packetBuffer.slice(packetBuffer.length-tagLength)
            const data = packetBuffer.slice(0, packetBuffer.length-tagLength)

            const rtpBuffer = rtpPacket.serialize().slice(0, 12)

            cryptoContext.setAuthTag(tag);
            cryptoContext.setAAD(rtpBuffer, {
                plaintextLength: rtpBuffer.length
            })

            const decrypted = Buffer.concat([
                cryptoContext.update(data),
                cryptoContext.final(),
            ])

            return decrypted

        } else {
            const cryptoContext = crypto.createCipheriv('aes-128-gcm', this.keys.cryptKey, iv, {
                authTagLength: 16
            })

            const packetBuffer = rtpPacket.payload

            const rtpBuffer = rtpPacket.serialize().slice(0, 12)
            cryptoContext.setAAD(rtpBuffer, {
                plaintextLength: rtpBuffer.length
            })

            const decrypted = Buffer.concat([
                cryptoContext.update(packetBuffer),
                cryptoContext.final(),
                cryptoContext.getAuthTag(),
            ])

            return decrypted
        }
    }

    _calc_iv(salt, ssrc, pkt_i){
        const saltBytes = this._bytes_to_int(salt)
        const iv = ((BigInt(ssrc) << (BigInt(48))) + BigInt(pkt_i)) ^ saltBytes
        return this._int_to_bytes(BigInt(iv)).slice(4)
    }

    _derive_session_keys(masterKey:Buffer, masterSalt:Buffer){
        this.keys.cryptKey = this._derive_single_key(masterKey, masterSalt, 0)
        this.keys.authKey = this._derive_single_key(masterKey, masterSalt, 1)
        this.keys.saltKey = this._derive_single_key(masterKey, masterSalt, 2, 14)
    }

    _derive_single_key(masterKey:Buffer, masterSalt:Buffer, keyIndex:number, maxSize:number = 16){
        const pkt_i = 0
        const key_derivation_rate = 0

        if(masterKey.length != 16){
            throw Error('Masterkey is incorrect size')
        }
        if(masterSalt.length != 14){
            throw Error('Mastersalt is incorrect size')
        }

        const r = BigInt(0) // @TODO: Change this static value but we dont use of change this at all.

        // salt to int
        let saltInt = this._bytes_to_int(masterSalt)

        saltInt ^= BigInt(((BigInt(keyIndex) << BigInt(48)) + r))
        const prngValue = saltInt << BigInt(16)
        const iv = this._int_to_bytes(prngValue)
        const key = this._crypt_ctr_oneshot(masterKey, iv, Buffer.from('00'.repeat(16), 'hex'), maxSize)

        return key
    }




    _crypt_ctr_oneshot(masterKey:Buffer, iv:Buffer, plaintext:Buffer, maxSize:number){
        var cipher = crypto.createCipheriv("aes-128-ctr", masterKey, iv)
        const output = Buffer.concat([cipher.update(plaintext), cipher.final()]);

        return output.slice(0, maxSize)
    }

    _int_to_bytes(bigNumber:bigint){
        let result = new Uint8Array(16);
        let i = 0;
        while (bigNumber > BigInt(0)) {
            result[i] = Number(bigNumber % (BigInt(256)))
            bigNumber = bigNumber / (BigInt(256))
            i += 1;
        }
        return Buffer.from(result).reverse();
    }

    _bytes_to_int(buffer:any){
        buffer = Buffer.from(buffer, 'binary')
        var arr = Array.prototype.slice.call(buffer, 0)
        return arr.map(
            (el, index, { length }) => {
            return BigInt(el * (256 ** (length - (1+index))))
            }).reduce((prev, curr) => {
            return prev + curr;
        }, BigInt(0));
    }
}