'use client';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/Components/Navbar';
import Sidebar from '@/Components/Sidebar';
import UserSidebar from '@/Components/UserSidebar';
import ProtectedRoute from '@/Components/ProtectedRoute';

/**
 * Dynamic Role Layout
 * Handles layout for all user roles with appropriate sidebar
 * 
 * Route: /[role]/*
 * Where [role] can be: superadmin, admin, user
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {Promise<Object>} props.params - Route parameters (Promise in Next.js 15+)
 * @param {string} props.params.role - Dynamic role from URL
 */
export default function DynamicRoleLayout({ children, params }) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Unwrap params Promise using React.use()
  const { role } = use(params);

  // Validate role parameter
  const validRoles = ['superadmin', 'admin', 'user'];
  const isValidRole = validRoles.includes(role);

  useEffect(() => {
    if (!isValidRole) {
      console.error(`Invalid role: ${role}`);
      router.push('/login');
    }
  }, [role, isValidRole, router]);

  if (!isValidRole) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-red-600 font-medium">Invalid role. Redirecting...</p>
        </div>
      </div>
    );
  }

  // Determine allowed roles based on route
  const getAllowedRoles = (routeRole) => {
    switch (routeRole) {
      case 'superadmin':
        return ['super_admin']; // Only super_admin can access
      case 'admin':
        return ['admin', 'super_admin']; // Both admin and super_admin can access
      case 'user':
        return ['user'];
      default:
        return [];
    }
  };

  // Determine which sidebar to use
  const renderSidebar = () => {
    if (role === 'user') {
      return <UserSidebar isMobileOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />;
    }
    // Both superadmin and admin use the same sidebar with mobile support
    return <Sidebar isMobileOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />;
  };

  // Determine layout style based on role
  const isUserRole = role === 'user';

  return (
    <ProtectedRoute allowedRoles={getAllowedRoles(role)}>
      {isUserRole ? (
        // User Layout Style - Responsive
        <div className="flex flex-col h-screen bg-gray-50">
          <Navbar onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} isMobileMenuOpen={isMobileMenuOpen} />
          <div className="flex flex-1 overflow-hidden">
            {renderSidebar()}
            <div className="flex-1 flex flex-col overflow-hidden lg:64">
              <main className="flex-1 overflow-y-auto p-4 md:p-6">
                {children}
              </main>
              <footer className="bg-white border-t border-gray-200 px-4 md:px-6 py-3">
                <p className="text-xs md:text-sm text-gray-600 text-center md:text-right">
                  © {new Date().getFullYear()} Tech Solutionor. All rights reserved.
                </p>
              </footer>
            </div>
          </div>
        </div>
      ) : (
        // Admin/SuperAdmin Layout Style - Responsive
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Navbar onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} isMobileMenuOpen={isMobileMenuOpen} />
          <div className="flex flex-1">
            {renderSidebar()}
            <main className="flex-1 flex flex-col lg:ml-64 w-full overflow-x-hidden">
              <div className="flex-1 p-4 md:p-6 lg:p-8">
                {children}
              </div>
              {/* Footer */}
              <div className="py-3 px-4 md:px-6 lg:px-8 bg-white border-t border-gray-200">
                <p className="text-gray-600 text-center md:text-right text-xs md:text-sm break-words">
                  © {new Date().getFullYear()}, Developed By{' '}
                  <a 
                    href="https://techsolutionor.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-bold text-green-600 hover:text-blue-700 whitespace-nowrap"
                  >
                    TechSolutionor
                  </a>
                </p>
              </div>
            </main>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
