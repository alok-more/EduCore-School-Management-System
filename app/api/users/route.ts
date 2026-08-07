import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireSuperAdmin } from '@/lib/session';
import { createUser, listUsers } from '@/lib/services/users.service';
import { createUserSchema } from '@/lib/validators';
import { apiError, apiOk, badRequest, forbidden, serverError, prismaError } from '@/lib/api';

const listSchema = z.object({ schoolId: z.string().uuid().optional() });

export async function GET(req: NextRequest) {
  try {
    const session = await requireSuperAdmin();
    const params = listSchema.parse(Object.fromEntries(req.nextUrl.searchParams));
    const users = await listUsers(session, params.schoolId);
    return apiOk(users);
  } catch (err) {
    const status = (err as Error & { status?: number }).status;
    if (status === 401) return apiError('Unauthorized', 401);
    if (status === 403) return forbidden();
    return serverError(prismaError(err));
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSuperAdmin();
    let body: unknown;
    try { body = await req.json(); } catch { return badRequest('Invalid JSON body'); }
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? 'Invalid input', 400);
    const user = await createUser(session, parsed.data);
    return apiOk(user, 201);
  } catch (err) {
    const status = (err as Error & { status?: number }).status;
    if (status === 401) return apiError('Unauthorized', 401);
    if (status === 403) return forbidden();
    return apiError(prismaError(err, 'Failed to create user'), 400);
  }
}
