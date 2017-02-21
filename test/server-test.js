const assert = require('assert');
import fs from 'fs';
import sinon from 'sinon';
import { IncomingMessage, ServerResponse } from 'http';
import { serveRoute, receiveMessage } from '../src/server';
import { createTempFile, clearTempFile } from './helper';
import EventEmitter from 'events';

class DummyWebSocketConnection extends EventEmitter {

  constructor() {
    super();
  }

  sendUTF(message) {
    this.message = message;
  }

}

describe('server', () => {

  describe('serveRoute()', () => {

    it('should call handle when match route', () => {
      const handle = sinon.spy();
      const anyMatchRoute = { match(path) { return true }, handle };
      const env = {};
      const route = serveRoute([anyMatchRoute], env);
      const req = new IncomingMessage();
      const res = new ServerResponse(req);
      const next = sinon.spy();

      route(req, res, next);
      assert(handle.called === true);
      assert(next.called === false);
    });

    it('should call next when does not match route', () => {
      const handle = sinon.spy();
      const anyMatchRoute = { match(path) { return false }, handle };
      const env = {};
      const route = serveRoute([anyMatchRoute], env);
      const req = new IncomingMessage();
      const res = new ServerResponse(req);
      const next = sinon.spy();

      route(req, res, next);
      assert(handle.called === false);
      assert(next.called === true);
    });

  });

  describe('receiveMessage()', () => {

    afterEach(() => {
      return clearTempFile();
    });

    it('should watch file changes and send reload message', () => {
      const connection = new DummyWebSocketConnection();
      const receiver = receiveMessage(connection);
      return createTempFile('markdown.md', '')
        .then(path => {
          receiver({ type: 'utf8', utf8Data: path });
          return new Promise((resolve, reject) => {
            fs.writeFile(path, 'test', err => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });
        })
        .then(() => {
          assert(connection.message === 'reload');
        });
    });

  });

});
