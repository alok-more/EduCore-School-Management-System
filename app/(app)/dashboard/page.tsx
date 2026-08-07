'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { useApi } from '@/hooks/use-api';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/layout/stat-card';
import { StatCardSkeleton } from '@/components/layout/skeletons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Building2, CheckCircle2, Users, UserCog, GraduationCap, XCircle, MapPin, Mail, Phone, Crown } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import Link from 'next/link';

interface SchoolCard {
  id: string;
  school_name: string;
  school_code: string;
  city: string | null;
  state: string | null;
  email: string | null;
  phone: string | null;
  affiliation_board: string | null;
  school_type: string | null;
  principal_name: string | null;
  is_active: boolean;
  studentCount: number;
  staffCount: number;
}

interface SuperAdminStats {
  totalSchools: number;
  activeSchools: number;
  inactiveSchools: number;
  totalAdmins: number;
  schoolCards: SchoolCard[];
}

interface SchoolInfo {
  id: string;
  school_name: string;
  school_code: string;
  city: string | null;
  state: string | null;
  affiliation_board: string | null;
  principal_name: string | null;
  email: string | null;
  phone: string | null;
}

interface SchoolAdminStats {
  school: SchoolInfo | null;
  totalStudents: number;
  totalStaff: number;
  recentStudents: Array<{ id: string; first_name: string; last_name: string; roll_no: string; status: string }>;
  recentStaff: Array<{ id: string; first_name: string; last_name: string; employee_code: string; designation: string | null }>;
}

const enrollmentTrend = [
  { month: 'Jan', students: 120, staff: 18 },
  { month: 'Feb', students: 135, staff: 20 },
  { month: 'Mar', students: 142, staff: 22 },
  { month: 'Apr', students: 150, staff: 24 },
  { month: 'May', students: 158, staff: 25 },
  { month: 'Jun', students: 164, staff: 26 },
  { month: 'Jul', students: 171, staff: 27 },
  { month: 'Aug', students: 178, staff: 28 },
];

export default function DashboardPage() {
  const { session } = useAuth();
  const { data, loading } = useApi<SuperAdminStats | SchoolAdminStats>('/api/dashboard/stats');

  if (!session) return null;

  if (session.role === 'SUPER_ADMIN') {
    return <SuperAdminDashboard data={data as SuperAdminStats | null} loading={loading} />;
  }
  return <SchoolAdminDashboard data={data as SchoolAdminStats | null} loading={loading} />;
}

// ---------------------------------------------------------------------------
// Super Admin Dashboard
// ---------------------------------------------------------------------------
function SuperAdminDashboard({ data, loading }: { data: SuperAdminStats | null; loading: boolean }) {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard' }]} />
      <PageHeader
        title="Platform Overview"
        description="A snapshot of schools and administrators across the platform."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading || !data ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Total Schools" value={data.totalSchools} icon={Building2} tone="primary" />
            <StatCard label="Active Schools" value={data.activeSchools} icon={CheckCircle2} tone="success" />
            <StatCard label="Inactive Schools" value={data.inactiveSchools} icon={XCircle} tone="destructive" />
            <StatCard label="School Admins" value={data.totalAdmins} icon={Users} tone="warning" />
          </>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Schools at a Glance</h2>
        {loading || !data ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="mt-3 h-4 w-1/2" />
                  <Skeleton className="mt-4 h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : data.schoolCards.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">No active schools yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.schoolCards.map((s) => (
              <Link key={s.id} href={`/schools/${s.id}`} className="group">
                <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
                  <CardContent className="flex h-full flex-col p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <Badge variant={s.is_active ? 'default' : 'secondary'} className={s.is_active ? 'bg-success/10 text-success' : ''}>
                        {s.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <h3 className="mt-4 truncate text-base font-semibold group-hover:text-primary">
                      {s.school_name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{s.school_code}</p>

                    <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                      {s.city && (
                        <p className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          {[s.city, s.state].filter(Boolean).join(', ')}
                        </p>
                      )}
                      {s.email && (
                        <p className="flex items-center gap-1.5 truncate">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{s.email}</span>
                        </p>
                      )}
                      {s.principal_name && (
                        <p className="flex items-center gap-1.5">
                          <Crown className="h-3.5 w-3.5 shrink-0" />
                          {s.principal_name}
                        </p>
                      )}
                    </div>

                    <div className="mt-auto flex items-center gap-4 pt-4">
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{s.studentCount}</span>
                        <span className="text-xs text-muted-foreground">Students</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <UserCog className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium">{s.staffCount}</span>
                        <span className="text-xs text-muted-foreground">Staff</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// School Admin Dashboard
// ---------------------------------------------------------------------------
function SchoolAdminDashboard({ data, loading }: { data: SchoolAdminStats | null; loading: boolean }) {
  const school = data?.school;
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard' }]} />
      <PageHeader
        title={school ? school.school_name : 'School Overview'}
        description={
          school
            ? `${school.school_code}${school.affiliation_board ? ' · ' + school.affiliation_board : ''}${school.principal_name ? ' · Principal: ' + school.principal_name : ''}`
            : 'Track students and staff at your school.'
        }
      />

      {school && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-wrap items-center gap-x-8 gap-y-3 p-5">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{school.school_name}</span>
            </div>
            {school.city && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {[school.city, school.state].filter(Boolean).join(', ')}
              </div>
            )}
            {school.email && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {school.email}
              </div>
            )}
            {school.phone && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                {school.phone}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading || !data ? (
          Array.from({ length: 2 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Total Students" value={data.totalStudents} icon={GraduationCap} tone="primary" />
            <StatCard label="Total Staff" value={data.totalStaff} icon={UserCog} tone="success" />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Admissions</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={enrollmentTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="students" fill="hsl(var(--chart-1))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Students</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading || !data
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
              : data.recentStudents.length === 0
                ? <p className="text-sm text-muted-foreground">No students yet.</p>
                : data.recentStudents.map((s) => (
                  <div key={s.id} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {s.first_name[0]}{s.last_name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{s.first_name} {s.last_name}</p>
                      <p className="text-xs text-muted-foreground">Roll {s.roll_no}</p>
                    </div>
                  </div>
                ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Staff</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading || !data
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
            : data.recentStaff.length === 0
              ? <p className="text-sm text-muted-foreground">No staff yet.</p>
              : data.recentStaff.map((s) => (
                <div key={s.id} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-success/10 text-xs font-medium text-success">
                    {s.first_name[0]}{s.last_name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{s.first_name} {s.last_name}</p>
                    <p className="text-xs text-muted-foreground">{s.designation ?? 'Staff'} · {s.employee_code}</p>
                  </div>
                </div>
              ))}
        </CardContent>
      </Card>
    </div>
  );
}
