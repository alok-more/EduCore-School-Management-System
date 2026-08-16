'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { staffSchema, type StaffInput } from '@/lib/validators';
import { apiPost, apiPut } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import type { StaffRow } from '@/lib/types/database';
import { COUNTRIES, STATES_BY_COUNTRY, CITIES_BY_STATE, DEFAULT_COUNTRY, DEFAULT_STATE } from '@/lib/location';

interface StaffFormProps {
  mode: 'create' | 'edit';
  staff?: StaffRow;
}

export function StaffForm({ mode, staff }: StaffFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<StaffInput>({
    resolver: zodResolver(staffSchema),
    defaultValues: staff
      ? {
          employee_code: staff.employee_code,
          first_name: staff.first_name,
          last_name: staff.last_name,
          gender: (staff.gender as 'Male' | 'Female' | 'Other' | '') ?? '',
          date_of_birth: staff.date_of_birth ? new Date(staff.date_of_birth).toISOString().split('T')[0] : '',
          mobile: staff.mobile ?? '',
          email: staff.email ?? '',
          designation: staff.designation ?? '',
          department: staff.department ?? '',
          joining_date: staff.joining_date ? new Date(staff.joining_date).toISOString().split('T')[0] : '',
          qualification: staff.qualification ?? '',
          salary: staff.salary ? Number(staff.salary) : 0,
          address: staff.address ?? '',
          city: staff.city ?? '',
          state: staff.state ?? '',
          country: staff.country ?? '',
          is_active: staff.is_active,
        }
      : { is_active: true, salary: 0, country: DEFAULT_COUNTRY, state: DEFAULT_STATE },
  });

  const isActive = watch('is_active');
  const gender = watch('gender');
  const country = watch('country');
  const state = watch('state');
  const states = country ? (STATES_BY_COUNTRY[country] ?? []) : [];
  const cities = state ? (CITIES_BY_STATE[state] ?? []) : [];

  const onSubmit = async (values: StaffInput) => {
    setSaving(true);
    const payload = {
      ...values,
      date_of_birth: values.date_of_birth || null,
      joining_date: values.joining_date || null,
      gender: values.gender || null,
      email: values.email || null,
      mobile: values.mobile || null,
      designation: values.designation || null,
      department: values.department || null,
      qualification: values.qualification || null,
      address: values.address || null,
      city: values.city || null,
      state: values.state || null,
      country: values.country || null,
    };
    if (mode === 'create') {
      const res = await apiPost<StaffRow>('/api/staff', payload);
      setSaving(false);
      if (!res.ok) return toast.error(res.error);
      toast.success('Staff member added');
      router.push('/staff');
    } else {
      const res = await apiPut<StaffRow>(`/api/staff/${staff!.id}`, payload);
      setSaving(false);
      if (!res.ok) return toast.error(res.error);
      toast.success('Staff member updated');
      router.push('/staff');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Staff Details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Employee Code" error={errors.employee_code?.message} required>
            <Input {...register('employee_code')} placeholder="EMP001" />
          </Field>
          <Field label="Gender" error={errors.gender?.message}>
            <Select value={gender ?? ''} onValueChange={(v) => setValue('gender', v as StaffInput['gender'])}>
              <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="First Name" error={errors.first_name?.message} required>
            <Input {...register('first_name')} />
          </Field>
          <Field label="Last Name" error={errors.last_name?.message} required>
            <Input {...register('last_name')} />
          </Field>
          <Field label="Date of Birth" error={errors.date_of_birth?.message}>
            <Input type="date" {...register('date_of_birth')} />
          </Field>
          <Field label="Joining Date" error={errors.joining_date?.message}>
            <Input type="date" {...register('joining_date')} />
          </Field>
          <Field label="Mobile" error={errors.mobile?.message}>
            <Input {...register('mobile')} placeholder="+91…" />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <Input type="email" {...register('email')} placeholder="name@school.test" />
          </Field>
          <Field label="Designation" error={errors.designation?.message}>
            <Input {...register('designation')} placeholder="Senior Teacher" />
          </Field>
          <Field label="Department" error={errors.department?.message}>
            <Input {...register('department')} placeholder="Mathematics" />
          </Field>
          <Field label="Qualification" error={errors.qualification?.message}>
            <Input {...register('qualification')} placeholder="M.Sc, B.Ed" />
          </Field>
          <Field label="Salary" error={errors.salary?.message}>
            <Input type="number" step="0.01" {...register('salary')} placeholder="0" />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Address</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Address" error={errors.address?.message} className="sm:col-span-2">
            <Input {...register('address')} />
          </Field>
          <Field label="Country" error={errors.country?.message}>
            <Select value={watch('country') ?? ''} onValueChange={(v) => { setValue('country', v, { shouldDirty: true }); setValue('state', '', { shouldDirty: true }); setValue('city', '', { shouldDirty: true }); }}>
              <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="State" error={errors.state?.message}>
            <Select value={state ?? ''} onValueChange={(v) => { setValue('state', v, { shouldDirty: true }); setValue('city', '', { shouldDirty: true }); }}>
              <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
              <SelectContent>
                {(STATES_BY_COUNTRY[country ?? DEFAULT_COUNTRY] ?? []).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="City" error={errors.city?.message}>
            <Select value={watch('city') ?? ''} onValueChange={(v) => setValue('city', v, { shouldDirty: true })}>
              <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
              <SelectContent>
                {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm font-medium">Active status</p>
            <p className="text-xs text-muted-foreground">Inactive staff are hidden from active lists.</p>
          </div>
          <Switch checked={isActive} onCheckedChange={(v) => setValue('is_active', v, { shouldDirty: true })} />
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {mode === 'create' ? 'Add Staff' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, error, required, className, children }: { label: string; error?: string; required?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <Label className="mb-1.5">{label} {required && <span className="text-destructive">*</span>}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
