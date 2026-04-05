import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Admin
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@blinkcure.com' },
    update: {},
    create: {
      email: 'admin@blinkcure.com',
      password: adminPassword,
      role: Role.ADMIN,
      isActive: true,
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // Create Demo Doctor
  const doctorPassword = await bcrypt.hash('doctor123', 12);
  const doctorUser = await prisma.user.upsert({
    where: { email: 'doctor@blinkcure.com' },
    update: {},
    create: {
      email: 'doctor@blinkcure.com',
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
    where: { email: 'derma@blinkcure.com' },
    update: {},
    create: {
      email: 'derma@blinkcure.com',
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
    const existing = await prisma.plan.findFirst({ where: { name: plan.name } });
    if (!existing) await prisma.plan.create({ data: plan });
  }
  console.log('✅ Plans created (₹399 single, ₹1000 family-3, ₹1500 family-5, ₹5999 yearly)');

  // Create categories (specializations)
  const categories = [
    { name: 'Nephrology', icon: 'droplets', sortOrder: 1 },
    { name: 'Anesthesiology', icon: 'syringe', sortOrder: 2 },
    { name: 'Orthopedics', icon: 'bone', sortOrder: 3 },
    { name: 'Ophthalmology', icon: 'eye', sortOrder: 4 },
    { name: 'Pediatrics', icon: 'baby', sortOrder: 5 },
    { name: 'Oncology', icon: 'ribbon', sortOrder: 6 },
    { name: 'Dermatology', icon: 'hand', sortOrder: 7 },
    { name: 'Pathology', icon: 'flask-conical', sortOrder: 8 },
    { name: 'Psychiatry', icon: 'brain', sortOrder: 9 },
    { name: 'General Surgery', icon: 'hospital', sortOrder: 10 },
    { name: 'Endocrinology', icon: 'activity', sortOrder: 11 },
    { name: 'Radiology', icon: 'scan-line', sortOrder: 12 },
    { name: 'Cardiology', icon: 'heart', sortOrder: 13 },
    { name: 'Geriatrics', icon: 'accessibility', sortOrder: 14 },
    { name: 'General Medicine', icon: 'stethoscope', sortOrder: 15 },
    { name: 'ENT', icon: 'ear', sortOrder: 16 },
    { name: 'Gynecology', icon: 'flower-2', sortOrder: 17 },
    { name: 'Neurology', icon: 'brain', sortOrder: 18 },
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
    { name: 'Headache', icon: 'headphones', specs: ['Neurology', 'General Medicine'] },
    { name: 'Irregular Periods', icon: 'droplets', specs: ['Gynecology', 'Endocrinology'] },
    { name: 'Breathing Problem', icon: 'wind', specs: ['General Medicine', 'Cardiology'] },
    { name: 'Cough & Cold', icon: 'thermometer', specs: ['General Medicine', 'ENT'] },
    { name: 'Digestion Issues', icon: 'stethoscope', specs: ['General Medicine', 'Nephrology'] },
    { name: 'Skin Rash', icon: 'circle-dot', specs: ['Dermatology'] },
    { name: 'Back Pain', icon: 'bone', specs: ['Orthopedics', 'General Medicine'] },
    { name: 'Eye Problem', icon: 'eye', specs: ['Ophthalmology'] },
    { name: 'Ear Pain', icon: 'ear', specs: ['ENT'] },
    { name: 'Fever', icon: 'thermometer', specs: ['General Medicine', 'Pediatrics'] },
    { name: 'Chest Pain', icon: 'heart', specs: ['Cardiology', 'General Medicine'] },
    { name: 'Anxiety & Stress', icon: 'brain', specs: ['Psychiatry'] },
    { name: 'Joint Pain', icon: 'activity', specs: ['Orthopedics'] },
    { name: 'Child Health', icon: 'baby', specs: ['Pediatrics'] },
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

  // Create lab provider + health packages
  const provider = await prisma.labProvider.upsert({
    where: { name: 'BlinkCure Labs' },
    update: {},
    create: { name: 'BlinkCure Labs', isActive: true, commission: 0 },
  });

  const healthPackages: { name: string; category: string; mrp: number; sellingPrice: number; costPrice: number; turnaround: string; fasting: boolean; isPackage?: boolean; testsIncluded?: string[]; description?: string }[] = [
    // ─── Anemia Profiles
    { name: 'Anemia Profile Basic', category: 'Anemia Profiles', mrp: 800, sellingPrice: 449, costPrice: 200, turnaround: '12 hours', fasting: true, isPackage: true, testsIncluded: ['CBC', 'Iron', 'Ferritin', 'TIBC'], description: 'Check for iron deficiency and anemia' },
    { name: 'Anemia Profile Advanced', category: 'Anemia Profiles', mrp: 1500, sellingPrice: 849, costPrice: 400, turnaround: '24 hours', fasting: true, isPackage: true, testsIncluded: ['CBC', 'Iron', 'Ferritin', 'TIBC', 'Vitamin B12', 'Folic Acid', 'Reticulocyte Count'] },
    // ─── Cardiac Profiles
    { name: 'Cardiac Risk Profile', category: 'Cardiac Profiles', mrp: 2500, sellingPrice: 1499, costPrice: 600, turnaround: '24 hours', fasting: true, isPackage: true, testsIncluded: ['Lipid Profile', 'hs-CRP', 'Homocysteine', 'Apolipoprotein A1/B'] },
    { name: 'Heart Health Checkup', category: 'Cardiac Profiles', mrp: 3500, sellingPrice: 1999, costPrice: 800, turnaround: '48 hours', fasting: true, isPackage: true, testsIncluded: ['Lipid Profile', 'ECG', 'Troponin I', 'BNP', 'hs-CRP', 'HbA1c'] },
    // ─── Fever & Infection
    { name: 'Fever Panel Basic', category: 'Fever & Infection Screening', mrp: 1200, sellingPrice: 699, costPrice: 300, turnaround: '12 hours', fasting: false, isPackage: true, testsIncluded: ['CBC', 'Malaria', 'Typhoid (Widal)', 'Dengue NS1', 'Urine Routine'] },
    { name: 'Fever Panel Advanced', category: 'Fever & Infection Screening', mrp: 2500, sellingPrice: 1399, costPrice: 600, turnaround: '24 hours', fasting: false, isPackage: true, testsIncluded: ['CBC', 'Malaria', 'Typhoid', 'Dengue', 'Chikungunya', 'CRP', 'Blood Culture', 'ESR'] },
    // ─── Infertility Profiles
    { name: 'Fertility Panel (Female)', category: 'Infertility Profiles', mrp: 3500, sellingPrice: 1999, costPrice: 900, turnaround: '48 hours', fasting: true, isPackage: true, testsIncluded: ['FSH', 'LH', 'Estradiol', 'Prolactin', 'AMH', 'Thyroid'] },
    { name: 'Fertility Panel (Male)', category: 'Infertility Profiles', mrp: 3000, sellingPrice: 1799, costPrice: 800, turnaround: '48 hours', fasting: true, isPackage: true, testsIncluded: ['Testosterone', 'FSH', 'LH', 'Prolactin', 'Semen Analysis'] },
    // ─── Pregnancy & Parental
    { name: 'Pregnancy Screening Package', category: 'Pregnancy & Parental Screening', mrp: 4000, sellingPrice: 2299, costPrice: 1000, turnaround: '48 hours', fasting: true, isPackage: true, testsIncluded: ['CBC', 'Blood Group', 'HIV', 'HBsAg', 'VDRL', 'Rubella IgG', 'TSH', 'Urine'] },
    // ─── Diabetic Profiles
    { name: 'Diabetes Screening', category: 'Diabetic Profiles', mrp: 800, sellingPrice: 449, costPrice: 200, turnaround: '12 hours', fasting: true, isPackage: true, testsIncluded: ['Fasting Glucose', 'HbA1c', 'Post Prandial Glucose'] },
    { name: 'Diabetes Monitoring Package', category: 'Diabetic Profiles', mrp: 2000, sellingPrice: 1149, costPrice: 500, turnaround: '24 hours', fasting: true, isPackage: true, testsIncluded: ['HbA1c', 'Fasting Glucose', 'Lipid Profile', 'KFT', 'Urine Microalbumin'] },
    // ─── Thyroid
    { name: 'Thyroid Profile (T3, T4, TSH)', category: 'Thyroid Test Packages', mrp: 800, sellingPrice: 449, costPrice: 200, turnaround: '12 hours', fasting: false },
    { name: 'Thyroid Complete Panel', category: 'Thyroid Test Packages', mrp: 1500, sellingPrice: 849, costPrice: 400, turnaround: '24 hours', fasting: false, isPackage: true, testsIncluded: ['T3', 'T4', 'TSH', 'Free T3', 'Free T4', 'Anti-TPO'] },
    // ─── Vitamin
    { name: 'Vitamin D', category: 'Vitamin Test Packages', mrp: 800, sellingPrice: 449, costPrice: 200, turnaround: '24 hours', fasting: false },
    { name: 'Vitamin B12', category: 'Vitamin Test Packages', mrp: 700, sellingPrice: 399, costPrice: 180, turnaround: '24 hours', fasting: false },
    { name: 'Complete Vitamin Panel', category: 'Vitamin Test Packages', mrp: 2500, sellingPrice: 1399, costPrice: 600, turnaround: '24 hours', fasting: false, isPackage: true, testsIncluded: ['Vitamin D', 'B12', 'B1', 'B6', 'Folic Acid', 'Iron'] },
    // ─── Arthritis
    { name: 'Arthritis Profile', category: 'Arthritis Profile Packages', mrp: 2000, sellingPrice: 1149, costPrice: 500, turnaround: '24 hours', fasting: false, isPackage: true, testsIncluded: ['RA Factor', 'Anti-CCP', 'Uric Acid', 'CRP', 'ESR', 'ANA'] },
    // ─── Cancer & Tumor
    { name: 'Cancer Screening (Male)', category: 'Cancer & Tumor Screening', mrp: 8000, sellingPrice: 4999, costPrice: 2500, turnaround: '72 hours', fasting: true, isPackage: true, testsIncluded: ['PSA', 'CEA', 'AFP', 'CA 19-9', 'CBC'] },
    { name: 'Cancer Screening (Female)', category: 'Cancer & Tumor Screening', mrp: 8000, sellingPrice: 4999, costPrice: 2500, turnaround: '72 hours', fasting: true, isPackage: true, testsIncluded: ['CA 125', 'CEA', 'AFP', 'CA 15-3', 'CBC', 'PAP Smear'] },
    // ─── Detox & Lifestyle
    { name: 'Liver & Kidney Detox Panel', category: 'Detox & Lifestyle Impact', mrp: 1800, sellingPrice: 999, costPrice: 450, turnaround: '24 hours', fasting: true, isPackage: true, testsIncluded: ['LFT', 'KFT', 'GGT', 'Uric Acid', 'Electrolytes'] },
    // ─── Gut & Food Intolerance
    { name: 'Food Intolerance Panel (40 Foods)', category: 'Gut & Food Intolerance', mrp: 5000, sellingPrice: 2999, costPrice: 1500, turnaround: '72 hours', fasting: false, isPackage: true, testsIncluded: ['IgG antibodies for 40 food items'] },
    // ─── Skin Care
    { name: 'Skin Health Checkup', category: 'Skin Care Checkup Packages', mrp: 2000, sellingPrice: 1199, costPrice: 500, turnaround: '24 hours', fasting: false, isPackage: true, testsIncluded: ['Vitamin D', 'B12', 'Iron', 'Thyroid', 'Zinc', 'ANA'] },
    // ─── Hair Fall
    { name: 'Hair Fall Profile', category: 'Hair Fall Packages', mrp: 2500, sellingPrice: 1399, costPrice: 600, turnaround: '24 hours', fasting: false, isPackage: true, testsIncluded: ['Iron', 'Ferritin', 'Vitamin D', 'B12', 'Thyroid', 'Zinc', 'Biotin'] },
    // ─── Allergy
    { name: 'Allergy Panel (30 Allergens)', category: 'Allergy Packages', mrp: 6000, sellingPrice: 3499, costPrice: 1800, turnaround: '72 hours', fasting: false, isPackage: true, testsIncluded: ['Food allergens', 'Dust', 'Pollen', 'Pet dander', 'Mold'] },
    // ─── Full Body Checkup
    { name: 'Basic Full Body Checkup', category: 'Full Body Checkup', mrp: 1500, sellingPrice: 799, costPrice: 350, turnaround: '24 hours', fasting: true, isPackage: true, testsIncluded: ['CBC', 'Lipid Profile', 'LFT', 'KFT', 'Urine Routine', 'Blood Sugar'] },
    { name: 'Comprehensive Full Body Checkup', category: 'Full Body Checkup', mrp: 3500, sellingPrice: 1999, costPrice: 800, turnaround: '48 hours', fasting: true, isPackage: true, testsIncluded: ['CBC', 'Lipid', 'LFT', 'KFT', 'Thyroid', 'HbA1c', 'Vitamin D', 'B12', 'Iron', 'Urine'] },
    { name: 'Premium Full Body Checkup', category: 'Full Body Checkup', mrp: 6000, sellingPrice: 3499, costPrice: 1500, turnaround: '48 hours', fasting: true, isPackage: true, testsIncluded: ['CBC', 'Lipid', 'LFT', 'KFT', 'Thyroid', 'HbA1c', 'Vitamin D', 'B12', 'Iron', 'Calcium', 'Cardiac markers', 'Cancer markers'] },
    // ─── Hormonal & Metabolic
    { name: 'Hormonal Imbalance Panel (Female)', category: 'Hormonal & Metabolic Packages', mrp: 3000, sellingPrice: 1799, costPrice: 800, turnaround: '48 hours', fasting: true, isPackage: true, testsIncluded: ['FSH', 'LH', 'Estradiol', 'Progesterone', 'Testosterone', 'DHEA-S', 'Cortisol'] },
    { name: 'Metabolic Syndrome Panel', category: 'Hormonal & Metabolic Packages', mrp: 2500, sellingPrice: 1399, costPrice: 600, turnaround: '24 hours', fasting: true, isPackage: true, testsIncluded: ['Fasting Glucose', 'HbA1c', 'Lipid Profile', 'Insulin', 'HOMA-IR'] },
    // ─── Immunity
    { name: 'Immunity Health Checkup', category: 'Immunity & Immune Health', mrp: 2000, sellingPrice: 1199, costPrice: 500, turnaround: '24 hours', fasting: false, isPackage: true, testsIncluded: ['CBC', 'Vitamin D', 'Vitamin C', 'Zinc', 'Iron', 'CRP'] },
    // ─── PCOD/PCOS
    { name: 'PCOD/PCOS Panel', category: 'PCOD & PCOS Packages', mrp: 3500, sellingPrice: 1999, costPrice: 900, turnaround: '48 hours', fasting: true, isPackage: true, testsIncluded: ['FSH', 'LH', 'Testosterone', 'DHEA-S', 'Insulin', 'Thyroid', 'HbA1c'] },
    // ─── Senior Citizen
    { name: 'Senior Citizen Basic', category: 'Senior Citizen Packages', mrp: 3000, sellingPrice: 1799, costPrice: 800, turnaround: '48 hours', fasting: true, isPackage: true, testsIncluded: ['CBC', 'Lipid', 'LFT', 'KFT', 'Thyroid', 'Blood Sugar', 'Urine'] },
    { name: 'Senior Citizen Comprehensive', category: 'Senior Citizen Packages', mrp: 5000, sellingPrice: 2999, costPrice: 1200, turnaround: '48 hours', fasting: true, isPackage: true, testsIncluded: ['CBC', 'Lipid', 'LFT', 'KFT', 'Thyroid', 'HbA1c', 'Vitamin D', 'B12', 'PSA/CA125', 'ECG'] },
    // ─── Sports & Fitness
    { name: 'Sports & Fitness Panel', category: 'Sports & Fitness', mrp: 2500, sellingPrice: 1499, costPrice: 700, turnaround: '24 hours', fasting: true, isPackage: true, testsIncluded: ['CBC', 'Iron', 'Vitamin D', 'B12', 'Electrolytes', 'CK', 'Testosterone', 'Cortisol'] },
    // ─── STD & Sexual Health
    { name: 'STD Screening Basic', category: 'STD & Sexual Health', mrp: 2000, sellingPrice: 1199, costPrice: 500, turnaround: '24 hours', fasting: false, isPackage: true, testsIncluded: ['HIV', 'HBsAg', 'HCV', 'VDRL', 'Herpes HSV 1&2'] },
    { name: 'STD Comprehensive Panel', category: 'STD & Sexual Health', mrp: 4000, sellingPrice: 2499, costPrice: 1000, turnaround: '48 hours', fasting: false, isPackage: true, testsIncluded: ['HIV', 'HBsAg', 'HCV', 'VDRL', 'Herpes', 'Chlamydia', 'Gonorrhea', 'HPV'] },
    // ─── Drug & Toxicology
    { name: 'Drug Screening (5 Panel)', category: 'Drug & Toxicology Screening', mrp: 2000, sellingPrice: 1199, costPrice: 500, turnaround: '24 hours', fasting: false, isPackage: true, testsIncluded: ['Marijuana', 'Cocaine', 'Opiates', 'Amphetamines', 'Benzodiazepines'] },
    { name: 'Drug Screening (10 Panel)', category: 'Drug & Toxicology Screening', mrp: 3500, sellingPrice: 1999, costPrice: 900, turnaround: '48 hours', fasting: false, isPackage: true, testsIncluded: ['10 substance panel including Barbiturates, Methadone, PCP, Propoxyphene'] },
    // ─── Preoperative
    { name: 'Pre-Surgery Panel', category: 'Preoperative Packages', mrp: 2500, sellingPrice: 1499, costPrice: 700, turnaround: '24 hours', fasting: true, isPackage: true, testsIncluded: ['CBC', 'PT/INR', 'Blood Group', 'HIV', 'HBsAg', 'HCV', 'Blood Sugar', 'KFT', 'LFT', 'Chest X-ray'] },
    // ─── Individual Tests
    { name: 'Complete Blood Count (CBC)', category: 'Individual Tests', mrp: 500, sellingPrice: 299, costPrice: 150, turnaround: '6 hours', fasting: false },
    { name: 'Lipid Profile', category: 'Individual Tests', mrp: 600, sellingPrice: 349, costPrice: 150, turnaround: '12 hours', fasting: true },
    { name: 'Liver Function Test (LFT)', category: 'Individual Tests', mrp: 700, sellingPrice: 399, costPrice: 180, turnaround: '24 hours', fasting: true },
    { name: 'Kidney Function Test (KFT)', category: 'Individual Tests', mrp: 650, sellingPrice: 379, costPrice: 170, turnaround: '24 hours', fasting: false },
    { name: 'HbA1c (Diabetes)', category: 'Individual Tests', mrp: 500, sellingPrice: 299, costPrice: 120, turnaround: '12 hours', fasting: false },
    { name: 'Urine Routine', category: 'Individual Tests', mrp: 200, sellingPrice: 149, costPrice: 60, turnaround: '6 hours', fasting: false },
    { name: 'Blood Group & Rh Type', category: 'Individual Tests', mrp: 200, sellingPrice: 99, costPrice: 40, turnaround: '6 hours', fasting: false },
    { name: 'COVID-19 RT-PCR', category: 'Individual Tests', mrp: 500, sellingPrice: 299, costPrice: 100, turnaround: '24 hours', fasting: false },
    { name: 'ESR (Erythrocyte Sedimentation Rate)', category: 'Individual Tests', mrp: 200, sellingPrice: 149, costPrice: 50, turnaround: '6 hours', fasting: false },
    { name: 'CRP (C-Reactive Protein)', category: 'Individual Tests', mrp: 500, sellingPrice: 299, costPrice: 120, turnaround: '12 hours', fasting: false },
  ];

  for (const test of healthPackages) {
    const existing = await prisma.labTest.findFirst({ where: { name: test.name, providerId: provider.id } });
    if (!existing) {
      await prisma.labTest.create({
        data: {
          providerId: provider.id,
          name: test.name,
          category: test.category,
          description: test.description,
          mrp: test.mrp,
          sellingPrice: test.sellingPrice,
          costPrice: test.costPrice,
          turnaround: test.turnaround,
          fasting: test.fasting,
          homeCollection: true,
          isPackage: test.isPackage || false,
          testsIncluded: test.testsIncluded || [],
        },
      });
    }
  }
  console.log('✅ 47 health packages + tests created across 20 categories');

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
