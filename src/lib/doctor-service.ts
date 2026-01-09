/**
 * Doctor Service
 * Handles all doctor profile related operations
 */

import { prisma } from './prisma';
import { DoctorProfileInput, ConsultationTypeInput, AvailabilityInput, AppointmentRulesInput } from './validations';
import { DayOfWeek, ConsultationMode } from '@prisma/client';

/**
 * Generate a unique slug from name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Check if slug is available
 */
export async function isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
  const existing = await prisma.doctorProfile.findUnique({
    where: { slug },
  });
  
  if (!existing) return true;
  if (excludeId && existing.id === excludeId) return true;
  return false;
}

/**
 * Generate unique slug (appends number if taken)
 */
export async function generateUniqueSlug(baseName: string): Promise<string> {
  let slug = generateSlug(baseName);
  let counter = 1;
  
  while (!(await isSlugAvailable(slug))) {
    slug = `${generateSlug(baseName)}-${counter}`;
    counter++;
  }
  
  return slug;
}

/**
 * Create a new doctor profile with associated clinic
 */
export async function createDoctorProfile(userId: string, data: DoctorProfileInput) {
  // Ensure slug is unique
  const slug = await generateUniqueSlug(data.slug || data.name);

  // Use a transaction to create both clinic and doctor profile
  return prisma.$transaction(async (tx) => {
    // Create a clinic for this doctor
    const clinic = await tx.clinic.create({
      data: {
        name: data.clinicName || `${data.name}'s Clinic`,
        slug: slug, // Use same slug for clinic
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        defaultDuration: data.defaultDuration ?? 15,
        bufferTime: data.bufferTime ?? 5,
      },
    });

    // Create doctor profile linked to the clinic
    const doctorProfile = await tx.doctorProfile.create({
      data: {
        userId,
        clinicId: clinic.id,
        slug,
        name: data.name,
        specialization: data.specialization,
        qualifications: data.qualifications,
        bio: data.bio,
        experience: data.experience,
        phone: data.phone,
        clinicName: data.clinicName,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        defaultDuration: data.defaultDuration ?? 15,
        bufferTime: data.bufferTime ?? 5,
      },
    });

    // Add the user as ADMIN staff of the clinic
    await tx.clinicStaff.create({
      data: {
        clinicId: clinic.id,
        userId,
        role: 'ADMIN',
        jobTitle: 'Owner',
        isActive: true,
        joinedAt: new Date(),
      },
    });

    return doctorProfile;
  });
}

/**
 * Update doctor profile
 */
export async function updateDoctorProfile(doctorProfileId: string, data: Partial<DoctorProfileInput>) {
  // If slug is being updated, check availability
  if (data.slug) {
    const isAvailable = await isSlugAvailable(data.slug, doctorProfileId);
    if (!isAvailable) {
      throw new Error('This URL is already taken');
    }
  }

  return prisma.doctorProfile.update({
    where: { id: doctorProfileId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.slug && { slug: data.slug }),
      ...(data.specialization && { specialization: data.specialization }),
      ...(data.qualifications !== undefined && { qualifications: data.qualifications }),
      ...(data.bio !== undefined && { bio: data.bio }),
      ...(data.experience !== undefined && { experience: data.experience }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.clinicName !== undefined && { clinicName: data.clinicName }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.city !== undefined && { city: data.city }),
      ...(data.state !== undefined && { state: data.state }),
      ...(data.pincode !== undefined && { pincode: data.pincode }),
      ...(data.defaultDuration !== undefined && { defaultDuration: data.defaultDuration }),
      ...(data.bufferTime !== undefined && { bufferTime: data.bufferTime }),
    },
  });
}

/**
 * Get doctor profile by user ID
 */
export async function getDoctorProfileByUserId(userId: string) {
  return prisma.doctorProfile.findUnique({
    where: { userId },
    include: {
      clinic: {
        include: {
          consultationTypes: true,
          availability: true,
          appointmentRules: true,
        },
      },
    },
  });
}

/**
 * Get doctor profile by slug (for public page)
 */
export async function getDoctorProfileBySlug(slug: string) {
  return prisma.doctorProfile.findUnique({
    where: { slug },
    include: {
      clinic: {
        include: {
          consultationTypes: {
            where: { isActive: true },
          },
          availability: {
            where: { isActive: true },
          },
          appointmentRules: true,
        },
      },
    },
  });
}

/**
 * Add consultation type
 */
export async function addConsultationType(clinicId: string, data: ConsultationTypeInput) {
  return prisma.consultationType.create({
    data: {
      clinicId,
      name: data.name,
      type: data.type as ConsultationMode,
      description: data.description,
      fee: data.fee,
      duration: data.duration,
      isActive: data.isActive ?? true,
      platformUrl: data.platformUrl,
    },
  });
}

/**
 * Update consultation type
 */
export async function updateConsultationType(id: string, data: Partial<ConsultationTypeInput>) {
  return prisma.consultationType.update({
    where: { id },
    data,
  });
}

/**
 * Delete consultation type
 */
export async function deleteConsultationType(id: string) {
  return prisma.consultationType.delete({
    where: { id },
  });
}

/**
 * Set availability (replace all)
 */
export async function setAvailability(clinicId: string, slots: AvailabilityInput[]) {
  // Delete existing availability
  await prisma.availability.deleteMany({
    where: { clinicId },
  });

  // Create new availability
  return prisma.availability.createMany({
    data: slots.map(slot => ({
      clinicId,
      dayOfWeek: slot.dayOfWeek as DayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isActive: slot.isActive ?? true,
    })),
  });
}

/**
 * Add single availability slot
 */
export async function addAvailabilitySlot(clinicId: string, data: AvailabilityInput) {
  return prisma.availability.create({
    data: {
      clinicId,
      dayOfWeek: data.dayOfWeek as DayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      isActive: data.isActive ?? true,
    },
  });
}

/**
 * Delete availability slot
 */
export async function deleteAvailabilitySlot(id: string) {
  return prisma.availability.delete({
    where: { id },
  });
}

/**
 * Set or update appointment rules
 */
export async function setAppointmentRules(clinicId: string, rules: AppointmentRulesInput) {
  return prisma.appointmentRules.upsert({
    where: { clinicId },
    update: rules,
    create: {
      clinicId,
      ...rules,
    },
  });
}

/**
 * Complete onboarding
 */
export async function completeOnboarding(doctorProfileId: string) {
  return prisma.doctorProfile.update({
    where: { id: doctorProfileId },
    data: { onboardingComplete: true },
  });
}

/**
 * Add blocked slot (holiday, leave, etc.)
 */
export async function addBlockedSlot(
  clinicId: string,
  date: Date,
  startTime?: string,
  endTime?: string,
  reason?: string
) {
  return prisma.blockedSlot.create({
    data: {
      clinicId,
      date,
      startTime,
      endTime,
      reason,
    },
  });
}

/**
 * Remove blocked slot
 */
export async function removeBlockedSlot(id: string) {
  return prisma.blockedSlot.delete({
    where: { id },
  });
}

/**
 * Get blocked slots for a date range
 */
export async function getBlockedSlots(
  clinicId: string,
  startDate: Date,
  endDate: Date
) {
  return prisma.blockedSlot.findMany({
    where: {
      clinicId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: 'asc' },
  });
}
