# Greenlight-Native

This project is a client for the Xbox in-home streaming protocol. (Also known as Nano V3).

#### This project is research material. The client is working but very unoptimised and lot of features are not implemented. Do not expect an optimised client out of this project.

## Setup project

Requirements:
- Nodejs LTS
- Yarn
- FFMpeg

### Instructions

Install dependencies first:

    yarn

Login with your xbox account to authenticate:

    yarn auth

Then edit `client-poc/src/gui.ts` and change your consoleid on line `34`.

After changing the above you can compile the script to a packed js file and run it via:

    yarn start:gui

## Project structure

| Folder | Description |
|--------|-------------|
| client-poc | CLI App which interacts with the libraries and renders the stream via node-sdl. |
| client-pcap | Simple PCAP reader. (very bare, comes with a gui and tool to convert your pcap to a video) |
| packages/gamestreaming | Actual game streaming logic |
| packages/gamestreaming-protocol | Library for reading and writing nano packets |
| packages/rtp | Code for reading and creating RTP Packets |
| packages/stun | Wrapper for node stun lib including fetching active interfaces |
| packages/teredo | Teredo library for routing data over Teredo (Not working/dummy package) |
| packages/xcloud | Holds the xcloud library (API client) |

## FAQ

### Render video

You can convert the video output by running the following ffmpeg command:

    ffmpeg -i client-poc/video.mp4 -vcodec libx264 ./video.mp4

or by running:

    make pcap_video

### Render audio

Dumping audio data is not implemented yet.

### Retrieve session SRTP key

You can retrieve the current session SRTP key by searching for 'SRTP' in the output. The key will be printed once every second to the output.