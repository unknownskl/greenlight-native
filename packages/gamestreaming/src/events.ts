import * as EventEmitter from 'events'
import GameStreaming from '.'

export default class Events extends EventEmitter {
    application = GameStreaming
    
    constructor(application){
        super()

        this.application = application
    }
}