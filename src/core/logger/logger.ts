/**
 * Structured Client-Side Logger with Tracing Support
 * Outputs structured JSON logs in production, pretty formatted logs in development.
 * Masks sensitive keys (password, token, secrets) automatically.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  component?: string;
  requestId?: string;
  userRole?: string;
  [key: string]: unknown;
}

export interface StructuredLogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
}

const SENSITIVE_KEYS = ['password', 'token', 'secret', 'authorization', 'credit_card'];

function maskSensitiveData(obj: unknown): unknown {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(maskSensitiveData);
  }

  const masked: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s))) {
      masked[key] = '***MASKED***';
    } else if (typeof value === 'object' && value !== null) {
      masked[key] = maskSensitiveData(value);
    } else {
      masked[key] = value;
    }
  }
  return masked;
}

const isProduction = import.meta.env.PROD;

function emitLog(level: LogLevel, message: string, context?: LogContext): void {
  // In production, suppress debug and info logs
  if (isProduction && (level === 'debug' || level === 'info')) {
    return;
  }

  const sanitizedContext = context
    ? (maskSensitiveData(context) as LogContext)
    : undefined;

  const entry: StructuredLogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context: sanitizedContext,
  };

  if (isProduction) {
    const jsonString = JSON.stringify(entry);
    if (level === 'error') {
      console.error(jsonString);
    } else if (level === 'warn') {
      console.warn(jsonString);
    }
  } else {
    // Development pretty logging
    const prefix = `[${entry.timestamp.slice(11, 19)}] [${level.toUpperCase()}]`;
    const comp = context?.component ? `[${context.component}]` : '';
    const req = context?.requestId ? `[req:${context.requestId.slice(0, 8)}]` : '';

    switch (level) {
      case 'debug':
        console.debug(`${prefix} ${comp} ${req}`, message, sanitizedContext || '');
        break;
      case 'info':
        console.info(`${prefix} ${comp} ${req}`, message, sanitizedContext || '');
        break;
      case 'warn':
        console.warn(`${prefix} ${comp} ${req}`, message, sanitizedContext || '');
        break;
      case 'error':
        console.error(`${prefix} ${comp} ${req}`, message, sanitizedContext || '');
        break;
    }
  }
}

export const logger = {
  debug(message: string, context?: LogContext): void {
    emitLog('debug', message, context);
  },
  info(message: string, context?: LogContext): void {
    emitLog('info', message, context);
  },
  warn(message: string, context?: LogContext): void {
    emitLog('warn', message, context);
  },
  error(message: string, context?: LogContext): void {
    emitLog('error', message, context);
  },
};
