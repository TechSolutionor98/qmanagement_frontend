'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { setLicenses, removeLicense, selectLicenses } from '@/store/slices/licenseSlice';

export default function ListOfLicensePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const token = useSelector((state) => state.auth.token);
  const licenses = useSelector(selectLicenses);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchLicenses();
  }, []);

  const fetchLicenses = async () => {
    try {
      setLoading(true);
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
      const response = await fetch('http://localhost:5000/api/license/all', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = await response.json();
      if (data.success) {
        dispatch(setLicenses(data.data));
      }
    } catch (error) {
      console.error('Failed to fetch licenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this license?')) return;

    try {
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
      const response = await fetch(`http://localhost:5000/api/license/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const data = await response.json();
      if (data.success) {
        dispatch(removeLicense(id));
        alert('License deleted successfully!');
      } else {
        alert(data.message || 'Failed to delete license');
      }
    } catch (error) {
      console.error('Delete license error:', error);
      alert('Failed to delete license');
    }
  };

  const getStatusBadge = (license) => {
    if (license.license_status === 'expired') {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Expired</span>;
    } else if (license.license_status === 'expiring_soon') {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Expiring Soon</span>;
    } else if (license.status === 'active') {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>;
    } else if (license.status === 'suspended') {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">Suspended</span>;
    } else {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Inactive</span>;
    }
  };

  const getLicenseTypeBadge = (type) => {
    const colors = {
      trial: 'bg-purple-100 text-purple-800',
      basic: 'bg-blue-100 text-blue-800',
      premium: 'bg-indigo-100 text-indigo-800',
      enterprise: 'bg-pink-100 text-pink-800'
    };
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
        {type.toUpperCase()}
      </span>
    );
  };

  const filteredLicenses = licenses.filter(license => {
    const matchesSearch = 
      license.license_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.admin_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || license.license_type === filterType;
    const matchesStatus = filterStatus === 'all' || license.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading licenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-green-600">📋</span>
            List of License
          </h1>
          <p className="text-gray-600 mt-2">Manage all licenses</p>
        </div>
        <button
          onClick={() => router.push(`/${currentUser?.role}/license/create-license`)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          + Create License
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by license key, admin, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">License Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="trial">Trial</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Licenses Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">License Key</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Admin</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Expiry</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLicenses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No licenses found
                  </td>
                </tr>
              ) : (
                filteredLicenses.map((license) => (
                  <tr key={license.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-mono font-semibold text-gray-900">{license.license_key}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{license.admin_name}</div>
                      <div className="text-xs text-gray-500">ID: {license.admin_id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{license.company_name}</div>
                      {license.city && <div className="text-xs text-gray-500">{license.city}, {license.country}</div>}
                    </td>
                    <td className="px-6 py-4">
                      {getLicenseTypeBadge(license.license_type)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{new Date(license.expiry_date).toLocaleDateString()}</div>
                      {license.days_remaining >= 0 && (
                        <div className="text-xs text-gray-500">{license.days_remaining} days left</div>
                      )}
                      {license.days_remaining < 0 && (
                        <div className="text-xs text-red-500">Expired {Math.abs(license.days_remaining)} days ago</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(license)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/${currentUser?.role}/license/${license.id}`)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(license.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Total Licenses: <strong>{filteredLicenses.length}</strong></span>
          <span>Showing {filteredLicenses.length} of {licenses.length} licenses</span>
        </div>
      </div>
    </div>
  );
}
