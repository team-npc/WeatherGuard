// Comprehensive error handling and resilience utilities
// for the Weather Safety App

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: number;
  location?: { lat: number; lng: number };
  timestamp?: string;
  userAgent?: string;
  url?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: Array<{ error: ApiError; context: ErrorContext; timestamp: string }> = [];
  private retryConfig: RetryConfig = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', 'SERVER_ERROR', 'RATE_LIMITED']
  };

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Enhanced API call with automatic retry and fallback
  async resilientApiCall<T>(
    primaryCall: () => Promise<T>,
    fallbackCall?: () => Promise<T>,
    context?: ErrorContext
  ): Promise<T> {
    let lastError: ApiError | null = null;

    // Try primary API with retry logic
    for (let attempt = 1; attempt <= this.retryConfig.maxAttempts; attempt++) {
      try {
        const result = await this.executeWithTimeout(primaryCall, 15000);
        
        // Log successful recovery if this wasn't the first attempt
        if (attempt > 1) {
          this.logRecovery(context, attempt);
        }
        
        return result;
      } catch (error) {
        lastError = this.categorizeError(error);
        
        // Log the error
        this.logError(lastError, context);
        
        // Check if error is retryable and we have attempts left
        if (this.isRetryable(lastError) && attempt < this.retryConfig.maxAttempts) {
          const delay = this.calculateDelay(attempt);
          await this.sleep(delay);
          continue;
        }
        
        break;
      }
    }

    // Try fallback if available
    if (fallbackCall) {
      try {
        console.log('Primary API failed, trying fallback...');
        const result = await this.executeWithTimeout(fallbackCall, 10000);
        this.logFallbackSuccess(context);
        return result;
      } catch (fallbackError) {
        const fallbackApiError = this.categorizeError(fallbackError);
        this.logError(fallbackApiError, { ...context, action: 'fallback' });
      }
    }

    // If we get here, both primary and fallback failed
    throw this.createUserFriendlyError(lastError, context);
  }

  // Execute function with timeout
  private async executeWithTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs)
      )
    ]);
  }

  // Categorize errors for better handling
  private categorizeError(error: any): ApiError {
    if (error.message === 'TIMEOUT') {
      return {
        code: 'TIMEOUT',
        message: 'Request timed out',
        retryable: true,
        severity: 'medium'
      };
    }

    if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network connection unavailable',
        retryable: true,
        severity: 'high'
      };
    }

    if (error.response?.status === 429) {
      return {
        code: 'RATE_LIMITED',
        message: 'API rate limit exceeded',
        retryable: true,
        severity: 'medium'
      };
    }

    if (error.response?.status >= 500) {
      return {
        code: 'SERVER_ERROR',
        message: 'Server temporarily unavailable',
        retryable: true,
        severity: 'high'
      };
    }

    if (error.response?.status === 404) {
      return {
        code: 'NOT_FOUND',
        message: 'Resource not found',
        retryable: false,
        severity: 'low'
      };
    }

    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        code: 'AUTH_ERROR',
        message: 'Authentication failed',
        retryable: false,
        severity: 'medium'
      };
    }

    // Generic error
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
      details: error,
      retryable: false,
      severity: 'medium'
    };
  }

  // Check if error is retryable
  private isRetryable(error: ApiError): boolean {
    return error.retryable && this.retryConfig.retryableErrors.includes(error.code);
  }

  // Calculate exponential backoff delay
  private calculateDelay(attempt: number): number {
    const delay = this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1);
    return Math.min(delay, this.retryConfig.maxDelay);
  }

  // Sleep utility
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Create user-friendly error messages
  private createUserFriendlyError(error: ApiError | null, context?: ErrorContext): Error {
    if (!error) {
      return new Error('Service temporarily unavailable. Please try again later.');
    }

    const userMessages: Record<string, string> = {
      'NETWORK_ERROR': 'No internet connection. Please check your network and try again.',
      'TIMEOUT': 'Request timed out. Please check your connection and try again.',
      'RATE_LIMITED': 'Too many requests. Please wait a moment and try again.',
      'SERVER_ERROR': 'Service temporarily unavailable. Please try again in a few minutes.',
      'AUTH_ERROR': 'Authentication failed. Please refresh the page and try again.',
      'NOT_FOUND': 'The requested information is not available.',
      'UNKNOWN_ERROR': 'An unexpected error occurred. Please try again.'
    };

    const message = userMessages[error.code] || error.message;
    const enhancedError = new Error(message);
    (enhancedError as any).code = error.code;
    (enhancedError as any).severity = error.severity;
    (enhancedError as any).context = context;

    return enhancedError;
  }

  // Log errors for monitoring
  private logError(error: ApiError, context?: ErrorContext): void {
    const logEntry = {
      error,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        online: navigator.onLine
      },
      timestamp: new Date().toISOString()
    };

    this.errorLog.push(logEntry);
    
    // Keep only last 100 errors to prevent memory issues
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', logEntry);
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production' && error.severity === 'critical') {
      this.sendToMonitoring(logEntry);
    }
  }

  // Log successful recovery
  private logRecovery(context?: ErrorContext, attempt?: number): void {
    console.log(`API recovered after ${attempt} attempts`, context);
  }

  // Log fallback success
  private logFallbackSuccess(context?: ErrorContext): void {
    console.log('Fallback API succeeded', context);
  }

  // Send critical errors to monitoring service
  private async sendToMonitoring(logEntry: any): Promise<void> {
    try {
      // In a real implementation, this would send to a monitoring service
      // like Sentry, LogRocket, or custom analytics
      await fetch('/api/monitoring/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry)
      });
    } catch (error) {
      console.error('Failed to send error to monitoring:', error);
    }
  }

  // Get error statistics
  getErrorStats(): {
    totalErrors: number;
    errorsByCode: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    recentErrors: Array<{ error: ApiError; context: ErrorContext; timestamp: string }>;
  } {
    const errorsByCode: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};

    this.errorLog.forEach(entry => {
      errorsByCode[entry.error.code] = (errorsByCode[entry.error.code] || 0) + 1;
      errorsBySeverity[entry.error.severity] = (errorsBySeverity[entry.error.severity] || 0) + 1;
    });

    return {
      totalErrors: this.errorLog.length,
      errorsByCode,
      errorsBySeverity,
      recentErrors: this.errorLog.slice(-10)
    };
  }

  // Clear error log
  clearErrorLog(): void {
    this.errorLog = [];
  }

  // Check system health
  async checkSystemHealth(): Promise<{
    online: boolean;
    apiHealth: Record<string, 'healthy' | 'degraded' | 'down'>;
    lastErrors: ApiError[];
  }> {
    const health = {
      online: navigator.onLine,
      apiHealth: {} as Record<string, 'healthy' | 'degraded' | 'down'>,
      lastErrors: this.errorLog.slice(-5).map(entry => entry.error)
    };

    // Test critical APIs
    const apiTests = [
      { name: 'weather', url: '/api/weather/health' },
      { name: 'locations', url: '/api/locations/health' },
      { name: 'safety', url: '/api/safety/health' }
    ];

    for (const test of apiTests) {
      try {
        const response = await fetch(test.url, { 
          method: 'HEAD', 
          timeout: 5000 
        } as any);
        health.apiHealth[test.name] = response.ok ? 'healthy' : 'degraded';
      } catch (error) {
        health.apiHealth[test.name] = 'down';
      }
    }

    return health;
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Utility functions for common error scenarios
export const withErrorHandling = <T>(
  apiCall: () => Promise<T>,
  fallback?: () => Promise<T>,
  context?: ErrorContext
): Promise<T> => {
  return errorHandler.resilientApiCall(apiCall, fallback, context);
};

export const handleOfflineScenario = <T>(
  onlineCall: () => Promise<T>,
  offlineData: T,
  context?: ErrorContext
): Promise<T> => {
  if (!navigator.onLine) {
    console.log('Offline mode: returning cached data', context);
    return Promise.resolve(offlineData);
  }
  
  return withErrorHandling(
    onlineCall,
    () => Promise.resolve(offlineData),
    context
  );
};
