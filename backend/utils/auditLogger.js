const fs = require('fs').promises;
const path = require('path');

class AuditLogger {
  constructor(logDir = path.join(__dirname, '../logs')) {
    this.logDir = logDir;
    this.ensureLogDirectory();
  }

  async ensureLogDirectory() {
    try {
      await fs.access(this.logDir);
    } catch (error) {
      await fs.mkdir(this.logDir, { recursive: true });
    }
  }

  getLogFileName(type = 'audit') {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `${type}-${date}.log`);
  }

  formatLogEntry(level, action, details, userId = null, ip = null) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      action,
      userId,
      ip,
      details,
      serverTime: Date.now()
    }) + '\n';
  }

  async writeLog(logEntry, type = 'audit') {
    try {
      const fileName = this.getLogFileName(type);
      await fs.appendFile(fileName, logEntry);
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }

  // Security-related events
  async logSecurityEvent(action, details, req = null) {
    const userId = req?.user?.id || null;
    const ip = req?.ip || req?.connection?.remoteAddress || 'unknown';
    
    const logEntry = this.formatLogEntry('SECURITY', action, details, userId, ip);
    await this.writeLog(logEntry, 'security');
    
    // Also log to console for immediate attention
    console.log(`🔒 SECURITY EVENT: ${action}`, details);
  }

  // Authentication events
  async logAuthEvent(action, details, req = null) {
    const userId = req?.user?.id || details.userId || null;
    const ip = req?.ip || req?.connection?.remoteAddress || 'unknown';
    
    const logEntry = this.formatLogEntry('AUTH', action, details, userId, ip);
    await this.writeLog(logEntry, 'auth');
  }

  // User actions
  async logUserAction(action, details, req = null) {
    const userId = req?.user?.id || null;
    const ip = req?.ip || req?.connection?.remoteAddress || 'unknown';
    
    const logEntry = this.formatLogEntry('USER', action, details, userId, ip);
    await this.writeLog(logEntry, 'user');
  }

  // System events
  async logSystemEvent(action, details) {
    const logEntry = this.formatLogEntry('SYSTEM', action, details);
    await this.writeLog(logEntry, 'system');
  }

  // Error events
  async logError(error, details = {}, req = null) {
    const userId = req?.user?.id || null;
    const ip = req?.ip || req?.connection?.remoteAddress || 'unknown';
    
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      ...details
    };
    
    const logEntry = this.formatLogEntry('ERROR', 'APPLICATION_ERROR', errorDetails, userId, ip);
    await this.writeLog(logEntry, 'error');
  }

  // Rate limit violations
  async logRateLimitViolation(endpoint, req) {
    await this.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
      endpoint,
      userAgent: req.get('User-Agent'),
      method: req.method,
      url: req.url
    }, req);
  }

  // Failed validation attempts
  async logValidationFailure(errors, req) {
    await this.logSecurityEvent('VALIDATION_FAILURE', {
      errors,
      endpoint: req.url,
      method: req.method,
      body: req.body // Be careful with sensitive data
    }, req);
  }

  // Suspicious activity
  async logSuspiciousActivity(activity, details, req) {
    await this.logSecurityEvent('SUSPICIOUS_ACTIVITY', {
      activity,
      ...details,
      userAgent: req.get('User-Agent'),
      endpoint: req.url
    }, req);
  }
}

// Middleware to add audit logging to requests
const auditMiddleware = (auditLogger) => {
  return (req, res, next) => {
    req.auditLogger = auditLogger;
    
    // Log high-value actions
    const originalSend = res.send;
    res.send = function(data) {
      // Log successful high-value operations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
          auditLogger.logUserAction(`${req.method}_${req.url}`, {
            statusCode: res.statusCode,
            method: req.method,
            url: req.url
          }, req);
        }
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Create singleton instance
const auditLogger = new AuditLogger();

module.exports = {
  AuditLogger,
  auditLogger,
  auditMiddleware
};
