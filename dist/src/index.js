#!/usr/bin/env node

'use strict';

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var speakeasy = require('speakeasy');
var notifier = require('node-notifier');
var keytar = require('keytar');
var ncp = require('copy-paste');

function waitForTime() {
  var seconds = new Date().getSeconds() % 30;
  if (seconds < 27) {
    return _promise2.default.resolve(true);
  }
  return new _promise2.default(function (resolve) {
    setTimeout(function () {
      return resolve();
    }, (30 - seconds) * 1000);
  });
}

if (!process.argv[2]) {
  console.error('Usage: quick-2fa --save KEY-NAME YOUR-KEY');
  console.error('Usage: quick-2fa KEY-NAME');
  process.exit(1);
}

if (process.argv[2] === '--save') {
  var _process$argv = (0, _slicedToArray3.default)(process.argv, 5),
      account = _process$argv[3],
      password = _process$argv[4];

  var done = keytar.replacePassword('quick-2fa', account, password);
  if (done) {
    console.log('Key stored!', 'Now you can retrieve your two-factor authentication token by running:');
    console.log('$ quick-2fa ' + account);
    process.exit(0);
  } else {
    console.error('Failed to store your key!');
    process.exit(1);
  }
}

var key = process.argv[2] === '--key' ? process.argv[3] : keytar.getPassword('quick-2fa', process.argv[2]);
if (!key) {
  console.error('Sorry, could not find your key...');
  process.exit(1);
}

waitForTime().then(function () {
  var token = speakeasy.totp({
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