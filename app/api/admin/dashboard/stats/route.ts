import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from '@/lib/supabase-client';

async function requireAdmin(request: NextRequest) {
  const supabase = getSupabaseServiceClient();
  
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No authorization token provided');
  }

  const token = authHeader.substring(7);
  
  // Verify the JWT token with Supabase
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('Invalid or expired token');
  }

  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  if (adminError || !adminUser) {
    throw new Error('Admin access required');
  }

  return { user, admin: adminUser };
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    
    const supabase = getSupabaseServiceClient();
    
    // Get user profiles count (since we don't have a users table in public schema)
    const { data: userProfiles, error: userError } = await supabase
      .from('user_profiles')
      .select('id', { count: 'exact' });
    
    // Get orders
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Get payment requests
    const { data: paymentRequests, error: paymentError } = await supabase
      .from('payment_requests')
      .select('*')
      .order('created_at', { ascending: false });

    // Get products count
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id', { count: 'exact' });
    
    if (userError || orderError || paymentError || productError) {
      throw new Error('Failed to fetch dashboard data');
    }
    
    const totalRevenue = orders
      ?.filter((o: any) => o.status === "delivered")
      .reduce((sum: number, order: any) => sum + parseFloat(order.total_price || '0'), 0) || 0;
    
    const pendingOrders = orders?.filter((o: any) => o.status === "pending").length || 0;
    const pendingPayments = paymentRequests?.filter((p: any) => p.status === "pending").length || 0;
    
    // Get today's new users
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const { data: newUsersToday } = await supabase
      .from('user_profiles')
      .select('id', { count: 'exact' })
      .gte('created_at', todayStart.toISOString());
    
    return NextResponse.json({
      totalUsers: userProfiles?.length || 0,
      totalProducts: products?.length || 0,
      totalOrders: orders?.length || 0,
      totalRevenue,
      pendingOrders,
      pendingPayments,
      newUsersToday: newUsersToday?.length || 0,
      recentOrders: orders?.slice(0, 10) || [],
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    if (error.message === "No authorization token provided" || 
        error.message === "Invalid or expired token" || 
        error.message === "Admin access required") {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
