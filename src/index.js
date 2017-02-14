/* @flow */

import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { server as WebSocketServer } from 'websocket';
import { routes, respond404 } from './route';

export function start(option: any) {
  const { port, cwd, markdown, themeCssPath } = option;
  const httpServer = http.createServer((req, res) => {
    const pathname: any = url.parse(req.url).pathname;
    const route = routes.find(r => r.match(pathname));
    const env = {
      cwd,
      themeCssPath
    };
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

  httpServer.listen(port);
  console.log(`listen ${port} port.`);
}
