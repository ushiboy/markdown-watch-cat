/* @flow */
import { IncomingMessage, ServerResponse } from 'http';

export type Environment = {
  port: number;
  markdownPath: string;
  cwd: string;
  themeCssPath: string;
}

export type Route = {
  match: (path: string) => boolean;
  handle: (req: IncomingMessage, res: ServerResponse, env: Environment) => void;
}
