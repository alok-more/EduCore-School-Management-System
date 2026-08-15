import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/session';
import { editStaff, getStaff, toggleStaffActive } from '@/lib/services/staff.service';
import { staffSchema } from '@/lib/validators';
import { apiError, apiOk, badRequest, forbidden, notFound, serverError, prismaError } from '@/lib/api';

const UUID_RE = /^[0-9a-fA-F-]{36}$/;

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!params?.id || !UUID_RE.test(params.id)) return badRequest('Invalid staff ID');
    const session = await requireSession();
    const staff = await getStaff(session, params.id);
    return apiOk(staff);
  } catch (err) {
    const status = (err as Error & { status?: number }).status;
    if (status === 401) return apiError('Unauthorized', 401);
    if (status === 403) return forbidden();
    if (status === 404) return notFound();
    return serverError(prismaError(err));
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!params?.id || !UUID_RE.test(params.id)) return badRequest('Invalid staff ID');
    const session = await requireSession();
    let body: unknown;
    try { body = await req.json(); } catch { return badRequest('Invalid JSON body'); }
    const parsed = staffSchema.partial().safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? 'Invalid input', 400);
    const staff = await editStaff(session, params.id, parsed.data);
    return apiOk(staff);
  } catch (err) {
    const status = (err as Error & { status?: number }).status;
    if (status === 401) return apiError('Unauthorized', 401);
    if (status === 403) return forbidden();
    if (status === 404) return notFound();
    return apiError(prismaError(err, 'Failed to update staff member'), 400);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!params?.id || !UUID_RE.test(params.id)) return badRequest('Invalid staff ID');
    const session = await requireSession();
    const isActive = new URL(req.url).searchParams.get('activate') === 'true';
    const staff = await toggleStaffActive(session, params.id, isActive);
    return apiOk(staff);
  } catch (err) {
    const status = (err as Error & { status?: number }).status;
    if (status === 401) return apiError('Unauthorized', 401);
    if (status === 403) return forbidden();
    if (status === 404) return notFound();
    return serverError(prismaError(err));
  }
}
