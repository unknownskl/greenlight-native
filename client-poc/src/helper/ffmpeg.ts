import ffmpeg from 'ffmpeg-static'
import { spawn } from 'child_process'

export default class Ffmpeg {

    _source

    loadSource = ({ width, height, framerate }, callback) => {
        console.log('ffmpeg:', ffmpeg)
        const proc = spawn(
            ffmpeg,
            [
                [ '-i', 'fd:' ],
                ['-fflags', 'nobuffer'],
                ['-flags', 'low_delay'],
                '-filter:v',
                [
                    framerate && `fps=fps=${framerate}`,
                    `scale=${width}:${height}`,
                    'format=pix_fmts=rgb24',
                    // 'setpts=100',
                ].filter(Boolean).join(','),
                [ '-f', 'rawvideo' ],
                '-',
            ].flat(),
        )
    
        const frameSize = width * height * 3
        const frames = []
        let chunks = []
        let size = 0
    
        const append = (data) => {
            const end = frameSize - size
            const chunk = data.slice(0, end)
            chunks.push(chunk)
            size += chunk.length
    
            if (size === frameSize) {
                // frames.push(Buffer.concat(chunks))
                callback(Buffer.concat(chunks))
                chunks = []
                size = 0
                append(data.slice(end))
            }
        }
    
        proc.stdout.on('data', append)

        proc.stderr.on('data', function(data) {
            console.log('ffmpeg error: ' + data);
        });

        proc.on('close', (code) => {
			console.log(code)
            // callback(Buffer.concat(frames))
		})

        this._source = proc
    }

    write(data){
        this._source.stdin.write(data)
    }

    close(){
        this._source.kill()
    }
}