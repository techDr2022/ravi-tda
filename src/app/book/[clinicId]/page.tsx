'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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
  Star,
  MessageCircle,
  AlertCircle,
} from 'lucide-react';
import { getClinicById, ClinicData } from '@/lib/clinic-store';

// Default clinic data for demo
const DEFAULT_CLINIC = {
  name: 'City Care Clinic',
  address: '123 Healthcare Street, Hyderabad, Telangana 500001',
  phone: '+91 90322 92171',
  rating: 4.9,
  reviewCount: 245,
  doctors: [
    {
      id: 'dr-1',
      name: 'Dr. Priya Sharma',
      specialty: 'General Physician',
      consultationFee: 500,
      availableSlots: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '02:00 PM', '02:30 PM', '03:00 PM', '04:00 PM'],
    },
    {
      id: 'dr-2',
      name: 'Dr. Rajesh Kumar',
      specialty: 'Cardiologist',
      consultationFee: 800,
      availableSlots: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '03:00 PM', '03:30 PM', '04:00 PM'],
    },
  ],
};

type BookingStep = 'doctor' | 'datetime' | 'details' | 'confirm' | 'success';

interface BookingData {
  doctorId: string;
  date: Date | null;
  time: string;
  consultationType: 'in-person' | 'video';
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  reason: string;
}

/**
 * Public Appointment Booking Page
 * Unique URL for each clinic - can be added to Google My Business
 */
export default function BookingPage() {
  const params = useParams();
  const clinicId = params.clinicId as string;
  
  const [step, setStep] = useState<BookingStep>('doctor');
  const [clinic, setClinic] = useState<typeof DEFAULT_CLINIC | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData>({
    doctorId: '',
    date: null,
    time: '',
    consultationType: 'in-person',
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    reason: '',
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState('');

  // Load clinic data
  useEffect(() => {
    const loadClinic = () => {
      // Try to get clinic from store
      const storedClinic = getClinicById(clinicId);
      
      if (storedClinic) {
        setClinic({
          name: storedClinic.name,
          address: storedClinic.address,
          phone: storedClinic.phone,
          rating: storedClinic.rating,
          reviewCount: storedClinic.reviewCount,
          doctors: storedClinic.doctors,
        });
      } else if (clinicId === 'demo-clinic') {
        // Use default demo clinic
        setClinic(DEFAULT_CLINIC);
      } else {
        // Try localStorage directly (for same-browser access)
        const data = localStorage.getItem('tdappointments_clinic');
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed.id === clinicId) {
            setClinic({
              name: parsed.name,
              address: parsed.address,
              phone: parsed.phone,
              rating: parsed.rating || 5.0,
              reviewCount: parsed.reviewCount || 0,
              doctors: parsed.doctors,
            });
          } else {
            // Show demo clinic for unknown IDs
            setClinic(DEFAULT_CLINIC);
          }
        } else {
          // No clinic found, show demo
          setClinic(DEFAULT_CLINIC);
        }
      }
      setLoading(false);
    };

    loadClinic();
  }, [clinicId]);

  // Get selected doctor details
  const selectedDoctor = clinic?.doctors?.find(d => d.id === bookingData.doctorId);

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
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if date is selectable (not in past, not Sunday)
  const isDateSelectable = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d >= today && d.getDay() !== 0; // Not Sunday
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate booking ID
    const id = `BK${Date.now().toString(36).toUpperCase()}`;
    setBookingId(id);
    setStep('success');
    setIsSubmitting(false);
  };

  // Step progress
  const steps = ['doctor', 'datetime', 'details', 'confirm'];
  const currentStepIndex = steps.indexOf(step);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-healthcare-muted">Loading clinic...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!clinic || notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-healthcare-text mb-2">Clinic Not Found</h1>
          <p className="text-healthcare-muted mb-6">This booking page doesn't exist or has been removed.</p>
          <a href="/" className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-all">
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Header */}
      <header className="bg-white border-b border-healthcare-border shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-healthcare-text">{clinic.name}</h1>
                <div className="flex items-center gap-2 text-sm text-healthcare-muted">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span>{clinic.rating} ({clinic.reviewCount} reviews)</span>
                </div>
              </div>
            </div>
            <a
              href={`tel:${clinic.phone}`}
              className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">Call</span>
            </a>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      {step !== 'success' && (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-2">
            {['Select Doctor', 'Date & Time', 'Your Details', 'Confirm'].map((label, index) => (
              <div key={label} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    index < currentStepIndex
                      ? 'bg-green-500 text-white'
                      : index === currentStepIndex
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {index < currentStepIndex ? <CheckCircle className="w-5 h-5" /> : index + 1}
                </div>
                {index < 3 && (
                  <div
                    className={`w-16 sm:w-24 h-1 mx-2 rounded ${
                      index < currentStepIndex ? 'bg-green-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs sm:text-sm text-healthcare-muted">
            <span>Doctor</span>
            <span>Schedule</span>
            <span>Details</span>
            <span>Confirm</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pb-12">
        <AnimatePresence mode="wait">
          {/* Step 1: Select Doctor */}
          {step === 'doctor' && (
            <motion.div
              key="doctor"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-bold text-healthcare-text mb-6">Select a Doctor</h2>
              
              <div className="grid gap-4">
                {clinic.doctors.map((doctor) => (
                  <button
                    key={doctor.id}
                    onClick={() => {
                      setBookingData({ ...bookingData, doctorId: doctor.id });
                      setStep('datetime');
                    }}
                    className={`w-full p-4 bg-white rounded-xl border-2 text-left transition-all hover:shadow-lg ${
                      bookingData.doctorId === doctor.id
                        ? 'border-primary-500 shadow-lg'
                        : 'border-healthcare-border hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {doctor.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-healthcare-text">{doctor.name}</h3>
                        <p className="text-sm text-healthcare-muted">{doctor.specialty}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm font-medium text-primary-600">
                            ₹{doctor.consultationFee} consultation
                          </span>
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            {doctor.availableSlots.length} slots available
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-healthcare-muted" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Date & Time */}
          {step === 'datetime' && (
            <motion.div
              key="datetime"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <button
                onClick={() => setStep('doctor')}
                className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to doctors
              </button>

              {selectedDoctor && (
                <div className="bg-white rounded-xl p-4 border border-healthcare-border flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedDoctor.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-healthcare-text">{selectedDoctor.name}</h3>
                    <p className="text-sm text-healthcare-muted">{selectedDoctor.specialty}</p>
                  </div>
                </div>
              )}

              {/* Consultation Type */}
              <div>
                <h3 className="font-medium text-healthcare-text mb-3">Consultation Type</h3>
                <div className="flex gap-4">
                  {[
                    { type: 'in-person', label: 'In-Person', icon: Building2 },
                    { type: 'video', label: 'Video Call', icon: Video },
                  ].map(({ type, label, icon: Icon }) => (
                    <button
                      key={type}
                      onClick={() => setBookingData({ ...bookingData, consultationType: type as 'in-person' | 'video' })}
                      className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        bookingData.consultationType === type
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-healthcare-border hover:border-primary-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Calendar */}
              <div className="bg-white rounded-xl p-4 border border-healthcare-border max-w-sm mx-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-healthcare-text text-sm">Select Date</h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
                      className="p-1.5 hover:bg-slate-100 rounded-lg"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-medium text-sm min-w-[110px] text-center">
                      {selectedMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                    <button
                      onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
                      className="p-1.5 hover:bg-slate-100 rounded-lg"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-0.5 mb-1">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="text-center text-[10px] font-medium text-healthcare-muted py-1">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-0.5">
                  {calendarDates.map((date, index) => {
                    const isCurrentMonth = date.getMonth() === selectedMonth.getMonth();
                    const isSelectable = isDateSelectable(date);
                    const isSelected = bookingData.date?.toDateString() === date.toDateString();
                    const isToday = date.toDateString() === new Date().toDateString();

                    return (
                      <button
                        key={index}
                        onClick={() => isSelectable && setBookingData({ ...bookingData, date, time: '' })}
                        disabled={!isSelectable || !isCurrentMonth}
                        className={`w-8 h-8 rounded-md text-xs font-medium transition-all mx-auto ${
                          !isCurrentMonth
                            ? 'text-slate-300'
                            : isSelected
                            ? 'bg-primary-500 text-white'
                            : isToday
                            ? 'bg-primary-100 text-primary-700'
                            : isSelectable
                            ? 'hover:bg-slate-100 text-healthcare-text'
                            : 'text-slate-300 cursor-not-allowed'
                        }`}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots */}
              {bookingData.date && selectedDoctor && (
                <div className="bg-white rounded-xl p-4 border border-healthcare-border">
                  <h3 className="font-medium text-healthcare-text mb-4">
                    Available Slots for {bookingData.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {selectedDoctor.availableSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setBookingData({ ...bookingData, time: slot })}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          bookingData.time === slot
                            ? 'bg-primary-500 text-white'
                            : 'bg-slate-100 text-healthcare-text hover:bg-primary-100'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Continue Button */}
              <button
                onClick={() => setStep('details')}
                disabled={!bookingData.date || !bookingData.time}
                className="w-full py-4 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
              >
                Continue
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
                className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to schedule
              </button>

              <div className="bg-white rounded-xl p-6 border border-healthcare-border">
                <h2 className="text-xl font-bold text-healthcare-text mb-6">Your Details</h2>
                
                <div className="space-y-4">
                  {/* Patient Name */}
                  <div>
                    <label className="block text-sm font-medium text-healthcare-text mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-healthcare-muted" />
                      <input
                        type="text"
                        value={bookingData.patientName}
                        onChange={(e) => setBookingData({ ...bookingData, patientName: e.target.value })}
                        placeholder="Enter your full name"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-healthcare-border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-healthcare-text mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-healthcare-muted" />
                      <input
                        type="tel"
                        value={bookingData.patientPhone}
                        onChange={(e) => setBookingData({ ...bookingData, patientPhone: e.target.value })}
                        placeholder="+91 90322 92171"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-healthcare-border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-healthcare-text mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-healthcare-muted" />
                      <input
                        type="email"
                        value={bookingData.patientEmail}
                        onChange={(e) => setBookingData({ ...bookingData, patientEmail: e.target.value })}
                        placeholder="your@email.com (optional)"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-healthcare-border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="block text-sm font-medium text-healthcare-text mb-2">
                      Reason for Visit
                    </label>
                    <div className="relative">
                      <MessageCircle className="absolute left-4 top-4 w-5 h-5 text-healthcare-muted" />
                      <textarea
                        value={bookingData.reason}
                        onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
                        placeholder="Briefly describe your symptoms or reason for appointment"
                        rows={3}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-healthcare-border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <button
                onClick={() => setStep('confirm')}
                disabled={!bookingData.patientName || !bookingData.patientPhone}
                className="w-full py-4 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
              >
                Review Booking
              </button>
            </motion.div>
          )}

          {/* Step 4: Confirm */}
          {step === 'confirm' && selectedDoctor && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <button
                onClick={() => setStep('details')}
                className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to details
              </button>

              <div className="bg-white rounded-xl p-6 border border-healthcare-border">
                <h2 className="text-xl font-bold text-healthcare-text mb-6">Confirm Your Booking</h2>
                
                {/* Booking Summary */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-healthcare-border">
                    <span className="text-healthcare-muted">Clinic</span>
                    <span className="font-medium text-healthcare-text">{clinic.name}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-healthcare-border">
                    <span className="text-healthcare-muted">Doctor</span>
                    <span className="font-medium text-healthcare-text">{selectedDoctor.name}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-healthcare-border">
                    <span className="text-healthcare-muted">Specialty</span>
                    <span className="font-medium text-healthcare-text">{selectedDoctor.specialty}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-healthcare-border">
                    <span className="text-healthcare-muted">Date</span>
                    <span className="font-medium text-healthcare-text">
                      {bookingData.date?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-healthcare-border">
                    <span className="text-healthcare-muted">Time</span>
                    <span className="font-medium text-healthcare-text">{bookingData.time}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-healthcare-border">
                    <span className="text-healthcare-muted">Type</span>
                    <span className="font-medium text-healthcare-text flex items-center gap-2">
                      {bookingData.consultationType === 'video' ? (
                        <><Video className="w-4 h-4" /> Video Call</>
                      ) : (
                        <><Building2 className="w-4 h-4" /> In-Person</>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-healthcare-border">
                    <span className="text-healthcare-muted">Patient Name</span>
                    <span className="font-medium text-healthcare-text">{bookingData.patientName}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-healthcare-border">
                    <span className="text-healthcare-muted">Phone</span>
                    <span className="font-medium text-healthcare-text">{bookingData.patientPhone}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-healthcare-muted">Consultation Fee</span>
                    <span className="text-xl font-bold text-primary-600">₹{selectedDoctor.consultationFee}</span>
                  </div>
                </div>
              </div>

              {/* Clinic Address */}
              {bookingData.consultationType === 'in-person' && (
                <div className="bg-primary-50 rounded-xl p-4 border border-primary-200">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-primary-700">Clinic Address</p>
                      <p className="text-sm text-primary-600">{clinic.address}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Confirm Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-4 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Confirm Booking
                  </>
                )}
              </button>

              <p className="text-center text-sm text-healthcare-muted">
                By confirming, you agree to our cancellation policy. You'll receive a confirmation via WhatsApp.
              </p>
            </motion.div>
          )}

          {/* Success */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                className="w-24 h-24 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center"
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>

              <h2 className="text-2xl font-bold text-healthcare-text mb-2">Booking Confirmed!</h2>
              <p className="text-healthcare-muted mb-6">
                Your appointment has been successfully booked.
              </p>

              <div className="bg-white rounded-xl p-6 border border-healthcare-border max-w-md mx-auto mb-6">
                <div className="text-sm text-healthcare-muted mb-2">Booking Reference</div>
                <div className="text-2xl font-bold text-primary-600 font-mono">{bookingId}</div>
              </div>

              <div className="bg-green-50 rounded-xl p-4 border border-green-200 max-w-md mx-auto mb-8">
                <p className="text-sm text-green-700">
                  📱 A confirmation message has been sent to <strong>{bookingData.patientPhone}</strong> via WhatsApp with all the appointment details.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    setStep('doctor');
                    setBookingData({
                      doctorId: '',
                      date: null,
                      time: '',
                      consultationType: 'in-person',
                      patientName: '',
                      patientPhone: '',
                      patientEmail: '',
                      reason: '',
                    });
                  }}
                  className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-all"
                >
                  Book Another Appointment
                </button>
                <a
                  href="/"
                  className="px-6 py-3 border-2 border-healthcare-border text-healthcare-text font-semibold rounded-xl hover:bg-slate-50 transition-all"
                >
                  Go to Homepage
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-healthcare-border py-6 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-healthcare-muted">
            Powered by <span className="font-semibold text-primary-600">TDAppointments</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
