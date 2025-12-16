/**
 * Timezone Utility - Global Timezone Handler
 * Converts UTC timestamps to user's local timezone
 * Author: Queue Management System
 * Date: December 15, 2025
 */

/**
 * Format date to user's local timezone with full date and time
 * @param {string|Date} dateString - ISO date string or Date object from backend
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string in user's local timezone
 */
export const formatToLocalTime = (dateString, options = {}) => {
  if (!dateString) return '-';
  
  try {
    // Backend saves in UTC (timezone: "+00:00")
    // Convert MySQL format to UTC ISO format
    let date;
    if (typeof dateString === 'string' && dateString.includes(' ') && !dateString.includes('T')) {
      // MySQL format: "2025-12-15 08:00:00" - This is UTC time from backend
      const utcString = dateString.replace(' ', 'T') + 'Z';
      date = new Date(utcString);
    } else {
      date = new Date(dateString);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return '-';
    }

    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      ...options
    };

    // Use user's browser locale and timezone - this automatically converts UTC to local time
    return new Intl.DateTimeFormat(navigator.language || 'en-US', defaultOptions).format(date);
  } catch (error) {
    console.error('Error formatting date:', error, dateString);
    return '-';
  }
};

/**
 * Format date without time (date only)
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {string} Formatted date string
 */
export const formatDateOnly = (dateString) => {
  return formatToLocalTime(dateString, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: undefined,
    minute: undefined,
    second: undefined
  });
};

/**
 * Format time only (no date)
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {string} Formatted time string
 */
export const formatTimeOnly = (dateString) => {
  return formatToLocalTime(dateString, {
    year: undefined,
    month: undefined,
    day: undefined,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

/**
 * Format date with short format (compact)
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {string} Formatted short date string
 */
export const formatShortDate = (dateString) => {
  return formatToLocalTime(dateString, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format date for activity logs (detailed)
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {string} Formatted activity log date string
 */
export const formatActivityLogDate = (dateString) => {
  if (!dateString) return '-';
  
  try {
    // Backend now saves in UTC (timezone: "+00:00" in database config)
    // MySQL format needs to be converted to UTC ISO format
    let date;
    if (typeof dateString === 'string' && dateString.includes(' ') && !dateString.includes('T')) {
      // MySQL format: "2025-12-15 08:00:00" - This is now in UTC
      // Add 'Z' to mark it as UTC time
      const utcString = dateString.replace(' ', 'T') + 'Z';
      date = new Date(utcString);
      console.log('🌍 [Global Timezone] UTC from backend:', dateString, '→', utcString);
    } else if (typeof dateString === 'string' && dateString.endsWith('Z')) {
      // Already ISO UTC format: "2025-12-15T08:00:00.000Z"
      date = new Date(dateString);
    } else {
      // Try to parse as-is
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) {
      console.error('❌ [Timezone] Invalid date:', dateString);
      return '-';
    }

    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // Debug logging
    console.log('🕐 [Timezone]', {
      input: dateString,
      utcTime: date.toISOString(),
      yourLocalTime: date.toLocaleString(),
      diffMins,
      diffHours
    });

    // Show relative time for recent activities
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    // Otherwise show full date in local timezone
    return formatToLocalTime(dateString);
  } catch (error) {
    console.error('Error formatting activity log date:', error);
    return '-';
  }
};

/**
 * Get relative time (e.g., "2 hours ago", "3 days ago")
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {string} Relative time string
 */
export const getRelativeTime = (dateString) => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffWeeks < 5) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
    if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
  } catch (error) {
    console.error('Error getting relative time:', error);
    return '-';
  }
};

/**
 * Get user's timezone name
 * @returns {string} Timezone name (e.g., "Asia/Dubai", "America/New_York")
 */
export const getUserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.error('Error getting timezone:', error);
    return 'UTC';
  }
};

/**
 * Get timezone offset in hours
 * @returns {string} Timezone offset (e.g., "+4:00", "-5:00")
 */
export const getTimezoneOffset = () => {
  const offset = new Date().getTimezoneOffset();
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;
  const sign = offset <= 0 ? '+' : '-';
  return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Convert local time to UTC ISO string for sending to backend
 * @param {Date} localDate - Local date object
 * @returns {string} UTC ISO string
 */
export const toUTCString = (localDate) => {
  try {
    return new Date(localDate).toISOString();
  } catch (error) {
    console.error('Error converting to UTC:', error);
    return new Date().toISOString();
  }
};

/**
 * Format for Excel/CSV export (locale-aware)
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {string} Formatted date for export
 */
export const formatForExport = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return formatToLocalTime(date, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('Error formatting for export:', error);
    return '';
  }
};

// Default export
export default {
  formatToLocalTime,
  formatDateOnly,
  formatTimeOnly,
  formatShortDate,
  formatActivityLogDate,
  getRelativeTime,
  getUserTimezone,
  getTimezoneOffset,
  toUTCString,
  formatForExport
};
