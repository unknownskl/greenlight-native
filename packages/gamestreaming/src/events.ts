import * as EventEmitter from 'events'
import GameStreaming from './index'

export default class Events extends EventEmitter {
    application:GameStreaming

    srtpInterval
    
    constructor(application:GameStreaming){
        super()

        this.application = application

        // SRTP Key handler to print out key to console
        this.srtpInterval = setInterval(() => {
            console.log('-- 1 sec interval. SRTP:', this.application.target.srtpkey)
        }, 1000)

        setInterval(() => {
            console.log('App class: ', this.application)
        }, 1000)

        // Exit handler
        let callAmount = 0;
        process.on('SIGINT', () => {
            if(callAmount < 1) {
                console.log('Gracefully exiting client...')
                this.application.close()
                
                // this.emit('application_disconnect', {})
                // fs.writeFileSync('./video.mp4', this.channels.VideoChannel._videoBuffer.getBuffer(), { flag: 'w+' })

                setTimeout(() => this.application.exit(0), 1000);
            }
        });
    }

    close(){
        clearInterval(this.srtpInterval)
    }
}