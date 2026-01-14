'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import { HiDocumentText } from 'react-icons/hi';

export default function UserSidebar({ isMobileOpen = false, onClose = () => {} }) {
  const pathname = usePathname();
  const [username, setUsername] = useState('User');
  const [counter, setCounter] = useState('-');
  const [permissions, setPermissions] = useState(null);
  const [userRole, setUserRole] = useState('user');

  // Close mobile menu on navigation
  useEffect(() => {
    onClose();
  }, [pathname]);

  // Function to refresh user data from localStorage
  const refreshUserData = () => {
    const userStr = localStorage.getItem('user');
    console.log('🔄 [UserSidebar] Refreshing user data from localStorage');
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        
        setUsername(user.username || 'User');
        setCounter(user.counter_no || user.counterNo || '-');
        setUserRole(user.role || 'user');
        
        // Parse permissions
        let userPermissions = user.permissions;
        
        if (typeof userPermissions === 'string') {
          try {
            userPermissions = JSON.parse(userPermissions);
          } catch (e) {
            console.error('❌ [UserSidebar] Failed to parse permissions:', e);
            userPermissions = null;
          }
        }
        
        setPermissions(userPermissions);
        console.log('✅ [UserSidebar] Permissions refreshed:', userPermissions);
      } catch (error) {
        console.error('❌ [UserSidebar] Error parsing user data:', error);
      }
    }
  };

  useEffect(() => {
    // Initial load
    refreshUserData();
    
    // 🔄 Auto-refresh every 5 seconds to pick up permission changes (faster for testing)
    const refreshInterval = setInterval(() => {
      refreshUserData();
    }, 5000); // 5 seconds for faster updates

    // 📡 Listen for custom storage events (when permissions update)
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === null) {
        console.log('🔔 [UserSidebar] Storage changed - refreshing permissions');
        refreshUserData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const isActive = (path) => pathname === path;
  
  // Check if user has specific permission
  const hasPermission = (permission) => {
    // Admin and super_admin have all permissions
    if (userRole === 'admin' || userRole === 'super_admin') {
      console.log(`✅ [hasPermission] ${permission}: Admin bypass = true`);
      return true;
    }
    
    const result = permissions && permissions[permission] === true;
    console.log(`🔐 [hasPermission] ${permission}:`, {
      permissionsExist: !!permissions,
      permissionValue: permissions?.[permission],
      result: result
    });
    
    return result;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          w-48 lg:w-64 bg-white border-r border-gray-200 h-screen
          flex flex-col overflow-y-auto mt-16 md:mt-16 lg:mt-0
          transition-transform duration-300 ease-in-out
          fixed top-0 left-0 z-50 lg:sticky lg:top-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Close button for mobile */}
        {/* <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 text-gray-600 hover:text-gray-800 p-2"
          aria-label="Close menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button> */}

        {/* User Info */}
        <div className="px-2 lg:px-4 py-6 border-b border-gray-200">
        <p className="text-xs lg:text-sm text-gray-600 mb-2">
          <span className="font-normal">User: </span>
          <span className="font-semibold text-gray-800">{username}</span>
        </p>
        <p className="text-xs lg:text-sm text-gray-600">
          <span className="font-normal">Counter: </span>
          <span className="font-semibold text-gray-800">{counter}</span>
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3">
        <div className="px-2 lg:px-4 mb-2 pb-2 border-b border-gray-200">
          <p className="text-[10px] lg:text-xs font-semibold text-gray-400 uppercase tracking-wider">MISC</p>
        </div>

        {/* User Dashboard - Only show if user has canCallTickets permission */}
        {hasPermission('canCallTickets') && (
          <Link
            href="/user/dashboard"
            className={`flex items-center gap-2 lg:gap-3 px-2 lg:px-4 py-2.5 transition-colors ${
              isActive('/user/dashboard') || pathname?.includes('/dashboard')
                ? 'bg-green-50 text-green-600 border-r-4 border-green-600' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <MdDashboard className="text-sm lg:text-base" />
            <span className="text-xs lg:text-sm font-normal">User Dashboard</span>
          </Link>
        )}

        {/* Completed Tasks - Only show if user has canCreateTickets permission */}
        {hasPermission('canCreateTickets') && (
          <Link
            href="/user/completed-tasks"
            className={`flex items-center gap-2 lg:gap-3 px-2 lg:px-4 py-2.5 transition-colors ${
              isActive('/user/completed-tasks') || pathname?.includes('/completed-tasks')
                ? 'bg-green-50 text-green-600 border-r-4 border-green-600' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <HiDocumentText className="text-sm lg:text-base" />
            <span className="text-xs lg:text-sm font-normal">Completed Tasks</span>
          </Link>
        )}
      </nav>
    </aside>
    </>
  );
}
