import React from 'react';
import Link from 'next/link';
import { ipcRenderer } from 'electron'

interface MenubarProps {
  onClick?: () => void;
}

function Menubar({
  onClick,
  ...props
}: MenubarProps) {

  function openFile() {
    ipcRenderer.send('pcap', {
      type: 'openFile',
      path: '/Volumes/Data/poc/xcloud-streaming-node/pcaps/button_test_02072022.pcap',
      srtpKey: 'vV9cuxwCpZ2iKGVFJhdLBcQ2mfSRzFvPj7+vTQbq'
    })
  }

  return (
    <React.Fragment>
        <div id="app_menubar">
            <ul>
                <li><a href="#" onClick={ () => { openFile() } }>Open file</a></li>
                <li><Link href="#">Reload file</Link></li>
                <li><Link href="settings">Settings</Link></li>
                {/* <li>This is just some text...</li>
                <li><a href="#">Foldable menu</a>

                    <ul>
                        <li><a href="#">Subitem</a></li>
                        <li><a href="#">Subitem 2</a></li>
                        <li><a href="#">Subitem 3</a></li>
                        <li>Textitem</li>
                        <li><a href="#">Subitem 3</a></li>
                        <li>Textitem</li>
                    </ul>
                </li> */}
            </ul>
        </div>
    </React.Fragment>
  );
};

export default Menubar;