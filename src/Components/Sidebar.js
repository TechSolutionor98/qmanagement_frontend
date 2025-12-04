'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { FaUser, FaBell, FaTv, FaSignOutAlt } from 'react-icons/fa';
import { MdSettings, MdDashboard } from 'react-icons/md';
import { HiDocumentReport } from 'react-icons/hi';
import { FaUsers, FaFileContract } from 'react-icons/fa6';
import { IoChevronForward } from 'react-icons/io5';

export default function Sidebar() {
  const pathname = usePathname();
  const currentUser = useSelector(selectCurrentUser);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [isLicenseOpen, setIsLicenseOpen] = useState(false);

  // Extract role from pathname instead of using state
  const role = pathname.split('/')[1] || 'admin';
  
  // Check if user is super admin
  const isSuperAdmin = currentUser?.role === 'super_admin';

  const isActive = (path) => pathname === path;

  // Auto-open dropdown based on current pathname
  useEffect(() => {
    if (pathname.includes('/services')) {
      setIsServicesOpen(true);
      setIsReportsOpen(false);
      setIsUsersOpen(false);
      setIsLicenseOpen(false);
    } else if (pathname.includes('/reports')) {
      setIsReportsOpen(true);
      setIsServicesOpen(false);
      setIsUsersOpen(false);
      setIsLicenseOpen(false);
    } else if (pathname.includes('/users')) {
      setIsUsersOpen(true);
      setIsServicesOpen(false);
      setIsReportsOpen(false);
      setIsLicenseOpen(false);
    } else if (pathname.includes('/license')) {
      setIsLicenseOpen(true);
      setIsServicesOpen(false);
      setIsReportsOpen(false);
      setIsUsersOpen(false);
    }
  }, [pathname]);

  // Handle dropdown toggle - close others when one opens
  const handleServicesToggle = () => {
    setIsServicesOpen(!isServicesOpen);
    setIsReportsOpen(false);
    setIsUsersOpen(false);
    setIsLicenseOpen(false);
  };

  const handleReportsToggle = () => {
    setIsReportsOpen(!isReportsOpen);
    setIsServicesOpen(false);
    setIsUsersOpen(false);
    setIsLicenseOpen(false);
  };

  const handleUsersToggle = () => {
    setIsUsersOpen(!isUsersOpen);
    setIsServicesOpen(false);
    setIsReportsOpen(false);
    setIsLicenseOpen(false);
  };

  const handleLicenseToggle = () => {
    setIsLicenseOpen(!isLicenseOpen);
    setIsServicesOpen(false);
    setIsReportsOpen(false);
    setIsUsersOpen(false);
  };

  return (
    <aside className="w-64 h-screen fixed top-0 left-0 flex flex-col overflow-y-auto z-40" style={{ backgroundColor: '#2d3540', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
      {/* Navigation */}
      <nav className="flex-1 py-6">
        <div className="px-6 mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">MENU</p>
        </div>

        {/* License Management - Only for Super Admin */}
        {isSuperAdmin && (
          <div>
            <button
              onClick={handleLicenseToggle}
              className={`flex items-center justify-between w-full px-6 py-3 transition-all duration-200 ${
                pathname.includes('/license') ? 'bg-green-500 text-white' : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <FaFileContract className="text-lg" />
                <span className="text-sm font-medium">License Management</span>
              </div>
              <IoChevronForward className={`text-sm transition-transform duration-200 ${isLicenseOpen ? 'rotate-90' : ''}`} />
            </button>
            {isLicenseOpen && (
              <div className="bg-black/20 py-1">
                <Link
                  href={`/${role}/license/create-license`}
                  className={`flex items-center gap-3 px-12 py-2.5 transition-all duration-200 ${
                    pathname.includes('/license/create-license') ? 'text-white bg-green-500' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    pathname.includes('/license/create-license') ? 'bg-white' : 'bg-gray-500'
                  }`}></span>
                  <span className="text-sm">Create License</span>
                </Link>
                <Link
                  href={`/${role}/license/license-report`}
                  className={`flex items-center gap-3 px-12 py-2.5 transition-all duration-200 ${
                    pathname.includes('/license/license-report') ? 'text-white bg-green-500' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    pathname.includes('/license/license-report') ? 'bg-white' : 'bg-gray-500'
                  }`}></span>
                  <span className="text-sm">License Report</span>
                </Link>
                <Link
                  href={`/${role}/license/list-of-license`}
                  className={`flex items-center gap-3 px-12 py-2.5 transition-all duration-200 ${
                    pathname.includes('/license/list-of-license') ? 'text-white bg-green-500' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    pathname.includes('/license/list-of-license') ? 'bg-white' : 'bg-gray-500'
                  }`}></span>
                  <span className="text-sm">List of License</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Services - Hidden for Super Admin */}
        {!isSuperAdmin && (
          <div>
            <button
              onClick={handleServicesToggle}
              className={`flex items-center justify-between w-full px-6 py-3 transition-all duration-200 ${
                pathname.includes('/services') ? 'bg-green-500 text-white' : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <MdSettings className="text-lg" />
                <span className="text-sm font-medium">Services</span>
              </div>
              <IoChevronForward className={`text-sm transition-transform duration-200 ${isServicesOpen ? 'rotate-90' : ''}`} />
            </button>
            {isServicesOpen && (
              <div className="bg-black/20 py-1">
                <Link
                  href={`/${role}/services/create-services`}
                  className={`flex items-center gap-3 px-12 py-2.5 transition-all duration-200 ${
                    pathname.includes('/services/create-services') ? 'text-white bg-green-500' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    pathname.includes('/services/create-services') ? 'bg-white' : 'bg-gray-500'
                  }`}></span>
                  <span className="text-sm">Create Services</span>
                </Link>
                <Link
                  href={`/${role}/services/assign-services`}
                  className={`flex items-center gap-3 px-12 py-2.5 transition-all duration-200 ${
                    pathname.includes('/services/assign-services') ? 'text-white bg-green-500' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    pathname.includes('/services/assign-services') ? 'bg-white' : 'bg-gray-500'
                  }`}></span>
                  <span className="text-sm">Assign Services</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Reports - Hidden for Super Admin */}
        {!isSuperAdmin && (
          <div>
            <button
              onClick={handleReportsToggle}
              className={`flex items-center justify-between w-full px-6 py-3 transition-all duration-200 ${
                pathname.includes('/reports') ? 'bg-green-500 text-white' : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <HiDocumentReport className="text-lg" />
                <span className="text-sm font-medium">Reports</span>
              </div>
              <IoChevronForward className={`text-sm transition-transform duration-200 ${isReportsOpen ? 'rotate-90' : ''}`} />
            </button>
            {isReportsOpen && (
              <div className="bg-black/20 py-1">
                <Link
                  href={`/${role}/reports/short-reports`}
                  className={`flex items-center gap-3 px-12 py-2.5 transition-all duration-200 ${
                    pathname.includes('/reports/short-reports') ? 'text-white bg-green-500' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    pathname.includes('/reports/short-reports') ? 'bg-white' : 'bg-gray-500'
                  }`}></span>
                  <span className="text-sm">Short Reports</span>
                </Link>
                <Link
                  href={`/${role}/reports/details-reports`}
                  className={`flex items-center gap-3 px-12 py-2.5 transition-all duration-200 ${
                    pathname.includes('/reports/details-reports') ? 'text-white bg-green-500' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    pathname.includes('/reports/details-reports') ? 'bg-white' : 'bg-gray-500'
                  }`}></span>
                  <span className="text-sm">Details Reports</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Configuration - Hidden for Super Admin */}
        {!isSuperAdmin && (
          <Link
            href={`/${role}/configuration`}
            className={`flex items-center gap-3 px-6 py-3 transition-all duration-200 ${
              pathname.includes('/configuration') ? 'bg-green-500 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <FaBell className="text-lg" />
            <span className="text-sm font-medium">Configuration</span>
          </Link>
        )}

        {/* Counter Display - Hidden for Super Admin */}
        {!isSuperAdmin && (
          <Link
            href={`/${role}/counter-display`}
            className={`flex items-center gap-3 px-6 py-3 transition-all duration-200 ${
              pathname.includes('/counter-display') ? 'bg-green-500 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <FaTv className="text-lg" />
            <span className="text-sm font-medium">Counter Display</span>
          </Link>
        )}

        {/* Users - Hidden for Super Admin */}
        {!isSuperAdmin && (
          <div>
            <button
              onClick={handleUsersToggle}
              className={`flex items-center justify-between w-full px-6 py-3 transition-all duration-200 ${
                pathname.includes('/users') ? 'bg-green-500 text-white' : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <FaUsers className="text-lg" />
                <span className="text-sm font-medium">Users & Permissions</span>
              </div>
              <IoChevronForward className={`text-sm transition-transform duration-200 ${isUsersOpen ? 'rotate-90' : ''}`} />
            </button>
            {isUsersOpen && (
              <div className="bg-black/20 py-1">
                <Link
                  href={`/${role}/users/user&sessions`}
                  className={`flex items-center gap-3 px-12 py-2.5 transition-all duration-200 ${
                    pathname.includes('/users/user&sessions') ? 'text-white bg-green-500' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    pathname.includes('/users/user&sessions') ? 'bg-white' : 'bg-gray-500'
                  }`}></span>
                  <span className="text-sm">User & Sessions</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Display Screens Sessions - Hidden for Super Admin */}
        {!isSuperAdmin && (
          <Link
            href={`/${role}/display-screens-sessions`}
            className={`flex items-center gap-3 px-6 py-3 transition-all duration-200 ${
              pathname.includes('/display-screens-sessions') ? 'bg-green-500 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <MdDashboard className="text-lg" />
            <span className="text-sm font-medium">Display Screens Sessions</span>
          </Link>
        )}

        {/* User Dashboard Btns - Hidden for Super Admin */}
        {!isSuperAdmin && (
          <Link
            href={`/${role}/user-dashboard-btns`}
            className={`flex items-center gap-3 px-6 py-3 transition-all duration-200 ${
              pathname.includes('/user-dashboard-btns') ? 'bg-green-500 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <FaTv className="text-lg" />
            <span className="text-sm font-medium">User Dashboard Btns</span>
          </Link>
        )}
      </nav>
    </aside>
  );
}
