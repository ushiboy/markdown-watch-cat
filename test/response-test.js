const assert = require('assert');

import { IncomingMessage, ServerResponse } from 'http';
import { toMarkdownHtml, respond404 } from '../src/response';

describe('response', () => {

  describe('toMarkdownHtml()', () => {

    const filePath = '/path/to/markdown';
    const data = '# test';
    const html = toMarkdownHtml(filePath, data);

    it('should return HTML with markdown embedded', () => {
      const [, h1] = html.match(/<h1 id=".*">(.*)<\/h1>/);
      assert(h1 === 'test');
    });

    it('should return HTML with websocket script embedded', () => {
      const [, sendMsg] = html.match(/ws.send\('(.*)'\);/);
      assert(sendMsg === filePath);
    });

  });

  describe('respond404()', () => {

    it('should set 404 status', () => {
      const res = new ServerResponse(new IncomingMessage());
      respond404(res);
      assert(res.statusCode === 404);
    });

  });

});
