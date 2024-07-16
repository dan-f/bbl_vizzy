import { Logger } from "../lib";

export class ConsoleLogger implements Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  withContext(context: string): Logger {
    return new ConsoleLogger(context);
  }

  debug(msg: string, data?: object): void {
    this.inModes(["development"], () => {
      console.debug(...[this.fmtMsg(msg), data].filter((x) => x != null));
    });
  }

  info(msg: string, data?: object): void {
    this.inModes(["development"], () => {
      console.info(...[this.fmtMsg(msg), data].filter((x) => x != null));
    });
  }

  warn(msg: string, data?: object): void {
    this.inModes(["development", "production"], () => {
      console.warn(...[this.fmtMsg(msg), data].filter((x) => x != null));
    });
  }

  error(msg: string, data?: object, error?: Error): void {
    this.inModes(["development", "production"], () => {
      console.error(...[this.fmtMsg(msg), data].filter((x) => x != null));
      if (error) {
        console.error(error);
      }
    });
  }

  fatal(msg: string, data?: object, error?: Error): void {
    this.inModes(["development", "production"], () => {
      console.error(...[this.fmtMsg(msg), data].filter((x) => x != null));
      if (error) {
        console.error(error);
      }
    });
  }

  private fmtMsg(msg: string): string {
    return `[${this.context}] ${msg}`;
  }

  private inModes(modes: string[], cb: (env: string) => void) {
    const mode = import.meta.env.MODE;
    if (modes.includes(mode)) {
      cb(mode);
    }
  }
}
