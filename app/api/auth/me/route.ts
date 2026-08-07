import { NextRequest } from 'next/server';
import { getRequestSession } from '@/lib/session';
import { findProfileById } from '@/lib/repositories/profiles.repository';
import { apiOk, apiError, serverError } from '@/lib/api';

export async function GET(_req: NextRequest) {
  try {
    const session = await getRequestSession();
    if (!session) return apiError('Unauthorized', 401);

    const profile = await findProfileById(session.userId);
    if (!profile) return apiError('Profile not found', 404);

    return apiOk({
      session: {
        ...session,
        mobile: profile.mobile ?? null,
        schoolName: profile.school?.school_name ?? null,
        schoolCode: profile.school?.school_code ?? null,
        createdAt: profile.created_at.toISOString(),
        lastLogin: profile.last_login ? profile.last_login.toISOString() : null,
        isActive: profile.is_active,
      },
    });
  } catch {
    return serverError('Failed to read session');
  }
}
