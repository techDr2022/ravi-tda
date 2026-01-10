'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  MapPin,
  Phone,
  Clock,
  User,
  Stethoscope,
  IndianRupee,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Calendar,
  Link2,
  Copy,
  ExternalLink,
} from 'lucide-react';
import {
  createClinicFromSubscription,
  updateClinic,
  addDoctor,
  completeOnboarding,
  getClinic,
  generateDefaultSlots,
} from '@/lib/clinic-store';

type OnboardingStep = 'clinic' | 'doctor' | 'slots' | 'complete';

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  
  const plan = searchParams.get('plan') || 'starter';
  
  const [step, setStep] = useState<OnboardingStep>('clinic');
  const [isInitialized, setIsInitialized] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Form data
  const [clinicData, setClinicData] = useState({
    name: '',
    address: '',
    phone: '',
    workingHours: '9:00 AM - 6:00 PM',
  });
  
  const [doctorData, setDoctorData] = useState({
    name: '',
    specialty: 'General Physician',
    consultationFee: 500,
  });
  
  const [selectedSlots, setSelectedSlots] = useState<string[]>(generateDefaultSlots());
  
  const [bookingUrl, setBookingUrl] = useState('');

  // Initialize clinic on first load
  useEffect(() => {
    if (status === 'authenticated' && session?.user && !isInitialized) {
      const existingClinic = getClinic();
      
      if (!existingClinic) {
        // Create new clinic
        const clinic = createClinicFromSubscription(
          session.user.email || '',
          session.user.name || '',
          plan
        );
        setClinicData({
          name: clinic.name,
          address: clinic.address,
          phone: clinic.phone,
          workingHours: clinic.workingHours,
        });
        setDoctorData({
          name: session.user.name || '',
          specialty: 'General Physician',
          consultationFee: 500,
        });
        setBookingUrl(`${window.location.origin}/book/${clinic.id}`);
      } else if (!existingClinic.onboardingComplete) {
        // Continue existing onboarding
        setClinicData({
          name: existingClinic.name,
          address: existingClinic.address,
          phone: existingClinic.phone,
          workingHours: existingClinic.workingHours,
        });
        if (existingClinic.doctors[0]) {
          setDoctorData({
            name: existingClinic.doctors[0].name,
            specialty: existingClinic.doctors[0].specialty,
            consultationFee: existingClinic.doctors[0].consultationFee,
          });
          setSelectedSlots(existingClinic.doctors[0].availableSlots);
        }
        setBookingUrl(`${window.location.origin}/book/${existingClinic.id}`);
      } else {
        // Onboarding complete, redirect to dashboard
        router.push('/dashboard');
        return;
      }
      
      setIsInitialized(true);
    }
  }, [status, session, plan, isInitialized, router]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Save clinic data
  const saveClinicStep = () => {
    updateClinic({
      name: clinicData.name,
      address: clinicData.address,
      phone: clinicData.phone,
      workingHours: clinicData.workingHours,
    });
    setStep('doctor');
  };

  // Save doctor data
  const saveDoctorStep = () => {
    const clinic = getClinic();
    if (clinic && clinic.doctors[0]) {
      // Update existing doctor
      clinic.doctors[0] = {
        ...clinic.doctors[0],
        name: doctorData.name,
        specialty: doctorData.specialty,
        consultationFee: doctorData.consultationFee,
      };
      updateClinic({ doctors: clinic.doctors });
    }
    setStep('slots');
  };

  // Save slots and complete
  const saveSlotsStep = () => {
    const clinic = getClinic();
    if (clinic && clinic.doctors[0]) {
      clinic.doctors[0].availableSlots = selectedSlots;
      updateClinic({ doctors: clinic.doctors });
    }
    completeOnboarding();
    setStep('complete');
  };

  // Toggle slot selection
  const toggleSlot = (slot: string) => {
    setSelectedSlots(prev =>
      prev.includes(slot)
        ? prev.filter(s => s !== slot)
        : [...prev, slot]
    );
  };

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

  // All available time slots
  const allSlots = [
    '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM',
    '08:00 PM'
  ];

  // Specialties list
  const specialties = [
    'General Physician', 'Cardiologist', 'Dermatologist', 'Gynecologist',
    'Pediatrician', 'Orthopedic', 'ENT Specialist', 'Ophthalmologist',
    'Neurologist', 'Psychiatrist', 'Dentist', 'Physiotherapist',
    'Urologist', 'Gastroenterologist', 'Pulmonologist', 'Other'
  ];

  if (status === 'loading' || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const steps = ['clinic', 'doctor', 'slots', 'complete'];
  const currentStepIndex = steps.indexOf(step);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-healthcare-text">
            {step === 'complete' ? '🎉 You\'re All Set!' : 'Set Up Your Clinic'}
          </h1>
          <p className="text-healthcare-muted mt-2">
            {step === 'complete' 
              ? 'Your booking page is ready to accept appointments'
              : 'Complete these quick steps to start accepting appointments'}
          </p>
        </div>

        {/* Progress */}
        {step !== 'complete' && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {['Clinic Info', 'Doctor', 'Time Slots'].map((label, index) => (
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
                {index < 2 && (
                  <div className={`w-12 h-1 mx-1 rounded ${
                    index < currentStepIndex ? 'bg-green-500' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Steps */}
        <AnimatePresence mode="wait">
          {/* Step 1: Clinic Info */}
          {step === 'clinic' && (
            <motion.div
              key="clinic"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-xl p-8 border border-healthcare-border"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-bold text-healthcare-text">Clinic Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-healthcare-text mb-2">
                    Clinic Name *
                  </label>
                  <input
                    type="text"
                    value={clinicData.name}
                    onChange={(e) => setClinicData({ ...clinicData, name: e.target.value })}
                    placeholder="e.g., City Care Clinic"
                    className="w-full px-4 py-3 rounded-xl border border-healthcare-border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-healthcare-text mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Address
                  </label>
                  <textarea
                    value={clinicData.address}
                    onChange={(e) => setClinicData({ ...clinicData, address: e.target.value })}
                    placeholder="Full clinic address"
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-healthcare-border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-healthcare-text mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={clinicData.phone}
                      onChange={(e) => setClinicData({ ...clinicData, phone: e.target.value })}
                      placeholder="+91 90322 92171"
                      className="w-full px-4 py-3 rounded-xl border border-healthcare-border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-healthcare-text mb-2">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Working Hours
                    </label>
                    <input
                      type="text"
                      value={clinicData.workingHours}
                      onChange={(e) => setClinicData({ ...clinicData, workingHours: e.target.value })}
                      placeholder="9:00 AM - 6:00 PM"
                      className="w-full px-4 py-3 rounded-xl border border-healthcare-border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={saveClinicStep}
                  disabled={!clinicData.name}
                  className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Doctor Info */}
          {step === 'doctor' && (
            <motion.div
              key="doctor"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-xl p-8 border border-healthcare-border"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-accent-600" />
                </div>
                <h2 className="text-xl font-bold text-healthcare-text">Doctor Details</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-healthcare-text mb-2">
                    Doctor Name *
                  </label>
                  <input
                    type="text"
                    value={doctorData.name}
                    onChange={(e) => setDoctorData({ ...doctorData, name: e.target.value })}
                    placeholder="Dr. John Doe"
                    className="w-full px-4 py-3 rounded-xl border border-healthcare-border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-healthcare-text mb-2">
                    <Stethoscope className="w-4 h-4 inline mr-1" />
                    Specialty *
                  </label>
                  <select
                    value={doctorData.specialty}
                    onChange={(e) => setDoctorData({ ...doctorData, specialty: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-healthcare-border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {specialties.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-healthcare-text mb-2">
                    <IndianRupee className="w-4 h-4 inline mr-1" />
                    Consultation Fee (₹) *
                  </label>
                  <input
                    type="number"
                    value={doctorData.consultationFee}
                    onChange={(e) => setDoctorData({ ...doctorData, consultationFee: parseInt(e.target.value) || 0 })}
                    placeholder="500"
                    className="w-full px-4 py-3 rounded-xl border border-healthcare-border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep('clinic')}
                  className="flex items-center gap-2 px-6 py-3 text-healthcare-muted hover:text-healthcare-text transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={saveDoctorStep}
                  disabled={!doctorData.name || !doctorData.consultationFee}
                  className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Time Slots */}
          {step === 'slots' && (
            <motion.div
              key="slots"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-xl p-8 border border-healthcare-border"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-healthcare-text">Available Time Slots</h2>
                  <p className="text-sm text-healthcare-muted">Select when patients can book appointments</p>
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {allSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => toggleSlot(slot)}
                    className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                      selectedSlots.includes(slot)
                        ? 'bg-primary-500 text-white'
                        : 'bg-slate-100 text-healthcare-text hover:bg-primary-100'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>

              <p className="text-sm text-healthcare-muted mt-4">
                {selectedSlots.length} slots selected
              </p>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep('doctor')}
                  className="flex items-center gap-2 px-6 py-3 text-healthcare-muted hover:text-healthcare-text transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={saveSlotsStep}
                  disabled={selectedSlots.length === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
                >
                  Complete Setup
                  <CheckCircle className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Complete */}
          {step === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-xl p-8 border border-healthcare-border text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center"
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>

              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <span className="text-2xl">🎉</span>
                <Sparkles className="w-5 h-5 text-yellow-500" />
              </div>

              <h2 className="text-2xl font-bold text-healthcare-text mb-2">
                Your Clinic is Ready!
              </h2>
              <p className="text-healthcare-muted mb-6">
                Patients can now book appointments using your unique booking link
              </p>

              {/* Booking URL */}
              <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Link2 className="w-5 h-5 text-primary-600" />
                  <span className="font-medium text-healthcare-text">Your Booking URL</span>
                </div>
                <div className="bg-white rounded-lg px-4 py-3 border border-healthcare-border mb-4">
                  <code className="text-sm text-primary-600 break-all">{bookingUrl}</code>
                </div>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={copyBookingUrl}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      copied
                        ? 'bg-green-500 text-white'
                        : 'bg-primary-500 text-white hover:bg-primary-600'
                    }`}
                  >
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                  <a
                    href={bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 border-2 border-primary-500 text-primary-600 rounded-lg font-medium hover:bg-primary-50 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Preview
                  </a>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm text-amber-800">
                  <strong>💡 Pro Tip:</strong> Add this URL to your Google Business Profile's "Book" button to let patients book directly from Google Search & Maps.
                </p>
              </div>

              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-4 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-all"
              >
                Go to Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}
