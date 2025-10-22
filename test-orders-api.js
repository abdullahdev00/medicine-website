// Test orders API
async function testOrdersAPI() {
  const baseUrl = 'http://localhost:5000';
  
  console.log('Testing Orders API...\n');
  
  try {
    const response = await fetch(baseUrl + '/api/admin/orders');
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Orders API - Status:', response.status);
      console.log('📊 Total Orders:', data.orders?.length || 0);
      
      if (data.orders && data.orders.length > 0) {
        console.log('\n📦 Sample Order:');
        const order = data.orders[0];
        console.log('  - Order ID:', order.id?.slice(0, 8));
        console.log('  - User Name:', order.userName);
        console.log('  - User Email:', order.userEmail);
        console.log('  - Products:', order.products?.map(p => p.name).join(', '));
        console.log('  - Total Price: Rs.', order.totalPrice);
        console.log('  - Payment Method:', order.paymentMethod);
        console.log('  - Status:', order.status);
        console.log('  - Date:', new Date(order.createdAt).toLocaleDateString());
      }
      
      // Check data structure
      console.log('\n✅ Data Structure Check:');
      if (data.orders && data.orders[0]) {
        const fields = ['id', 'products', 'totalPrice', 'paymentMethod', 'status', 'createdAt'];
        fields.forEach(field => {
          console.log(`  - ${field}: ${data.orders[0][field] !== undefined ? '✓' : '✗'}`);
        });
      }
    } else {
      console.log('❌ Orders API - Status:', response.status);
      console.log('   Error:', data.message || 'Unknown error');
    }
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
}

testOrdersAPI();
