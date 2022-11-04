# Greenlight-Native

This project is a client for the Xbox in-home streaming protocol. (Also known as Nano V3).

## Setup project

Requirements:
- Nodejs LTS
- Yarn

### Instructions

Install dependencies first:

    yarn

Then edit `client-poc/src/index.ts` and fill-in the xbox streaming token on line `7`. Also change your consoleid on line `24`.

After changing the above you can compile the script to a packed js file and run it via:

    yarn dev

## Project structure

| Folder | Description |
|--------|-------------|
| client-poc | CLI App which interacts with the libraries. |
| packages/gamestreaming | Actual game streaming logic |
| packages/rtp | Code for reading and creating RTP Packets |
| packages/stun | Wrapper for node stun lib including fetching active interfaces |
| packages/teredo | Teredo library for routing data over Teredo (Not working/dummy package) |
| packages/xcloud | Holds the xcloud library (API client) |

| Folder | Description |
|--------|-------------|
| packages/gamestreaming/src/channels | Channel logic |
| packages/gamestreaming/src/lib | Contains helpers |
| packages/gamestreaming/src/packets | Packet formats, note though that this is not the ideal way. The packets have a certain format based on the RTP payload type. (Needs refactor) |

## FAQ

### Render video

You can convert the video output by running the following ffmpeg command:

    ffmpeg -i client-poc/video.mp4 -vcodec libx264 ./video.mp4

### Render audio

Dumping audio data is not implemented yet.

### Retrieve session SRTP key

You can retrieve the current session SRTP key by searching for 'SRTP' in the output. The key will be printed once every second to the output.