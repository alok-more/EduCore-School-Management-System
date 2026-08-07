'use client';

import { useApi } from '@/hooks/use-api';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { StaffForm } from '@/components/staff/staff-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { StaffRow } from '@/lib/types/database';

export default function EditStaffPage({ params }: { params: { id: string } }) {
  const { data: staff, loading } = useApi<StaffRow>(`/api/staff/${params.id}`);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Staff', href: '/staff' }, { label: 'Edit Staff' }]} />
      <PageHeader title="Edit Staff" description="Update staff information." />
      {loading || !staff ? (
        <Card>
          <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
          </CardContent>
        </Card>
      ) : (
        <StaffForm mode="edit" staff={staff} />
      )}
    </div>
  );
}
