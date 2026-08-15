'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Plus, Pencil, Eye, Power, PowerOff } from 'lucide-react';
import { useApi, apiDelete } from '@/hooks/use-api';
import { useAuth } from '@/components/providers/auth-provider';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable, type Column } from '@/components/layout/data-table';
import { StudentStatusBadge } from '@/components/layout/status-badge';
import { EmptyState } from '@/components/layout/empty-state';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/layout/confirm-dialog';
import { toast } from 'sonner';
import type { StudentRow } from '@/lib/types/database';

interface StudentsResponse {
  data: StudentRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function StudentsPage() {
  const { session } = useAuth();
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [confirm, setConfirm] = useState<{ student: StudentRow; activate: boolean } | null>(null);

  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    sortBy,
    sortDir,
  });
  if (appliedSearch) query.set('search', appliedSearch);

  const { data, loading, refetch } = useApi<StudentsResponse>(`/api/students?${query.toString()}`);

  const handleSearch = (v: string) => {
    setSearch(v);
    setAppliedSearch(v);
    setPage(1);
  };

  const columns: Column<StudentRow>[] = [
    {
      key: 'roll_no',
      header: 'Roll No',
      sortable: true,
      render: (s) => <span className="font-mono text-sm">{s.roll_no}</span>,
    },
    {
      key: 'first_name',
      header: 'Name',
      sortable: true,
      render: (s) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{s.first_name} {s.middle_name ? s.middle_name + ' ' : ''}{s.last_name}</p>
        </div>
      ),
    },
    {
      key: 'gender',
      header: 'Gender',
      render: (s) => <span className="text-sm text-muted-foreground">{s.gender ?? '—'}</span>,
    },
    {
      key: 'date_of_birth',
      header: 'DOB',
      render: (s) => <span className="text-sm text-muted-foreground">{fmtDate(s.date_of_birth)}</span>,
    },
    {
      key: 'blood_group',
      header: 'Blood',
      render: (s) => <span className="text-sm">{s.blood_group ?? '—'}</span>,
    },
    {
      key: 'admission_date',
      header: 'Admitted',
      render: (s) => <span className="text-sm text-muted-foreground">{fmtDate(s.admission_date)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (s) => <StudentStatusBadge active={!!s.is_active} />,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (s) => (
        <div className="flex items-center justify-end gap-1">
          <Button asChild variant="ghost" size="icon">
            <Link href={`/students/${s.id}`} aria-label="View student">
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon">
            <Link href={`/students/${s.id}/edit`} aria-label="Edit student">
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={s.is_active ? 'Deactivate student' : 'Activate student'}
            onClick={() => setConfirm({ student: s, activate: !s.is_active })}
          >
            {s.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
          </Button>
        </div>
      ),
    },
  ];

  const handleToggle = async () => {
    if (!confirm) return;
    const res = await apiDelete<StudentRow>(`/api/students/${confirm.student.id}?activate=${confirm.activate}`);
    if (!res.ok) return toast.error(res.error);
    toast.success(confirm.activate ? 'Student activated' : 'Student deactivated');
    refetch();
    setConfirm(null);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Students' }]} />
      <PageHeader title="Students" description="Manage student records at your school.">
        <Button asChild>
          <Link href="/students/new">
            <Plus className="mr-2 h-4 w-4" /> Add Student
          </Link>
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        loading={loading}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        totalPages={data?.totalPages ?? 1}
        search={search}
        onSearch={handleSearch}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        onSort={(by, dir) => { setSortBy(by); setSortDir(dir); }}
        sortBy={sortBy}
        sortDir={sortDir}
        rowKey={(s) => s.id}
        emptyState={
          <EmptyState
            icon={GraduationCap}
            title="No students found"
            description="Try adjusting your search, or add a new student."
            action={
              <Button asChild>
                <Link href="/students/new"><Plus className="mr-2 h-4 w-4" /> Add Student</Link>
              </Button>
            }
          />
        }
      />

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm?.activate ? 'Activate student?' : 'Deactivate student?'}
        description={
          confirm
            ? `This will ${confirm.activate ? 'activate' : 'deactivate'} ${confirm.student.first_name} ${confirm.student.last_name}.`
            : ''
        }
        confirmLabel={confirm?.activate ? 'Activate' : 'Deactivate'}
        destructive={!confirm?.activate}
        onConfirm={handleToggle}
      />
    </div>
  );
}

function fmtDate(d?: Date | string | null): string {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
