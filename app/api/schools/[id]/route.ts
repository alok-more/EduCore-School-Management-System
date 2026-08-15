import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireSuperAdmin } from '@/lib/session';
import { editSchool, getSchool, toggleSchoolActive } from '@/lib/services/schools.service';
import { schoolSchema } from '@/lib/validators';
import { apiError, apiOk, badRequest, forbidden, notFound, serverError, prismaError } from '@/lib/api';

const UUID_RE = /^[0-9a-fA-F-]{36}$/;

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!params?.id || !UUID_RE.test(params.id)) return badRequest('Invalid school ID');
    const session = await requireSuperAdmin();
    const school = await getSchool(session, params.id);
    return apiOk(school);
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
    if (!params?.id || !UUID_RE.test(params.id)) return badRequest('Invalid school ID');
    const session = await requireSuperAdmin();
    let body: unknown;
    try { body = await req.json(); } catch { return badRequest('Invalid JSON body'); }
    const parsed = schoolSchema.partial().safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? 'Invalid input', 400);
    const school = await editSchool(session, params.id, parsed.data);
    return apiOk(school);
  } catch (err) {
    const status = (err as Error & { status?: number }).status;
    if (status === 401) return apiError('Unauthorized', 401);
    if (status === 403) return forbidden();
    if (status === 404) return notFound();
    return apiError(prismaError(err, 'Failed to update school'), 400);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!params?.id || !UUID_RE.test(params.id)) return badRequest('Invalid school ID');
    const session = await requireSuperAdmin();
    const url = new URL(req.url);
    const isActive = url.searchParams.get('activate') === 'true';
    const school = await toggleSchoolActive(session, params.id, isActive);
    return apiOk(school);
  } catch (err) {
    const status = (err as Error & { status?: number }).status;
    if (status === 401) return apiError('Unauthorized', 401);
    if (status === 403) return forbidden();
    if (status === 404) return notFound();
    return serverError(prismaError(err));
  }
}
