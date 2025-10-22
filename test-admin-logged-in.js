// Test admin APIs with login
async function testAdminAPIs() {
  const baseUrl = 'http://localhost:5000';
  
  console.log('1. Logging in as admin...\n');
  
  // First login as admin
  const loginResponse = await fetch(baseUrl + '/api/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'admin@gmail.com',
      password: 'admin123456'
    })
  });
  
  if (!loginResponse.ok) {
    console.log('❌ Admin login failed');
    return;
  }
  
  const adminData = await loginResponse.json();
  console.log('✅ Admin logged in:', adminData.fullName);
  
  // Get cookies from login response
  const cookies = loginResponse.headers.get('set-cookie');
  console.log('Cookies set:', cookies ? 'Yes' : 'No');
  console.log('\n2. Testing APIs with admin session...\n');
  
  const apis = [
    '/api/admin/payment-requests',
    '/api/admin/orders', 
    '/api/admin/partners',
    '/api/admin/users'
  ];
  
  for (const api of apis) {
    try {
      console.log(`Testing ${api}...`);
      const response = await fetch(baseUrl + api, {
        headers: {
          'Cookie': cookies || ''
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ ${api} - Status: ${response.status}`);
        
        // Check data structure
        if (data.requests) {
          console.log(`   - Payment Requests: ${data.requests.length}`);
        }
        if (data.orders) {
          console.log(`   - Orders: ${data.orders.length}`);
          if (data.orders.length > 0) {
            console.log(`   - First order user: ${data.orders[0].userName || 'N/A'}`);
          }
        }
        if (data.partners) {
          console.log(`   - Partners: ${data.partners.length}`);
          if (data.partners.length > 0) {
            console.log(`   - First partner: ${data.partners[0].businessName}`);
          }
        }
        if (data.users) {
          console.log(`   - Users: ${data.users.length}`);
          if (data.users.length > 0) {
            console.log(`   - First user: ${data.users[0].fullName}`);
          }
        }
      } else {
        console.log(`❌ ${api} - Status: ${response.status}`);
        console.log(`   - Error: ${data.message || 'Unknown error'}`);
      }
      
      console.log('');
    } catch (error) {
      console.log(`❌ ${api} - Network Error: ${error.message}\n`);
    }
  }
}

testAdminAPIs();
