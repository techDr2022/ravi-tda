/**
 * Messaging Service
 * High-level service for sending appointment-related messages
 */

import { sendWhatsAppMessage } from './twilio';
import { prisma } from './prisma';
import { MessageType } from '@prisma/client';
import { format } from 'date-fns';

interface AppointmentMessageData {
  appointmentId: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  date: Date;
  time: string;
  bookingRef: string;
  clinicId: string;
  clinicName?: string;
  clinicPhone?: string;
  clinicAddress?: string;
  consultationType?: string;
}

/**
 * Send appointment confirmation message
 */
export async function sendAppointmentConfirmation(data: AppointmentMessageData): Promise<{
  success: boolean;
  messageLogId?: string;
}> {
  // Check if clinic has confirmation enabled
  const rules = await prisma.appointmentRules.findUnique({
    where: { clinicId: data.clinicId },
  });

  if (rules && !rules.sendConfirmation) {
    return { success: false };
  }

  const result = await sendWhatsAppMessage({
    clinicId: data.clinicId,
    appointmentId: data.appointmentId,
    to: data.patientPhone,
    messageType: 'APPOINTMENT_CONFIRMATION',
    template: 'appointment_confirmation',
    templateData: {
      patientName: data.patientName,
      doctorName: data.doctorName,
      date: data.date,
      time: data.time,
      bookingRef: data.bookingRef,
      clinicName: data.clinicName,
      clinicPhone: data.clinicPhone,
      clinicAddress: data.clinicAddress,
      consultationType: data.consultationType,
    },
  });

  return {
    success: result.success,
    messageLogId: result.messageLogId,
  };
}

/**
 * Send appointment reminder message
 */
export async function sendAppointmentReminder(data: AppointmentMessageData): Promise<{
  success: boolean;
  messageLogId?: string;
}> {
  // Check if clinic has reminders enabled
  const rules = await prisma.appointmentRules.findUnique({
    where: { clinicId: data.clinicId },
  });

  if (rules && !rules.sendReminder) {
    return { success: false };
  }

  const result = await sendWhatsAppMessage({
    clinicId: data.clinicId,
    appointmentId: data.appointmentId,
    to: data.patientPhone,
    messageType: 'APPOINTMENT_REMINDER',
    template: 'appointment_reminder',
    templateData: {
      patientName: data.patientName,
      doctorName: data.doctorName,
      date: data.date,
      time: data.time,
      bookingRef: data.bookingRef,
      clinicName: data.clinicName,
      clinicPhone: data.clinicPhone,
      clinicAddress: data.clinicAddress,
      consultationType: data.consultationType,
    },
  });

  return {
    success: result.success,
    messageLogId: result.messageLogId,
  };
}

/**
 * Send appointment cancellation message
 */
export async function sendAppointmentCancellation(
  data: AppointmentMessageData,
  reason?: string
): Promise<{
  success: boolean;
  messageLogId?: string;
}> {
  const result = await sendWhatsAppMessage({
    clinicId: data.clinicId,
    appointmentId: data.appointmentId,
    to: data.patientPhone,
    messageType: 'APPOINTMENT_CANCELLATION',
    template: 'appointment_cancellation',
    templateData: {
      patientName: data.patientName,
      doctorName: data.doctorName,
      date: data.date,
      time: data.time,
      bookingRef: data.bookingRef,
      clinicName: data.clinicName,
      clinicPhone: data.clinicPhone,
      clinicAddress: data.clinicAddress,
      consultationType: data.consultationType,
    },
    cancellationReason: reason,
  });

  return {
    success: result.success,
    messageLogId: result.messageLogId,
  };
}

/**
 * Send appointment reschedule message
 */
export async function sendAppointmentReschedule(
  data: AppointmentMessageData,
  oldDate: Date,
  oldTime: string
): Promise<{
  success: boolean;
  messageLogId?: string;
}> {
  const result = await sendWhatsAppMessage({
    clinicId: data.clinicId,
    appointmentId: data.appointmentId,
    to: data.patientPhone,
    messageType: 'APPOINTMENT_RESCHEDULE',
    template: 'appointment_reschedule',
    templateData: {
      patientName: data.patientName,
      doctorName: data.doctorName,
      date: data.date,
      time: data.time,
      bookingRef: data.bookingRef,
      clinicName: data.clinicName,
      clinicPhone: data.clinicPhone,
      clinicAddress: data.clinicAddress,
      consultationType: data.consultationType,
    },
    oldDate,
    oldTime,
  });

  return {
    success: result.success,
    messageLogId: result.messageLogId,
  };
}
