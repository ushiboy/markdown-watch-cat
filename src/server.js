/* @flow */

import http from 'http';
import url from 'url';
import serveIndex from 'serve-index';
import serveStatic from 'serve-static';
import chokidar from 'chokidar';
import util from 'util';
import { server as WebSocketServer } from 'websocket';
import { routes } from './route';
import { respond404 } from './response';
import type { Environment, Route, HttpMiddleware, WebSocketMessageHandler } from './type';


const debuglog = util.debuglog('mdcat');

export function serveRoute(routes: Array<Route>, env: Environment): HttpMiddleware {
  return (req, res, next) => {
    const pathname = url.parse(req.url).pathname || '';
    const route = routes.find(r => r.match(pathname));
    if (route) {
      route.handle(req, res, env);
    } else {
      next();
    }
  };
}

export function receiveMessage(connection: any): WebSocketMessageHandler {
  return message => {
    if (message.type === 'utf8') {
      const markdownFile = message.utf8Data;
      const watcher = chokidar.watch(markdownFile);
      debuglog(`start watch [${markdownFile}]`);
      watcher.on('change', () => {
        debuglog(`send reload message`);
        connection.sendUTF('reload');
      });
      connection.on('close', (reasonCode, description) => {
        debuglog(`close watch`);
        watcher.close();
      });
    }
  };
}

export function start(env: Environment) : Promise<*> {

  const index = serveIndex(env.cwd, {
    icons: true
  });
  const statics = serveStatic(env.cwd);
  const route = serveRoute(routes, env);

  const httpServer = http.createServer((req, res) => {
    index(req, res, () => {
      route(req, res, () => {
        statics(req, res, () => {
          respond404(res);
        });
      });
    });
  });

  const wsServer = new WebSocketServer({
    httpServer,
    autoAcceptConnections: false
  });
  wsServer.on('request', request => {
    const connection = request.accept(null, request.origin);
    connection.on('message', receiveMessage(connection));
  });

  return new Promise((resolve, reject) => {
    httpServer.once('listening', () => {
      resolve();
    });
    httpServer.listen(env.port);
  });
}
