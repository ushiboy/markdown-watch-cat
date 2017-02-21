/* @flow */

import http from 'http';
import url from 'url';
import serveIndex from 'serve-index';
import serveStatic from 'serve-static';
import chokidar from 'chokidar';
import { server as WebSocketServer } from 'websocket';
import { routes } from './route';
import { respond404 } from './response';
import type { Environment, Route, HttpMiddleware } from './type';


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

  wsServer.on('request', function(request) {
    const connection = request.accept(null, request.origin);
    const sendReload = () => {
      connection.sendUTF('reload');
    };
    connection.on('message', function(message) {
      if (message.type === 'utf8') {
        const markdownFile = message.utf8Data;
        const watcher = chokidar.watch(markdownFile);
        watcher.on('change', sendReload);
        connection.on('close', function(reasonCode, description) {
          watcher.close();
        });
      }
    });
  });

  return new Promise((resolve, reject) => {
    httpServer.once('listening', () => {
      resolve();
    });
    httpServer.listen(env.port);
  });
}
