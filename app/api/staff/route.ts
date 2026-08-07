import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/session';
import { listStaff, createStaff } from '@/lib/services/staff.service';
import { staffSchema } from '@/lib/validators';
import { apiError, apiOk, badRequest, forbidden, serverError, prismaError } from '@/lib/api';

const listSchema = z.object({
  schoolId: z.string().uuid().optional(),
  search: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortDir: z.enum(['asc', 'desc']).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    const params = listSchema.parse(Object.fromEntries(req.nextUrl.searchParams));
    const schoolId = params.schoolId ?? session.schoolId ?? '';
    if (!schoolId) return badRequest('schoolId is required');
    const result = await listStaff(session, {
      schoolId,
      search: params.search,
      isActive: params.isActive ? params.isActive === 'true' : undefined,
      page: params.page,
      pageSize: params.pageSize,
      sortBy: params.sortBy ?? 'created_at',
      sortDir: params.sortDir ?? 'desc',
    });
    return apiOk(result);
  } catch (err) {
    const status = (err as Error & { status?: number }).status;
    if (status === 401) return apiError('Unauthorized', 401);
    if (status === 403) return forbidden();
    return serverError(prismaError(err));
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    let body: unknown;
    try { body = await req.json(); } catch { return badRequest('Invalid JSON body'); }
    const parsed = staffSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? 'Invalid input', 400);
    const schoolId = session.schoolId ?? '';
    if (!schoolId) return badRequest('Your account is not tied to a school');
    const staff = await createStaff(session, schoolId, parsed.data);
    return apiOk(staff, 201);
  } catch (err) {
    const status = (err as Error & { status?: number }).status;
    if (status === 401) return apiError('Unauthorized', 401);
    if (status === 403) return forbidden();
    return apiError(prismaError(err, 'Failed to create staff member'), 400);
  }
}
