import React from 'react';
import { ipcRenderer } from 'electron'

interface PacketlistProps {
  onClick?: () => void;
}

function Packetlist({
  onClick,
  ...props
}: PacketlistProps) {

  const [packetList, setPacketList] = React.useState([]);

  function appIpcHandler(event, args) {
    console.log('renderer/components/packetlist.tsx: Received IPC [packetlist] event:', args)

    if(args.type == 'loadPacketList'){
      console.log('Received list:', args.data)
      setPacketList(args.data)
    }
  }

  function selectPacket(id){
    console.log('Select packet id:', id)

    ipcRenderer.send('pcap', {
      type: 'openPacketId',
      id: id
    })
  }

  React.useEffect(() => {
    ipcRenderer.on('packetlist', appIpcHandler)

    return () => {
      ipcRenderer.removeListener('packetlist', appIpcHandler)
    }
  }, [])

  return (
    <React.Fragment>
        <div id="app_packetlist">
            <ul>
              {packetList.map((item, i) => {
                return (
                  <li key={ item.id } onClick={ () => { selectPacket(item.id) } } className={ item.is_from_console === true ? 'from_console' : ''} id={ 'packet_list_'+ item.id}>{ item.text }</li>
                )
              })}
            </ul>
        </div>
    </React.Fragment>
  );
};

export default Packetlist;