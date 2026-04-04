import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Admin
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@healio.in' },
    update: {},
    create: {
      email: 'admin@healio.in',
      password: adminPassword,
      role: Role.ADMIN,
      isActive: true,
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // Create Demo Doctor
  const doctorPassword = await bcrypt.hash('doctor123', 12);
  const doctorUser = await prisma.user.upsert({
    where: { email: 'doctor@healio.in' },
    update: {},
    create: {
      email: 'doctor@healio.in',
      password: doctorPassword,
      role: Role.DOCTOR,
      isActive: true,
      doctor: {
        create: {
          name: 'Dr. Priya Sharma',
          qualifications: ['MBBS', 'MD (General Medicine)'],
          specialization: 'General Medicine',
          experience: 8,
          consultationFee: 500,
          verificationStatus: 'APPROVED',
          bio: 'Experienced general physician with 8+ years of practice.',
        },
      },
    },
  });
  console.log(`✅ Doctor created: ${doctorUser.email}`);

  // Create wallet for doctor
  await prisma.wallet.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: { userId: doctorUser.id, balance: 0 },
  });

  // Create doctor slots (Mon-Fri 9am-5pm, with lunch break 1pm-2pm)
  const doctor1 = await prisma.doctor.findUnique({
    where: { userId: doctorUser.id },
  });
  if (doctor1) {
    await prisma.doctorSlot.deleteMany({ where: { doctorId: doctor1.id } });
    for (let day = 1; day <= 5; day++) {
      // Working hours
      await prisma.doctorSlot.create({
        data: { doctorId: doctor1.id, dayOfWeek: day, startTime: '09:00', endTime: '13:00' },
      });
      await prisma.doctorSlot.create({
        data: { doctorId: doctor1.id, dayOfWeek: day, startTime: '14:00', endTime: '17:00' },
      });
      // Lunch break
      await prisma.doctorSlot.create({
        data: { doctorId: doctor1.id, dayOfWeek: day, startTime: '13:00', endTime: '14:00', isBreak: true },
      });
    }
    // Saturday half day
    await prisma.doctorSlot.create({
      data: { doctorId: doctor1.id, dayOfWeek: 6, startTime: '09:00', endTime: '13:00' },
    });
    console.log('✅ Doctor slots created (Mon-Fri 9-5, Sat 9-1)');
  }

  // Create Demo Patient
  const patientUser = await prisma.user.upsert({
    where: { phone: '+919876543210' },
    update: {},
    create: {
      phone: '+919876543210',
      role: Role.PATIENT,
      isActive: true,
      patient: {
        create: {
          name: 'Rahul Kumar',
          gender: 'male',
        },
      },
    },
  });
  console.log(`✅ Patient created: ${patientUser.phone}`);

  // Create wallet for patient with demo balance
  await prisma.wallet.upsert({
    where: { userId: patientUser.id },
    update: {},
    create: { userId: patientUser.id, balance: 2000 },
  });

  // Create a second doctor
  const doctor2Password = await bcrypt.hash('doctor123', 12);
  const doctor2User = await prisma.user.upsert({
    where: { email: 'derma@healio.in' },
    update: {},
    create: {
      email: 'derma@healio.in',
      password: doctor2Password,
      role: Role.DOCTOR,
      isActive: true,
      doctor: {
        create: {
          name: 'Dr. Amit Verma',
          qualifications: ['MBBS', 'MD (Dermatology)'],
          specialization: 'Dermatology',
          experience: 5,
          consultationFee: 700,
          verificationStatus: 'APPROVED',
          bio: 'Specialist in skin care and dermatological treatments.',
        },
      },
    },
  });
  await prisma.wallet.upsert({
    where: { userId: doctor2User.id },
    update: {},
    create: { userId: doctor2User.id, balance: 0 },
  });
  console.log(`✅ Doctor created: ${doctor2User.email}`);

  // Create consultation plans
  const plans = [
    {
      name: 'Single Consult',
      type: 'single',
      price: 399,
      consultations: 1,
      maxMembers: 1,
      validityDays: 30,
      childDiscountPercent: 10,
      description: 'One-time consultation with any available doctor',
      features: ['15-min HD video call', 'Digital prescription', 'Chat support'],
      sortOrder: 1,
    },
    {
      name: 'Family Plan - 3 Members',
      type: 'family',
      price: 1000,
      consultations: 3,
      maxMembers: 3,
      validityDays: 90,
      childDiscountPercent: 10,
      description: 'Perfect for small families. Add up to 3 members.',
      features: ['3 consultations', '3 family members', '10% child discount', '3 months validity'],
      sortOrder: 2,
    },
    {
      name: 'Family Plan - 5 Members',
      type: 'family',
      price: 1500,
      consultations: 5,
      maxMembers: 5,
      validityDays: 90,
      childDiscountPercent: 10,
      description: 'Best for larger families. Add up to 5 members.',
      features: ['5 consultations', '5 family members', '10% child discount', '3 months validity', 'Priority booking'],
      sortOrder: 3,
    },
    {
      name: 'Yearly Card',
      type: 'yearly',
      price: 5999,
      consultations: 10,
      maxMembers: 5,
      validityDays: 365,
      childDiscountPercent: 10,
      description: 'Annual health card with 10 consultations for the whole family.',
      features: ['10 consultations', '5 family members', '12 months validity', 'Priority booking', 'Free follow-ups', '10% child discount'],
      sortOrder: 4,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.create({ data: plan });
  }
  console.log('✅ Plans created (₹399 single, ₹1000 family-3, ₹1500 family-5, ₹5999 yearly)');

  // Create categories (specializations)
  const categories = [
    { name: 'Nephrology', icon: '🫘', sortOrder: 1 },
    { name: 'Anesthesiology', icon: '💉', sortOrder: 2 },
    { name: 'Orthopedics', icon: '🦴', sortOrder: 3 },
    { name: 'Ophthalmology', icon: '👁️', sortOrder: 4 },
    { name: 'Pediatrics', icon: '👶', sortOrder: 5 },
    { name: 'Oncology', icon: '🎗️', sortOrder: 6 },
    { name: 'Dermatology', icon: '🧴', sortOrder: 7 },
    { name: 'Pathology', icon: '🔬', sortOrder: 8 },
    { name: 'Psychiatry', icon: '🧠', sortOrder: 9 },
    { name: 'General Surgery', icon: '🏥', sortOrder: 10 },
    { name: 'Endocrinology', icon: '🦋', sortOrder: 11 },
    { name: 'Radiology', icon: '📡', sortOrder: 12 },
    { name: 'Cardiology', icon: '❤️', sortOrder: 13 },
    { name: 'Geriatrics', icon: '👴', sortOrder: 14 },
    { name: 'General Medicine', icon: '🩺', sortOrder: 15 },
    { name: 'ENT', icon: '👂', sortOrder: 16 },
    { name: 'Gynecology', icon: '🌸', sortOrder: 17 },
    { name: 'Neurology', icon: '🧠', sortOrder: 18 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: { icon: cat.icon, sortOrder: cat.sortOrder },
      create: cat,
    });
  }
  console.log('✅ 18 categories created');

  // Create demo coupons
  await prisma.coupon.upsert({
    where: { code: 'WELCOME50' },
    update: {},
    create: {
      code: 'WELCOME50',
      discountType: 'flat',
      discountValue: 50,
      maxUsage: 1000,
      description: '₹50 off on your first consultation',
      applicableFor: 'consultation',
      expiresAt: new Date('2027-12-31'),
    },
  });
  await prisma.coupon.upsert({
    where: { code: 'HEALTH20' },
    update: {},
    create: {
      code: 'HEALTH20',
      discountType: 'percentage',
      discountValue: 20,
      maxDiscountAmt: 200,
      maxUsage: 500,
      description: '20% off up to ₹200',
      applicableFor: 'all',
      expiresAt: new Date('2027-12-31'),
    },
  });
  await prisma.coupon.upsert({
    where: { code: 'FAMILY100' },
    update: {},
    create: {
      code: 'FAMILY100',
      discountType: 'flat',
      discountValue: 100,
      maxUsage: 200,
      description: '₹100 off on family plans only',
      applicableFor: 'plan_purchase',
      expiresAt: new Date('2027-12-31'),
    },
  });
  console.log('✅ Coupons created (WELCOME50, HEALTH20, FAMILY100)');

  // Create symptoms/diseases and link to specialists
  const symptomData = [
    { name: 'Headache', icon: '🤕', specs: ['Neurology', 'General Medicine'] },
    { name: 'Irregular Periods', icon: '🩸', specs: ['Gynecology', 'Endocrinology'] },
    { name: 'Breathing Problem', icon: '😮‍💨', specs: ['General Medicine', 'Cardiology'] },
    { name: 'Cough & Cold', icon: '🤧', specs: ['General Medicine', 'ENT'] },
    { name: 'Digestion Issues', icon: '🤢', specs: ['General Medicine', 'Nephrology'] },
    { name: 'Skin Rash', icon: '🔴', specs: ['Dermatology'] },
    { name: 'Back Pain', icon: '😣', specs: ['Orthopedics', 'General Medicine'] },
    { name: 'Eye Problem', icon: '👁️', specs: ['Ophthalmology'] },
    { name: 'Ear Pain', icon: '👂', specs: ['ENT'] },
    { name: 'Fever', icon: '🤒', specs: ['General Medicine', 'Pediatrics'] },
    { name: 'Chest Pain', icon: '💔', specs: ['Cardiology', 'General Medicine'] },
    { name: 'Anxiety & Stress', icon: '😰', specs: ['Psychiatry'] },
    { name: 'Joint Pain', icon: '🦵', specs: ['Orthopedics'] },
    { name: 'Child Health', icon: '👶', specs: ['Pediatrics'] },
  ];

  for (const s of symptomData) {
    const symptom = await prisma.symptom.upsert({
      where: { name: s.name },
      update: { icon: s.icon },
      create: { name: s.name, icon: s.icon },
    });

    // Link to specialist categories
    for (const specName of s.specs) {
      const cat = await prisma.category.findUnique({ where: { name: specName } });
      if (cat) {
        await prisma.symptomSpecialist.upsert({
          where: { symptomId_categoryId: { symptomId: symptom.id, categoryId: cat.id } },
          update: {},
          create: { symptomId: symptom.id, categoryId: cat.id },
        });
      }
    }
  }
  console.log('✅ 14 symptoms created and linked to specialists');

  // Set default app configs
  const configs = [
    { key: 'global_consultation_fee', value: 500 },
    { key: 'platform_commission_percent', value: 30 },
    { key: 'min_call_duration_for_charge', value: 30 },
    { key: 'max_reschedule_count', value: 1 },
    { key: 'report_upload_window_days', value: 10 },
    { key: 'doctor_reply_deadline_hours', value: 24 },
    { key: 'payout_schedule', value: { day: 'friday', autoEnabled: true } },
  ];

  for (const config of configs) {
    await prisma.appConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: { key: config.key, value: config.value },
    });
  }
  console.log('✅ App configs set');

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
