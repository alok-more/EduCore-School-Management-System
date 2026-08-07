'use client';

import { useApi } from '@/hooks/use-api';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { StudentForm } from '@/components/students/student-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { StudentRow } from '@/lib/types/database';

export default function EditStudentPage({ params }: { params: { id: string } }) {
  const { data: student, loading } = useApi<StudentRow>(`/api/students/${params.id}`);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Students', href: '/students' }, { label: 'Edit Student' }]} />
      <PageHeader title="Edit Student" description="Update student information." />
      {loading || !student ? (
        <Card>
          <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
          </CardContent>
        </Card>
      ) : (
        <StudentForm mode="edit" student={student} />
      )}
    </div>
  );
}
