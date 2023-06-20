import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { ipcRenderer } from 'electron'

import Menubar from '../components/layout/menubar'

import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {

  function appIpcHandler(event, args) {
    console.log('renderer/pages/_app.tsx: Received IPC [app] event:', args)

    if(args.type == 'loadFileData'){
      // PCAP File has been loaded. Lets load the File metadata into the gui.
      ipcRenderer.send('pcap', {
        type: 'openPacketList'
      })
    }
  }

  React.useEffect(() => {
    // console.log('renderer/pages/_app.tsx: Received IPC [app] event:', ipcRenderer)

    ipcRenderer.on('app', appIpcHandler)

    return () => {
      ipcRenderer.removeListener('app', appIpcHandler)
    }
  }, [])

  return <div id="app" className="min-h-full">
    <Menubar></Menubar>

    <Component {...pageProps} />
  </div>
}

export default MyApp
