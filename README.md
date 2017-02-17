# Markdown Watch Cat

Preview the markdown in the browser, and reload after saving your changes.

## Usage

```
$ mdcat [-h] [-v] [-p PORT] [-t THEME] [-s] path
```

## Options

| Option | Default | Description |
| :-- | :-- | :-- |
| -p, --port | 8080 | listen port number |
| -t, --theme | github-markdown.css | preview theme css file path |
| -s, --skip-open | (not skip) | skip open url |

## Installation

```
$ git clone https://github.com/ushiboy/markdown-watch-cat.git
$ cd markdown-watch-cat
$ npm install
$ npm run build
$ npm install -g .
```
