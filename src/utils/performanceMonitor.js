/**
 * Performance Monitoring Utilities
 * Track and optimize application performance
 */

// Web Vitals tracking
export function reportWebVitals(metric) {
  const { name, value, id, label } = metric;
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${name}:`, {
      value: Math.round(value),
      id,
      label
    });
  }
  
  // Send to analytics in production
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    // Example: Send to Google Analytics
    if (window.gtag) {
      window.gtag('event', name, {
        event_category: label === 'web-vital' ? 'Web Vitals' : 'Custom',
        value: Math.round(name === 'CLS' ? value * 1000 : value),
        event_label: id,
        non_interaction: true,
      });
    }
    
    // Example: Send to custom analytics endpoint
    if (navigator.sendBeacon) {
      const body = JSON.stringify({
        name,
        value,
        id,
        label,
        url: window.location.href,
        timestamp: Date.now()
      });
      
      navigator.sendBeacon('/api/analytics/web-vitals', body);
    }
  }
}

// Performance monitoring class
export class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.marks = {};
  }
  
  // Start timing an operation
  startMeasure(name) {
    if (typeof performance !== 'undefined') {
      this.marks[name] = performance.now();
    }
  }
  
  // End timing an operation
  endMeasure(name, logToConsole = true) {
    if (typeof performance !== 'undefined' && this.marks[name]) {
      const duration = performance.now() - this.marks[name];
      this.metrics[name] = duration;
      
      if (logToConsole && process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
      }
      
      delete this.marks[name];
      return duration;
    }
    return null;
  }
  
  // Get all metrics
  getMetrics() {
    return { ...this.metrics };
  }
  
  // Clear all metrics
  clearMetrics() {
    this.metrics = {};
    this.marks = {};
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// API call tracking
export class APIPerformanceTracker {
  constructor() {
    this.calls = [];
    this.maxCalls = 100; // Keep last 100 calls
  }
  
  track(endpoint, method, duration, status) {
    this.calls.push({
      endpoint,
      method,
      duration,
      status,
      timestamp: Date.now()
    });
    
    // Keep only last maxCalls
    if (this.calls.length > this.maxCalls) {
      this.calls.shift();
    }
    
    // Log slow API calls
    if (duration > 1000 && process.env.NODE_ENV === 'development') {
      console.warn(`[API Performance] Slow API call: ${method} ${endpoint} (${duration}ms)`);
    }
  }
  
  getStats() {
    if (this.calls.length === 0) return null;
    
    const durations = this.calls.map(c => c.duration);
    const sum = durations.reduce((a, b) => a + b, 0);
    
    return {
      totalCalls: this.calls.length,
      averageTime: sum / this.calls.length,
      minTime: Math.min(...durations),
      maxTime: Math.max(...durations),
      slowCalls: this.calls.filter(c => c.duration > 1000).length
    };
  }
  
  getCalls() {
    return [...this.calls];
  }
  
  clear() {
    this.calls = [];
  }
}

// Create singleton instance
export const apiTracker = new APIPerformanceTracker();

// Component render tracking
export function withRenderTracking(Component, componentName) {
  if (process.env.NODE_ENV === 'production') {
    return Component;
  }
  
  let renderCount = 0;
  
  return function TrackedComponent(props) {
    renderCount++;
    
    if (renderCount % 10 === 0) {
      console.log(`[Render] ${componentName} has rendered ${renderCount} times`);
    }
    
    return Component(props);
  };
}

// Memory usage monitoring
export function getMemoryUsage() {
  if (typeof performance !== 'undefined' && performance.memory) {
    return {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      usedPercentage: ((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100).toFixed(2)
    };
  }
  return null;
}

// Log memory usage
export function logMemoryUsage() {
  const memory = getMemoryUsage();
  if (memory) {
    console.log('[Memory Usage]', {
      used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
      percentage: `${memory.usedPercentage}%`
    });
  }
}

// Debounce utility for performance
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle utility for performance
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Lazy load utility
export function lazyLoad(importFunc, options = {}) {
  const { fallback = null } = options;
  
  if (typeof window === 'undefined') {
    return importFunc;
  }
  
  return () => importFunc().catch(err => {
    console.error('[Lazy Load] Failed to load component:', err);
    return fallback;
  });
}

// Resource timing API helper
export function getResourceTiming(resourceType) {
  if (typeof performance === 'undefined' || !performance.getEntriesByType) {
    return [];
  }
  
  const resources = performance.getEntriesByType('resource');
  
  if (resourceType) {
    return resources.filter(r => r.initiatorType === resourceType);
  }
  
  return resources;
}

// Navigation timing helper
export function getNavigationTiming() {
  if (typeof performance === 'undefined' || !performance.getEntriesByType) {
    return null;
  }
  
  const [navigation] = performance.getEntriesByType('navigation');
  
  if (!navigation) return null;
  
  return {
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcp: navigation.connectEnd - navigation.connectStart,
    ttfb: navigation.responseStart - navigation.requestStart,
    download: navigation.responseEnd - navigation.responseStart,
    domInteractive: navigation.domInteractive - navigation.fetchStart,
    domComplete: navigation.domComplete - navigation.fetchStart,
    loadComplete: navigation.loadEventEnd - navigation.fetchStart
  };
}

// Check if performance API is available
export function isPerformanceAPIAvailable() {
  return typeof performance !== 'undefined';
}

// Export all utilities
export default {
  reportWebVitals,
  PerformanceMonitor,
  performanceMonitor,
  APIPerformanceTracker,
  apiTracker,
  withRenderTracking,
  getMemoryUsage,
  logMemoryUsage,
  debounce,
  throttle,
  lazyLoad,
  getResourceTiming,
  getNavigationTiming,
  isPerformanceAPIAvailable
};
