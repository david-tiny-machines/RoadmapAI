const LOG_PREFIX = '[RoadmapAI]';
const isDevelopment = process.env.NODE_ENV === 'development';

function formatMessage(message: string, data?: any): string {
  if (isDevelopment) {
    return `${LOG_PREFIX} ${message}${data ? ' ' + JSON.stringify(data) : ''}`;
  }
  const timestamp = new Date().toISOString();
  return `${LOG_PREFIX} [${timestamp}] ${message}${data ? '\nData: ' + JSON.stringify(data, null, 2) : ''}`;
}

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Function to send logs to server - only in production
async function sendLogToServer(message: string, data?: any, level: 'info' | 'error' = 'info') {
  if (isDevelopment) return;
  
  try {
    await fetch('/api/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        data,
        level,
      }),
    });
  } catch (error) {
    console.error('Failed to send log to server:', error);
  }
}

export const logger = {
  log: (message: string, data?: any) => {
    const logMessage = formatMessage(message, data);
    
    if (isBrowser) {
      // In browser, only log to console in development
      console.log(logMessage);
      if (!isDevelopment) {
        sendLogToServer(message, data, 'info').catch(() => {
          // Ignore errors in sending logs to avoid infinite loops
        });
      }
    } else {
      // In Node.js environment, we can use fs
      // This code will only be included in server-side bundles
      try {
        if (!isDevelopment) {
          const fs = require('fs');
          const path = require('path');
          const LOG_FILE = path.join(process.cwd(), 'auth.log');
          fs.appendFileSync(LOG_FILE, logMessage + '\n');
        }
        console.log(logMessage);
      } catch (error) {
        console.error('Failed to write to log file:', error);
        console.log(logMessage);
      }
    }
  },

  error: (message: string, error?: any) => {
    const logMessage = formatMessage('ERROR: ' + message, error);
    
    if (isBrowser) {
      // In browser, only log to console in development
      console.error(logMessage);
      if (!isDevelopment) {
        sendLogToServer(message, error, 'error').catch(() => {
          // Ignore errors in sending logs to avoid infinite loops
        });
      }
    } else {
      // In Node.js environment, we can use fs
      // This code will only be included in server-side bundles
      try {
        if (!isDevelopment) {
          const fs = require('fs');
          const path = require('path');
          const LOG_FILE = path.join(process.cwd(), 'auth.log');
          fs.appendFileSync(LOG_FILE, logMessage + '\n');
        }
        console.error(logMessage);
      } catch (error) {
        console.error('Failed to write to log file:', error);
        console.error(logMessage);
      }
    }
  }
}; 