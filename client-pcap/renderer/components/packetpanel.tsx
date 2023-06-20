import React from 'react';
import { ipcRenderer } from 'electron'
import hexy from 'hexy'

interface PacketpanelProps {
  onClick?: () => void;
}

function Packetpanel({
  onClick,
  ...props
}: PacketpanelProps) {

  const [packet, setPacket] = React.useState([]);

  function appIpcHandler(event, args) {
    console.log('renderer/components/Packetpanel.tsx: Received IPC [Packetpanel] event:', args)

    if(args.type == 'loadPacket'){
      console.log('Received packet data:', args)
      setPacket(args)
    }
  }

  React.useEffect(() => {
    ipcRenderer.on('packetpanel', appIpcHandler)

    return () => {
      ipcRenderer.removeListener('packetpanel', appIpcHandler)
    }
  }, [])

  let renderPayload = (packet?.data?.decrypted_payload) ? Buffer.from(packet?.data?.decrypted_payload, 'hex') : packet?.data?.data;

  return (
    <React.Fragment>
        <div id="app_packetpanel">
            <div id="app_packetpanel_left">
                <h2>Raw data:</h2>

                <div id="app_packetlist_raw">
                    <pre>{ JSON.stringify(packet, null, 4) }</pre>
                </div>

                <h2>Decoded payload:</h2>

                <div id="app_packetlist_decrypted">
                    <div dangerouslySetInnerHTML={{ __html: hexy.hexy(renderPayload, { html: true}) }}></div>
                </div>
            </div>

            <div id="app_packetpanel_right">
                <h2>New protocol</h2>

                <div id="app_packetlist_gs_new">
                    <pre>{ JSON.stringify(packet?.data?.gs_payload, null, 4) }</pre>
                </div>
            </div>
            
        </div>
    </React.Fragment>
  );
};

export default Packetpanel;