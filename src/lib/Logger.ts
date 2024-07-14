export interface Logger {
  withContext(context: string): Logger;

  debug(msg: string, data?: object): void;
  info(msg: string, data?: object): void;
  warn(msg: string, data?: object): void;
  error(msg: string, data?: object, error?: Error): void;
  fatal(msg: string, data?: object, error?: Error): void;
}
