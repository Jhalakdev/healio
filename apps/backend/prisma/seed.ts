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
          qualification: 'MBBS, MD (General Medicine)',
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
          qualification: 'MBBS, MD (Dermatology)',
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

  // Set default app configs
  const configs = [
    { key: 'global_consultation_fee', value: 500 },
    { key: 'platform_commission_percent', value: 30 },
    { key: 'min_call_duration_for_charge', value: 30 },
    { key: 'max_reschedule_count', value: 1 },
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
