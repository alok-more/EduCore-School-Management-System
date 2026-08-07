'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Plus, Pencil, Eye, Power, PowerOff } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { apiDelete } from '@/hooks/use-api';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable, type Column } from '@/components/layout/data-table';
import { StatusBadge } from '@/components/layout/status-badge';
import { EmptyState } from '@/components/layout/empty-state';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/layout/confirm-dialog';
import { toast } from 'sonner';
import type { SchoolRow } from '@/lib/types/database';

interface SchoolsResponse {
  data: SchoolRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function SchoolsPage() {
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [confirm, setConfirm] = useState<{ school: SchoolRow; activate: boolean } | null>(null);

  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    sortBy,
    sortDir,
  });
  if (appliedSearch) query.set('search', appliedSearch);
  const { data, loading, refetch } = useApi<SchoolsResponse>(`/api/schools?${query.toString()}`);

  useEffect(() => {
    if (appliedSearch !== search) setAppliedSearch(search);
  }, [search, appliedSearch]);

  const columns: Column<SchoolRow>[] = [
    {
      key: 'school_name',
      header: 'School',
      sortable: true,
      render: (s) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{s.school_name}</p>
          <p className="text-xs text-muted-foreground">{s.school_code}</p>
        </div>
      ),
    },
    {
      key: 'city',
      header: 'Location',
      sortable: true,
      render: (s) => (
        <span className="text-sm text-muted-foreground">
          {[s.city, s.state].filter(Boolean).join(', ') || '—'}
        </span>
      ),
    },
    {
      key: 'affiliation_board',
      header: 'Board',
      render: (s) => <span className="text-sm">{s.affiliation_board ?? '—'}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (s) => <span className="text-sm text-muted-foreground">{s.email ?? '—'}</span>,
    },
    {
      key: 'is_active',
      header: 'Status',
      sortable: true,
      render: (s) => <StatusBadge active={s.is_active} inactiveLabel="Inactive" />,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (s) => (
        <div className="flex items-center justify-end gap-1">
          <Button asChild variant="ghost" size="icon">
            <Link href={`/schools/${s.id}`} aria-label="View school">
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon">
            <Link href={`/schools/${s.id}/edit`} aria-label="Edit school">
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={s.is_active ? 'Deactivate school' : 'Activate school'}
            onClick={() => setConfirm({ school: s, activate: !s.is_active })}
          >
            {s.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
          </Button>
        </div>
      ),
    },
  ];

  const handleToggle = async () => {
    if (!confirm) return;
    const res = await apiDelete<SchoolRow>(`/api/schools/${confirm.school.id}?activate=${confirm.activate}`);
    if (!res.ok) {
      toast.error(res.error);
    } else {
      toast.success(confirm.activate ? 'School activated' : 'School deactivated');
      refetch();
    }
    setConfirm(null);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Schools' }]} />
      <PageHeader title="Schools" description="Create and manage schools on the platform.">
        <Button asChild>
          <Link href="/schools/new">
            <Plus className="mr-2 h-4 w-4" /> Add School
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
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        onPageChange={setPage}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setPage(1);
        }}
        onSort={(by, dir) => {
          setSortBy(by);
          setSortDir(dir);
        }}
        sortBy={sortBy}
        sortDir={sortDir}
        rowKey={(s) => s.id}
        emptyState={
          <EmptyState
            icon={Building2}
            title="No schools found"
            description="Try adjusting your search, or add a new school to get started."
            action={
              <Button asChild>
                <Link href="/schools/new">
                  <Plus className="mr-2 h-4 w-4" /> Add School
                </Link>
              </Button>
            }
          />
        }
      />

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm?.activate ? 'Activate school?' : 'Deactivate school?'}
        description={
          confirm?.activate
            ? `This will reactivate ${confirm?.school.school_name}. Its admins will be able to sign in again.`
            : `This will deactivate ${confirm?.school.school_name}. Its admins will lose access until reactivated.`
        }
        confirmLabel={confirm?.activate ? 'Activate' : 'Deactivate'}
        destructive={!confirm?.activate}
        onConfirm={handleToggle}
      />
    </div>
  );
}
