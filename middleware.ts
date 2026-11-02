import { NextRequest, NextResponse } from 'next/server';

function contentSecurityPolicy(nonce: string): string {
  let supabaseOrigin = '';
  try { if (process.env.SUPABASE_URL) supabaseOrigin = new URL(process.env.SUPABASE_URL).origin; } catch { /* setup screen reports invalid configuration */ }
  const devEval = process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : '';
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${devEval}`,
    // The site uses inline style attributes for a few theme-driven details; scripts remain nonce-only.
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${supabaseOrigin} https://*.supabase.co https://images.unsplash.com`,
    `media-src 'self' blob: ${supabaseOrigin} https://*.supabase.co https://videos.pexels.com`,
    `connect-src 'self' ${supabaseOrigin} https://*.supabase.co wss://*.supabase.co`,
    "font-src 'self' data:",
    'frame-src https://maps.google.com https://www.google.com',
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
  ].join('; ');
}

function protect(response: NextResponse, nonce: string, policy: string): NextResponse {
  response.headers.set('Content-Security-Policy', policy);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (process.env.NODE_ENV === 'production') response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  return response;
}

// Domain split:
//  - admin.<domain> serves only /admin pages
//  - the public domain never serves /admin (404)
export function middleware(req: NextRequest) {
  const host = (req.headers.get('host') || '').split(':')[0];
  const path = req.nextUrl.pathname;
  const nonceBytes = crypto.getRandomValues(new Uint8Array(16));
  const nonce = btoa(String.fromCharCode(...nonceBytes));
  const policy = contentSecurityPolicy(nonce);
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', policy);
  const next = () => protect(NextResponse.next({ request: { headers: requestHeaders } }), nonce, policy);
  const redirect = (url: URL) => protect(NextResponse.redirect(url), nonce, policy);

  if (path.startsWith('/_next') || path === '/favicon.ico') return next();

  const isAdminHost = host.startsWith('admin.');
  const publicOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin);
  publicOrigin.hostname = `admin.${publicOrigin.hostname.replace(/^www\./i, '')}`;

  if (!isAdminHost) {
    if (path === '/admin' || path.startsWith('/admin/')) {
      return protect(new NextResponse('Not found', { status: 404 }), nonce, policy);
    }
    return next();
  }

  // Admin host
  if (!path.startsWith('/admin')) {
    return redirect(new URL('/admin', publicOrigin));
  }
  const hasSession = req.cookies.has('padmaarc_admin');
  if (!hasSession && path !== '/admin/login') {
    return redirect(new URL('/admin/login', publicOrigin));
  }
  return next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
