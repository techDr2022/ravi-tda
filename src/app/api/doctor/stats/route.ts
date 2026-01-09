/**
 * Dashboard Stats API
 * Get statistics for doctor's dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDoctorProfileByUserId } from '@/lib/doctor-service';
import { getAppointmentStats } from '@/lib/appointment-service';
import prisma from '@/lib/prisma';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getDoctorProfileByUserId(session.user.id);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const today = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());
    const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
    const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));

    // Get various stats
    const [
      todayAppointments,
      todayCompleted,
      pendingAppointments,
      monthAppointments,
      lastMonthAppointments,
      totalPatients,
      monthRevenue,
      lastMonthRevenue,
      upcomingAppointments,
    ] = await Promise.all([
      // Today's appointments
      prisma.appointment.count({
        where: {
          doctorProfileId: profile.id,
          date: today,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      }),
      // Today's completed
      prisma.appointment.count({
        where: {
          doctorProfileId: profile.id,
          date: today,
          status: 'COMPLETED',
        },
      }),
      // Pending appointments (all)
      prisma.appointment.count({
        where: {
          doctorProfileId: profile.id,
          status: 'PENDING',
        },
      }),
      // This month's total appointments
      prisma.appointment.count({
        where: {
          doctorProfileId: profile.id,
          date: { gte: monthStart, lte: monthEnd },
        },
      }),
      // Last month's total appointments
      prisma.appointment.count({
        where: {
          doctorProfileId: profile.id,
          date: { gte: lastMonthStart, lte: lastMonthEnd },
        },
      }),
      // Total unique patients
      prisma.appointment.groupBy({
        by: ['patientId'],
        where: { doctorProfileId: profile.id },
      }),
      // This month's revenue
      prisma.appointment.aggregate({
        where: {
          doctorProfileId: profile.id,
          date: { gte: monthStart, lte: monthEnd },
          status: 'COMPLETED',
        },
        _sum: { fee: true },
      }),
      // Last month's revenue
      prisma.appointment.aggregate({
        where: {
          doctorProfileId: profile.id,
          date: { gte: lastMonthStart, lte: lastMonthEnd },
          status: 'COMPLETED',
        },
        _sum: { fee: true },
      }),
      // Upcoming appointments (next 5)
      prisma.appointment.findMany({
        where: {
          doctorProfileId: profile.id,
          date: { gte: today },
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
        include: {
          patient: true,
          consultationType: true,
        },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        take: 5,
      }),
    ]);

    // Calculate growth percentages
    const appointmentGrowth = lastMonthAppointments > 0
      ? Math.round(((monthAppointments - lastMonthAppointments) / lastMonthAppointments) * 100)
      : 0;

    const currentRevenue = Number(monthRevenue._sum.fee || 0);
    const previousRevenue = Number(lastMonthRevenue._sum.fee || 0);
    const revenueGrowth = previousRevenue > 0
      ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
      : 0;

    return NextResponse.json({
      stats: {
        todayAppointments,
        todayCompleted,
        todayRemaining: todayAppointments,
        pendingAppointments,
        totalPatients: totalPatients.length,
        monthAppointments,
        appointmentGrowth,
        monthRevenue: currentRevenue,
        revenueGrowth,
      },
      upcomingAppointments: upcomingAppointments.map(apt => ({
        id: apt.id,
        bookingRef: apt.bookingRef,
        date: apt.date.toISOString().split('T')[0],
        startTime: apt.startTime,
        endTime: apt.endTime,
        status: apt.status,
        patient: {
          name: apt.patient.name,
          phone: apt.patient.phone,
        },
        consultationType: {
          name: apt.consultationType.name,
          type: apt.consultationType.type,
          fee: apt.consultationType.fee,
        },
      })),
      profile: {
        name: profile.name,
        slug: profile.slug,
        onboardingComplete: profile.onboardingComplete,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get stats' },
      { status: 500 }
    );
  }
}
