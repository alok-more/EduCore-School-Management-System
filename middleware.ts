import { type NextRequest, NextResponse } from 'next/server';

// Lightweight middleware: no session refresh needed since JWT is stateless.
// Protected routes are handled at the API layer via requireSession().
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)'],
};
