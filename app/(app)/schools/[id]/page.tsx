'use client';

import { useState } from 'react';
import { useApi, apiPost } from '@/hooks/use-api';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/layout/status-badge';
import { ConfirmDialog } from '@/components/layout/confirm-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Loader2, Mail, Phone, MapPin, CalendarDays, Hash, Power, PowerOff } from 'lucide-react';
import { toast } from 'sonner';
import type { SchoolRow, ProfileRow } from '@/lib/types/database';

export default function ViewSchoolPage({ params }: { params: { id: string } }) {
  const { data: school, loading } = useApi<SchoolRow>(`/api/schools/${params.id}`);
  const { data: admins, refetch: refetchAdmins } = useApi<ProfileRow[]>(`/api/users?schoolId=${params.id}`);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Schools', href: '/schools' }, { label: 'View School' }]} />
      {loading || !school ? (
        <PageHeader title="Loading…" />
      ) : (
        <>
          <PageHeader
            title={school.school_name}
            description={`${school.school_code} · ${school.affiliation_board ?? 'No board'} · ${school.school_type ?? '—'}`}
          >
            <StatusBadge active={school.is_active} />
          </PageHeader>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Details</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Detail icon={Hash} label="Registration No." value={school.registration_number} />
                <Detail icon={UserPlus} label="Principal" value={school.principal_name} />
                <Detail icon={CalendarDays} label="Established" value={fmtDate(school.establishment_date)} />
                <Detail icon={CalendarDays} label="Registered" value={fmtDate(school.registration_date)} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Detail icon={Mail} label="Email" value={school.email} />
                <Detail icon={Phone} label="Phone" value={school.phone} />
                <Detail icon={MapPin} label="Address" value={[school.address, school.city, school.state, school.country, school.zipcode].filter(Boolean).join(', ')} className="sm:col-span-2" />
              </CardContent>
            </Card>
          </div>

          <SchoolAdminsSection schoolId={school.id} admins={admins ?? []} refetch={refetchAdmins} />
        </>
      )}
    </div>
  );
}

function SchoolAdminsSection({
  schoolId,
  admins,
  refetch,
}: {
  schoolId: string;
  admins: ProfileRow[];
  refetch: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ admin: ProfileRow; activate: boolean } | null>(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', mobile: '', password: '' });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await apiPost('/api/users', { ...form, school_id: schoolId });
    setSaving(false);
    if (!res.ok) return toast.error(res.error);
    toast.success('School admin created');
    setForm({ first_name: '', last_name: '', email: '', mobile: '', password: '' });
    setOpen(false);
    refetch();
  };

  const handleToggle = async () => {
    if (!confirm) return;
    setToggling(confirm.admin.id);
    const res = await fetch(`/api/users/${confirm.admin.id}?activate=${confirm.activate}`, {
      method: 'PATCH',
      credentials: 'same-origin',
    });
    const json = await res.json();
    setToggling(null);
    if (!res.ok) {
      toast.error(json.error ?? 'Failed to update access');
      setConfirm(null);
      return;
    }
    toast.success(confirm.activate ? 'Access restored' : 'Access revoked');
    refetch();
    setConfirm(null);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>School Administrators</CardTitle>
        <Button size="sm" onClick={() => setOpen((o) => !o)}>
          <UserPlus className="mr-2 h-4 w-4" /> Create Admin
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {open && (
          <form onSubmit={submit} className="grid gap-4 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5">First Name</Label>
              <Input required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5">Last Name</Label>
              <Input required value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5">Email</Label>
              <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5">Mobile</Label>
              <Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1.5">Temporary Password</Label>
              <Input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Admin
              </Button>
            </div>
          </form>
        )}

        {admins.length === 0 ? (
          <p className="text-sm text-muted-foreground">No administrators assigned yet.</p>
        ) : (
          <div className="space-y-2">
            {admins.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-lg border p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {a.first_name[0]}{a.last_name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.first_name} {a.last_name}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.email}</p>
                </div>
                <StatusBadge active={a.is_active} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={toggling === a.id}
                  onClick={() => setConfirm({ admin: a, activate: !a.is_active })}
                  aria-label={a.is_active ? 'Revoke access' : 'Restore access'}
                >
                  {toggling === a.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : a.is_active ? (
                    <PowerOff className="h-4 w-4 text-destructive" />
                  ) : (
                    <Power className="h-4 w-4 text-success" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm?.activate ? 'Restore access?' : 'Revoke access?'}
        description={
          confirm
            ? `This will ${confirm.activate ? 'restore access for' : 'revoke access from'} ${confirm.admin.first_name} ${confirm.admin.last_name}. ${confirm.activate ? '' : 'They will no longer be able to log in.'}`
            : ''
        }
        confirmLabel={confirm?.activate ? 'Restore' : 'Revoke'}
        destructive={!confirm?.activate}
        onConfirm={handleToggle}
      />
    </Card>
  );
}

function Detail({ icon: Icon, label, value, className }: { icon: React.ElementType; label: string; value?: string | null; className?: string }) {
  return (
    <div className={className}>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value || '—'}</p>
    </div>
  );
}

function fmtDate(d?: Date | string | null): string {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
