/* @flow */

import { readTextFile, readDir } from './file';
import fs from 'fs';
import path from 'path';
import url from 'url';
import type { Environment, Route } from './type';
import { toMarkdownHtml, toIndexHtml, respond404 } from './response';


const indexRoute: Route = {
  match(path) {
    return path === '/';
  },

  handle(req, res, env) {
    readDir(env.cwd)
      .then(files => {
        const markdownFiles = files.filter(f => f.match(/\.md$/) != null);
        res.write(toIndexHtml(markdownFiles));
        res.end();
      })
      .catch(err => {
        respond404(res);
      });
  }
};

const themeCSSRoute: Route = {
  match(path) {
    return path === '/theme.css';
  },

  handle(req, res, env) {
    res.writeHead(200, {'Content-Type' : 'text/css' });
    fs.createReadStream(env.themeCssPath).pipe(res);
  }
};

const markdownRoute: Route = {
  match(path) {
    return path.match(/\.md$/) != null;
  },

  handle(req, res, env) {
    const pathname: any = url.parse(req.url).pathname;
    const filePath = path.join(env.cwd, pathname);
    readTextFile(filePath)
      .then(data => {
        res.write(toMarkdownHtml(filePath, data));
        res.end();
      })
      .catch(err => {
        respond404(res);
      });
  }
};

export const routes: Array<Route> = [
  indexRoute,
  themeCSSRoute,
  markdownRoute
];
