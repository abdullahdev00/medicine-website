// Test admin APIs
async function testAPIs() {
  const baseUrl = 'http://localhost:5000';
  
  const apis = [
    '/api/admin/payment-requests',
    '/api/admin/orders', 
    '/api/admin/partners',
    '/api/admin/users'
  ];
  
  console.log('Testing Admin APIs...\n');
  
  for (const api of apis) {
    try {
      console.log(`Testing ${api}...`);
      const response = await fetch(baseUrl + api);
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ ${api} - Status: ${response.status}`);
        
        // Check data structure
        if (data.requests) {
          console.log(`   - Payment Requests: ${data.requests.length}`);
        }
        if (data.orders) {
          console.log(`   - Orders: ${data.orders.length}`);
        }
        if (data.partners) {
          console.log(`   - Partners: ${data.partners.length}`);
        }
        if (data.users) {
          console.log(`   - Users: ${data.users.length}`);
        }
        if (data.message) {
          console.log(`   - Message: ${data.message}`);
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

testAPIs();
