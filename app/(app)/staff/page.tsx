'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserCog, Plus, Pencil, Eye, Power, PowerOff } from 'lucide-react';
import { useApi, apiDelete } from '@/hooks/use-api';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable, type Column } from '@/components/layout/data-table';
import { StatusBadge } from '@/components/layout/status-badge';
import { EmptyState } from '@/components/layout/empty-state';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/layout/confirm-dialog';
import { toast } from 'sonner';
import type { StaffRow } from '@/lib/types/database';

interface StaffResponse {
  data: StaffRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function StaffPage() {
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [confirm, setConfirm] = useState<{ staff: StaffRow; activate: boolean } | null>(null);

  const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize), sortBy, sortDir });
  if (appliedSearch) query.set('search', appliedSearch);
  const { data, loading, refetch } = useApi<StaffResponse>(`/api/staff?${query.toString()}`);

  const handleSearch = (v: string) => { setSearch(v); setAppliedSearch(v); setPage(1); };

  const columns: Column<StaffRow>[] = [
    { key: 'employee_code', header: 'Emp Code', sortable: true, render: (s) => <span className="font-mono text-sm">{s.employee_code}</span> },
    {
      key: 'first_name',
      header: 'Name',
      sortable: true,
      render: (s) => <p className="truncate font-medium">{s.first_name} {s.last_name}</p>,
    },
    { key: 'designation', header: 'Designation', sortable: true, render: (s) => <span className="text-sm">{s.designation ?? '—'}</span> },
    { key: 'department', header: 'Department', sortable: true, render: (s) => <span className="text-sm text-muted-foreground">{s.department ?? '—'}</span> },
    { key: 'email', header: 'Email', render: (s) => <span className="text-sm text-muted-foreground">{s.email ?? '—'}</span> },
    { key: 'mobile', header: 'Mobile', render: (s) => <span className="text-sm text-muted-foreground">{s.mobile ?? '—'}</span> },
    { key: 'is_active', header: 'Status', sortable: true, render: (s) => <StatusBadge active={s.is_active} /> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (s) => (
        <div className="flex items-center justify-end gap-1">
          <Button asChild variant="ghost" size="icon">
            <Link href={`/staff/${s.id}`} aria-label="View staff"><Eye className="h-4 w-4" /></Link>
          </Button>
          <Button asChild variant="ghost" size="icon">
            <Link href={`/staff/${s.id}/edit`} aria-label="Edit staff"><Pencil className="h-4 w-4" /></Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label={s.is_active ? 'Deactivate' : 'Activate'} onClick={() => setConfirm({ staff: s, activate: !s.is_active })}>
            {s.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
          </Button>
        </div>
      ),
    },
  ];

  const handleToggle = async () => {
    if (!confirm) return;
    const res = await apiDelete<StaffRow>(`/api/staff/${confirm.staff.id}?activate=${confirm.activate}`);
    if (!res.ok) return toast.error(res.error);
    toast.success(confirm.activate ? 'Staff activated' : 'Staff deactivated');
    refetch();
    setConfirm(null);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Staff' }]} />
      <PageHeader title="Staff" description="Manage staff records at your school.">
        <Button asChild><Link href="/staff/new"><Plus className="mr-2 h-4 w-4" /> Add Staff</Link></Button>
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
            icon={UserCog}
            title="No staff found"
            description="Try adjusting your search, or add a new staff member."
            action={<Button asChild><Link href="/staff/new"><Plus className="mr-2 h-4 w-4" /> Add Staff</Link></Button>}
          />
        }
      />

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm?.activate ? 'Activate staff?' : 'Deactivate staff?'}
        description={confirm ? `This will ${confirm.activate ? 'activate' : 'deactivate'} ${confirm.staff.first_name} ${confirm.staff.last_name}.` : ''}
        confirmLabel={confirm?.activate ? 'Activate' : 'Deactivate'}
        destructive={!confirm?.activate}
        onConfirm={handleToggle}
      />
    </div>
  );
}
