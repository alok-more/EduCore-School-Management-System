import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireSuperAdmin } from '@/lib/session';
import { createSchool, listSchools, toggleSchoolActive } from '@/lib/services/schools.service';
import { schoolSchema } from '@/lib/validators';
import { apiError, apiOk, badRequest, forbidden, serverError, prismaError } from '@/lib/api';

const listSchema = z.object({
  search: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortDir: z.enum(['asc', 'desc']).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireSuperAdmin();
    const params = listSchema.parse(Object.fromEntries(req.nextUrl.searchParams));
    const result = await listSchools(session, {
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
    const session = await requireSuperAdmin();
    let body: unknown;
    try { body = await req.json(); } catch { return badRequest('Invalid JSON body'); }
    const parsed = schoolSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? 'Invalid input', 400);
    const school = await createSchool(session, parsed.data);
    return apiOk(school, 201);
  } catch (err) {
    const status = (err as Error & { status?: number }).status;
    if (status === 401) return apiError('Unauthorized', 401);
    if (status === 403) return forbidden();
    return apiError(prismaError(err, 'Failed to create school'), 400);
  }
}
