'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Video,
  Building2,
  PhoneCall,
  AlertCircle,
  Loader2,
  Stethoscope,
  Award,
  IndianRupee,
  Sun,
  Sunset,
  Moon,
  Copy,
  Check,
  Share2,
  CalendarCheck,
  MessageSquare,
} from 'lucide-react';
import { format, parse, startOfDay, isSameDay, addMonths, subMonths } from 'date-fns';

type BookingStep = 'service' | 'datetime' | 'details' | 'confirm' | 'success';

interface ConsultationType {
  id: string;
  name: string;
  type: 'IN_PERSON' | 'VIDEO_CALL' | 'PHONE_CALL';
  description?: string;
  fee: number;
  duration: number;
}

interface DoctorProfile {
  slug: string;
  name: string;
  photo?: string;
  specialization: string;
  qualifications?: string;
  bio?: string;
  experience?: number;
  phone?: string;
  clinicName?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  consultationTypes: ConsultationType[];
  availability: Array<{
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }>;
  appointmentRules?: {
    minAdvanceBooking: number;
    maxAdvanceBooking: number;
    allowCancellation: boolean;
    cancellationWindow: number;
    requirePayment: boolean;
    paymentMode: string;
  };
}

interface TimeSlot {
  time: string;
  displayTime: string;
}

interface GroupedSlots {
  morning: TimeSlot[];
  afternoon: TimeSlot[];
  evening: TimeSlot[];
}

interface AvailableDate {
  date: string;
  dayOfWeek: string;
  displayDate: string;
}

interface BookingData {
  consultationTypeId: string;
  date: Date | null;
  time: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  reasonForVisit: string;
}

/**
 * Public Appointment Booking Page
 * Dynamic slug-based page for each doctor
 */
export default function BookingPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [step, setStep] = useState<BookingStep>('service');
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bookingData, setBookingData] = useState<BookingData>({
    consultationTypeId: '',
    date: null,
    time: '',
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    reasonForVisit: '',
  });

  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [groupedSlots, setGroupedSlots] = useState<GroupedSlots>({
    morning: [],
    afternoon: [],
    evening: [],
  });
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [copied, setCopied] = useState(false);

  // Load doctor profile
  useEffect(() => {
    async function loadDoctor() {
      try {
        const res = await fetch(`/api/public/doctor/${slug}`);

        if (res.status === 404) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error('Failed to load doctor');
        }

        const data = await res.json();
        setDoctor(data.doctor);

        // Load available dates
        const datesRes = await fetch(`/api/public/slots?slug=${slug}&mode=dates&days=60`);
        if (datesRes.ok) {
          const datesData = await datesRes.json();
          setAvailableDates(datesData.dates);
        }
      } catch (err) {
        console.error('Error loading doctor:', err);
        setNotFound(true);
      }
      setLoading(false);
    }

    if (slug) {
      loadDoctor();
    }
  }, [slug]);

  // Load slots when date changes
  const loadSlots = useCallback(
    async (date: Date, consultationTypeId: string) => {
      setLoadingSlots(true);
      try {
        const dateStr = format(date, 'yyyy-MM-dd');
        const res = await fetch(
          `/api/public/slots?slug=${slug}&date=${dateStr}&consultationTypeId=${consultationTypeId}`
        );

        if (res.ok) {
          const data = await res.json();
          setGroupedSlots(data.grouped || { morning: [], afternoon: [], evening: [] });
        }
      } catch (err) {
        console.error('Error loading slots:', err);
      }
      setLoadingSlots(false);
    },
    [slug]
  );

  useEffect(() => {
    if (bookingData.date && bookingData.consultationTypeId) {
      loadSlots(bookingData.date, bookingData.consultationTypeId);
    }
  }, [bookingData.date, bookingData.consultationTypeId, loadSlots]);

  // Get selected consultation type
  const selectedConsultationType = doctor?.consultationTypes.find(
    ct => ct.id === bookingData.consultationTypeId
  );

  // Generate calendar dates
  const generateCalendarDates = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const dates: Date[] = [];
    const current = new Date(startDate);

    while (current <= lastDay || dates.length % 7 !== 0) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
      if (dates.length > 42) break;
    }

    return dates;
  };

  const calendarDates = generateCalendarDates();

  // Check if date is available
  const isDateAvailable = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return availableDates.some(d => d.date === dateStr);
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/public/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorSlug: slug,
          consultationTypeId: bookingData.consultationTypeId,
          date: format(bookingData.date!, 'yyyy-MM-dd'),
          time: bookingData.time,
          patient: {
            name: bookingData.patientName,
            phone: bookingData.patientPhone,
            email: bookingData.patientEmail || null,
          },
          reasonForVisit: bookingData.reasonForVisit || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to book appointment');
      }

      setBookingRef(data.appointment.bookingRef);
      setStep('success');
    } catch (err: any) {
      setError(err.message);
    }

    setIsSubmitting(false);
  };

  // Copy booking reference
  const copyBookingRef = () => {
    navigator.clipboard.writeText(bookingRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get consultation type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'IN_PERSON':
        return Building2;
      case 'VIDEO_CALL':
        return Video;
      case 'PHONE_CALL':
        return PhoneCall;
      default:
        return Building2;
    }
  };

  // Get type label
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'IN_PERSON':
        return 'Visit clinic in person';
      case 'VIDEO_CALL':
        return 'Video consultation from home';
      case 'PHONE_CALL':
        return 'Phone call consultation';
      default:
        return '';
    }
  };

  // Step progress
  const steps = ['service', 'datetime', 'details', 'confirm'];
  const currentStepIndex = steps.indexOf(step);

  // Total available slots
  const totalSlots =
    groupedSlots.morning.length + groupedSlots.afternoon.length + groupedSlots.evening.length;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-cyan-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Loading booking page...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!doctor || notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-cyan-50 px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-3">Page Not Found</h1>
          <p className="text-slate-500 mb-8">
            This booking page doesn't exist or the doctor is no longer accepting appointments.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-all shadow-lg shadow-teal-500/30"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      {/* Doctor Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Doctor Avatar */}
            {doctor.photo ? (
              <Image
                src={doctor.photo}
                alt={`${doctor.name}, ${doctor.specialization}${doctor.clinicName ? ` at ${doctor.clinicName}` : ''}${doctor.city ? ` in ${doctor.city}` : ''} - TDAppointments booking page`}
                width={56}
                height={56}
                className="w-14 h-14 rounded-2xl object-cover shadow-md"
              />
            ) : (
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg font-bold">
                  {doctor.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .slice(0, 2)}
                </span>
              </div>
            )}

            {/* Doctor Info */}
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-slate-800 truncate">{doctor.name}</h1>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Stethoscope className="w-4 h-4 text-teal-500 flex-shrink-0" />
                <span className="truncate">{doctor.specialization}</span>
                {doctor.experience && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="flex-shrink-0">{doctor.experience}+ yrs</span>
                  </>
                )}
              </div>
            </div>

            {/* Clinic Info (desktop) */}
            {doctor.clinicName && (
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-slate-700">{doctor.clinicName}</p>
                {doctor.city && <p className="text-xs text-slate-500">{doctor.city}</p>}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      {step !== 'success' && (
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-3">
            {['Service', 'Schedule', 'Details', 'Confirm'].map((label, index) => (
              <div key={label} className="flex items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    index < currentStepIndex
                      ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                      : index === currentStepIndex
                      ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30 ring-4 ring-teal-100'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {index < currentStepIndex ? <Check className="w-5 h-5" /> : index + 1}
                </div>
                {index < 3 && (
                  <div
                    className={`w-8 sm:w-16 lg:w-24 h-1 mx-1 sm:mx-2 rounded-full transition-all ${
                      index < currentStepIndex ? 'bg-teal-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-500 px-1">
            <span>Service</span>
            <span>Schedule</span>
            <span>Details</span>
            <span>Confirm</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-3xl mx-auto px-4 mb-4"
          >
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 pb-16">
        <AnimatePresence mode="wait">
          {/* Step 1: Select Service */}
          {step === 'service' && (
            <motion.div
              key="service"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">Select Consultation Type</h2>
                <p className="text-slate-500 text-sm">
                  Choose how you'd like to consult with {doctor.name.split(' ')[0]}
                </p>
              </div>

              <div className="space-y-3">
                {doctor.consultationTypes.map(ct => {
                  const Icon = getTypeIcon(ct.type);
                  return (
                    <motion.button
                      key={ct.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => {
                        setBookingData(prev => ({ ...prev, consultationTypeId: ct.id }));
                        setStep('datetime');
                      }}
                      className="w-full p-5 bg-white rounded-2xl border-2 border-slate-200 text-left transition-all hover:shadow-xl hover:border-teal-300 hover:shadow-teal-100/50 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center group-hover:from-teal-500 group-hover:to-cyan-500 transition-all">
                          <Icon className="w-7 h-7 text-teal-600 group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800 mb-1">{ct.name}</h3>
                          <p className="text-sm text-slate-500">{getTypeLabel(ct.type)}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm font-bold text-teal-600 flex items-center gap-1">
                              <IndianRupee className="w-4 h-4" />
                              {ct.fee}
                            </span>
                            <span className="text-sm text-slate-400 flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {ct.duration} min
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-teal-500 transition-colors" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Doctor Info Card */}
              {(doctor.bio || doctor.qualifications || doctor.address) && (
                <div className="mt-8 p-5 bg-white rounded-2xl border border-slate-200">
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-teal-500" />
                    About {doctor.name}
                  </h3>
                  {doctor.bio && <p className="text-sm text-slate-600 mb-4 leading-relaxed">{doctor.bio}</p>}
                  <div className="flex flex-wrap gap-4">
                    {doctor.qualifications && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span>{doctor.qualifications}</span>
                      </div>
                    )}
                    {doctor.address && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 text-rose-500" />
                        <span>
                          {doctor.address}
                          {doctor.city && `, ${doctor.city}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2: Date & Time */}
          {step === 'datetime' && selectedConsultationType && (
            <motion.div
              key="datetime"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <button
                onClick={() => setStep('service')}
                className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to services
              </button>

              {/* Selected Service Summary */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center gap-4">
                {(() => {
                  const Icon = getTypeIcon(selectedConsultationType.type);
                  return (
                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-teal-600" />
                    </div>
                  );
                })()}
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">{selectedConsultationType.name}</h3>
                  <p className="text-sm text-slate-500">
                    ₹{selectedConsultationType.fee} • {selectedConsultationType.duration} minutes
                  </p>
                </div>
              </div>

              {/* Calendar */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-slate-800">Select Date</h3>
                  <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                    <button
                      onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}
                      className="p-2 hover:bg-white rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <span className="font-medium min-w-[130px] text-center text-slate-700">
                      {format(selectedMonth, 'MMMM yyyy')}
                    </span>
                    <button
                      onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}
                      className="p-2 hover:bg-white rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-slate-600" />
                    </button>
                  </div>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div
                      key={i}
                      className="text-center text-xs font-semibold text-slate-400 py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDates.map((date, index) => {
                    const isCurrentMonth = date.getMonth() === selectedMonth.getMonth();
                    const isAvailable = isDateAvailable(date);
                    const isSelected = bookingData.date && isSameDay(bookingData.date, date);
                    const isToday = isSameDay(date, new Date());

                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (isAvailable && isCurrentMonth) {
                            setBookingData(prev => ({ ...prev, date, time: '' }));
                            setGroupedSlots({ morning: [], afternoon: [], evening: [] });
                          }
                        }}
                        disabled={!isAvailable || !isCurrentMonth}
                        className={`aspect-square rounded-xl text-sm font-medium transition-all flex items-center justify-center ${
                          !isCurrentMonth
                            ? 'text-slate-200'
                            : isSelected
                            ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                            : isToday
                            ? 'bg-teal-100 text-teal-700 font-bold'
                            : isAvailable
                            ? 'hover:bg-slate-100 text-slate-700'
                            : 'text-slate-300 cursor-not-allowed'
                        }`}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-3 h-3 rounded bg-teal-500" />
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-3 h-3 rounded bg-teal-100" />
                    <span>Today</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-3 h-3 rounded bg-slate-200" />
                    <span>Unavailable</span>
                  </div>
                </div>
              </div>

              {/* Time Slots */}
              {bookingData.date && (
                <div className="bg-white rounded-2xl p-5 border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-800">
                      {format(bookingData.date, 'EEEE, MMM d')}
                    </h3>
                    {!loadingSlots && totalSlots > 0 && (
                      <span className="text-sm text-slate-500">
                        {totalSlots} slot{totalSlots !== 1 && 's'} available
                      </span>
                    )}
                  </div>

                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                    </div>
                  ) : totalSlots === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No slots available for this date</p>
                      <p className="text-sm text-slate-400 mt-1">Please select another date</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Morning Slots */}
                      {groupedSlots.morning.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Sun className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-medium text-slate-600">Morning</span>
                            <span className="text-xs text-slate-400">({groupedSlots.morning.length})</span>
                          </div>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {groupedSlots.morning.map(slot => (
                              <button
                                key={slot.time}
                                onClick={() => setBookingData(prev => ({ ...prev, time: slot.time }))}
                                className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                                  bookingData.time === slot.time
                                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                                    : 'bg-slate-100 text-slate-700 hover:bg-teal-100 hover:text-teal-700'
                                }`}
                              >
                                {slot.displayTime}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Afternoon Slots */}
                      {groupedSlots.afternoon.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Sunset className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-medium text-slate-600">Afternoon</span>
                            <span className="text-xs text-slate-400">({groupedSlots.afternoon.length})</span>
                          </div>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {groupedSlots.afternoon.map(slot => (
                              <button
                                key={slot.time}
                                onClick={() => setBookingData(prev => ({ ...prev, time: slot.time }))}
                                className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                                  bookingData.time === slot.time
                                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                                    : 'bg-slate-100 text-slate-700 hover:bg-teal-100 hover:text-teal-700'
                                }`}
                              >
                                {slot.displayTime}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Evening Slots */}
                      {groupedSlots.evening.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Moon className="w-4 h-4 text-indigo-500" />
                            <span className="text-sm font-medium text-slate-600">Evening</span>
                            <span className="text-xs text-slate-400">({groupedSlots.evening.length})</span>
                          </div>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {groupedSlots.evening.map(slot => (
                              <button
                                key={slot.time}
                                onClick={() => setBookingData(prev => ({ ...prev, time: slot.time }))}
                                className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                                  bookingData.time === slot.time
                                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                                    : 'bg-slate-100 text-slate-700 hover:bg-teal-100 hover:text-teal-700'
                                }`}
                              >
                                {slot.displayTime}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Continue Button */}
              <button
                onClick={() => setStep('details')}
                disabled={!bookingData.date || !bookingData.time}
                className="w-full py-4 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-teal-500/30 disabled:shadow-none"
              >
                Continue to Details
              </button>
            </motion.div>
          )}

          {/* Step 3: Patient Details */}
          {step === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <button
                onClick={() => setStep('datetime')}
                className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to schedule
              </button>

              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-1">Your Details</h2>
                <p className="text-slate-500 text-sm mb-6">
                  Enter your details to complete the booking
                </p>

                <div className="space-y-5">
                  {/* Patient Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={bookingData.patientName}
                        onChange={e => setBookingData(prev => ({ ...prev, patientName: e.target.value }))}
                        placeholder="Enter your full name"
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="tel"
                        value={bookingData.patientPhone}
                        onChange={e => setBookingData(prev => ({ ...prev, patientPhone: e.target.value }))}
                        placeholder="+91 90322 92171"
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address <span className="text-slate-400">(optional)</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        value={bookingData.patientEmail}
                        onChange={e => setBookingData(prev => ({ ...prev, patientEmail: e.target.value }))}
                        placeholder="your@email.com"
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Reason for Visit <span className="text-slate-400">(optional)</span>
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                      <textarea
                        value={bookingData.reasonForVisit}
                        onChange={e => setBookingData(prev => ({ ...prev, reasonForVisit: e.target.value }))}
                        placeholder="Briefly describe your symptoms or reason"
                        rows={3}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <button
                onClick={() => setStep('confirm')}
                disabled={!bookingData.patientName || !bookingData.patientPhone}
                className="w-full py-4 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-teal-500/30 disabled:shadow-none"
              >
                Review Booking
              </button>
            </motion.div>
          )}

          {/* Step 4: Confirm */}
          {step === 'confirm' && selectedConsultationType && bookingData.date && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <button
                onClick={() => setStep('details')}
                className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to details
              </button>

              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-6">Confirm Your Booking</h2>

                {/* Booking Summary */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <span className="text-slate-500">Doctor</span>
                    <span className="font-medium text-slate-800">{doctor.name}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <span className="text-slate-500">Service</span>
                    <span className="font-medium text-slate-800">{selectedConsultationType.name}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <span className="text-slate-500">Date</span>
                    <span className="font-medium text-slate-800">
                      {format(bookingData.date, 'EEEE, MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <span className="text-slate-500">Time</span>
                    <span className="font-medium text-slate-800">
                      {format(parse(bookingData.time, 'HH:mm', new Date()), 'h:mm a')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <span className="text-slate-500">Duration</span>
                    <span className="font-medium text-slate-800">
                      {selectedConsultationType.duration} minutes
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <span className="text-slate-500">Patient</span>
                    <span className="font-medium text-slate-800">{bookingData.patientName}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <span className="text-slate-500">Phone</span>
                    <span className="font-medium text-slate-800">{bookingData.patientPhone}</span>
                  </div>
                  <div className="flex items-center justify-between py-4 bg-teal-50 rounded-xl px-4 -mx-4">
                    <span className="text-teal-700 font-medium">Consultation Fee</span>
                    <span className="text-2xl font-bold text-teal-600">
                      ₹{selectedConsultationType.fee}
                    </span>
                  </div>
                </div>
              </div>

              {/* Location Info for In-Person */}
              {selectedConsultationType.type === 'IN_PERSON' && doctor.address && (
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800">Clinic Address</p>
                      <p className="text-sm text-amber-700">
                        {doctor.clinicName && `${doctor.clinicName}, `}
                        {doctor.address}
                        {doctor.city && `, ${doctor.city}`}
                        {doctor.pincode && ` - ${doctor.pincode}`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Confirm Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-4 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/30 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    <CalendarCheck className="w-5 h-5" />
                    Confirm Booking
                  </>
                )}
              </button>

              <p className="text-center text-sm text-slate-500">
                {doctor.appointmentRules?.allowCancellation
                  ? '✓ Free cancellation available'
                  : 'Note: This appointment cannot be cancelled after confirmation'}
              </p>
            </motion.div>
          )}

          {/* Success */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl shadow-emerald-500/30"
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>

              <h2 className="text-2xl font-bold text-slate-800 mb-2">Booking Confirmed! 🎉</h2>
              <p className="text-slate-500 mb-8">Your appointment has been successfully booked</p>

              {/* Booking Reference Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 max-w-sm mx-auto mb-6">
                <p className="text-sm text-slate-500 mb-2">Your Booking Reference</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl font-bold text-teal-600 font-mono tracking-wider">
                    {bookingRef}
                  </span>
                  <button
                    onClick={copyBookingRef}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Copy"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Copy className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Important Note */}
              <div className="bg-teal-50 rounded-2xl p-4 border border-teal-200 max-w-sm mx-auto mb-8">
                <p className="text-sm text-teal-700">
                  📱 Save your booking reference <strong>{bookingRef}</strong> to manage or
                  reschedule your appointment
                </p>
              </div>

              {/* Appointment Summary */}
              {selectedConsultationType && bookingData.date && (
                <div className="bg-slate-50 rounded-2xl p-4 max-w-sm mx-auto mb-8 text-left">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Doctor</span>
                      <span className="font-medium text-slate-700">{doctor.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date</span>
                      <span className="font-medium text-slate-700">
                        {format(bookingData.date, 'MMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Time</span>
                      <span className="font-medium text-slate-700">
                        {format(parse(bookingData.time, 'HH:mm', new Date()), 'h:mm a')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    setStep('service');
                    setBookingData({
                      consultationTypeId: '',
                      date: null,
                      time: '',
                      patientName: '',
                      patientPhone: '',
                      patientEmail: '',
                      reasonForVisit: '',
                    });
                    setBookingRef('');
                    setError(null);
                  }}
                  className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-all shadow-lg shadow-teal-500/30"
                >
                  Book Another Appointment
                </button>
                <a
                  href="/"
                  className="px-6 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
                >
                  Go to Homepage
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white/50 border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-500">
            Powered by{' '}
            <a href="/" className="font-semibold text-teal-600 hover:text-teal-700">
              TDAppointments
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
