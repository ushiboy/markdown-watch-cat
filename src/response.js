/* @flow */
import { ServerResponse } from 'http';
import marked from 'marked';

export function toMarkdownHtml(filePath: string, data: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="/theme.css">
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

export function respond404(res: ServerResponse): ServerResponse {
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.write('Not Found');
  res.end();
  return res;
}
