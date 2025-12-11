/**
 * Enhanced logger utility
 */

type LogLevel = "info" | "warn" | "error" | "debug" | "api" | "init";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  private formatMessage(level: LogLevel, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (data) {
      return `${prefix} ${message}\n${JSON.stringify(data, null, 2)}`;
    }
    
    return `${prefix} ${message}`;
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    const formatted = this.formatMessage(level, message, data);
    
    switch (level) {
      case "error":
        console.error(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      case "debug":
        if (this.isDevelopment) {
          console.debug(formatted);
        }
        break;
      default:
        console.log(formatted);
    }
  }

  info(message: string, data?: unknown): void {
    this.log("info", message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log("warn", message, data);
  }

  error(message: string, data?: unknown): void {
    this.log("error", message, data);
  }

  debug(message: string, data?: unknown): void {
    this.log("debug", message, data);
  }

  api(message: string, data?: unknown): void {
    this.log("api", message, data);
  }

  init(message: string, data?: unknown): void {
    this.log("init", message, data);
  }
}

export const logger = new Logger();

// Export legacy log function for backward compatibility
export function log(message: string, type: LogLevel = "info"): void {
  logger[type](message);
}

