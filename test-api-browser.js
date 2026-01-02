// Quick test to check API response
const testAPI = async () => {
  const token = localStorage.getItem('token');
  const adminId = 12;
  const url = `http://localhost:5000/api/user/ticket-info-users?adminId=${adminId}`;
  
  console.log('🧪 Testing API:', url);
  console.log('🔑 Token:', token ? 'Present' : 'Missing');
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Response status:', response.status);
    const data = await response.json();
    console.log('📦 Response data:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Run test
testAPI();
