/* @flow */

import { IncomingMessage, ServerResponse } from 'http';
import { readTextFile, readDir } from './file';
import fs from 'fs';
import path from 'path';
import url from 'url';
import marked from 'marked';

type Environment = {
  cwd: string;
  themeCssPath: string;
}

type Route = {
  match: (path: string) => boolean;
  handle: (req: IncomingMessage, res: ServerResponse, env: Environment) => void;
}

function toMarkdownHtml(filePath: string, data: string): string {
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

function toIndexHtml(files: string[]): string {
  const links = files.map(f => {
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

export function respond404(res: ServerResponse) {
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.write('Not Found');
  res.end();
}

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
