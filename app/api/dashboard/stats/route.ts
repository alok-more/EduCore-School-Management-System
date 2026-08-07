import { NextRequest } from 'next/server';
import { requireSession } from '@/lib/session';
import { getSchoolAdminStats, getSuperAdminStats } from '@/lib/services/dashboard.service';
import { apiError, apiOk, forbidden, serverError, prismaError } from '@/lib/api';

export async function GET(_req: NextRequest) {
  try {
    const session = await requireSession();
    if (session.role === 'SUPER_ADMIN') {
      return apiOk(await getSuperAdminStats(session));
    }
    if (session.role === 'SCHOOL_ADMIN') {
      return apiOk(await getSchoolAdminStats(session));
    }
    return forbidden('Unknown role');
  } catch (err) {
    const status = (err as Error & { status?: number }).status;
    if (status === 401) return apiError('Unauthorized', 401);
    if (status === 403) return forbidden();
    return serverError(prismaError(err));
  }
}
