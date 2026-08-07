'use client';

import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { SchoolForm } from '@/components/schools/school-form';

export default function NewSchoolPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Schools', href: '/schools' }, { label: 'Add School' }]} />
      <PageHeader title="Add School" description="Register a new school on the platform." />
      <SchoolForm mode="create" />
    </div>
  );
}
