import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, whatsappNumber } = await request.json();
    
    console.log('🔍 Checking phone numbers:', { phoneNumber, whatsappNumber });
    
    const results = {
      phoneExists: false,
      whatsappExists: false,
      message: ''
    };

    // Check if phone number exists in user_profiles table
    if (phoneNumber) {
      const { data: phoneData, error: phoneError } = await supabase
        .from('user_profiles')
        .select('id, phone_number')
        .eq('phone_number', phoneNumber)
        .single();

      if (phoneError && phoneError.code !== 'PGRST116') {
        console.error('Phone check error:', phoneError);
      } else if (phoneData) {
        results.phoneExists = true;
        console.log('📱 Phone number already exists:', phoneNumber);
      }
    }

    // Check if WhatsApp number exists in user_profiles table
    if (whatsappNumber) {
      const { data: whatsappData, error: whatsappError } = await supabase
        .from('user_profiles')
        .select('id, whatsapp_number')
        .eq('whatsapp_number', whatsappNumber)
        .single();

      if (whatsappError && whatsappError.code !== 'PGRST116') {
        console.error('WhatsApp check error:', whatsappError);
      } else if (whatsappData) {
        results.whatsappExists = true;
        console.log('💬 WhatsApp number already exists:', whatsappNumber);
      }
    }

    return NextResponse.json(results);

  } catch (error: any) {
    console.error('❌ Phone check API error:', error);
    return NextResponse.json(
      { 
        phoneExists: false, 
        whatsappExists: false, 
        message: "Error checking phone numbers" 
      },
      { status: 500 }
    );
  }
}
