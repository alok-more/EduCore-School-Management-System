'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Shield, Building2, Calendar, User, Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function ProfilePage() {
  const { session } = useAuth();
  if (!session) return null;

  const initials = `${session.firstName[0] ?? ''}${session.lastName[0] ?? ''}`;
  const roleLabel = session.role === 'SUPER_ADMIN' ? 'Super Admin' : 'School Admin';
  const fullName = `${session.firstName} ${session.lastName}`;
  const joinedDate = session.createdAt
    ? new Date(session.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';
  const lastLoginDate = session.lastLogin
    ? new Date(session.lastLogin).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Never';

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Profile' }]} />
      <PageHeader title="Profile" description="Your account information." />

      {/* Hero card with avatar + name */}
      <Card className="overflow-hidden">
        {/* <div className="h-28 bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5" /> */}
        <CardContent className="h-24 mt-12 flex flex-col items-center gap-4 pb-6 sm:flex-row sm:items-end">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-card bg-primary text-2xl font-semibold text-primary-foreground">
            {initials}
          </div>
          <div className="flex-1 text-center sm:pb-2 sm:text-left">
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-3">
              <h2 className="text-xl font-semibold">{fullName}</h2>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <Shield className="mr-1 h-3 w-3" />
                {roleLabel}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{session.email}</p>
          </div>
          <div className="flex items-center gap-2">
            {session.isActive ? (
              <Badge className="bg-success/10 text-success">
                <CheckCircle2 className="mr-1 h-3 w-3" /> Active
              </Badge>
            ) : (
              <Badge className="bg-destructive/10 text-destructive">
                <XCircle className="mr-1 h-3 w-3" /> Inactive
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detail cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Personal info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Row icon={User} label="Full Name" value={fullName} />
            <Row icon={Mail} label="Email" value={session.email} />
            <Row icon={Phone} label="Mobile" value={session.mobile ?? '—'} />
            <Row icon={Shield} label="Role" value={roleLabel} />
          </CardContent>
        </Card>

        {/* Assignment + account status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Assignment & Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Row
              icon={Building2}
              label="School"
              value={
                session.schoolName
                  ? `${session.schoolName} (${session.schoolCode ?? '—'})`
                  : 'Platform-wide'
              }
            />
            <Row icon={Calendar} label="Joined" value={joinedDate} />
            <Row icon={Clock} label="Last Login" value={lastLoginDate} />
            <Row
              icon={session.isActive ? CheckCircle2 : XCircle}
              label="Account Status"
              value={session.isActive ? 'Active' : 'Inactive'}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" /> {label}
      </span>
      <span className="truncate text-right text-sm font-medium">{value}</span>
    </div>
  );
}
