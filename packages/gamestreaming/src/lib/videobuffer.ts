import EventEmitter = require("events")

export interface Framedata {
    frameId:string
    totalSize:number
    offset:number
    data:Buffer
    metadata:Buffer
}

export default class Videobuffer {

    _videoBuffer = Buffer.from('')
    _lastFrameId

    _events = new EventEmitter()

    _frames = <any>{}
    _frameNums = <any>[]

    addFrame(frame:Framedata){

        if(this._frames[frame.frameId] === undefined){

            let bufferPadding = 0
            if(frame.data.length == frame.totalSize){
                // Add metadata to data
                bufferPadding = 9
            }

            // Insert new frame
            this._frames[frame.frameId] = {
                buffer: Buffer.alloc(frame.totalSize+bufferPadding),
                size: frame.totalSize,
                metadata: frame.metadata,
                received: 0
            }
        }

        const videodata = Buffer.concat([
            frame.metadata,
            frame.data,
        ])
        videodata.copy(this._frames[frame.frameId].buffer, frame.offset)
        this._frames[frame.frameId].received += frame.data.length

        if(this._frames[frame.frameId].received == this._frames[frame.frameId].size){

            // Drop frame if old
            // if(frame.frameId <= (this._lastFrameId))
            //     if(this._frames[frame.frameId].received < this._frames[frame.frameId].size)
            //         return

            // Completed a frame. Lets send it to the buffer.
            this._videoBuffer = Buffer.concat([
                this._videoBuffer,
                this._frames[frame.frameId].buffer //.slice(6)
            ])
            
            const frameEvent = {
                metadata: this._frames[frame.frameId].metadata,
                data: this._frames[frame.frameId].buffer
            }

            delete this._frames[frame.frameId]

            // if(frame.frameId <= (this._lastFrameId))
            //     this._frameNums.push(-frame.frameId)
            // else
                this._frameNums.push(frame.frameId)

            // console.log(frame.frameId, this._lastFrameId)
            // if(frame.frameId <= (this._lastFrameId)){
            //     throw new Error('SORT ERROR')
            // } else {
            this._lastFrameId = frame.frameId
            // }

            this.emit('frame', frameEvent)

        }
    }

    getBuffer() {
        return this._videoBuffer
    }

    on(eventName, listener){
        return this._events.on(eventName, listener)
    }

    once(eventName, listener){
        return this._events.once(eventName, listener)
    }

    emit(eventName, ...args){
        return this._events.emit(eventName, ...args)
    }
}