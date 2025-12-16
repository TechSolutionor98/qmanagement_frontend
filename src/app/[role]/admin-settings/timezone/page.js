'use client';
import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { FaClock, FaGlobe, FaEdit, FaSave, FaTimes, FaCheck } from 'react-icons/fa';

export default function TimezoneManagementPage() {
  const { callAPI, user } = useAuthContext();
  const [admins, setAdmins] = useState([]);
  const [timezones, setTimezones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [selectedTimezone, setSelectedTimezone] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    fetchAdmins();
    fetchTimezones();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await callAPI('/admin/users', {
        method: 'GET',
        validateSession: false
      });
      
      // Filter to get only admins (not users)
      const adminsList = (data.users || data.data || []).filter(u => u.role === 'admin');
      setAdmins(adminsList);
    } catch (err) {
      showMessage(`Error fetching admins: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimezones = async () => {
    try {
      const data = await callAPI('/timezones', {
        method: 'GET',
        validateSession: false
      });
      
      setTimezones(data.timezones || []);
    } catch (err) {
      console.error('Error fetching timezones:', err);
      // Fallback timezone list
      setTimezones([
        { offset: '+05:00', name: 'Pakistan Standard Time (PKT)', region: 'Pakistan' },
        { offset: '+04:00', name: 'Gulf Standard Time (GST)', region: 'UAE, Saudi Arabia' },
        { offset: '+03:00', name: 'East Africa Time (EAT)', region: 'East Africa' },
        { offset: '+02:00', name: 'Central Africa Time (CAT)', region: 'Central Africa' },
        { offset: '+01:00', name: 'West Africa Time (WAT)', region: 'West Africa' },
        { offset: '+00:00', name: 'Coordinated Universal Time (UTC)', region: 'UTC' },
        { offset: '-05:00', name: 'Eastern Standard Time (EST)', region: 'USA East' },
        { offset: '-06:00', name: 'Central Standard Time (CST)', region: 'USA Central' },
        { offset: '-07:00', name: 'Mountain Standard Time (MST)', region: 'USA Mountain' },
        { offset: '-08:00', name: 'Pacific Standard Time (PST)', region: 'USA West' },
      ]);
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const startEdit = (admin) => {
    setEditing(admin.id);
    setSelectedTimezone(admin.timezone || '+05:00');
  };

  const cancelEdit = () => {
    setEditing(null);
    setSelectedTimezone('');
  };

  const updateTimezone = async (adminId) => {
    if (!selectedTimezone) {
      showMessage('Please select a timezone', 'error');
      return;
    }

    try {
      const response = await callAPI('/admin/timezone', {
        method: 'POST',
        body: {
          admin_id: adminId,
          timezone: selectedTimezone
        },
        validateSession: false
      });

      if (response.success) {
        // Update local state
        setAdmins(admins.map(a => 
          a.id === adminId ? { ...a, timezone: selectedTimezone } : a
        ));
        
        setEditing(null);
        setSelectedTimezone('');
        showMessage(`✅ Timezone updated successfully!`, 'success');
      }
    } catch (err) {
      showMessage(`Error: ${err.message}`, 'error');
    }
  };

  const getTimezoneName = (offset) => {
    const tz = timezones.find(t => t.offset === offset);
    return tz ? `${tz.name} (${tz.region})` : offset;
  };

  const getCurrentTime = (offset) => {
    const now = new Date();
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    
    // Parse offset
    const match = offset.match(/([+-])(\d{2}):(\d{2})/);
    if (!match) return '';
    
    const sign = match[1] === '+' ? 1 : -1;
    const hours = parseInt(match[2]);
    const minutes = parseInt(match[3]);
    const offsetMs = sign * (hours * 3600000 + minutes * 60000);
    
    const localTime = new Date(utcTime + offsetMs);
    return localTime.toLocaleTimeString('en-PK', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  };

  if (!user || user.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 text-lg">❌ Access Denied</p>
          <p className="text-gray-600">Only Super Admin can manage timezones</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-600 rounded-lg">
              <FaClock className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Timezone Management</h1>
          </div>
          <p className="text-gray-600 ml-14">Set each admin's local timezone for accurate activity logging</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            messageType === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            {messageType === 'success' ? <FaCheck /> : <FaTimes />}
            {message}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading administrators...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Info Box */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-l-4 border-blue-600">
              <div className="flex gap-4">
                <FaGlobe className="text-blue-600 text-2xl flex-shrink-0 mt-1" />
                <div>
                  <h2 className="font-semibold text-gray-800 mb-2">How It Works</h2>
                  <ul className="text-gray-700 space-y-1 text-sm">
                    <li>✅ Each admin gets their own timezone</li>
                    <li>✅ All activities (tickets, calls, updates) are saved in admin's local time</li>
                    <li>✅ Times display automatically in the correct timezone</li>
                    <li>✅ Perfect for global teams across different regions</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Admins Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
                <h2 className="text-white text-xl font-bold">Admin Timezone Settings</h2>
              </div>

              {admins.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-600">No admins found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100 border-b">
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Admin Name</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Current Timezone</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Local Time</th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map((admin, index) => (
                        <tr key={admin.id} className={`border-b transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        } hover:bg-blue-50`}>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{admin.username}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-700">{admin.email}</td>
                          
                          {editing === admin.id ? (
                            <>
                              <td className="px-6 py-4">
                                <select
                                  value={selectedTimezone}
                                  onChange={(e) => setSelectedTimezone(e.target.value)}
                                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  {timezones.map(tz => (
                                    <option key={tz.offset} value={tz.offset}>
                                      {tz.name} ({tz.region})
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-semibold text-blue-600">
                                  {getCurrentTime(selectedTimezone)}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2 justify-center">
                                  <button
                                    onClick={() => updateTimezone(admin.id)}
                                    className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-1 text-sm transition-colors"
                                  >
                                    <FaSave size={14} /> Save
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    className="px-3 py-1 bg-gray-400 hover:bg-gray-500 text-white rounded-lg flex items-center gap-1 text-sm transition-colors"
                                  >
                                    <FaTimes size={14} /> Cancel
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-6 py-4">
                                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                  <FaClock size={12} />
                                  {getTimezoneName(admin.timezone || '+05:00')}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-semibold text-gray-700">
                                  {getCurrentTime(admin.timezone || '+05:00')}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => startEdit(admin)}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 mx-auto transition-colors"
                                >
                                  <FaEdit size={14} /> Edit
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Timezone Reference */}
            <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Available Timezones Reference</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {timezones.map(tz => (
                  <div key={tz.offset} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                    <div className="text-sm font-semibold text-gray-900">{tz.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{tz.region}</div>
                    <div className="text-xs text-blue-600 font-mono mt-1">{tz.offset}</div>
                    <div className="text-xs text-gray-500 mt-1">🕐 {getCurrentTime(tz.offset)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Info */}
            <div className="mt-8 p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-gray-700">
              <p className="font-semibold text-indigo-900 mb-2">💡 Pro Tips:</p>
              <ul className="space-y-1 text-indigo-800">
                <li>• Each admin's timezone determines when activities are recorded</li>
                <li>• Times are stored as-is in the admin's local timezone</li>
                <li>• Activity logs automatically show the correct time for each admin</li>
                <li>• Perfect for managing global queue operations across time zones</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
