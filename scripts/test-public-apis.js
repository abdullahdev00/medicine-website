// Test public APIs for products page
// Run this in browser console on localhost:5000/products

(async () => {
  console.log('🧪 Testing Public APIs...');
  
  // 1. Test Products API
  console.log('\n1️⃣ Testing Products API...');
  try {
    const response = await fetch('/api/products');
    console.log('Products API status:', response.status);
    
    if (response.ok) {
      const products = await response.json();
      console.log('✅ Products API working');
      console.log('Products found:', products.length);
      console.log('Response type:', Array.isArray(products) ? 'Array' : typeof products);
      
      if (products.length > 0) {
        console.log('Sample product:', {
          name: products[0].name,
          id: products[0].id,
          images: products[0].images?.length || 0,
          inStock: products[0].inStock
        });
      } else {
        console.log('⚠️ No products found - this is why products page is empty');
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Products API failed:', errorText);
    }
  } catch (error) {
    console.log('❌ Products API error:', error.message);
  }
  
  // 2. Test Categories API
  console.log('\n2️⃣ Testing Categories API...');
  try {
    const response = await fetch('/api/categories');
    console.log('Categories API status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Categories API working');
      console.log('Response structure:', Object.keys(data));
      console.log('Categories found:', data.categories?.length || 0);
      
      if (data.categories && data.categories.length > 0) {
        console.log('Sample categories:', data.categories.slice(0, 3).map(c => c.name));
      }
    } else {
      console.log('❌ Categories API failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Categories API error:', error.message);
  }
  
  // 3. Check React Query State
  console.log('\n3️⃣ Checking React Query State...');
  
  // Check if we're on the products page
  if (window.location.pathname === '/products') {
    console.log('✅ On products page');
    
    // Check for loading states
    const loadingElements = document.querySelectorAll('[data-testid*="loading"]');
    console.log('Loading elements found:', loadingElements.length);
    
    // Check for error messages
    const errorElements = document.querySelectorAll('[role="alert"], .text-red-500');
    console.log('Error elements found:', errorElements.length);
    
    // Check for product cards
    const productCards = document.querySelectorAll('[data-testid*="product"]');
    console.log('Product cards found:', productCards.length);
    
    // Check for empty state
    const emptyState = document.querySelector('[data-testid="empty-state"]');
    if (emptyState) {
      console.log('⚠️ Empty state showing:', emptyState.textContent);
    }
  } else {
    console.log('⚠️ Not on products page. Navigate to /products first.');
  }
  
  // 4. Check Console for Errors
  console.log('\n4️⃣ Check Browser Console...');
  console.log('Look for:');
  console.log('- React Query errors');
  console.log('- Network request failures');
  console.log('- Component rendering errors');
  console.log('- CSS preload warnings (these are minor)');
  
  // 5. Test Network Connectivity
  console.log('\n5️⃣ Testing Network...');
  try {
    const testResponse = await fetch('/api/products', { method: 'HEAD' });
    console.log('Network connectivity:', testResponse.ok ? '✅ Good' : '❌ Issues');
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
  
  console.log('\n🎯 Summary:');
  console.log('1. If Products API returns empty array: Database has no products');
  console.log('2. If Categories API fails: Check Supabase connection');
  console.log('3. If APIs work but page empty: Check React Query cache');
  console.log('4. CSS preload warnings are harmless - Next.js optimization issue');
  
  console.log('\n💡 Next Steps:');
  console.log('1. Add products via admin panel if database is empty');
  console.log('2. Refresh the products page');
  console.log('3. Check network tab for failed requests');
})();
