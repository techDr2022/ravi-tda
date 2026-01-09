/**
 * Printable Prescription Page
 * A4-sized printable prescription with print-friendly CSS
 */

import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import PrescriptionPrint from '@/components/prescription/PrescriptionPrint';

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

interface PrescriptionPageProps {
  params: {
    appointmentId: string;
  };
}

export default async function PrescriptionPage({ params }: PrescriptionPageProps) {
  const { appointmentId } = params;

  // Get prescription with all related data
  const prescription = await prisma.prescription.findUnique({
    where: { appointmentId },
    include: {
      appointment: {
        include: {
          patient: true,
          doctorProfile: true,
          clinic: true,
        },
      },
    },
  });

  if (!prescription) {
    notFound();
  }

  const medicines = prescription.medicines as Medicine[];

  return (
    <PrescriptionPrint
      prescription={{
        id: prescription.id,
        patientName: prescription.patientName,
        patientAge: prescription.patientAge,
        patientGender: prescription.patientGender,
        doctorName: prescription.doctorName,
        doctorQualification: prescription.doctorQualification,
        clinicName: prescription.clinicName || prescription.appointment.clinic.name,
        diagnosis: prescription.diagnosis,
        chiefComplaint: prescription.chiefComplaint,
        medicines,
        advice: prescription.advice,
        followUpDate: prescription.followUpDate,
        followUpNotes: prescription.followUpNotes,
        appointmentDate: prescription.appointment.date,
        createdAt: prescription.createdAt,
      }}
    />
  );
}
