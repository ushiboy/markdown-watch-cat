# Markdown Watch Cat

Preview the markdown in the browser, and reload after saving your changes.

## Usage

```
$ mdcat README.md
```

## Options

```
$ mdcat [-h] [-v] [-p PORT] [-t THEME] [-o] path
```

| Option | Default | Description |
| :-- | :-- | :-- |
| -p, --port | 8080 | listen port number |
| -t, --theme | github-markdown.css | preview theme css file path |
| -o, --open-url | (open) | open url |

## Installation

```
$ git clone https://github.com/ushiboy/markdown-watch-cat.git
$ cd markdown-watch-cat
$ npm install
$ npm run build
$ npm install -g .
```
