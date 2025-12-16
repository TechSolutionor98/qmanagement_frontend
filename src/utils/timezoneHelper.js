/**
 * Timezone Helper Utilities
 * Convert times between timezones based on admin's saved timezone
 */

/**
 * Convert UTC time to admin's timezone
 * @param {Date|string} utcTime - UTC time to convert
 * @param {string} timezoneOffset - Timezone offset like "+05:00" or "-05:00"
 * @returns {Date} - Date object in the specified timezone
 */
export const convertToAdminTimezone = (utcTime, timezoneOffset) => {
  if (!utcTime || !timezoneOffset) return new Date(utcTime);

  const date = new Date(utcTime);
  
  // Parse offset like "+05:00" or "-05:00"
  const sign = timezoneOffset[0] === '+' ? 1 : -1;
  const [hours, minutes] = timezoneOffset.slice(1).split(':').map(Number);
  const offsetMs = sign * (hours * 60 + minutes) * 60 * 1000;
  
  // UTC offset is 0, so we add the timezone offset
  const localTime = new Date(date.getTime() + offsetMs);
  return localTime;
};

/**
 * Format time for display in admin's timezone
 * @param {Date|string} utcTime - UTC time to format
 * @param {string} timezoneOffset - Timezone offset like "+05:00"
 * @param {string} format - Format style: 'long', 'short', 'time-only'
 * @returns {string} - Formatted time string
 */
export const formatTimeInTimezone = (utcTime, timezoneOffset, format = 'long') => {
  if (!utcTime || !timezoneOffset) {
    return new Date(utcTime).toLocaleString();
  }

  const localDate = convertToAdminTimezone(utcTime, timezoneOffset);
  
  if (format === 'time-only') {
    return localDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  }
  
  if (format === 'short') {
    return localDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }) + ' ' + localDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }
  
  // 'long' format (default)
  return localDate.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

/**
 * Get current time in admin's timezone
 * @param {string} timezoneOffset - Timezone offset like "+05:00"
 * @returns {Date} - Current time in admin's timezone
 */
export const getNowInTimezone = (timezoneOffset) => {
  return convertToAdminTimezone(new Date(), timezoneOffset);
};

/**
 * Convert Date object to timestamp string in admin's timezone
 * For saving to database in ISO format
 * @param {Date|string} date - Date to convert
 * @param {string} timezoneOffset - Timezone offset
 * @returns {string} - ISO string representing the time in that timezone
 */
export const getTimestampInTimezone = (date, timezoneOffset) => {
  if (!date || !timezoneOffset) {
    return new Date(date).toISOString();
  }

  const localDate = convertToAdminTimezone(date, timezoneOffset);
  return localDate.toISOString();
};

/**
 * Get timezone name from offset
 * @param {string} offset - Timezone offset like "+05:00"
 * @returns {string} - Timezone name
 */
export const getTimezoneName = (offset) => {
  const timezoneMap = {
    '+05:00': 'PKT (Pakistan)',
    '+04:00': 'GST (UAE)',
    '+03:00': 'EAT (East Africa)',
    '+02:00': 'CAT (Central Africa)',
    '+01:00': 'WAT (West Africa)',
    '+00:00': 'UTC',
    '-05:00': 'EST (USA East)',
    '-06:00': 'CST (USA Central)',
    '-07:00': 'MST (USA Mountain)',
    '-08:00': 'PST (USA West)',
  };
  
  return timezoneMap[offset] || offset;
};
