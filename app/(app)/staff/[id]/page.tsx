'use client';

import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/layout/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import type { StaffRow } from '@/lib/types/database';

export default function ViewStaffPage({ params }: { params: { id: string } }) {
  const { data: staff, loading } = useApi<StaffRow>(params?.id ? `/api/staff/${params.id}` : null);

  if (loading || !staff) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Staff', href: '/staff' }, { label: 'View Staff' }]} />
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  const fullName = `${staff.first_name} ${staff.last_name}`;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Staff', href: '/staff' }, { label: fullName }]} />
      <PageHeader title={fullName} description={`${staff.employee_code} · ${staff.designation ?? '—'}`}>
        <StatusBadge active={staff.is_active} />
        <Button asChild variant="outline" size="sm">
          <Link href={`/staff/${staff.id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Staff Details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Detail label="Employee Code" value={staff.employee_code} />
            <Detail label="Gender" value={staff.gender} />
            <Detail label="Date of Birth" value={fmtDate(staff.date_of_birth)} />
            <Detail label="Joining Date" value={fmtDate(staff.joining_date)} />
            <Detail label="Designation" value={staff.designation} />
            <Detail label="Department" value={staff.department} />
            <Detail label="Qualification" value={staff.qualification} />
            <Detail label="Salary" value={fmtDecimal(staff.salary)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Contact & Address</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Detail label="Mobile" value={staff.mobile} />
            <Detail label="Email" value={staff.email} />
            <Detail label="Address" value={staff.address} className="sm:col-span-2" />
            <Detail label="City" value={staff.city} />
            <Detail label="State" value={staff.state} />
            <Detail label="Country" value={staff.country} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Detail({ label, value, className }: { label: string; value?: string | null; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value || '—'}</p>
    </div>
  );
}

function fmtDate(d?: Date | string | null): string {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function fmtMoney(v?: string | number | null): string {
  if (v === null || v === undefined) return '—';
  const n = Number(v);
  if (isNaN(n) || n === 0) return '—';
  return n.toLocaleString(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
}

function fmtDecimal(v?: { toString(): string } | null): string {
  if (!v) return '—';
  const n = Number(v.toString());
  if (isNaN(n) || n === 0) return '—';
  return n.toLocaleString(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
}
