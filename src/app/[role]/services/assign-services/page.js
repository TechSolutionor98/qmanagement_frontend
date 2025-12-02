'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '@/utils/sessionStorage';

export default function AssignServicesPage() {
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [assignedServices, setAssignedServices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchServices();
    fetchAssignedServices();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/services/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setServices(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchAssignedServices = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/services/assigned`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setAssignedServices(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching assigned services:', error);
    }
  };

  const handleServiceToggle = (serviceId) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(s => s !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedServices.length === services.length) {
      setSelectedServices([]);
    } else {
      setSelectedServices(services.map(s => s.id));
    }
  };

  const handleAssignServices = async () => {
    if (!selectedUser) {
      alert('Please select a user');
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/services/assign`,
        {
          user_id: selectedUser,
          service_ids: selectedServices
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        alert('Services assigned successfully!');
        setSelectedUser('');
        setSelectedServices([]);
        fetchAssignedServices();
      }
    } catch (error) {
      console.error('Error assigning services:', error);
      alert('Failed to assign services');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async (userId) => {
    if (!confirm('Are you sure you want to remove all services from this user?')) {
      return;
    }

    try {
      const token = getToken();
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/services/assigned/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        alert('All services removed successfully!');
        fetchAssignedServices();
      }
    } catch (error) {
      console.error('Error deleting services:', error);
      alert('Failed to remove services');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-700 mb-6">Admin Assign Services</h1>

      {/* Assigned Services Table */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-700">Assigned Services</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Services</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignedServices.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                    No services assigned yet
                  </td>
                </tr>
              ) : (
                assignedServices.map((item) => (
                  <tr key={item.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">{item.username}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{item.services || 'No services assigned'}</td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleDeleteAll(item.user_id)}
                        className="px-4 py-1.5 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                      >
                        Delete All
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Services to User */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-700">Assign Services to User</h2>
        </div>
        
        <div className="p-6">
          {/* Assign to User Dropdown */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-600 uppercase mb-2">
              Assign to User
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-700"
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>

          {/* Select Services */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-600 uppercase mb-3">
              Select Services
            </label>
            
            <div className="space-y-2">
              {/* Select All Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={selectedServices.length === services.length && services.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="select-all" className="ml-2 text-sm text-gray-700 font-medium">
                  Select All
                </label>
              </div>

              {/* Individual Service Checkboxes */}
              {services.length === 0 ? (
                <p className="text-sm text-gray-500 ml-6">No services available. Create services first.</p>
              ) : (
                services.map((service) => (
                  <div key={service.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`service-${service.id}`}
                      checked={selectedServices.includes(service.id)}
                      onChange={() => handleServiceToggle(service.id)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <label htmlFor={`service-${service.id}`} className="ml-2 text-sm text-gray-700">
                      {service.service_name} ({service.service_name_arabic})
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Assign Services Button */}
          <div>
            <button
              onClick={handleAssignServices}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Assigning...' : 'Assign Services'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
