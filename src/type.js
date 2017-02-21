/* @flow */
import { IncomingMessage, ServerResponse } from 'http';

export type CommandOption = {
  port: number;
  path: string;
  theme: string;
  openUrl: boolean;
}

export type Environment = {
  port: number;
  cwd: string;
  themeCssPath: string;
}

export type Route = {
  match: (path: string) => boolean;
  handle: (req: IncomingMessage, res: ServerResponse, env: Environment) => Promise<ServerResponse>;
}

export type HttpMiddleware = (req: IncomingMessage, res: ServerResponse, next: Function) => mixed;

export type WebSocketMessageHandler = (message: any) => void;
