'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentSchema, type StudentInput } from '@/lib/validators';
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
import type { StudentRow } from '@/lib/types/database';

interface StudentFormProps {
  mode: 'create' | 'edit';
  student?: StudentRow;
}

export function StudentForm({ mode, student }: StudentFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<StudentInput>({
    resolver: zodResolver(studentSchema),
    defaultValues: student
      ? {
          roll_no: student.roll_no,
          first_name: student.first_name,
          middle_name: student.middle_name ?? '',
          last_name: student.last_name,
          gender: (student.gender as 'Male' | 'Female' | 'Other' | '') ?? '',
          date_of_birth: student.date_of_birth ? new Date(student.date_of_birth).toISOString().split('T')[0] : '',
          blood_group: student.blood_group ?? '',
          admission_date: student.admission_date ? new Date(student.admission_date).toISOString().split('T')[0] : '',
          status: student.status as 'Active' | 'Inactive' | 'Graduated' | 'Suspended',
          photo: student.photo ?? '',
          is_active: student.is_active,
        }
      : { status: 'Active', is_active: true },
  });

  const isActive = watch('is_active');
  const status = watch('status');
  const gender = watch('gender');

  const onSubmit = async (values: StudentInput) => {
    setSaving(true);
    const payload = {
      ...values,
      date_of_birth: values.date_of_birth || null,
      admission_date: values.admission_date || null,
      middle_name: values.middle_name || null,
      gender: values.gender || null,
      blood_group: values.blood_group || null,
      photo: values.photo || null,
    };
    if (mode === 'create') {
      const res = await apiPost<StudentRow>('/api/students', payload);
      setSaving(false);
      if (!res.ok) return toast.error(res.error);
      toast.success('Student added');
      router.push('/students');
    } else {
      const res = await apiPut<StudentRow>(`/api/students/${student!.id}`, payload);
      setSaving(false);
      if (!res.ok) return toast.error(res.error);
      toast.success('Student updated');
      router.push('/students');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Student Details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Roll No" error={errors.roll_no?.message} required>
            <Input {...register('roll_no')} placeholder="R001" />
          </Field>
          <Field label="Status" error={errors.status?.message}>
            <Select value={status} onValueChange={(v) => setValue('status', v as StudentInput['status'])}>
              <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Graduated">Graduated</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="First Name" error={errors.first_name?.message} required>
            <Input {...register('first_name')} />
          </Field>
          <Field label="Middle Name" error={errors.middle_name?.message}>
            <Input {...register('middle_name')} />
          </Field>
          <Field label="Last Name" error={errors.last_name?.message} required>
            <Input {...register('last_name')} />
          </Field>
          <Field label="Gender" error={errors.gender?.message}>
            <Select value={gender} onValueChange={(v) => setValue('gender', v as StudentInput['gender'])}>
              <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Date of Birth" error={errors.date_of_birth?.message}>
            <Input type="date" {...register('date_of_birth')} />
          </Field>
          <Field label="Blood Group" error={errors.blood_group?.message}>
            <Input {...register('blood_group')} placeholder="O+" />
          </Field>
          <Field label="Admission Date" error={errors.admission_date?.message}>
            <Input type="date" {...register('admission_date')} />
          </Field>
          <Field label="Photo URL" error={errors.photo?.message}>
            <Input {...register('photo')} placeholder="https://…" />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm font-medium">Active status</p>
            <p className="text-xs text-muted-foreground">Inactive students are hidden from active lists.</p>
          </div>
          <Switch checked={isActive} onCheckedChange={(v) => setValue('is_active', v, { shouldDirty: true })} />
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {mode === 'create' ? 'Add Student' : 'Save Changes'}
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
