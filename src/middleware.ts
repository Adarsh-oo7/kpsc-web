import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Skip static assets, internal paths, and API calls
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/static') ||
    url.pathname.includes('.') // matches favicon.ico, images, etc.
  ) {
    return NextResponse.next();
  }

  // Parse subdomain
  let subdomain = '';
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');

  if (isLocalhost) {
    // e.g. abc.localhost:3000
    const parts = hostname.split('.');
    if (parts.length >= 2 && !parts[0].startsWith('localhost') && !parts[0].startsWith('127')) {
      subdomain = parts[0];
    }
  } else {
    // e.g. abc.kpscmaster.com
    const parts = hostname.split('.');
    if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'api' && parts[0] !== 'admin') {
      subdomain = parts[0];
    }
  }

  // Rewrite root request of subdomain to its branded public landing page
  if (subdomain && url.pathname === '/') {
    // Rewrite internally: abc.localhost:3000/ -> /institute/abc
    return NextResponse.rewrite(new URL(`/institute/${subdomain}`, request.url));
  }

  return NextResponse.next();
}
