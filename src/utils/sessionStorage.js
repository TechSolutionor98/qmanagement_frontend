// Session storage utilities for tab-specific authentication

// Get unique tab ID
export const getTabId = () => {
  if (typeof window === 'undefined') return null
  
  let tabId = sessionStorage.getItem('tabId')
  if (!tabId) {
    tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('tabId', tabId)
  }
  return tabId
}

// Get tab-specific storage key
export const getStorageKey = (key) => {
  const tabId = getTabId()
  return tabId ? `${key}_${tabId}` : key
}

// Get token from session storage (tab-specific)
export const getToken = () => {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(getStorageKey('token'))
}

// Get user from session storage (tab-specific)
export const getUser = () => {
  if (typeof window === 'undefined') return null
  const userStr = sessionStorage.getItem(getStorageKey('user'))
  return userStr ? JSON.parse(userStr) : null
}

// Check if authenticated in current tab
export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(getStorageKey('isAuthenticated')) === 'true'
}

// Set session data (tab-specific)
export const setSessionData = (token, user) => {
  if (typeof window === 'undefined') return
  
  sessionStorage.setItem(getStorageKey('token'), token)
  sessionStorage.setItem(getStorageKey('user'), JSON.stringify(user))
  sessionStorage.setItem(getStorageKey('isAuthenticated'), 'true')
}

// Clear session data (tab-specific)
export const clearSessionData = () => {
  if (typeof window === 'undefined') return
  
  sessionStorage.removeItem(getStorageKey('token'))
  sessionStorage.removeItem(getStorageKey('user'))
  sessionStorage.removeItem(getStorageKey('isAuthenticated'))
}
