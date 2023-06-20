import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

function Settings() {
  return (
    <React.Fragment>
        <div className='content'>
            <Link href='/home'>
                <a className='btn-blue'>Go to home page</a>
            </Link>
        </div>
    </React.Fragment>
  )
}

export default Settings
