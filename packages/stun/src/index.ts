import * as os from 'os'
import * as udp from 'dgram'
import EventEmitter = require('events');
const stun = require('stun')
const { STUN_BINDING_RESPONSE, STUN_EVENT_BINDING_REQUEST, STUN_BINDING_REQUEST, STUNE_EVENT_BINDING_RESPONSE } = stun.constants;


interface StunServerOptions {
    ice_user?: string;
    ice_pwd?: string;
    port?: number
}

interface StunServersArray {
    address: string;
    family: string;
    iface: string;
    port: number;
    scopeid: number;
    stunServer:any,
    socket: udp.Socket;
}

export default class StunServer {

    // What does this do?
    // - Create udp sockets on all listening interfaces
    // - Returns the ip + port to the client
    // - Has the ability to detect stun timeouts and close the socket.
    // - Eventually in the future we can use this socket to relay data to teredo

    options:StunServerOptions
    stun_servers:Array<StunServersArray> = []

    ice_remote_credentials = {
        ice_user: '',
        ice_pwd: '',
    }
    on_connection_ready

    constructor(options?:StunServerOptions){
        this.options = {
            port: 54670,
            ...options
        }
    }

    listen(eth_iface?:string){
        return new Promise((resolve, reject) => {

            const interfaces = this.discoverInterfaces(eth_iface)

            for(const iface in interfaces){
                let socket
                let stunserver

                if(interfaces[iface].family === 'IPv4'){
                    socket = udp.createSocket('udp4')
                    socket.bind({
                        address: interfaces[iface].address,
                        port: interfaces[iface].port,
                        exclusive: false
                    })
                    stunserver = stun.createServer({
                        'type': 'udp4',
                        'socket': socket
                    })
                } else {
                    socket = udp.createSocket('udp6')
                    socket.bind({
                        address: interfaces[iface].address + '%' + interfaces[iface].iface,
                        port: interfaces[iface].port,
                        exclusive: false
                    })
                    stunserver = stun.createServer({
                        'type': 'udp6',
                        'socket': socket
                    })
                }

                stunserver.once(STUN_EVENT_BINDING_REQUEST, (request, rinfo) => {
                    this.onBindingRequest(socket, stunserver, request, rinfo)
                })

                this.stun_servers.push({
                    ...interfaces[iface],
                    stunServer: stunserver,
                    socket: socket,
                })
            }

            resolve(this.stun_servers)
        })
    }

    discoverInterfaces(pref_iface?:string){
        let networkInterfaces = os.networkInterfaces()
        const interfaces = []

        for(const iface in networkInterfaces){
            if(pref_iface !== undefined && pref_iface !== iface)
                continue

            for(const iface_addr in networkInterfaces[iface]){
                if(networkInterfaces[iface][iface_addr].internal === true)
                    continue

                interfaces.push({
                    address: networkInterfaces[iface][iface_addr].address,
                    family: networkInterfaces[iface][iface_addr].family,
                    iface: iface,
                    port: (this.options.port + interfaces.length),
                    scopeid: networkInterfaces[iface][iface_addr].scopeid || 0
                })
            }
        }

        return interfaces
    }

    getIceCredentials(){
        return {
            ice_user: this.options.ice_user,
            ice_pwd: this.options.ice_pwd,
        }
    }

    setIceRemoteCredentials(ice_user, ice_pwd){
        this.ice_remote_credentials.ice_user = ice_user
        this.ice_remote_credentials.ice_pwd = ice_pwd
    }

    onBindingRequest(socket, stunServer, request, rinfo){
        const validated = stun.validateMessageIntegrity(request, this.options.ice_pwd)
        if(! validated){
            console.log('Warning: Message integrity validation failed. Result:', validated, 'Dropping request...')
            return
        }

        if(this.ice_remote_credentials.ice_pwd === ''){
            stunServer.once(STUN_EVENT_BINDING_REQUEST, (request, rinfo) => {
                this.onBindingRequest(socket, stunServer, request, rinfo)
            })
            return // Ignore as we dont have an config ready yet.
        }

        const ice_remote_user = request.getAttribute(6).value.toString()
        const ice_credentials = ice_remote_user.split(':').reverse().join(':')
        const tiebreaker = Buffer.from('89ec5f417241e2d2', 'hex')

        // Send binding request
        const stun_request = stun.createMessage(STUN_BINDING_REQUEST)
        stun_request.addPriority(123)
        stun_request.addIceControlling(tiebreaker)
        stun_request.addUsername(ice_credentials)
        stun_request.addMessageIntegrity(this.ice_remote_credentials.ice_pwd)

        stunServer.send(stun_request, rinfo.port, rinfo.address)

        // Send binding response
        const stun_response = stun.createMessage(STUN_BINDING_RESPONSE, request.transactionId)
        stun_response.addAddress(rinfo.address, rinfo.port)
        stun_response.addXorAddress(rinfo.address, rinfo.port)
        stun_response.addMessageIntegrity(this.ice_remote_credentials.ice_pwd)
    
        stunServer.send(stun_response, rinfo.port, rinfo.address)

        // Send new request with use-candidate set
        setTimeout(() => {
            const stun_message_candidate = stun.createMessage(STUN_BINDING_REQUEST)
            stun_message_candidate.addPriority(123)
            stun_message_candidate.addIceControlling(tiebreaker)
            stun_message_candidate.addUsername(ice_credentials)
            stun_message_candidate.addUseCandidate()
            stun_message_candidate.addMessageIntegrity(this.ice_remote_credentials.ice_pwd)

            stunServer.send(stun_message_candidate, rinfo.port, rinfo.address)

            stunServer.once(STUN_EVENT_BINDING_REQUEST, (controlled_request, rinfo_c) => {
                // We have received a request back from the console. We have a working connection.
                const message = stun.createMessage(STUN_BINDING_RESPONSE, controlled_request.transactionId)
            
                message.addAddress(rinfo.address, rinfo_c.port);
                message.addXorAddress(rinfo.address, rinfo_c.port);
                message.addMessageIntegrity(this.ice_remote_credentials.ice_pwd)
            
                stunServer.send(message, rinfo_c.port, rinfo_c.address);

                // Start UDP Client?
                this.onConnectionReady(socket, rinfo_c.address, rinfo_c.port)

                setTimeout(() => {
                    for(const server in this.stun_servers){
                        // console.log(this.stun_servers[server].socket)

                        if(this.stun_servers[server].stunServer._eventsCount > 0){
                            // console.log('Eventcount is:', this.stun_servers[server].stunServer._eventsCount, 'Closing socket..')
                            this.stun_servers[server].stunServer.close()
                        } else {
                            // console.log('Keeping socket alive: ', this.stun_servers[server].stunServer)
                        }
                    }
                }, 5000)
            })
        }, 500)
    }

    onConnectionReady(socket:udp.Socket, address:string, port:number){
        if(this.on_connection_ready !== undefined){
            this.on_connection_ready(socket, address, port)
        }
    }

    setOnConnectionReady(callback){
        this.on_connection_ready = callback
    }
}