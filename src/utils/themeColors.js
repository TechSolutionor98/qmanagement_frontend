/**
 * Theme colors configuration and presets for Ticket Info Screens (Horizontal & Vertical)
 */

export const DEFAULT_THEME_COLORS = {
  // Table Styling
  tableHeaderBg: '#16909B',       // Header row background (default teal)
  tableHeaderColor: '#FFFFFF',    // Header row text color
  tableRowBg: '#FFFFFF',          // Normal table row background
  tableRowColor: '#000000',       // Normal ticket & counter text
  tableBorderColor: '#E6E9EC',    // Border between rows
  
  // Highlight / Calling Ticket in Table
  activeTicketBg: '#FEF08A',      // Highlight row for currently called ticket (yellow-200)
  activeTicketColor: '#000000',   // Active ticket text color
  
  // Header / Calling Box
  headerBg: '#FFFFFF',            // Header section background
  nowCallingColor: '#DC2626',     // "Now Calling" label color (red-600)
  nowCallingTextColor: '#000000', // Ticket & Counter text color in header box
  
  // Ticker Bar
  tickerBg: '#333333',            // News ticker background
  tickerColor: '#FFFFFF',         // News ticker text color
  
  // Screen Background
  screenBg: '#FFFFFF',            // Overall page background

  // Permission setting
  allowUserCustomization: true    // Allow users/screens to customize colors
};

export const THEME_PRESETS = [
  {
    id: 'default_teal',
    name: 'Teal Horizon (Default)',
    description: 'Classic professional teal theme',
    badgeColor: '#16909B',
    colors: {
      tableHeaderBg: '#16909B',
      tableHeaderColor: '#FFFFFF',
      tableRowBg: '#FFFFFF',
      tableRowColor: '#000000',
      tableBorderColor: '#E6E9EC',
      activeTicketBg: '#FEF08A',
      activeTicketColor: '#000000',
      headerBg: '#FFFFFF',
      nowCallingColor: '#DC2626',
      nowCallingTextColor: '#000000',
      tickerBg: '#333333',
      tickerColor: '#FFFFFF',
      screenBg: '#FFFFFF'
    }
  },
  {
    id: 'royal_blue',
    name: 'Royal Blue (Banking)',
    description: 'Trustworthy corporate deep blue theme',
    badgeColor: '#1E40AF',
    colors: {
      tableHeaderBg: '#1E40AF',
      tableHeaderColor: '#FFFFFF',
      tableRowBg: '#FFFFFF',
      tableRowColor: '#0F172A',
      tableBorderColor: '#E2E8F0',
      activeTicketBg: '#DBEAFE',
      activeTicketColor: '#1E3A8A',
      headerBg: '#F8FAFC',
      nowCallingColor: '#1D4ED8',
      nowCallingTextColor: '#0F172A',
      tickerBg: '#0F172A',
      tickerColor: '#60A5FA',
      screenBg: '#F8FAFC'
    }
  },
  {
    id: 'emerald_green',
    name: 'Emerald Green (Hospital / Gov)',
    description: 'Clean medical and government green theme',
    badgeColor: '#059669',
    colors: {
      tableHeaderBg: '#059669',
      tableHeaderColor: '#FFFFFF',
      tableRowBg: '#FFFFFF',
      tableRowColor: '#064E3B',
      tableBorderColor: '#E2E8F0',
      activeTicketBg: '#D1FAE5',
      activeTicketColor: '#064E3B',
      headerBg: '#FFFFFF',
      nowCallingColor: '#047857',
      nowCallingTextColor: '#064E3B',
      tickerBg: '#064E3B',
      tickerColor: '#A7F3D0',
      screenBg: '#F0FDF4'
    }
  },
  {
    id: 'luxury_dark',
    name: 'Modern Dark Slate',
    description: 'Sleek premium dark mode for VIP lounges',
    badgeColor: '#0F172A',
    colors: {
      tableHeaderBg: '#0F172A',
      tableHeaderColor: '#38BDF8',
      tableRowBg: '#1E293B',
      tableRowColor: '#F8FAFC',
      tableBorderColor: '#334155',
      activeTicketBg: '#F59E0B',
      activeTicketColor: '#000000',
      headerBg: '#0F172A',
      nowCallingColor: '#F59E0B',
      nowCallingTextColor: '#FFFFFF',
      tickerBg: '#020617',
      tickerColor: '#38BDF8',
      screenBg: '#0B0F17'
    }
  },
  {
    id: 'crimson_ruby',
    name: 'Crimson Ruby',
    description: 'High visibility energetic red theme',
    badgeColor: '#BE123C',
    colors: {
      tableHeaderBg: '#BE123C',
      tableHeaderColor: '#FFFFFF',
      tableRowBg: '#FFFFFF',
      tableRowColor: '#881337',
      tableBorderColor: '#FFE4E6',
      activeTicketBg: '#FFE4E6',
      activeTicketColor: '#881337',
      headerBg: '#FFFFFF',
      nowCallingColor: '#E11D48',
      nowCallingTextColor: '#881337',
      tickerBg: '#881337',
      tickerColor: '#FECDD3',
      screenBg: '#FFF1F2'
    }
  },
  {
    id: 'purple_elegance',
    name: 'Purple Elegance',
    description: 'Sophisticated modern violet theme',
    badgeColor: '#6D28D9',
    colors: {
      tableHeaderBg: '#6D28D9',
      tableHeaderColor: '#FFFFFF',
      tableRowBg: '#FFFFFF',
      tableRowColor: '#3B0764',
      tableBorderColor: '#EDE9FE',
      activeTicketBg: '#EDE9FE',
      activeTicketColor: '#4C1D95',
      headerBg: '#FAF5FF',
      nowCallingColor: '#7C3AED',
      nowCallingTextColor: '#3B0764',
      tickerBg: '#4C1D95',
      tickerColor: '#DDD6FE',
      screenBg: '#FAF5FF'
    }
  },
  {
    id: 'golden_amber',
    name: 'Golden Amber',
    description: 'Warm gold theme for financial services',
    badgeColor: '#B45309',
    colors: {
      tableHeaderBg: '#B45309',
      tableHeaderColor: '#FFFFFF',
      tableRowBg: '#FFFFFF',
      tableRowColor: '#451A03',
      tableBorderColor: '#FEF3C7',
      activeTicketBg: '#FEF3C7',
      activeTicketColor: '#78350F',
      headerBg: '#FFFBEB',
      nowCallingColor: '#D97706',
      nowCallingTextColor: '#451A03',
      tickerBg: '#451A03',
      tickerColor: '#FCD34D',
      screenBg: '#FFFBEB'
    }
  }
];

/**
 * Safely parse theme colors from string or object, merging with defaults
 */
export function parseThemeColors(raw) {
  if (!raw) return { ...DEFAULT_THEME_COLORS };
  
  let parsed = {};
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse theme_colors JSON:', e);
      parsed = {};
    }
  } else if (typeof raw === 'object' && raw !== null) {
    parsed = raw;
  }

  // Filter out null, undefined, or empty values so they fallback to DEFAULT_THEME_COLORS
  const cleanParsed = {};
  for (const key of Object.keys(parsed || {})) {
    const val = parsed[key];
    if (val !== null && val !== undefined && val !== '') {
      cleanParsed[key] = val;
    }
  }

  return {
    ...DEFAULT_THEME_COLORS,
    ...cleanParsed
  };
}

