/* @flow */

import { ArgumentParser } from 'argparse';
import path from 'path';
import open from 'open';
import { start } from './server';
import type { CommandOption } from './type';

const pkg = require('../package.json');

export function parseArgs(args: string[]): CommandOption  {
  const parser = new ArgumentParser({
    version: pkg.version,
    addHelp: true,
    description: 'markdown preview'
  });
  parser.addArgument(
    ['path'],
    {
      help: 'markdown file path'
    }
  );
  parser.addArgument(
    ['-p', '--port'],
    {
      defaultValue: 8080,
      type: 'int',
      help: 'port'
    }
  );
  parser.addArgument(
    ['-t', '--theme'],
    {
      defaultValue: path.join(__dirname, '../node_modules/github-markdown-css/github-markdown.css'),
      help: 'theme css path'
    }
  );
  parser.addArgument(
    ['-o', '--open-url'],
    {
      action: 'storeTrue',
      help: 'open url'
    }
  );
  const parsed = parser.parseArgs(args);
  return {
    port: parsed.port,
    path: parsed.path,
    theme: parsed.theme,
    openUrl: parsed.open_url
  };
}

export function run(args: string[]) : void {
  const cwd = process.cwd();
  const option = parseArgs(args);
  start({
    port: option.port,
    themeCssPath: option.theme,
    cwd
  })
  .then(() => {
    console.log(`http://localhost:${option.port}/${option.path}`);
    if (option.openUrl) {
      open(`http://localhost:${option.port}/${option.path}`);
    }
  });
}
