import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/session';
import { toggleUserAccess } from '@/lib/services/users.service';
import { apiError, forbidden, notFound, serverError, prismaError } from '@/lib/api';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSuperAdmin();
    const activate = new URL(req.url).searchParams.get('activate') === 'true';
    const user = await toggleUserAccess(session, params.id, activate);
    return NextResponse.json(user);
  } catch (err) {
    const status = (err as Error & { status?: number }).status;
    if (status === 401) return apiError('Unauthorized', 401);
    if (status === 403) return forbidden();
    if (status === 404) return notFound();
    return serverError(prismaError(err));
  }
}
