'use client'

import { Provider } from 'react-redux'
import { store } from './store'
import { useEffect } from 'react'
import { restoreAuth } from './slices/authSlice'
import { getToken, getUser, isAuthenticated, getTabId } from '@/utils/sessionStorage'

// Helper to set cookie
function setCookie(name, value, days = 7) {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
}

// Helper to delete cookie
function deleteCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`
}

export function ReduxProvider({ children }) {
  useEffect(() => {
    // Restore auth from sessionStorage on mount (tab-specific)
    if (typeof window !== 'undefined') {
      const token = getToken()
      const user = getUser()
      const isAuth = isAuthenticated()
      
      if (token && user && isAuth) {
        try {
          store.dispatch(restoreAuth({ user, token }))
          
          // Set cookies for middleware
          const tabId = getTabId()
          setCookie('isAuthenticated', 'true', 7)
          setCookie('userRole', user.role, 7)
          setCookie(`token_${tabId}`, token, 7)
        } catch (err) {
          console.error('Failed to restore auth:', err)
          sessionStorage.clear()
          deleteCookie('isAuthenticated')
          deleteCookie('userRole')
        }
      } else {
        // Clear cookies if no auth in this tab
        deleteCookie('isAuthenticated')
        deleteCookie('userRole')
      }
    }
  }, [])

  return <Provider store={store}>{children}</Provider>
}
