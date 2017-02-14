/* @flow */

import { ArgumentParser } from 'argparse';
import path from 'path';
import { start } from './index';

const pkg = require('../package.json');

export function run(args: string[]) : void {
  const parser = new ArgumentParser({
    version: pkg.version,
    addHelp: true,
    description: 'test'
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
  const parsedArgs = parser.parseArgs(args);
  const cwd = process.cwd();
  start({
    port: parsedArgs.port,
    markdown: parsedArgs.path,
    themeCssPath: parsedArgs.theme,
    cwd
  });
}
