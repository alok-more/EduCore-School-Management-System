'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { schoolSchema, type SchoolInput } from '@/lib/validators';
import { apiPost, apiPut } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import type { SchoolRow } from '@/lib/types/database';

interface SchoolFormProps {
  mode: 'create' | 'edit';
  school?: SchoolRow;
}

export function SchoolForm({ mode, school }: SchoolFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<SchoolInput>({
    resolver: zodResolver(schoolSchema),
    defaultValues: school
      ? {
          school_code: school.school_code,
          school_name: school.school_name,
          registration_number: school.registration_number ?? '',
          affiliation_board: school.affiliation_board ?? '',
          school_type: school.school_type ?? '',
          principal_name: school.principal_name ?? '',
          establishment_date: school.establishment_date ? new Date(school.establishment_date).toISOString().split('T')[0] : '',
          registration_date: school.registration_date ? new Date(school.registration_date).toISOString().split('T')[0] : '',
          email: school.email ?? '',
          phone: school.phone ?? '',
          address: school.address ?? '',
          city: school.city ?? '',
          state: school.state ?? '',
          country: school.country ?? '',
          zipcode: school.zipcode ?? '',
          is_active: school.is_active,
        }
      : { is_active: true },
  });

  const isActive = watch('is_active');

  const onSubmit = async (values: SchoolInput) => {
    setSaving(true);
    const payload = {
      ...values,
      establishment_date: values.establishment_date || null,
      registration_date: values.registration_date || null,
      email: values.email || null,
      phone: values.phone || null,
      address: values.address || null,
      city: values.city || null,
      state: values.state || null,
      country: values.country || null,
      zipcode: values.zipcode || null,
      registration_number: values.registration_number || null,
      affiliation_board: values.affiliation_board || null,
      school_type: values.school_type || null,
      principal_name: values.principal_name || null,
    };

    if (mode === 'create') {
      const res = await apiPost<SchoolRow>('/api/schools', payload);
      setSaving(false);
      if (!res.ok) return toast.error(res.error);
      toast.success('School created');
      router.push('/schools');
    } else {
      const res = await apiPut<SchoolRow>(`/api/schools/${school!.id}`, payload);
      setSaving(false);
      if (!res.ok) return toast.error(res.error);
      toast.success('School updated');
      router.push('/schools');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="School Code" error={errors.school_code?.message} required>
            <Input {...register('school_code')} placeholder="SCH001" />
          </Field>
          <Field label="School Name" error={errors.school_name?.message} required>
            <Input {...register('school_name')} placeholder="Maplewood International School" />
          </Field>
          <Field label="Registration Number" error={errors.registration_number?.message}>
            <Input {...register('registration_number')} placeholder="REG-MW-2010" />
          </Field>
          <Field label="Affiliation Board" error={errors.affiliation_board?.message}>
            <Input {...register('affiliation_board')} placeholder="CBSE / ICSE / State" />
          </Field>
          <Field label="School Type" error={errors.school_type?.message}>
            <Input {...register('school_type')} placeholder="Senior Secondary" />
          </Field>
          <Field label="Principal Name" error={errors.principal_name?.message}>
            <Input {...register('principal_name')} placeholder="Dr. Anita Rao" />
          </Field>
          <Field label="Establishment Date" error={errors.establishment_date?.message}>
            <Input type="date" {...register('establishment_date')} />
          </Field>
          <Field label="Registration Date" error={errors.registration_date?.message}>
            <Input type="date" {...register('registration_date')} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact & Address</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" error={errors.email?.message}>
            <Input type="email" {...register('email')} placeholder="info@school.test" />
          </Field>
          <Field label="Phone" error={errors.phone?.message}>
            <Input {...register('phone')} placeholder="+91…" />
          </Field>
          <Field label="Address" error={errors.address?.message} className="sm:col-span-2">
            <Input {...register('address')} placeholder="12 Hill Road" />
          </Field>
          <Field label="City" error={errors.city?.message}>
            <Input {...register('city')} placeholder="Bengaluru" />
          </Field>
          <Field label="State" error={errors.state?.message}>
            <Input {...register('state')} placeholder="Karnataka" />
          </Field>
          <Field label="Country" error={errors.country?.message}>
            <Input {...register('country')} placeholder="India" />
          </Field>
          <Field label="Zipcode" error={errors.zipcode?.message}>
            <Input {...register('zipcode')} placeholder="560001" />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm font-medium">Active status</p>
            <p className="text-xs text-muted-foreground">Inactive schools cannot be administered.</p>
          </div>
          <Switch
            checked={isActive}
            onCheckedChange={(v) => setValue('is_active', v, { shouldDirty: true })}
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {mode === 'create' ? 'Create School' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  required,
  className,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
