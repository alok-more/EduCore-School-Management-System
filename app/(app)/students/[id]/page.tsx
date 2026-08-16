'use client';

import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { StudentStatusBadge } from '@/components/layout/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import type { StudentRow } from '@/lib/types/database';

export default function ViewStudentPage({ params }: { params: { id: string } }) {
  const { data: student, loading } = useApi<StudentRow>(params?.id ? `/api/students/${params.id}` : null);

  if (loading || !student) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Students', href: '/students' }, { label: 'View Student' }]} />
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  const fullName = [student.first_name, student.middle_name, student.last_name].filter(Boolean).join(' ');

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Students', href: '/students' }, { label: fullName }]} />
      <PageHeader title={fullName} description={`Roll No ${student.roll_no} · ${student.standard_sought ?? '—'}`}>
        <StudentStatusBadge active={!!student.is_active} />
        <Button asChild variant="outline" size="sm">
          <Link href={`/students/${student.id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Student Details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Detail label="Roll No" value={student.roll_no} />
            <Detail label="Gender" value={student.gender} />
            <Detail label="Date of Birth" value={fmtDate(student.date_of_birth)} />
            <Detail label="Blood Group" value={student.blood_group} />
            <Detail label="Aadhar Card No." value={student.aadhar_card_no} />
            <Detail label="Admission Date" value={fmtDate(student.admission_date)} />
            <Detail label="Standard Sought" value={student.standard_sought} />
            <Detail label="Identification Mark" value={student.identification_mark} />
            <Detail label="Physical Problems / Disability" value={student.physical_disability} />
            <Detail label="Status" value={student.status} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Demographic Information</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Detail label="Caste" value={student.caste} />
            <Detail label="Category" value={student.category} />
            <Detail label="Religion" value={student.religion} />
            <Detail label="Mother Tongue" value={student.mother_tongue} />
            <Detail label="Previous School" value={student.previous_school} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Residential Address</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Detail label="Address" value={student.address} className="sm:col-span-2" />
            <Detail label="City" value={student.city} />
            <Detail label="State" value={student.state} />
            <Detail label="Country" value={student.country} />
            <Detail label="Pin Code" value={student.pin_code} />
            <Detail label="Phone" value={student.phone} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Parent&apos;s Details</CardTitle></CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground">Father</h4>
              <Detail label="Father's Name" value={student.father_name} />
              <Detail label="Qualification" value={student.father_qualification} />
              <Detail label="Occupation" value={student.father_occupation} />
              <Detail label="Mobile" value={student.father_mobile} />
              <Detail label="Annual Income" value={fmtDecimal(student.father_annual_income)} />
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground">Mother</h4>
              <Detail label="Mother's Name" value={student.mother_name} />
              <Detail label="Qualification" value={student.mother_qualification} />
              <Detail label="Occupation" value={student.mother_occupation} />
              <Detail label="Mobile" value={student.mother_mobile} />
              <Detail label="Annual Income" value={fmtDecimal(student.mother_annual_income)} />
            </div>
            <div className="space-y-4 sm:col-span-2">
              <h4 className="text-sm font-semibold text-muted-foreground">Grandfather</h4>
              <Detail label="Grandfather's Name" value={student.grandfather_name} />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Local Guardian</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <Detail label="Guardian Name" value={student.guardian_name} />
            <Detail label="Relationship" value={student.guardian_relationship} />
            <Detail label="Guardian Phone" value={student.guardian_phone} />
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

function fmtDecimal(v?: { toString(): string } | null): string {
  if (!v) return '—';
  const n = Number(v.toString());
  if (isNaN(n) || n === 0) return '—';
  return n.toLocaleString(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
}
