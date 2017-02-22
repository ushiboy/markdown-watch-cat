/* @flow */

import { readTextFile } from './file';
import path from 'path';
import url from 'url';
import util from 'util';
import type { Environment, Route } from './type';
import { toMarkdownHtml, respond404 } from './response';


const debuglog = util.debuglog('mwcat');

export const themeCSSRoute: Route = {
  match(path) {
    return path === '/theme.css';
  },

  handle(req, res, env) {
    return readTextFile(env.themeCssPath)
      .then(data => {
        res.writeHead(200, {'Content-Type' : 'text/css' });
        res.write(data);
        res.end();
        return res;
      })
      .catch(err => {
        debuglog(err);
        return respond404(res);
      });
  }
};

export const markdownRoute: Route = {
  match(path) {
    return path.match(/\.md$/) != null;
  },

  handle(req, res, env) {
    const pathname: any = url.parse(req.url).pathname;
    const filePath = path.join(env.cwd, pathname);
    return readTextFile(filePath)
      .then(data => {
        res.write(toMarkdownHtml(filePath, data));
        res.end();
        return res;
      })
      .catch(err => {
        debuglog(err);
        return respond404(res);
      });
  }
};

export const routes: Array<Route> = [
  themeCSSRoute,
  markdownRoute
];
