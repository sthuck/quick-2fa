#!/usr/bin/env node
'use strict';

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var speakeasy = require('speakeasy');

var notifier = require('node-notifier');

var keytar = require('keytar');

var ncp = require('copy-paste');

function waitForTime() {
  var seconds = new Date().getSeconds() % 30;

  if (seconds < 27) {
    return Promise.resolve(true);
  }

  return new Promise(function (resolve) {
    setTimeout(function () {
      return resolve();
    }, (30 - seconds) * 1000);
  });
}

function main() {
  return _main.apply(this, arguments);
}

function _main() {
  _main = _asyncToGenerator(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee() {
    var _process$argv, account, password, getPassword, key;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!process.argv[2]) {
              console.error('Usage: quick-2fa --save KEY-NAME YOUR-KEY');
              console.error('Usage: quick-2fa KEY-NAME');
              process.exit(1);
            }

            if (process.argv[2] === '--save') {
              _process$argv = process.argv, account = _process$argv[3], password = _process$argv[4];
              keytar.setPassword('quick-2fa', account, password).then(function () {
                console.log('Key stored!', 'Now you can retrieve your two-factor authentication token by running:');
                console.log("$ quick-2fa " + account);
                process.exit(0);
              })["catch"](function () {
                console.error('Failed to store your key!');
                process.exit(1);
              });
            }

            getPassword = function getPassword(keyName) {
              return keytar.getPassword('quick-2fa', keyName)["catch"](function () {
                console.error('Sorry, could not find your key...');
                process.exit(1);
              });
            };

            if (!(process.argv[2] === '--key')) {
              _context.next = 7;
              break;
            }

            _context.t0 = process.argv[3];
            _context.next = 10;
            break;

          case 7:
            _context.next = 9;
            return getPassword(process.argv[2]);

          case 9:
            _context.t0 = _context.sent;

          case 10:
            key = _context.t0;
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

          case 12:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _main.apply(this, arguments);
}

main()["catch"](function (e) {
  console.error('error', e);
  process.exit(-1);
});