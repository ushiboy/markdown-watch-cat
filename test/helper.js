import fs from 'fs';
import os from 'os';
import path from 'path';

const tempFiles = [];

export function createTempFile(fileName, data) {
  const filePath = generateTempFilePath(fileName);
  tempFiles.push(filePath);
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, e => {
      if (e) {
        reject(e);
      } else {
        resolve(filePath);
      }
    });
  });
}

export function clearTempFile() {
  const promises = [];
  while (tempFiles.length > 0) {
    const f = tempFiles.pop();
    promises.push(() => {
      return new Promise((resolve, reject) => {
        fs.unlink(f, e => {
          if (e) {
            reject(e);
          } else {
            resolve();
          }
        });
      });
    });
  }
  return promises.reduce((a, b) => {
    return a.then(b);
  }, Promise.resolve());
}

export function generateTempFilePath(fileName) {
  return path.join(os.tmpdir(), fileName);
}
