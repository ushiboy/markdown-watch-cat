const assert = require('assert');

import fs from 'fs';
import os from 'os';
import path from 'path';
import { readTextFile } from '../src/file';

describe('file', () => {

  describe('readTextFile()', () => {

    const fileContent = 'test';

    let filePath;

    beforeEach(() => {
      filePath = path.join(os.tmpdir(), 'test.md');
      return new Promise((resolve, reject) => {
        fs.writeFile(filePath, fileContent, e => {
          if (e) {
            reject(e);
          } else {
            resolve();
          }
        });
      });
    });

    afterEach(() => {
      return new Promise((resolve, reject) => {
        fs.unlink(filePath, e => {
          if (e) {
            reject(e);
          } else {
            resolve();
          }
        });
      });
    });

    it('should return a promise to receive text data', () => {
      return readTextFile(filePath).then(data => {
        assert(data === fileContent);
      });
    });

    it('should return a promise to catch error when file loading fails', () => {
      const noneFilePath = path.join(os.tmpdir(), Date.now() + 'nothing.md');
      return readTextFile(noneFilePath).catch(err => {
        assert(err.message === `ENOENT: no such file or directory, open '${noneFilePath}'`);
      });
    });

  });

});
