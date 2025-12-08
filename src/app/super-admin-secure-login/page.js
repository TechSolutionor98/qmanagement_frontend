'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useAppDispatch } from '@/store/hooks';
import { setCredentials, setLoading, setError, clearError } from '@/store';

// Simple toast notification function
const showToast = (message, type = 'error') => {
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 animate-fade-in ${
    type === 'success' ? 'bg-green-600' : 'bg-red-600'
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('animate-fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, loading, error } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user && user.role === 'super_admin') {
      router.push('/superadmin');
    } else if (isAuthenticated && user && user.role !== 'super_admin') {
      // If logged in as non-super admin, redirect to their respective page
      showToast('Access denied. Super Admin only.', 'error');
      setTimeout(() => {
        if (user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/user/dashboard');
        }
      }, 2000);
    }
  }, [isAuthenticated, user, router]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear errors on input change
    if (error) {
      dispatch(clearError());
    }
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      const errorMsg = 'Please fill in all required fields';
      dispatch(setError(errorMsg));
      showToast(errorMsg, 'error');
      return false;
    }

    if (formData.password.length < 8) {
      const errorMsg = 'Password must be at least 8 characters';
      dispatch(setError(errorMsg));
      showToast(errorMsg, 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    // Validate form
    if (!validateForm()) {
      return;
    }

    dispatch(setLoading(true));

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      // 🔐 Secure super admin route
      const endpoint = `${API_URL}/auth/secure-admin-access/super-login-2024`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMsg = data.message || 'Invalid credentials';
        dispatch(setError(errorMsg));
        showToast(errorMsg, 'error');
        dispatch(setLoading(false));
        return;
      }

      // Verify it's actually a super_admin
      if (data.user.role !== 'super_admin') {
        dispatch(setError('Access denied. Super Admin credentials required.'));
        showToast('Access denied. Super Admin credentials required.', 'error');
        dispatch(setLoading(false));
        return;
      }

      // Store credentials in Redux
      dispatch(setCredentials({
        user: data.user,
        token: data.token,
      }));

      // Show success message
      showToast('Super Admin login successful!', 'success');

      // Redirect to super admin dashboard
      setTimeout(() => {
        router.push('/superadmin');
      }, 500);
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg = 'Network error. Please try again.';
      dispatch(setError(errorMsg));
      showToast(errorMsg, 'error');
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white shadow-2xl rounded-lg overflow-hidden border border-green-500">
          <div className="p-8">
            {/* Logo & Title */}
            <div className="flex flex-col items-center mb-6">
              <div className="text-3xl font-bold text-green-600 mb-2">
                🔐 Super Admin
              </div>
              <p className="text-gray-600 text-sm">Secure Access Portal</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <span className="block sm:inline whitespace-pre-line">{error}</span>
                <button
                  onClick={() => dispatch(clearError())}
                  className="absolute top-0 bottom-0 right-0 px-4 py-3"
                >
                  <span className="text-red-700 text-xl">&times;</span>
                </button>
              </div>
            )}

            {/* Super Admin Login Form */}
            <div>
              <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Super Admin Login</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Super Admin Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="super@admin.com"
                    required
                    disabled={loading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="············"
                      required
                      disabled={loading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition pr-10 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Authenticating...
                    </>
                  ) : (
                    '🔐 Secure Login'
                  )}
                </button>

                {/* Warning Notice */}
                <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 rounded-lg">
                  <p className="text-yellow-800 text-xs text-center">
                    ⚠️ Unauthorized access is prohibited and will be logged.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Back to regular login */}
        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/login')}
            className="text-gray-600 hover:text-gray-800 text-sm transition-colors"
          >
            ← Back to Regular Login
          </button>
        </div>
      </div>
      
      {/* Toast Animation Styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-20px);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-fade-out {
          animation: fadeOut 0.3s ease-in;
        }
      `}</style>
    </div>
  );
}
