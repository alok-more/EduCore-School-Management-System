import { NextResponse } from 'next/server';

export function apiError(message: string, status = 400, code?: string) {
  return NextResponse.json({ error: message, code }, { status });
}

export function apiOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function notFound(message = 'Resource not found') {
  return apiError(message, 404);
}

export function unauthorized(message = 'Unauthorized') {
  return apiError(message, 401);
}

export function forbidden(message = 'You do not have permission to perform this action') {
  return apiError(message, 403);
}

export function badRequest(message = 'Invalid request') {
  return apiError(message, 400);
}

export function serverError(message = 'Something went wrong') {
  return apiError(message, 500);
}

export function prismaError(err: unknown, fallback = 'Operation failed'): string {
  if (err && typeof err === 'object' && 'message' in err) {
    const m = String((err as { message: unknown }).message);
    if (m) return m;
  }
  return fallback;
}
