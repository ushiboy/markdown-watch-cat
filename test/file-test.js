const assert = require('assert');
import { createTempFile, clearTempFile, generateTempFilePath } from './helper';
import { readTextFile } from '../src/file';

describe('file', () => {

  describe('readTextFile()', () => {

    const fileContent = 'test';

    let filePath;

    beforeEach(() => {
      return createTempFile('test.md', fileContent)
        .then(p => {
          filePath = p;
        });
    });

    afterEach(() => {
      return clearTempFile();
    });

    it('should return a promise to receive text data', () => {
      return readTextFile(filePath).then(data => {
        assert(data === fileContent);
      });
    });

    it('should return a promise to catch error when file loading fails', () => {
      const noneFilePath = generateTempFilePath(Date.now() + 'nothing.md');
      return readTextFile(noneFilePath).catch(err => {
        assert(err.message === `ENOENT: no such file or directory, open '${noneFilePath}'`);
      });
    });

  });

});
