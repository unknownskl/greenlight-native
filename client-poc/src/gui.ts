import xCloudApi from 'greenlight-xcloud'
import StunServer from 'greenlight-stun'
import GameStreaming from 'greenlight-gamestreaming'
import * as sdl from '@kmamal/sdl'
import { Xal, TokenStore } from 'xal-node'

import Ffmpeg from './helper/ffmpeg'
import * as fs from 'fs'
import path from 'path'

// Setup Node-Xal
const tokenStore = new TokenStore()
console.log('Load existing file:', tokenStore.load(path.join(__dirname, '../..', '.xbox.tokens.json')))

const xalAuth = new Xal()
if(tokenStore._jwtKeys){
    xalAuth.setKeys(tokenStore._jwtKeys.jwt).then((keys) => {
        // Get XSTS Token
        xalAuth.doXstsAuthorization(tokenStore._sisuToken?.data, 'http://gssv.xboxlive.com/').then((xstsToken) => {
            xalAuth.getStreamToken(xstsToken, 'xhome').then((xhomeToken) => {
                // console.log('Retrieved token:', xhomeToken.data.gsToken)

                const apiClient = new xCloudApi(xhomeToken.data.gsToken, 'xhome')

                apiClient.getConsoles().then((consoles) => {
                    console.log(':: Get consoles:', consoles)

                    const stun = new StunServer({
                        ice_user: '+1+OwRqT3Fs=',
                        ice_pwd: 'Pb0Abn9Lh0Zgy4WArNkJSfciloWd6JSQR\\/J2pzq1Dyg='
                    })

                    stun.listen().then((stunInterfaces) => {
                        apiClient.startSession('xhome', 'F400000000000000', {
                            ice_user: stun.getIceCredentials().ice_user,
                            ice_pwd: stun.getIceCredentials().ice_pwd,
                            interfaces: stunInterfaces
                        }).then((configuration:any) => {
                            // console.log(':: Stream configuration:')
                            // console.log(configuration.ice_server)

                            // Create new gui window
                            const window = sdl.video.createWindow({ width: 1280, height: 720, title: "Greenlight" })

                            const ffmpeg = new Ffmpeg()
                            ffmpeg.loadSource({
                                width: 1280,
                                height: 720,
                                framerate: 60,
                            }, (data) => {
                                window.render(1280, 720, 1280*3, 'rgb24', data)
                            })

                            stun.setIceRemoteCredentials(configuration.ice_server.Username, configuration.ice_server.Password)
                            stun.setOnConnectionReady((socket, address, port) => {
                                const GSClient = new GameStreaming(socket, address, port, configuration.session.serverDetails.srtp.key)

                                GSClient.events.on('video_frame', (frame) => {

                                    ffmpeg.write(frame.data)
                                })

                                // const playbackInstance = sdl.audio.openDevice({ type: 'playback' }, { buffered: 128 })
                                // playbackInstance.play()

                                GSClient.events.on('audio_frame', (frame) => {
                                    // @TODO: Implement audio
                                })

                                window.on('keyUp', (e) => {
                                    // console.log('keyUp:', e)
                                    processButton(e)
                                })

                                window.on('keyDown', (e) => {
                                    // console.log('keyDown:', e)
                                    processButton(e)
                                })

                                function processButton(e){
                                    switch(e.key){
                                        case 'up':
                                            GSClient.channels.input._gamepad.sendButtonState('dpad_up', (e.type === 'keyDown'))
                                            break;
                                        case 'down':
                                            GSClient.channels.input._gamepad.sendButtonState('dpad_down', (e.type === 'keyDown'))
                                            break;
                                        case 'left':
                                            GSClient.channels.input._gamepad.sendButtonState('dpad_left', (e.type === 'keyDown'))
                                            break;
                                        case 'right':
                                            GSClient.channels.input._gamepad.sendButtonState('dpad_right', (e.type === 'keyDown'))
                                            break;
                                        
                                        case 'return':
                                            GSClient.channels.input._gamepad.sendButtonState('a', (e.type === 'keyDown'))
                                            break;
                                        case 'backspace':
                                            GSClient.channels.input._gamepad.sendButtonState('b', (e.type === 'keyDown'))
                                            break;
                                        case 'x':
                                            GSClient.channels.input._gamepad.sendButtonState('x', (e.type === 'keyDown'))
                                            break;
                                        case 'y':
                                            GSClient.channels.input._gamepad.sendButtonState('y', (e.type === 'keyDown'))
                                            break;
                                        case 'n':
                                            GSClient.channels.input._gamepad.sendButtonState('nexus', (e.type === 'keyDown'))
                                            break;

                                        case 'm':
                                            GSClient.channels.input._gamepad.sendButtonState('start', (e.type === 'keyDown'))
                                            break;
                                        case 'v':
                                            GSClient.channels.input._gamepad.sendButtonState('select', (e.type === 'keyDown'))
                                            break;
                                    }
                                }
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

// // Retrieve token
// const dummyApi = new xCloudApi('', 'xhome')
// dummyApi.requestxHomeToken(require('../../.xbox.tokens.json').xsts_token.Token).then((tokens:any) => {

//     const apiClient = new xCloudApi(tokens.gsToken, 'xhome')

//     apiClient.getConsoles().then((consoles) => {
//         console.log(':: Get consoles:', consoles)

//         const stun = new StunServer({
//             ice_user: '+1+OwRqT3Fs=',
//             ice_pwd: 'Pb0Abn9Lh0Zgy4WArNkJSfciloWd6JSQR\\/J2pzq1Dyg='
//         })

//         stun.listen().then((stunInterfaces) => {
//             apiClient.startSession('xhome', 'F4000EEB7F3EF52A', {
//                 ice_user: stun.getIceCredentials().ice_user,
//                 ice_pwd: stun.getIceCredentials().ice_pwd,
//                 interfaces: stunInterfaces
//             }).then((configuration:any) => { // One: FD0048D02C570DF8, Series S: F4001ED24E92B799, Series X: F4000EEB7F3EF52A
//                 // console.log(':: Stream configuration:')
//                 // console.log(configuration.ice_server)

//                 // Create new gui window
//                 const window = sdl.video.createWindow({ width: 1280, height: 720, title: "Greenlight" })

//                 const ffmpeg = new Ffmpeg()
//                 ffmpeg.loadSource({
//                     width: 1280,
//                     height: 720,
//                     framerate: 60,
//                 }, (data) => {
//                     window.render(1280, 720, 1280*3, 'rgb24', data)
//                 })

//                 stun.setIceRemoteCredentials(configuration.ice_server.Username, configuration.ice_server.Password)
//                 stun.setOnConnectionReady((socket, address, port) => {
//                     const GSClient = new GameStreaming(socket, address, port, configuration.session.serverDetails.srtp.key)

//                     GSClient.events.on('video_frame', (frame) => {

//                         ffmpeg.write(frame.data)
//                     })

//                     // const playbackInstance = sdl.audio.openDevice({ type: 'playback' }, { buffered: 128 })
//                     // playbackInstance.play()

//                     GSClient.events.on('audio_frame', (frame) => {
//                         // @TODO: Implement audio
//                     })

//                     window.on('keyUp', (e) => {
//                         // console.log('keyUp:', e)
//                         processButton(e)
//                     })

//                     window.on('keyDown', (e) => {
//                         // console.log('keyDown:', e)
//                         processButton(e)
//                     })

//                     function processButton(e){
//                         switch(e.key){
//                             case 'up':
//                                 GSClient.channels.input._gamepad.sendButtonState('dpad_up', (e.type === 'keyDown'))
//                                 break;
//                             case 'down':
//                                 GSClient.channels.input._gamepad.sendButtonState('dpad_down', (e.type === 'keyDown'))
//                                 break;
//                             case 'left':
//                                 GSClient.channels.input._gamepad.sendButtonState('dpad_left', (e.type === 'keyDown'))
//                                 break;
//                             case 'right':
//                                 GSClient.channels.input._gamepad.sendButtonState('dpad_right', (e.type === 'keyDown'))
//                                 break;
                            
//                             case 'return':
//                                 GSClient.channels.input._gamepad.sendButtonState('a', (e.type === 'keyDown'))
//                                 break;
//                             case 'backspace':
//                                 GSClient.channels.input._gamepad.sendButtonState('b', (e.type === 'keyDown'))
//                                 break;
//                             case 'x':
//                                 GSClient.channels.input._gamepad.sendButtonState('x', (e.type === 'keyDown'))
//                                 break;
//                             case 'y':
//                                 GSClient.channels.input._gamepad.sendButtonState('y', (e.type === 'keyDown'))
//                                 break;
//                             case 'n':
//                                 GSClient.channels.input._gamepad.sendButtonState('nexus', (e.type === 'keyDown'))
//                                 break;

//                             case 'm':
//                                 GSClient.channels.input._gamepad.sendButtonState('start', (e.type === 'keyDown'))
//                                 break;
//                             case 'v':
//                                 GSClient.channels.input._gamepad.sendButtonState('select', (e.type === 'keyDown'))
//                                 break;
//                         }
//                     }
//                 })
//             }).catch((error) => {
//                 console.log('startSession error:', error)
//             })

//         }).catch((error) => {
//             console.log('stun error:', error)
//         })

//     }).catch((error) => {
//         console.log('Failed to fetch consoles:', error)
//     })

// }).catch((error) => {
//    console.log('Failed to refresh token:', error)
// })