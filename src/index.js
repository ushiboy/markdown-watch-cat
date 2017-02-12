// @flow

import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
import marked from 'marked';
import { server as WebSocketServer } from 'websocket';

const cwd = process.cwd();

function toHtml(filePath: string, data: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="theme.css">
  <title>Markdown Preview</title>
  <style type="text/css">
    .markdown-body {
      box-sizing: border-box;
      min-width: 200px;
      max-width: 980px;
      margin: 0 auto;
      padding: 45px;
    }
  </style>
</head>
<body class="markdown-body">
${marked(data)}
  <script type="text/javascript">
  (function() {
    var ws = new WebSocket('ws://'+location.host);
    ws.onopen = () => {
      ws.send('${filePath}');
    };
    ws.onmessage = msg => {
      ws.close();
      location.reload();
    };
  })();
  </script>
</body>
</html>`;
}

function toIndexHtml(markDownFiles) {
  const links = markDownFiles.map(f => {
    return `<li><a href="${f}">${f}</a></li>`;
  });
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Markdown List</title>
</head>
<body>
  <ul>
    ${links.join('')}
  </ul>
</body>
</html>`;
}

const httpServer = http.createServer((req, res) => {
  const {pathname} = url.parse(req.url);
  if (pathname.match(/\.md$/) != null) {
    fs.readFile(path.join(cwd, pathname), { encoding: 'utf8' }, (err, data) => {
      if (err) {
        console.log(err);
        res.end();
      } else {
        res.write(toHtml(path.join(cwd, pathname), data));
        res.end();
      }
    });
  } else if (pathname === '/') {
    fs.readdir(cwd, (err, files) => {
      if (err) {
        console.log(err);
      }
      const markdownFiles = files.filter(f => f.match(/\.md$/) != null);
      res.write(toIndexHtml(markdownFiles));
      res.end();
    });
  } else if (pathname === '/theme.css') {
    fs.readFile(path.join(__dirname, '../node_modules/github-markdown-css/github-markdown.css'), { encoding: 'utf8' }, (err, data) => {
      if (err) {
        console.log(err);
        res.end();
      } else {
        res.write(data);
        res.end();
      }
    });
  } else {
    res.statusCode = 404;
    res.end();
  }
});


const wsServer = new WebSocketServer({
  httpServer,
  autoAcceptConnections: false
});

wsServer.on('request', function(request) {

  const connection = request.accept(null, request.origin);
  const sendReload = () => {
    connection.sendUTF("reload");
  };

  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      const markdownFile = message.utf8Data;
      fs.watchFile(markdownFile, { interval: 500 }, sendReload);
    }
    connection.on('close', function(reasonCode, description) {
      fs.unwatchFile(markdownFile, sendReload);
    });
  });
});

httpServer.listen(8080);
