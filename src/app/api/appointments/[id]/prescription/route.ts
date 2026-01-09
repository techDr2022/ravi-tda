/**
 * Prescription API
 * Handles prescription CRUD operations for appointments
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

interface PrescriptionInput {
  diagnosis?: string;
  chiefComplaint?: string;
  medicines: Medicine[];
  advice?: string;
  followUpDate?: string;
  followUpNotes?: string;
}

/**
 * GET - Get prescription for an appointment
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appointmentId = params.id;

    // Get appointment with relations
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        doctorProfile: true,
        clinic: true,
        prescription: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Check if user has access (doctor or clinic staff)
    const isDoctor = appointment.doctorProfileId && 
      appointment.doctorProfile?.userId === session.user.id;
    
    const isStaff = await prisma.clinicStaff.findFirst({
      where: {
        clinicId: appointment.clinicId,
        userId: session.user.id,
        isActive: true,
      },
    });

    if (!isDoctor && !isStaff) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (appointment.prescription) {
      return NextResponse.json({ prescription: appointment.prescription });
    }

    return NextResponse.json({ prescription: null });
  } catch (error) {
    console.error('Get prescription error:', error);
    return NextResponse.json(
      { error: 'Failed to get prescription' },
      { status: 500 }
    );
  }
}

/**
 * POST - Create prescription for an appointment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appointmentId = params.id;
    const body: PrescriptionInput = await request.json();

    // Validate medicines
    if (!body.medicines || !Array.isArray(body.medicines) || body.medicines.length === 0) {
      return NextResponse.json(
        { error: 'At least one medicine is required' },
        { status: 400 }
      );
    }

    // Get appointment with relations
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        doctorProfile: true,
        clinic: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Check if user has access (doctor or clinic staff)
    const isDoctor = appointment.doctorProfileId && 
      appointment.doctorProfile?.userId === session.user.id;
    
    const isStaff = await prisma.clinicStaff.findFirst({
      where: {
        clinicId: appointment.clinicId,
        userId: session.user.id,
        isActive: true,
      },
    });

    if (!isDoctor && !isStaff) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if prescription already exists
    const existing = await prisma.prescription.findUnique({
      where: { appointmentId },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Prescription already exists. Use PUT to update.' },
        { status: 409 }
      );
    }

    // Create prescription
    const prescription = await prisma.prescription.create({
      data: {
        appointmentId,
        clinicId: appointment.clinicId,
        doctorProfileId: appointment.doctorProfileId,
        patientName: appointment.patient.name,
        patientAge: appointment.patient.dateOfBirth
          ? new Date().getFullYear() - new Date(appointment.patient.dateOfBirth).getFullYear()
          : null,
        patientGender: appointment.patient.gender,
        doctorName: appointment.doctorProfile?.name || 'Dr. Unknown',
        doctorQualification: appointment.doctorProfile?.qualifications || null,
        clinicName: appointment.clinic.name,
        diagnosis: body.diagnosis,
        chiefComplaint: body.chiefComplaint,
        medicines: body.medicines as any,
        advice: body.advice,
        followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
        followUpNotes: body.followUpNotes,
      },
    });

    return NextResponse.json({ prescription }, { status: 201 });
  } catch (error) {
    console.error('Create prescription error:', error);
    return NextResponse.json(
      { error: 'Failed to create prescription' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update prescription
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appointmentId = params.id;
    const body: PrescriptionInput = await request.json();

    // Validate medicines
    if (!body.medicines || !Array.isArray(body.medicines) || body.medicines.length === 0) {
      return NextResponse.json(
        { error: 'At least one medicine is required' },
        { status: 400 }
      );
    }

    // Get appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        doctorProfile: true,
        clinic: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Check if user has access
    const isDoctor = appointment.doctorProfileId && 
      appointment.doctorProfile?.userId === session.user.id;
    
    const isStaff = await prisma.clinicStaff.findFirst({
      where: {
        clinicId: appointment.clinicId,
        userId: session.user.id,
        isActive: true,
      },
    });

    if (!isDoctor && !isStaff) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update or create prescription
    const prescription = await prisma.prescription.upsert({
      where: { appointmentId },
      update: {
        diagnosis: body.diagnosis,
        chiefComplaint: body.chiefComplaint,
        medicines: body.medicines as any,
        advice: body.advice,
        followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
        followUpNotes: body.followUpNotes,
      },
      create: {
        appointmentId,
        clinicId: appointment.clinicId,
        doctorProfileId: appointment.doctorProfileId,
        patientName: appointment.patient.name,
        patientAge: appointment.patient.dateOfBirth
          ? new Date().getFullYear() - new Date(appointment.patient.dateOfBirth).getFullYear()
          : null,
        patientGender: appointment.patient.gender,
        doctorName: appointment.doctorProfile?.name || 'Dr. Unknown',
        doctorQualification: appointment.doctorProfile?.qualifications || null,
        clinicName: appointment.clinic.name,
        diagnosis: body.diagnosis,
        chiefComplaint: body.chiefComplaint,
        medicines: body.medicines as any,
        advice: body.advice,
        followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
        followUpNotes: body.followUpNotes,
      },
    });

    return NextResponse.json({ prescription });
  } catch (error) {
    console.error('Update prescription error:', error);
    return NextResponse.json(
      { error: 'Failed to update prescription' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete prescription
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appointmentId = params.id;

    // Get appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Check if user has access
    const isDoctor = appointment.doctorProfileId && 
      await prisma.doctorProfile.findFirst({
        where: {
          id: appointment.doctorProfileId,
          userId: session.user.id,
        },
      });
    
    const isStaff = await prisma.clinicStaff.findFirst({
      where: {
        clinicId: appointment.clinicId,
        userId: session.user.id,
        isActive: true,
      },
    });

    if (!isDoctor && !isStaff) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.prescription.delete({
      where: { appointmentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete prescription error:', error);
    return NextResponse.json(
      { error: 'Failed to delete prescription' },
      { status: 500 }
    );
  }
}
