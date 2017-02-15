/* @flow */

import http from 'http';
import fs from 'fs';
import url from 'url';
import { server as WebSocketServer } from 'websocket';
import { routes } from './route';
import { respond404 } from './response';
import type { Environment } from './type';

export function start(env: Environment) : Promise<*> {
  const httpServer = http.createServer((req, res) => {
    const pathname = url.parse(req.url).pathname || '';
    const route = routes.find(r => r.match(pathname));
    if (route) {
      route.handle(req, res, env);
    } else {
      respond404(res);
    }
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
        fs.watchFile(markdownFile, { interval: 500 }, sendReload);
        connection.on('close', function(reasonCode, description) {
          fs.unwatchFile(markdownFile, sendReload);
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
