'use client';

import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { StudentForm } from '@/components/students/student-form';

export default function NewStudentPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Students', href: '/students' }, { label: 'Add Student' }]} />
      <PageHeader title="Add Student" description="Enroll a new student at your school." />
      <StudentForm mode="create" />
    </div>
  );
}
