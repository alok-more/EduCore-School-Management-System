'use client';

import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { StaffForm } from '@/components/staff/staff-form';

export default function NewStaffPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Staff', href: '/staff' }, { label: 'Add Staff' }]} />
      <PageHeader title="Add Staff" description="Add a new staff member to your school." />
      <StaffForm mode="create" />
    </div>
  );
}
