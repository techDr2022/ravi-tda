'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Calendar,
  Users,
  IndianRupee,
  Clock,
  Video,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Link2,
  Copy,
  ExternalLink,
  TrendingUp,
  CalendarCheck,
  Loader2,
  Building2,
  PhoneCall,
  Bell,
  Settings,
} from 'lucide-react';
import { format, parse } from 'date-fns';
import Link from 'next/link';

interface DashboardStats {
  todayAppointments: number;
  todayCompleted: number;
  todayRemaining: number;
  pendingAppointments: number;
  totalPatients: number;
  monthAppointments: number;
  appointmentGrowth: number;
  monthRevenue: number;
  revenueGrowth: number;
}

interface UpcomingAppointment {
  id: string;
  bookingRef: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  patient: {
    name: string;
    phone: string;
  };
  consultationType: {
    name: string;
    type: string;
    fee: number;
  };
}

interface DoctorProfile {
  name: string;
  slug: string;
  onboardingComplete: boolean;
}

export default function DashboardHome() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([]);
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch dashboard data
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/doctor/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setUpcomingAppointments(data.upcomingAppointments);
          setProfile(data.profile);
          
          // Redirect to setup if onboarding not complete
          if (!data.profile.onboardingComplete) {
            router.push('/setup');
          }
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
      setLoading(false);
    }

    if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);

  // Get booking URL
  const bookingUrl = typeof window !== 'undefined' && profile
    ? `${window.location.origin}/${profile.slug}`
    : '';

  // Copy booking URL
  const copyBookingUrl = async () => {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Get consultation type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'IN_PERSON': return Building2;
      case 'VIDEO_CALL': return Video;
      case 'PHONE_CALL': return PhoneCall;
      default: return Calendar;
    }
  };

  // Format time for display
  const formatTime = (time: string) => {
    try {
      return format(parse(time, 'HH:mm', new Date()), 'h:mm a');
    } catch {
      return time;
    }
  };

  // Loading state
  if (loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-teal-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Get user name
  const userName = session?.user?.name?.split(' ')[0] || 'Doctor';

  // Add noindex meta tag for dashboard pages
  useEffect(() => {
    // Add noindex meta tag
    const metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    metaRobots.content = 'noindex, nofollow, noarchive, nosnippet';
    document.head.appendChild(metaRobots);

    return () => {
      // Cleanup on unmount
      const existing = document.querySelector('meta[name="robots"]');
      if (existing && existing.getAttribute('content') === 'noindex, nofollow, noarchive, nosnippet') {
        existing.remove();
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-slate-500 mt-1">
            Here's what's happening with your appointments today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock className="w-4 h-4" />
          <span>{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
        </div>
      </div>

      {/* Booking Link Card */}
      {profile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-6 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Link2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Your Booking Page</h3>
                  <p className="text-teal-100 text-sm mb-3">
                    Share this link with patients to accept bookings 24/7
                  </p>
                  <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2 backdrop-blur-sm">
                    <Link2 className="w-4 h-4 text-teal-100 flex-shrink-0" />
                    <code className="text-sm text-white truncate max-w-[300px]">
                      {bookingUrl}
                    </code>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={copyBookingUrl}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-white text-teal-600 hover:bg-teal-50'
                  }`}
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </>
                  )}
                </button>
                <a
                  href={bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 border-2 border-white/30 text-white rounded-xl font-medium hover:bg-white/10 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  Preview
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Today's Appointments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                <CalendarCheck className="w-6 h-6 text-teal-600" />
              </div>
              <span className="text-2xl font-bold text-slate-800">
                {stats.todayAppointments}
              </span>
            </div>
            <h3 className="text-slate-500 text-sm">Today's Appointments</h3>
            <p className="text-xs text-slate-400 mt-1">
              {stats.todayCompleted} completed
            </p>
          </motion.div>

          {/* Pending */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-2xl font-bold text-slate-800">
                {stats.pendingAppointments}
              </span>
            </div>
            <h3 className="text-slate-500 text-sm">Pending Confirmation</h3>
            <p className="text-xs text-slate-400 mt-1">
              Awaiting your action
            </p>
          </motion.div>

          {/* Total Patients */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-violet-600" />
              </div>
              <span className="text-2xl font-bold text-slate-800">
                {stats.totalPatients}
              </span>
            </div>
            <h3 className="text-slate-500 text-sm">Total Patients</h3>
            <p className="text-xs text-slate-400 mt-1">
              All time
            </p>
          </motion.div>

          {/* Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-slate-800">
                  ₹{stats.monthRevenue.toLocaleString()}
                </span>
                {stats.revenueGrowth !== 0 && (
                  <div className={`flex items-center gap-1 text-xs mt-1 ${
                    stats.revenueGrowth > 0 ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {stats.revenueGrowth > 0 ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {Math.abs(stats.revenueGrowth)}%
                  </div>
                )}
              </div>
            </div>
            <h3 className="text-slate-500 text-sm">This Month's Revenue</h3>
            <p className="text-xs text-slate-400 mt-1">
              From completed appointments
            </p>
          </motion.div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Upcoming Appointments</h2>
            <Link
              href="/dashboard/appointments"
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              View all →
            </Link>
          </div>
          
          <div className="p-6">
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-slate-600 font-medium mb-1">No upcoming appointments</h3>
                <p className="text-slate-400 text-sm">
                  Share your booking link to start receiving appointments
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((apt, index) => {
                  const TypeIcon = getTypeIcon(apt.consultationType.type);
                  return (
                    <motion.div
                      key={apt.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                          {apt.patient.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-800">{apt.patient.name}</h4>
                          <div className="flex items-center gap-3 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(apt.date), 'MMM d')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(apt.startTime)}
                            </span>
                            <span className="flex items-center gap-1">
                              <TypeIcon className="w-3 h-3" />
                              {apt.consultationType.name}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          apt.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : apt.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {apt.status.charAt(0) + apt.status.slice(1).toLowerCase()}
                        </span>
                        {apt.consultationType.type === 'VIDEO_CALL' && apt.status === 'CONFIRMED' && (
                          <button className="p-2 bg-teal-100 text-teal-600 rounded-lg hover:bg-teal-200 transition-colors">
                            <Video className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Info */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/dashboard/appointments"
                className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-xl hover:bg-teal-50 hover:text-teal-600 transition-colors group"
              >
                <Calendar className="w-6 h-6 text-slate-400 group-hover:text-teal-500" />
                <span className="text-xs font-medium text-slate-600 group-hover:text-teal-600 text-center">
                  View Appointments
                </span>
              </Link>
              <Link
                href="/dashboard/schedule"
                className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-xl hover:bg-amber-50 hover:text-amber-600 transition-colors group"
              >
                <Clock className="w-6 h-6 text-slate-400 group-hover:text-amber-500" />
                <span className="text-xs font-medium text-slate-600 group-hover:text-amber-600 text-center">
                  Manage Schedule
                </span>
              </Link>
              <Link
                href="/dashboard/patients"
                className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-xl hover:bg-violet-50 hover:text-violet-600 transition-colors group"
              >
                <Users className="w-6 h-6 text-slate-400 group-hover:text-violet-500" />
                <span className="text-xs font-medium text-slate-600 group-hover:text-violet-600 text-center">
                  Patient Records
                </span>
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
              >
                <Settings className="w-6 h-6 text-slate-400 group-hover:text-slate-600" />
                <span className="text-xs font-medium text-slate-600 text-center">
                  Settings
                </span>
              </Link>
            </div>
          </div>

          {/* Monthly Stats */}
          {stats && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">This Month</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Total Appointments</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{stats.monthAppointments}</span>
                    {stats.appointmentGrowth !== 0 && (
                      <span className={`flex items-center text-xs ${
                        stats.appointmentGrowth > 0 ? 'text-emerald-600' : 'text-red-500'
                      }`}>
                        {stats.appointmentGrowth > 0 ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {Math.abs(stats.appointmentGrowth)}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Revenue</span>
                  <span className="font-semibold text-slate-800">
                    ₹{stats.monthRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Avg. per Appointment</span>
                  <span className="font-semibold text-slate-800">
                    ₹{stats.monthAppointments > 0 
                      ? Math.round(stats.monthRevenue / stats.monthAppointments).toLocaleString()
                      : 0
                    }
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Help Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
            <h3 className="font-semibold mb-2">Need Help?</h3>
            <p className="text-slate-300 text-sm mb-4">
              Check our help center or contact support for assistance.
            </p>
            <button className="w-full py-2.5 bg-white/10 rounded-xl text-sm font-medium hover:bg-white/20 transition-colors">
              View Help Center
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
