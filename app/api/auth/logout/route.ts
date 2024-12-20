import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value;

    if (sessionToken) {
      // Sign out from Supabase
      await supabase.auth.admin.signOut(sessionToken);
    }

    // Clear session cookie
    const response = NextResponse.json({ success: true });
    response.cookies.delete('session');
    response.cookies.delete('session_token');
    response.cookies.delete('user_id');
    response.cookies.delete('username');
    response.cookies.delete('avatarurl');
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
} 