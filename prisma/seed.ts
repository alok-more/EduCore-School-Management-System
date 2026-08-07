import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding EduCore database...');

  // --- Roles ---
  const superAdminRole = await prisma.role.upsert({
    where: { role_name: 'SUPER_ADMIN' },
    update: {},
    create: {
      role_name: 'SUPER_ADMIN',
      description: 'Platform-wide administrator with access to all schools.',
      is_active: true,
    },
  });

  const schoolAdminRole = await prisma.role.upsert({
    where: { role_name: 'SCHOOL_ADMIN' },
    update: {},
    create: {
      role_name: 'SCHOOL_ADMIN',
      description: 'Administrator scoped to a single school.',
      is_active: true,
    },
  });

  // --- Schools ---
  const maplewood = await prisma.school.upsert({
    where: { school_code: 'SCH001' },
    update: {},
    create: {
      school_code: 'SCH001',
      school_name: 'Maplewood International School',
      registration_number: 'REG-MW-2010',
      affiliation_board: 'CBSE',
      school_type: 'Senior Secondary',
      principal_name: 'Dr. Anita Rao',
      establishment_date: new Date('1998-06-15'),
      registration_date: new Date('2010-04-01'),
      email: 'info@maplewood.test',
      phone: '+918822334455',
      address: '12 Hill Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      zipcode: '560001',
      is_active: true,
    },
  });

  const sunrise = await prisma.school.upsert({
    where: { school_code: 'SCH002' },
    update: {},
    create: {
      school_code: 'SCH002',
      school_name: 'Sunrise Public School',
      registration_number: 'REG-SR-2012',
      affiliation_board: 'ICSE',
      school_type: 'Secondary',
      principal_name: 'Mr. Vikram Shah',
      establishment_date: new Date('2001-09-01'),
      registration_date: new Date('2012-06-12'),
      email: 'info@sunrise.test',
      phone: '+919911223344',
      address: '45 Lake View',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      zipcode: '411001',
      is_active: true,
    },
  });

  // --- Profiles (users) ---
  const superAdminHash = bcrypt.hashSync('Educ0re!Super', 10);
  const adminHash = bcrypt.hashSync('Educ0re!Admin', 10);

  await prisma.profile.upsert({
    where: { email: 'superadmin@educore.test' },
    update: {},
    create: {
      id: crypto.randomUUID(),
      role_id: superAdminRole.id,
      first_name: 'System',
      last_name: 'Administrator',
      email: 'superadmin@educore.test',
      mobile: '+919900000001',
      password_hash: superAdminHash,
      is_active: true,
    },
  });

  await prisma.profile.upsert({
    where: { email: 'admin@maplewood.test' },
    update: {},
    create: {
      id: crypto.randomUUID(),
      school_id: maplewood.id,
      role_id: schoolAdminRole.id,
      first_name: 'Ravi',
      last_name: 'Kumar',
      email: 'admin@maplewood.test',
      mobile: '+919911001100',
      password_hash: adminHash,
      is_active: true,
    },
  });

  await prisma.profile.upsert({
    where: { email: 'admin@sunrise.test' },
    update: {},
    create: {
      id: crypto.randomUUID(),
      school_id: sunrise.id,
      role_id: schoolAdminRole.id,
      first_name: 'Priya',
      last_name: 'Nair',
      email: 'admin@sunrise.test',
      mobile: '+919922002200',
      password_hash: adminHash,
      is_active: true,
    },
  });

  // --- Staff (Maplewood) ---
  const mapleStaff = [
    { employee_code: 'EMP001', first_name: 'Suresh', last_name: 'Menon', gender: 'Male', date_of_birth: new Date('1985-03-12'), mobile: '+919811100001', email: 'suresh.menon@maplewood.test', designation: 'Senior Teacher', department: 'Mathematics', joining_date: new Date('2015-06-01'), qualification: 'M.Sc, B.Ed', salary: 55000, address: 'MG Road', city: 'Bengaluru', state: 'Karnataka' },
    { employee_code: 'EMP002', first_name: 'Latha', last_name: 'Iyer', gender: 'Female', date_of_birth: new Date('1988-07-22'), mobile: '+919811100002', email: 'latha.iyer@maplewood.test', designation: 'Teacher', department: 'Science', joining_date: new Date('2017-06-15'), qualification: 'M.Sc, B.Ed', salary: 48000, address: 'Indiranagar', city: 'Bengaluru', state: 'Karnataka' },
    { employee_code: 'EMP003', first_name: 'Joseph', last_name: 'Pinto', gender: 'Male', date_of_birth: new Date('1980-11-05'), mobile: '+919811100003', email: 'joseph.pinto@maplewood.test', designation: 'Librarian', department: 'Library', joining_date: new Date('2012-04-10'), qualification: 'B.Lib', salary: 36000, address: 'Jayanagar', city: 'Bengaluru', state: 'Karnataka' },
    { employee_code: 'EMP004', first_name: 'Meena', last_name: 'Reddy', gender: 'Female', date_of_birth: new Date('1990-02-18'), mobile: '+919811100004', email: 'meena.reddy@maplewood.test', designation: 'Lab Assistant', department: 'Science Lab', joining_date: new Date('2019-07-01'), qualification: 'B.Sc', salary: 30000, address: 'Koramangala', city: 'Bengaluru', state: 'Karnataka' },
  ];

  for (const s of mapleStaff) {
    await prisma.staff.upsert({
      where: { school_id_employee_code: { school_id: maplewood.id, employee_code: s.employee_code } },
      update: {},
      create: { ...s, school_id: maplewood.id, is_active: true },
    });
  }

  // --- Staff (Sunrise) ---
  const sunriseStaff = [
    { employee_code: 'EMP101', first_name: 'Ramesh', last_name: 'Gupta', gender: 'Male', date_of_birth: new Date('1982-05-09'), mobile: '+919822200001', email: 'ramesh.gupta@sunrise.test', designation: 'Senior Teacher', department: 'English', joining_date: new Date('2014-06-01'), qualification: 'M.A, B.Ed', salary: 52000, address: 'Camp Road', city: 'Pune', state: 'Maharashtra' },
    { employee_code: 'EMP102', first_name: 'Sunita', last_name: 'Joshi', gender: 'Female', date_of_birth: new Date('1986-09-30'), mobile: '+919822200002', email: 'sunita.joshi@sunrise.test', designation: 'Teacher', department: 'Hindi', joining_date: new Date('2016-06-12'), qualification: 'M.A, B.Ed', salary: 46000, address: 'FC Road', city: 'Pune', state: 'Maharashtra' },
    { employee_code: 'EMP103', first_name: 'Anil', last_name: 'Deshpande', gender: 'Male', date_of_birth: new Date('1979-12-21'), mobile: '+919822200003', email: 'anil.deshpande@sunrise.test', designation: 'Accountant', department: 'Accounts', joining_date: new Date('2011-03-15'), qualification: 'B.Com', salary: 40000, address: 'Shivaji Nagar', city: 'Pune', state: 'Maharashtra', is_active: false },
  ];

  for (const s of sunriseStaff) {
    await prisma.staff.upsert({
      where: { school_id_employee_code: { school_id: sunrise.id, employee_code: s.employee_code } },
      update: {},
      create: { ...s, school_id: sunrise.id, is_active: s.is_active ?? true },
    });
  }

  // --- Students (Maplewood) ---
  const mapleStudents = [
    { roll_no: 'R001', first_name: 'Aarav', middle_name: 'Kumar', last_name: 'Sharma', gender: 'Male', date_of_birth: new Date('2012-04-10'), blood_group: 'O+', admission_date: new Date('2020-06-15'), status: 'Active', is_active: true },
    { roll_no: 'R002', first_name: 'Diya', middle_name: 'Raj', last_name: 'Nair', gender: 'Female', date_of_birth: new Date('2013-08-22'), blood_group: 'A+', admission_date: new Date('2021-06-14'), status: 'Active', is_active: true },
    { roll_no: 'R003', first_name: 'Kabir', middle_name: 'Singh', last_name: 'Verma', gender: 'Male', date_of_birth: new Date('2011-12-05'), blood_group: 'B+', admission_date: new Date('2019-06-16'), status: 'Active', is_active: true },
    { roll_no: 'R004', first_name: 'Ananya', middle_name: 'Devi', last_name: 'Rao', gender: 'Female', date_of_birth: new Date('2014-01-30'), blood_group: 'AB+', admission_date: new Date('2022-06-13'), status: 'Active', is_active: true },
    { roll_no: 'R005', first_name: 'Ishaan', middle_name: 'Kumar', last_name: 'Gupta', gender: 'Male', date_of_birth: new Date('2012-09-18'), blood_group: 'O-', admission_date: new Date('2020-06-15'), status: 'Inactive', is_active: false },
  ];

  for (const s of mapleStudents) {
    await prisma.student.upsert({
      where: { school_id_roll_no: { school_id: maplewood.id, roll_no: s.roll_no } },
      update: {},
      create: { ...s, school_id: maplewood.id },
    });
  }

  // --- Students (Sunrise) ---
  const sunriseStudents = [
    { roll_no: 'S001', first_name: 'Saanvi', middle_name: 'Raj', last_name: 'Patil', gender: 'Female', date_of_birth: new Date('2013-03-14'), blood_group: 'A+', admission_date: new Date('2021-06-15'), status: 'Active', is_active: true },
    { roll_no: 'S002', first_name: 'Vivaan', middle_name: 'Kumar', last_name: 'Joshi', gender: 'Male', date_of_birth: new Date('2012-07-09'), blood_group: 'B+', admission_date: new Date('2020-06-16'), status: 'Active', is_active: true },
    { roll_no: 'S003', first_name: 'Aanya', middle_name: 'Devi', last_name: 'Deshmukh', gender: 'Female', date_of_birth: new Date('2014-11-25'), blood_group: 'O+', admission_date: new Date('2022-06-14'), status: 'Active', is_active: true },
    { roll_no: 'S004', first_name: 'Reyansh', middle_name: 'Singh', last_name: 'Kulkarni', gender: 'Male', date_of_birth: new Date('2011-05-02'), blood_group: 'AB+', admission_date: new Date('2019-06-17'), status: 'Active', is_active: true },
  ];

  for (const s of sunriseStudents) {
    await prisma.student.upsert({
      where: { school_id_roll_no: { school_id: sunrise.id, roll_no: s.roll_no } },
      update: {},
      create: { ...s, school_id: sunrise.id },
    });
  }

  console.log('✅ Seed complete!');
  console.log('   Super Admin:  superadmin@educore.test / Educ0re!Super');
  console.log('   School Admin: admin@maplewood.test / Educ0re!Admin');
  console.log('   School Admin: admin@sunrise.test / Educ0re!Admin');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
