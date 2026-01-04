/**
 * Logger utility for MCP server
 * Uses console.error for all logging since stdout is reserved for MCP protocol
 */

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

class Logger {
  private logLevel: LogLevel;

  constructor() {
    const level = (process.env.LOG_LEVEL || 'error') as LogLevel;
    this.logLevel = level;
  }

  /**
   * Log an error message
   */
  error(...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error('[ERROR]', ...args);
    }
  }

  /**
   * Log a warning message
   */
  warn(...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.error('[WARN]', ...args);
    }
  }

  /**
   * Log an info message
   */
  info(...args: any[]): void {
    if (this.shouldLog('info')) {
      console.error('[INFO]', ...args);
    }
  }

  /**
   * Log a debug message
   */
  debug(...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.error('[DEBUG]', ...args);
    }
  }

  /**
   * Determine if a message should be logged based on current log level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }
}

export const logger = new Logger();
