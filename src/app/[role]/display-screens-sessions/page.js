'use client';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from '@/utils/axiosInstance';



export default function DisplayScreensSessionsPage() {
  const currentUser = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  
  const [ticketSessions, setTicketSessions] = useState([]);
  const [serviceSessions, setServiceSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch sessions on component mount
  useEffect(() => {
    if (currentUser && token) {
      fetchSessions();
    }
  }, [currentUser, token]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      console.log('🔍 Fetching sessions for admin_id:', currentUser.admin_id || currentUser.id);
      console.log('👤 Current user:', currentUser);
      console.log('🔑 Token available:', !!token);
      
      // Fetch ticket_info sessions
      const ticketResponse = await axios.get(
        `${API_URL}/sessions/ticket-info/${currentUser.admin_id || currentUser.id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log('✅ Ticket Info Response:', ticketResponse.data);
      
      // Fetch receptionist sessions
      const receptionistResponse = await axios.get(
        `${API_URL}/sessions/receptionist/${currentUser.admin_id || currentUser.id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log('✅ Receptionist Response:', receptionistResponse.data);

      if (ticketResponse.data.success) {
        setTicketSessions(ticketResponse.data.sessions || []);
      }

      if (receptionistResponse.data.success) {
        setServiceSessions(receptionistResponse.data.sessions || []);
      }
    } catch (err) {
      console.error('❌ Error fetching sessions:', err);
      console.error('❌ Error response:', err.response?.data);
      setError('Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutTicket = async (sessionId) => {
    if (!confirm('Are you sure you want to logout this session?')) return;
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await axios.delete(
        `${API_URL}/sessions/${sessionId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setTicketSessions(ticketSessions.filter(session => session.id !== sessionId));
        alert('Session logged out successfully');
      }
    } catch (err) {
      console.error('Error logging out session:', err);
      alert('Failed to logout session');
    }
  };

  const handleLogoutService = async (sessionId) => {
    if (!confirm('Are you sure you want to logout this session?')) return;
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await axios.delete(
        `${API_URL}/sessions/${sessionId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setServiceSessions(serviceSessions.filter(session => session.id !== sessionId));
        alert('Session logged out successfully');
      }
    } catch (err) {
      console.error('Error logging out session:', err);
      alert('Failed to logout session');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-700">Active Sessions Management</h1>
        <button
          onClick={fetchSessions}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {/* Tickets Display Sessions - ticket_info users */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b bg-green-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700">Tickets Display Sessions (Ticket Info Users)</h2>
            <span className="px-3 py-1 bg-green-600 text-white text-sm rounded-full font-medium">
              {ticketSessions.length} Active
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Session ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">User Role</th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Email</th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Login Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Device</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ticketSessions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No active ticket_info sessions found.
                  </td>
                </tr>
              ) : (
                ticketSessions.map((session, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">{session.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{session.username}</td>
                    <td className="px-6 py-4 text-sm">
                      {session.user_role && session.user_role.includes(',') ? (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          Both User
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          Ticket Info
                        </span>
                      )}
                    </td>
                    {/* <td className="px-6 py-4 text-sm text-gray-700">{session.email}</td> */}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(session.login_time).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{session.device_info || 'Unknown'}</td>
                    <td className="px-6 py-4 text-sm">
                      {session.active ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleLogoutTicket(session.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors font-medium text-xs flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Services Display Sessions - receptionist users */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b bg-blue-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700">Services Display Sessions (Receptionist Users)</h2>
            <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full font-medium">
              {serviceSessions.length} Active
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Session ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">User Role</th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Email</th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Login Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Device</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {serviceSessions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No active receptionist sessions found.
                  </td>
                </tr>
              ) : (
                serviceSessions.map((session, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">{session.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{session.username}</td>
                    <td className="px-6 py-4 text-sm">
                      {session.user_role && session.user_role.includes(',') ? (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          Both User
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          Receptionist
                        </span>
                      )}
                    </td>
                    {/* <td className="px-6 py-4 text-sm text-gray-700">{session.email}</td> */}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(session.login_time).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{session.device_info || 'Unknown'}</td>
                    <td className="px-6 py-4 text-sm">
                      {session.active ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleLogoutService(session.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors font-medium text-xs flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
