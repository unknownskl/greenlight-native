import * as https from 'https'
import debug from 'debug'

const log = debug('xCloudApi')

interface xCloudApiOptions {
    ice_user: string;
    ice_pwd: string;
    interfaces: any;
}

export default class xCloudApi {

    _tokenxHome = ''
    _tokenxCloud = ''
    _cloudType = ''

    constructor(apikey:string, type?:'xhome'|'xcloud'){
        if(type === 'xhome'){
            this._tokenxHome = apikey
        } else {
            this._tokenxCloud = apikey
        }
    }

    startSession(type:'xhome'|'xcloud', entryId:string, options:xCloudApiOptions) {
        return new Promise((resolve, reject) => {
            
            if(type === 'xhome'){
                this._cloudType = 'home'
            } else {
                this._cloudType = 'cloud'
            }

            let configuration = {
                session: {},
                ice_client: {},
                ice_server: {},
            }

            // Start new session
            this._createSession(entryId).then((session:any) => {

                log(':: Start session ('+session.sessionId+'):')
                log(session)

                configuration.session = session

                // Wait for provisioned status
                this._stateReady(session.sessionId).then((session_status:any) => {
                    log(':: State response final (Console is ready):')
                    log(session_status)
                    configuration.session = { ...configuration.session, ...session_status }

                    this._isExchangeReady(session.sessionId, 'configuration').then((received_config:any) => {
                        log(':: Received configuration:')
                        log('CONFIG::', received_config)

                        configuration.session = { ...configuration.session, ...received_config }

                        // let ice_config = {
                        //     "Full":"1",
                        //     "PacingMs":"50",
                        //     "Version":"1",
                        //     "Candidates":{
                        //         "0": {
                        //             "transportAddress": options.teredo_address,
                        //             "baseAddress": "teredo",
                        //             "serverAddress":"",
                        //             "ipv6": 1,
                        //             "type": 4,
                        //             "addressType": 0,
                        //             "priority": "2130706431",
                        //             "foundation": "4041954136",
                        //             "transport":"udp"
                        //         },
                        //         "count": 1,
                        //     },
                        //     "Username": options.ice_user,
                        //     "Password": options.ice_pwd
                        // }

                        // log(ice_config)

                        const ice_config = {
                            "Full":"1",
                            "PacingMs":"50",
                            "Version":"1",
                            "Candidates":{
                               "count":0,
                            },
                            "Username": options.ice_user,
                            "Password": options.ice_pwd
                        }

                        for(const iface in options.interfaces){
                            // if(options.interfaces[iface].family !== "IPv4")
                            //     continue

                            // ice_config.Candidates[iface] = { // STUN REQUEST
                            ice_config.Candidates[iface] = { // STUN REQUEST
                                "transportAddress": options.interfaces[iface].address + ':' + options.interfaces[iface].port,
                                "baseAddress": options.interfaces[iface].address + ':' + options.interfaces[iface].port,
                                // "transportAddress":"192.168.178.129:64571",
                                // "baseAddress":"192.168.178.129:64571",
                                "serverAddress":"",
                                "ipv6": options.interfaces[iface].family === 'IPv6' ? '1':'0',
                                "type": "3",
                                "addressType": options.interfaces[iface].scopeid,
                                "priority":"2130705919",
                                "foundation":"1310976135",
                                "transport":"udp"
                            }
                        }
                        ice_config.Candidates.count = Object.keys(ice_config.Candidates).length-1

                        // log('Sending ice config:', ice_config)

                        configuration.ice_client = ice_config

                        this._sendIce(session.sessionId, ice_config).then((send_ice) => {
                            log(':: Send ICE')
                            log(send_ice, ice_config)

                            this._isExchangeReady(session.sessionId, 'ice').then((received_ice:any) => {
                                log(':: Received ICE Response')
                                log(received_ice)

                                const iceResponse = JSON.parse(received_ice.candidates)
                                log(iceResponse)

                                configuration.ice_server = iceResponse

                                resolve(configuration)

                            }).catch((error) => {
                                reject(error)
                            })
                            
                        }).catch((error) => {
                            reject(error)
                        })

                    }).catch((error) => {
                        reject(error)
                    })

                }).catch((error) => {
                    reject(error)
                })

            }).catch((error) => {
                reject(error)
            })
        })
    }

    getConsoles() {
        return new Promise((resolve, reject) => {

            this.getRequest('uks.gssv-play-prodxhome.xboxlive.com', '/v6/servers/home', {
                'Authorization': 'Bearer '+this._tokenxHome,

            }).then((json:any) => {
                resolve(json.results)

            }).catch((error) => {
                reject(error)
            })
        })
    }

    _createSession(entryId:string) {
        return new Promise((resolve, reject) => {
            this.postRequest('uks.gssv-play-prodxhome.xboxlive.com', '/v5/sessions/home/play', {
                'Authorization': 'Bearer '+ ((this._cloudType === 'home') ? this._tokenxHome : this._tokenxCloud),
            }, {
                "titleId": (this._cloudType === 'cloud') ? entryId : '',
                "systemUpdateGroup": "",
                "settings": {
                    "nanoVersion": "V3",
                    "enableTextToSpeech": false,
                    "highContrast": 0,
                    "locale": "en-US",
                    "useIceConnection": true,
                    "timezoneOffsetMinutes": 120,
                    "sdkType":"native",
                    "osName":"unknown",
                    "magnifier": false
                },
                "serverId": (this._cloudType === 'home') ? entryId : '',
                "fallbackRegionNames": [Array]

            }).then((json:any) => {
                resolve(json)

            }).catch((error) => {
                reject(error)
            })
        })
    }

    _stateReady(sessionId:string) {
        return new Promise((resolve, reject) => {
            this.getRequest('uks.gssv-play-prodxhome.xboxlive.com', '/v4/sessions/home/'+sessionId+'/state', {
                'Authorization': 'Bearer '+ ((this._cloudType === 'home') ? this._tokenxHome : this._tokenxCloud),
            }).then((json:any) => {

                log(':: State response:')
                log(json)

                if(json.state === 'Failed'){
                    reject(json.errorDetails)

                } else if(json.state === 'Provisioned'){
                    resolve(json)

                }  else {
                    setTimeout(() => {
                        this._stateReady(sessionId).then((json) => { resolve(json) }).catch((error) => { reject(error) })
                    }, 1000)
                }

            }).catch((error) => {
                reject(error)
            })
        })
    }

    _sendIce(sessionId:string, ice_config:any) {
        return new Promise((resolve, reject) => {
            this.postRequest('uks.gssv-play-prodxhome.xboxlive.com', '/v4/sessions/home/'+sessionId+'/ice', {
                'Authorization': 'Bearer '+ ((this._cloudType === 'home') ? this._tokenxHome : this._tokenxCloud),
            }, {
                "candidates": JSON.stringify(ice_config)
            }).then((json:any) => {
                resolve(json)
            }).catch((error) => {
                reject(error)
            })
        })
    }

    _isExchangeReady(sessionId:string, path:string) {
        // log(':: _isExchangeReady', sessionId, path)
        return new Promise((resolve, reject) => {
            this.getRequest('uks.gssv-play-prodxhome.xboxlive.com', '/v4/sessions/home/'+sessionId+'/'+path, {
                'Authorization': 'Bearer '+ ((this._cloudType === 'home') ? this._tokenxHome : this._tokenxCloud),
            }).then((json:any) => {

                if(json.errorDetails !== undefined && json.errorDetails.code !== null){
                    reject(json.errorDetails)

                } else if(json.errorDetails !== undefined ){
                    resolve(json)

                } else if(json.serverDetails !== undefined ){
                    resolve(json)

                } else if(json.candidates !== undefined ){
                    resolve(json)

                }  else {
                    setTimeout(() => {
                    // log(':: _isExchangeReady result', json)

                        this._isExchangeReady(sessionId, path).then((json) => { resolve(json) }).catch((error) => { reject(error) })
                    }, 1000)
                }

            }).catch((error) => {
                reject(error)
            })
        })
    }

    getRequest(host, path, headers) {
        return new Promise((resolve, reject) => {

            const hostHeaders = {
                'Content-Type': 'application/json',
                ...headers,
            }

            const options = {
                method: 'GET',
                hostname: host,
                path: path,
                port: 443,
                headers: hostHeaders
            }

            const req = https.request(options, (res) => {
                let responseData = ''
                
                res.on('data', (data) => {
                    responseData += data
                })

                res.on('close', () => {
                    if(res.statusCode == 200 || res.statusCode == 204){
                        if(responseData.toString() === ''){
                            resolve({})
                        } else {
                            resolve(JSON.parse(responseData.toString()))
                        }
                    } else {
                        reject({
                            statuscode: res.statusCode,
                            body: responseData.toString(),
                            message: 'Error fetching '+host+path
                        })
                    }
                })
            })
            
            req.on('error', (error) => {
                reject(error)
            })

            req.end()

        })
    }

    postRequest(host, path, headers, data) {
        return new Promise((resolve, reject) => {

            const hostHeaders = {
                'Content-Type': 'application/json',
                ...headers,
            }

            if(typeof data === 'object'){
                data = JSON.stringify(data)
            }

            const options = {
                method: 'POST',
                hostname: host,
                path: path,
                port: 443,
                headers: hostHeaders
            }

            // log(options)

            const req = https.request(options, (res) => {
                let responseData = ''
                
                res.on('data', (data) => {
                    responseData += data
                })

                res.on('close', () => {
                    if(res.statusCode == 200 || res.statusCode == 202){
                        if(responseData.toString() === ''){
                            resolve({})
                        } else {
                            resolve(JSON.parse(responseData.toString()))
                        }
                    } else {
                        reject({
                            statuscode: res.statusCode,
                            body: responseData.toString(),
                            message: 'Error fetching '+host+path
                        })
                    }
                })
            })
            
            req.on('error', (error) => {
                reject(error)
            })

            req.write(data)
            req.end()

        })
    }

    getSdpValue(sdp:string, key:string){
        const regex = new RegExp("a=" + key + ":(.*)$", "gm");
        const result = sdp.match(regex)
        
        if(result !== null && result.length > 0){
            return result

        } else {
            return false
        }
    }

    parseIceCandidate(candidate){
        const parsedCandidate = candidate.candidate.split(' ')

        if(parsedCandidate.length > 1){
            return {
                type: parsedCandidate[2],
                host: parsedCandidate[4],
                port: parsedCandidate[5],
            }
            
        } else {
            return false
        }
    }











    requestxHomeToken(streamingToken){
        return new Promise((resolve, reject) => {
            console.log('authentication', __filename+'[requestxHomeToken()] Requesting xHome streaming tokens')

            // Get xHomeStreaming Token
            const data = JSON.stringify({
                "token": streamingToken,
                "offeringId": "xhome"
            })
        
            const options = {
                hostname: 'xhome.gssv-play-prod.xboxlive.com',
                method: 'POST',
                path: '/v2/login/user',
            }

            this.request(options, data).then((response:any) => {

                resolve(response)
            }).catch((error) => {
                console.log('authentication', __filename+'[requestxHomeToken()] xHome token retrieval error:', error)
                reject(error)
            })
        })
    }

    requestxCloudToken(streamingToken){
        return new Promise((resolve, reject) => {
            console.log('authentication', __filename+'[requestxHomeToken()] Requesting xHome streaming tokens')

            // Get xHomeStreaming Token
            const data = JSON.stringify({
                "token": streamingToken,
                "offeringId": "xgpuweb"
            })
        
            const options = {
                hostname: 'xgpuweb.gssv-play-prod.xboxlive.com',
                method: 'POST',
                path: '/v2/login/user',
            }

            this.request(options, data).then((response:any) => {
                resolve(response)
            }).catch((error) => {
                console.log('authentication', __filename+'[requestxHomeToken()] xCloud token retrieval error:', error)
                reject(error)
            })
        })
    }

    request(options, data, headers = {}) {

        return new Promise((resolve, reject) => {
            const reqOptions = {
                hostname: '',
                port: 443,
                path: '',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': data.length,
                    'x-gssv-client': 'XboxComBrowser',
                    ...headers,
                },
                ...options
            }
            const req = https.request(reqOptions, (res) => {
                let responseData = ''
                
                res.on('data', (data) => {
                    responseData += data
                })
        
                res.on('close', () => {
                    if(res.statusCode == 200){
                        const response = JSON.parse(responseData.toString())
        
                        resolve(response)
                    } else {
                        console.log('authentication', __filename+'[request()] Request error ['+res.statusCode+']', responseData.toString())
                        reject({
                            status: res.statusCode,
                            body: responseData.toString()
                        })
                    }
                })
            })
            
            req.on('error', (error) => {
                reject({
                    error: error
                })
            })

            req.write(data)
            req.end()
        })
    }
}