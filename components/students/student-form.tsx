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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import type { StudentRow } from '@/lib/types/database';
import { COUNTRIES, STATES_BY_COUNTRY, CITIES_BY_STATE, DEFAULT_COUNTRY, DEFAULT_STATE } from '@/lib/location';

interface StudentFormProps {
  mode: 'create' | 'edit';
  student?: StudentRow;
}

export function StudentForm({ mode, student }: StudentFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  // const [uploading, setUploading] = useState(false);
  // const [photoPreview, setPhotoPreview] = useState<string | null>(student?.photo ?? null);
  // const fileInputRef = useRef<HTMLInputElement>(null);

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
          father_name: student.father_name ?? '',
          mother_name: student.mother_name ?? '',
          grandfather_name: student.grandfather_name ?? '',
          aadhar_card_no: student.aadhar_card_no ?? '',
          physical_disability: student.physical_disability ?? '',
          mother_tongue: student.mother_tongue ?? '',
          identification_mark: student.identification_mark ?? '',
          caste: student.caste ?? '',
          category: student.category ?? '',
          religion: student.religion ?? '',
          previous_school: student.previous_school ?? '',
          standard_sought: student.standard_sought ?? '',
          address: student.address ?? '',
          city: student.city ?? '',
          state: student.state ?? '',
          country: student.country ?? '',
          pin_code: student.pin_code ?? '',
          phone: student.phone ?? '',
          father_qualification: student.father_qualification ?? '',
          father_occupation: student.father_occupation ?? '',
          father_mobile: student.father_mobile ?? '',
          father_annual_income: student.father_annual_income ? Number(student.father_annual_income) : 0,
          mother_qualification: student.mother_qualification ?? '',
          mother_occupation: student.mother_occupation ?? '',
          mother_mobile: student.mother_mobile ?? '',
          mother_annual_income: student.mother_annual_income ? Number(student.mother_annual_income) : 0,
          guardian_name: student.guardian_name ?? '',
          guardian_relationship: student.guardian_relationship ?? '',
          guardian_phone: student.guardian_phone ?? '',
          is_active: student.is_active,
        }
      : { status: 'Active', is_active: true, country: DEFAULT_COUNTRY, state: DEFAULT_STATE },
  });

  const isActive = watch('is_active');
  const gender = watch('gender');
  const status = watch('status');
  const country = watch('country');
  const state = watch('state');
  const states = country ? (STATES_BY_COUNTRY[country] ?? []) : [];
  const cities = state ? (CITIES_BY_STATE[state] ?? []) : [];

  // const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;
  //   if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
  //     toast.error('Please select a JPEG, PNG, WebP, or GIF image');
  //     return;
  //   }
  //   if (file.size > 5 * 1024 * 1024) {
  //     toast.error('Image must be 5 MB or smaller');
  //     return;
  //   }
  //   setUploading(true);
  //   const formData = new FormData();
  //   formData.append('file', file);
  //   try {
  //     const res = await fetch('/api/upload', { method: 'POST', credentials: 'same-origin', body: formData });
  //     const json = await res.json();
  //     if (!res.ok) { toast.error(json.error ?? 'Upload failed'); return; }
  //     setPhotoPreview(json.url);
  //     setValue('photo', json.url);
  //     toast.success('Image uploaded');
  //   } catch {
  //     toast.error('Upload failed');
  //   } finally {
  //     setUploading(false);
  //     if (fileInputRef.current) fileInputRef.current.value = '';
  //   }
  // };

  // const handleRemovePhoto = () => {
  //   setPhotoPreview(null);
  //   setValue('photo', '');
  // };

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
      father_name: values.father_name || null,
      mother_name: values.mother_name || null,
      grandfather_name: values.grandfather_name || null,
      aadhar_card_no: values.aadhar_card_no || null,
      physical_disability: values.physical_disability || null,
      mother_tongue: values.mother_tongue || null,
      identification_mark: values.identification_mark || null,
      caste: values.caste || null,
      category: values.category || null,
      religion: values.religion || null,
      previous_school: values.previous_school || null,
      standard_sought: values.standard_sought || null,
      address: values.address || null,
      city: values.city || null,
      state: values.state || null,
      country: values.country || null,
      pin_code: values.pin_code || null,
      phone: values.phone || null,
      father_qualification: values.father_qualification || null,
      father_occupation: values.father_occupation || null,
      father_mobile: values.father_mobile || null,
      father_annual_income: values.father_annual_income || null,
      mother_qualification: values.mother_qualification || null,
      mother_occupation: values.mother_occupation || null,
      mother_mobile: values.mother_mobile || null,
      mother_annual_income: values.mother_annual_income || null,
      guardian_name: values.guardian_name || null,
      guardian_relationship: values.guardian_relationship || null,
      guardian_phone: values.guardian_phone || null,
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
      {/* Student Details */}
      <Card>
        <CardHeader><CardTitle>Student Details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="First Name" error={errors.first_name?.message} required>
            <Input {...register('first_name')} />
          </Field>
          <Field label="Middle Name" error={errors.middle_name?.message}>
            <Input {...register('middle_name')} />
          </Field>
          <Field label="Last Name / Surname" error={errors.last_name?.message} required>
            <Input {...register('last_name')} />
          </Field>
          <Field label="Roll No" error={errors.roll_no?.message} required>
            <Input {...register('roll_no')} placeholder="R001" />
          </Field>
          <Field label="Date of Birth" error={errors.date_of_birth?.message}>
            <Input type="date" {...register('date_of_birth')} />
          </Field>
          <Field label="Gender" error={errors.gender?.message}>
            <Select value={gender ?? ''} onValueChange={(v) => setValue('gender', v as StudentInput['gender'])}>
              <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Blood Group" error={errors.blood_group?.message}>
            <Input {...register('blood_group')} placeholder="O+" />
          </Field>
          <Field label="Aadhar Card No." error={errors.aadhar_card_no?.message}>
            <Input {...register('aadhar_card_no')} placeholder="XXXX XXXX XXXX" />
          </Field>
          <Field label="Identification Mark" error={errors.identification_mark?.message}>
            <Input {...register('identification_mark')} placeholder="Mole on left arm" />
          </Field>
          <Field label="Physical Problems / Disability" error={errors.physical_disability?.message}>
            <Input {...register('physical_disability')} placeholder="None" />
          </Field>
          <Field label="Admission Date" error={errors.admission_date?.message}>
            <Input type="date" {...register('admission_date')} />
          </Field>
          <Field label="Standard Sought" error={errors.standard_sought?.message}>
            <Input {...register('standard_sought')} placeholder="5th Grade" />
          </Field>
          <Field label="Status" error={errors.status?.message}>
            <Select value={status ?? 'Active'} onValueChange={(v) => setValue('status', v as StudentInput['status'])}>
              <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Graduated">Graduated</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {/* Photo upload — temporarily disabled
          <Field label="Student Photo" error={errors.photo?.message} className="sm:col-span-2">
            <input type="hidden" {...register('photo')} />
            <div className="flex items-center gap-4">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
                {photoPreview ? (
                  <>
                    <img src={photoPreview} alt="Student" className="h-full w-full object-cover" />
                    <button type="button" onClick={handleRemovePhoto} className="absolute right-1 top-1 rounded-full bg-background/80 p-1 text-foreground shadow-sm transition hover:bg-background" aria-label="Remove photo">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <ImagePlus className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFileSelect} className="hidden" />
                <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                  {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                </Button>
                <p className="text-xs text-muted-foreground">JPEG, PNG, WebP or GIF. Max 5 MB.</p>
              </div>
            </div>
          </Field>
          */}
        </CardContent>
      </Card>

      {/* Demographic Info */}
      <Card>
        <CardHeader><CardTitle>Demographic Information</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Caste" error={errors.caste?.message}>
            <Input {...register('caste')} />
          </Field>
          <Field label="Category" error={errors.category?.message}>
            <Input {...register('category')} placeholder="General / OBC / SC / ST" />
          </Field>
          <Field label="Religion" error={errors.religion?.message}>
            <Input {...register('religion')} />
          </Field>
          <Field label="Mother Tongue" error={errors.mother_tongue?.message}>
            <Input {...register('mother_tongue')} placeholder="Marathi / Hindi / English" />
          </Field>
          <Field label="Previous School" error={errors.previous_school?.message}>
            <Input {...register('previous_school')} />
          </Field>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader><CardTitle>Residential Address</CardTitle></CardHeader>
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
          <Field label="Pin Code" error={errors.pin_code?.message}>
            <Input {...register('pin_code')} />
          </Field>
          <Field label="Phone No." error={errors.phone?.message}>
            <Input {...register('phone')} />
          </Field>
        </CardContent>
      </Card>

      {/* Parent Details */}
      <Card>
        <CardHeader><CardTitle>Parents Details</CardTitle></CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          {/* Father */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground">Father</h4>
            <Field label="Father's Name" error={errors.father_name?.message}>
              <Input {...register('father_name')} />
            </Field>
            <Field label="Qualification" error={errors.father_qualification?.message}>
              <Input {...register('father_qualification')} />
            </Field>
            <Field label="Occupation" error={errors.father_occupation?.message}>
              <Input {...register('father_occupation')} />
            </Field>
            <Field label="Mobile" error={errors.father_mobile?.message}>
              <Input {...register('father_mobile')} />
            </Field>
            <Field label="Annual Income" error={errors.father_annual_income?.message}>
              <Input type="number" step="0.01" min="0" {...register('father_annual_income')} />
            </Field>
          </div>
          {/* Mother */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground">Mother</h4>
            <Field label="Mother's Name" error={errors.mother_name?.message}>
              <Input {...register('mother_name')} />
            </Field>
            <Field label="Qualification" error={errors.mother_qualification?.message}>
              <Input {...register('mother_qualification')} />
            </Field>
            <Field label="Occupation" error={errors.mother_occupation?.message}>
              <Input {...register('mother_occupation')} />
            </Field>
            <Field label="Mobile" error={errors.mother_mobile?.message}>
              <Input {...register('mother_mobile')} />
            </Field>
            <Field label="Annual Income" error={errors.mother_annual_income?.message}>
              <Input type="number" step="0.01" min="0" {...register('mother_annual_income')} />
            </Field>
          </div>
          {/* Grandfather */}
          <div className="space-y-4 sm:col-span-2">
            <Field label="Grandfather's Name" error={errors.grandfather_name?.message}>
              <Input {...register('grandfather_name')} />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* Local Guardian */}
      <Card>
        <CardHeader><CardTitle>Local Guardian</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Guardian Name" error={errors.guardian_name?.message}>
            <Input {...register('guardian_name')} />
          </Field>
          <Field label="Relationship with Guardian" error={errors.guardian_relationship?.message}>
            <Input {...register('guardian_relationship')} placeholder="Uncle / Aunt / Sibling" />
          </Field>
          <Field label="Guardian Phone" error={errors.guardian_phone?.message}>
            <Input {...register('guardian_phone')} />
          </Field>
        </CardContent>
      </Card>

      {/* Active status */}
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
