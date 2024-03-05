import xCloudApi from 'greenlight-xcloud'
import StunServer from 'greenlight-stun'
import GameStreaming from 'greenlight-gamestreaming'
import { Xal, TokenStore } from 'xal-node'
import path from 'path'
console.log('Hello from greenlight-client-poc')

// Setup Node-Xal
const tokenStore = new TokenStore()
console.log('Load existing file:', tokenStore.load(path.join(__dirname, '../..', '.xbox.tokens.json')))

const xalAuth = new Xal()
if(tokenStore._jwtKeys){
    xalAuth.setKeys(tokenStore._jwtKeys.jwt).then((keys) => {
        // Get XSTS Token
        xalAuth.doXstsAuthorization(tokenStore._sisuToken?.data, 'http://gssv.xboxlive.com/').then((xstsToken) => {
            xalAuth.getStreamToken(xstsToken, 'xhome').then((xhomeToken) => {
                const apiClient = new xCloudApi(xhomeToken.data.gsToken, 'xhome')

                apiClient.getConsoles().then((consoles) => {
                    console.log(':: Get consoles:')
                    console.log(consoles)

                    const stun = new StunServer({
                        ice_user: '+1+OwRqT3Fs=',
                        ice_pwd: 'Pb0Abn9Lh0Zgy4WArNkJSfciloWd6JSQR\\/J2pzq1Dyg='
                    })

                    stun.listen().then((stunInterfaces) => {
                        // console.log(':: Stun Servers created:')
                        // console.log(stunInterfaces)

                        apiClient.startSession('xhome', 'F400000000000000', {
                            ice_user: stun.getIceCredentials().ice_user,
                            ice_pwd: stun.getIceCredentials().ice_pwd,
                            interfaces: stunInterfaces
                        }).then((configuration:any) => {
                            // console.log(':: Stream configuration:')
                            // console.log(configuration.ice_server)

                            stun.setIceRemoteCredentials(configuration.ice_server.Username, configuration.ice_server.Password)
                            stun.setOnConnectionReady((socket, address, port) => {
                                const GSClient = new GameStreaming(socket, address, port, configuration.session.serverDetails.srtp.key)
                            })
                        }).catch((error) => {
                            console.log('startSession error:', error)
                        })

                    }).catch((error) => {
                        console.log('stun error:', error)
                    })

                    

                }).catch((error) => {
                    console.log('Failed to fetch consoles:', error)
                })

            }).catch((error) => {
                console.log('Failed to get stream token:', error)
            })
        }).catch((error) => {
            console.log('Failed to get stream token:', error)
        })
        
    }).catch((error) => {
        console.log('Failed to load keys:', error, 'Please reset authentication by removing the .xbox.tokens.json file')
    })
} else {
    console.log('No JWT Keys found:', tokenStore)
}