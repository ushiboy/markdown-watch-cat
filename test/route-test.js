const assert = require('assert');

import os from 'os';
import { createTempFile, clearTempFile, generateTempFilePath } from './helper';
import { IncomingMessage, ServerResponse } from 'http';
import { themeCSSRoute, markdownRoute } from '../src/route';

describe('route', () => {

  afterEach(() => {
    return clearTempFile();
  });

  describe('themeCSSRoute', () => {

    describe('match()', () => {

      it('should return true when the path is "/theme.css"', () => {
        assert(themeCSSRoute.match('/theme.css') === true);
      });

      it('should return false when the path is not "/theme.css"', () => {
        assert(themeCSSRoute.match('/theme2.css') === false);
      });

    });

    describe('handle()', () => {

      it('should set 200 status', () => {
        return createTempFile('theme.css')
          .then(filePath => {
            const req = new IncomingMessage();
            const res = new ServerResponse(req);
            const env = {
              themeCssPath: filePath
            };
            return themeCSSRoute.handle(req, res, env)
          })
          .then(res => {
            assert(res.statusCode === 200);
          });
      });

      it('should set 404 status when the css file can not be found', () => {
        const req = new IncomingMessage();
        const res = new ServerResponse(req);
        const env = {
          themeCssPath: '/path/to/none.css'
        };
        return themeCSSRoute.handle(req, res, env)
          .then(res => {
            assert(res.statusCode === 404);
          });
      });

    });

  });

  describe('markdownRoute', () => {

    describe('match()', () => {

      it('should return true when the path is markdown file', () => {
        assert(markdownRoute.match('/path/to/markdown.md') === true);
      });

      it('should return false when the path is not markdown file', () => {
        assert(markdownRoute.match('/path/to/markdown.txt') === false);
      });

    });

    describe('handle()', () => {

      it('should set 200 status', () => {
        return createTempFile('readme.md', '# test')
          .then(filePath => {
            const req = new IncomingMessage();
            req.url = 'http://localhost:8080/readme.md';
            const res = new ServerResponse(req);
            const env = {
              cwd: os.tmpdir()
            };
            return markdownRoute.handle(req, res, env)
              .then(() => {
                assert(res.statusCode === 200);
              });
          });
      });

      it('should set 404 status when the markdown file can not be found', () => {
        const req = new IncomingMessage();
        req.url = 'http://localhost:8080/readme.md';
        const res = new ServerResponse(req);
        const env = {
          cwd: os.tmpdir()
        };
        return markdownRoute.handle(req, res, env)
          .then(() => {
            assert(res.statusCode === 404);
          });
      });

    });


  });

});
