// middleware.js
import { NextResponse } from 'next/server';

import { supabase } from '@/lib/supabaseClient';

export async function middleware(request) {
  const token = request.cookies.get('supabase-auth-token');

  if (!token) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  const { data: { session }, error } = await supabase.auth.getSession(token);

  if (error || !session) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/todos/:path*', '/api/:path*'],
};
