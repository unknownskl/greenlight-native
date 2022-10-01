import xCloudApi from 'greenlight-xcloud'
import StunServer from 'greenlight-stun'
import GameStreaming from 'greenlight-gamestreaming'

console.log('Hello from greenlight-client-poc')

const apiClient = new xCloudApi('ey...', 'xhome')

// console.log('apiClient:', apiClient)

apiClient.getConsoles().then((consoles) => {
    console.log(':: Get consoles:')
    console.log(consoles)

    const stun = new StunServer({
        ice_user: '+1+OwRqT3Fs=',
        ice_pwd: 'Pb0Abn9Lh0Zgy4WArNkJSfciloWd6JSQR\\/J2pzq1Dyg='
    })

    stun.listen('en0').then((stunInterfaces) => {
        // console.log(':: Stun Servers created:')
        // console.log(stunInterfaces)

        apiClient.startSession('xhome', 'F4000EEB7F3EF52A', {
            ice_user: stun.getIceCredentials().ice_user,
            ice_pwd: stun.getIceCredentials().ice_pwd,
            interfaces: stunInterfaces
        }).then((configuration:any) => { // One: FD0048D02C570DF8, Series S: F4001ED24E92B799, Series X: F4000EEB7F3EF52A
            // console.log(':: Stream configuration:')
            // console.log(configuration.ice_server)

            stun.setIceRemoteCredentials(configuration.ice_server.Username, configuration.ice_server.Password)
            stun.setOnConnectionReady((socket, address, port) => {
                const GSClient = new GameStreaming(socket, address, port, configuration.session.serverDetails.srtp.key)
            })
        })

    }).catch((error) => {
        console.log('stun error:', error)
    })

    

}).catch((error) => {
    console.log('Failed to fetch consoles:', error)
})

