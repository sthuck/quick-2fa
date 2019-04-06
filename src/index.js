#!/usr/bin/env node
'use strict';
const speakeasy = require('speakeasy');
const notifier = require('node-notifier');
const keytar = require('keytar');
const ncp = require('copy-paste');

function waitForTime() {
  const seconds = new Date().getSeconds() % 30;
  if (seconds < 27) {
    return Promise.resolve(true);
  }
  return new Promise(resolve => {
    setTimeout(() => resolve(), (30 - seconds) * 1000);
  });
}

async function main() {
  if (!process.argv[2]) {
    console.error('Usage: quick-2fa --save KEY-NAME YOUR-KEY');
    console.error('Usage: quick-2fa KEY-NAME');
    process.exit(1);
  }

  if (process.argv[2] === '--save') {
    const [, , , account, password] = process.argv;
    keytar.setPassword('quick-2fa', account, password).then(() => {
      console.log('Key stored!', 'Now you can retrieve your two-factor authentication token by running:');
      console.log(`$ quick-2fa ${account}`);
      process.exit(0);
    }).catch(() => {
      console.error('Failed to store your key!');
      process.exit(1);
    });
  }

  const getPassword = (keyName) => {
    return keytar.getPassword('quick-2fa', keyName).catch(() => {
      console.error('Sorry, could not find your key...');
      process.exit(1);
    });
  }

  const key = process.argv[2] === '--key' ? process.argv[3] : await getPassword(process.argv[2]);

  waitForTime().then(() => {
    const token = speakeasy.totp({
      secret: key,
      encoding: 'base32'
    });

    ncp.copy(token);

    notifier.notify({
      title: 'quick-2fa',
      message: token
    });

    console.log(token);
  });
}

main().catch(e => {
  console.error('error', e);
  process.exit(-1);
});
