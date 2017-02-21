const assert = require('assert');
import sinon from 'sinon';
import { IncomingMessage, ServerResponse } from 'http';
import { serveRoute } from '../src/server';

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

});
