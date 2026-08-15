'use client';

import { useApi } from '@/hooks/use-api';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { SchoolForm } from '@/components/schools/school-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { SchoolRow } from '@/lib/types/database';

export default function EditSchoolPage({ params }: { params: { id: string } }) {
  const { data: school, loading } = useApi<SchoolRow>(params?.id ? `/api/schools/${params.id}` : null);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Schools', href: '/schools' }, { label: 'Edit School' }]} />
      <PageHeader title="Edit School" description="Update school information." />
      {loading || !school ? (
        <Card>
          <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
          </CardContent>
        </Card>
      ) : (
        <SchoolForm mode="edit" school={school} />
      )}
    </div>
  );
}
