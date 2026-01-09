'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Stethoscope,
  MapPin,
  Phone,
  Clock,
  IndianRupee,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Calendar,
  Link2,
  Copy,
  ExternalLink,
  Video,
  Building2,
  PhoneCall,
  Plus,
  Trash2,
  Check,
  X,
  AlertCircle,
  Loader2,
} from 'lucide-react';

type SetupStep = 'profile' | 'consultation' | 'availability' | 'rules' | 'complete';

interface ConsultationType {
  id?: string;
  name: string;
  type: 'IN_PERSON' | 'VIDEO_CALL' | 'PHONE_CALL';
  fee: number;
  duration: number;
  description?: string;
  isActive: boolean;
}

interface AvailabilitySlot {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const DAYS_OF_WEEK = [
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'
];

const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
};

const SPECIALIZATIONS = [
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'Gynecologist',
  'Pediatrician',
  'Orthopedic',
  'ENT Specialist',
  'Ophthalmologist',
  'Neurologist',
  'Psychiatrist',
  'Dentist',
  'Physiotherapist',
  'Urologist',
  'Gastroenterologist',
  'Pulmonologist',
  'Hematologist',
  'Nephrologist',
  'Endocrinologist',
  'Oncologist',
  'Other',
];

function SetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  
  const [step, setStep] = useState<SetupStep>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    name: '',
    slug: '',
    specialization: 'General Physician',
    qualifications: '',
    bio: '',
    experience: 0,
    phone: '',
    clinicName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    defaultDuration: 15,
    bufferTime: 5,
  });
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  // Consultation types state
  const [consultationTypes, setConsultationTypes] = useState<ConsultationType[]>([
    { name: 'In-Person Consultation', type: 'IN_PERSON', fee: 500, duration: 15, isActive: true },
  ]);

  // Availability state
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([
    { dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '17:00', isActive: true },
    { dayOfWeek: 'TUESDAY', startTime: '09:00', endTime: '17:00', isActive: true },
    { dayOfWeek: 'WEDNESDAY', startTime: '09:00', endTime: '17:00', isActive: true },
    { dayOfWeek: 'THURSDAY', startTime: '09:00', endTime: '17:00', isActive: true },
    { dayOfWeek: 'FRIDAY', startTime: '09:00', endTime: '17:00', isActive: true },
    { dayOfWeek: 'SATURDAY', startTime: '09:00', endTime: '13:00', isActive: true },
  ]);

  // Rules state
  const [rules, setRules] = useState({
    minAdvanceBooking: 60,
    maxAdvanceBooking: 43200,
    allowCancellation: true,
    cancellationWindow: 240,
    allowRescheduling: true,
    reschedulingWindow: 240,
    maxReschedules: 2,
    requirePayment: false,
    paymentMode: 'PAY_AT_CLINIC' as const,
    sendConfirmation: true,
    sendReminder: true,
    reminderHours: 24,
  });

  const [bookingUrl, setBookingUrl] = useState('');
  const [profileExists, setProfileExists] = useState(false);

  // Check if user has existing profile
  useEffect(() => {
    async function checkProfile() {
      if (status === 'authenticated') {
        try {
          const res = await fetch('/api/doctor/profile');
          const data = await res.json();
          
          if (data.profile) {
            setProfileExists(true);
            if (data.profile.onboardingComplete) {
              router.push('/dashboard');
              return;
            }
            // Pre-fill with existing data
            setProfile(prev => ({
              ...prev,
              ...data.profile,
            }));
            setBookingUrl(`${window.location.origin}/${data.profile.slug}`);
          } else {
            setProfileExists(false);
            // Pre-fill name from session
            setProfile(prev => ({
              ...prev,
              name: session?.user?.name || '',
              slug: generateSlug(session?.user?.name || ''),
            }));
          }
        } catch (err) {
          console.error('Error checking profile:', err);
        }
        setLoading(false);
      }
    }

    if (status === 'authenticated') {
      checkProfile();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session, router]);

  // Generate slug from name
  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // Check slug availability
  const checkSlugAvailability = useCallback(async (slug: string) => {
    if (slug.length < 3) {
      setSlugAvailable(null);
      return;
    }

    setCheckingSlug(true);
    try {
      const res = await fetch(`/api/doctor/check-slug?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      setSlugAvailable(data.available);
    } catch (err) {
      console.error('Error checking slug:', err);
    }
    setCheckingSlug(false);
  }, []);

  // Debounced slug check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (profile.slug) {
        checkSlugAvailability(profile.slug);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [profile.slug, checkSlugAvailability]);

  // Save profile
  const saveProfile = async () => {
    setSaving(true);
    setError(null);

    try {
      // Use PATCH if profile exists, POST if it doesn't
      const res = await fetch('/api/doctor/profile', {
        method: profileExists ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save profile');
      }

      // Mark profile as existing after successful creation
      if (!profileExists) {
        setProfileExists(true);
      }

      setBookingUrl(`${window.location.origin}/${data.profile.slug}`);
      setStep('consultation');
    } catch (err: any) {
      setError(err.message);
    }

    setSaving(false);
  };

  // Save consultation types
  const saveConsultationTypes = async () => {
    setSaving(true);
    setError(null);

    try {
      // Save each consultation type
      for (const ct of consultationTypes) {
        if (!ct.id) {
          const res = await fetch('/api/doctor/consultation-types', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ct),
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to save consultation type');
          }
        }
      }

      setStep('availability');
    } catch (err: any) {
      setError(err.message);
    }

    setSaving(false);
  };

  // Save availability
  const saveAvailability = async () => {
    setSaving(true);
    setError(null);

    try {
      const activeSlots = availability.filter(a => a.isActive);
      
      const res = await fetch('/api/doctor/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activeSlots),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save availability');
      }

      setStep('rules');
    } catch (err: any) {
      setError(err.message);
    }

    setSaving(false);
  };

  // Save rules and complete
  const saveRulesAndComplete = async () => {
    setSaving(true);
    setError(null);

    try {
      // Save rules
      let res = await fetch('/api/doctor/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rules),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save rules');
      }

      // Complete onboarding
      res = await fetch('/api/doctor/complete-onboarding', {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to complete setup');
      }

      setStep('complete');
    } catch (err: any) {
      setError(err.message);
    }

    setSaving(false);
  };

  // Add consultation type
  const addConsultationType = () => {
    setConsultationTypes(prev => [
      ...prev,
      { name: '', type: 'IN_PERSON', fee: 500, duration: 15, isActive: true },
    ]);
  };

  // Remove consultation type
  const removeConsultationType = (index: number) => {
    setConsultationTypes(prev => prev.filter((_, i) => i !== index));
  };

  // Update consultation type
  const updateConsultationType = (index: number, updates: Partial<ConsultationType>) => {
    setConsultationTypes(prev =>
      prev.map((ct, i) => (i === index ? { ...ct, ...updates } : ct))
    );
  };

  // Toggle availability day
  const toggleAvailabilityDay = (dayOfWeek: string) => {
    setAvailability(prev => {
      const existing = prev.find(a => a.dayOfWeek === dayOfWeek);
      if (existing) {
        return prev.map(a =>
          a.dayOfWeek === dayOfWeek ? { ...a, isActive: !a.isActive } : a
        );
      } else {
        return [...prev, { dayOfWeek, startTime: '09:00', endTime: '17:00', isActive: true }];
      }
    });
  };

  // Update availability time
  const updateAvailabilityTime = (
    dayOfWeek: string,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    setAvailability(prev =>
      prev.map(a => (a.dayOfWeek === dayOfWeek ? { ...a, [field]: value } : a))
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

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const steps = ['profile', 'consultation', 'availability', 'rules', 'complete'];
  const currentStepIndex = steps.indexOf(step);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-healthcare-text">
            {step === 'complete' ? '🎉 Setup Complete!' : 'Set Up Your Practice'}
          </h1>
          <p className="text-healthcare-muted mt-2">
            {step === 'complete'
              ? 'Your booking page is ready to accept appointments'
              : 'Complete these steps to start accepting appointments'}
          </p>
        </div>

        {/* Progress */}
        {step !== 'complete' && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {['Profile', 'Services', 'Schedule', 'Rules'].map((label, index) => (
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
                    className={`w-12 h-1 mx-1 rounded ${
                      index < currentStepIndex ? 'bg-green-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Steps */}
        <AnimatePresence mode="wait">
          {/* Step 1: Profile */}
          {step === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-xl p-8 border border-healthcare-border"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-bold text-healthcare-text">Your Profile</h2>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-healthcare-text mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={e => {
                      setProfile(prev => ({
                        ...prev,
                        name: e.target.value,
                        slug: prev.slug || generateSlug(e.target.value),
                      }));
                    }}
                    placeholder="Dr. John Doe"
                    className="w-full px-4 py-3 rounded-xl border border-healthcare-border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-healthcare-text mb-2">
                    <Link2 className="w-4 h-4 inline mr-1" />
                    Your Booking URL *
                  </label>
                  <div className="flex items-center">
                    <span className="px-4 py-3 bg-slate-100 border border-r-0 border-healthcare-border rounded-l-xl text-sm text-healthcare-muted">
                      tdappointments.com/
                    </span>
                    <input
                      type="text"
                      value={profile.slug}
                      onChange={e =>
                        setProfile(prev => ({ ...prev, slug: e.target.value.toLowerCase() }))
                      }
                      placeholder="dr-john"
                      className="flex-1 px-4 py-3 border border-healthcare-border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="px-4 py-3 border border-l-0 border-healthcare-border rounded-r-xl">
                      {checkingSlug ? (
                        <Loader2 className="w-5 h-5 text-healthcare-muted animate-spin" />
                      ) : slugAvailable === true ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : slugAvailable === false ? (
                        <X className="w-5 h-5 text-red-500" />
                      ) : null}
                    </div>
                  </div>
                  {slugAvailable === false && (
                    <p className="text-red-500 text-sm mt-1">This URL is already taken</p>
                  )}
                </div>

                {/* Specialization */}
                <div>
                  <label className="block text-sm font-medium text-healthcare-text mb-2">
                    <Stethoscope className="w-4 h-4 inline mr-1" />
                    Specialization *
                  </label>
                  <select
                    value={profile.specialization}
                    onChange={e => setProfile(prev => ({ ...prev, specialization: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-healthcare-border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {SPECIALIZATIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Two columns */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-healthcare-text mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={e => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-xl border border-healthcare-border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-healthcare-text mb-2">
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      value={profile.experience}
                      onChange={e =>
                        setProfile(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))
                      }
                      min={0}
                      max={70}
                      className="w-full px-4 py-3 rounded-xl border border-healthcare-border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* Clinic Name */}
                <div>
                  <label className="block text-sm font-medium text-healthcare-text mb-2">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    Clinic Name
                  </label>
                  <input
                    type="text"
                    value={profile.clinicName}
                    onChange={e => setProfile(prev => ({ ...prev, clinicName: e.target.value }))}
                    placeholder="City Care Clinic"
                    className="w-full px-4 py-3 rounded-xl border border-healthcare-border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-healthcare-text mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Address
                  </label>
                  <textarea
                    value={profile.address}
                    onChange={e => setProfile(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Full clinic address"
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-healthcare-border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* City, State, Pincode */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-healthcare-text mb-2">City</label>
                    <input
                      type="text"
                      value={profile.city}
                      onChange={e => setProfile(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Hyderabad"
                      className="w-full px-4 py-3 rounded-xl border border-healthcare-border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-healthcare-text mb-2">State</label>
                    <input
                      type="text"
                      value={profile.state}
                      onChange={e => setProfile(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="Telangana"
                      className="w-full px-4 py-3 rounded-xl border border-healthcare-border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-healthcare-text mb-2">Pincode</label>
                    <input
                      type="text"
                      value={profile.pincode}
                      onChange={e => setProfile(prev => ({ ...prev, pincode: e.target.value }))}
                      placeholder="500001"
                      className="w-full px-4 py-3 rounded-xl border border-healthcare-border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={saveProfile}
                  disabled={!profile.name || !profile.slug || slugAvailable === false || saving}
                  className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Consultation Types */}
          {step === 'consultation' && (
            <motion.div
              key="consultation"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-xl p-8 border border-healthcare-border"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-accent-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-healthcare-text">Consultation Types</h2>
                  <p className="text-sm text-healthcare-muted">Define your services and fees</p>
                </div>
              </div>

              <div className="space-y-4">
                {consultationTypes.map((ct, index) => (
                  <div key={index} className="p-4 bg-slate-50 rounded-xl border border-healthcare-border">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex gap-2">
                        {[
                          { type: 'IN_PERSON', icon: Building2, label: 'In-Person' },
                          { type: 'VIDEO_CALL', icon: Video, label: 'Video' },
                          { type: 'PHONE_CALL', icon: PhoneCall, label: 'Phone' },
                        ].map(({ type, icon: Icon, label }) => (
                          <button
                            key={type}
                            onClick={() => updateConsultationType(index, { type: type as any })}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              ct.type === type
                                ? 'bg-primary-500 text-white'
                                : 'bg-white border border-healthcare-border hover:bg-primary-50'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            {label}
                          </button>
                        ))}
                      </div>
                      {consultationTypes.length > 1 && (
                        <button
                          onClick={() => removeConsultationType(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-1">
                        <label className="block text-xs font-medium text-healthcare-muted mb-1">Name</label>
                        <input
                          type="text"
                          value={ct.name}
                          onChange={e => updateConsultationType(index, { name: e.target.value })}
                          placeholder="Consultation name"
                          className="w-full px-3 py-2 rounded-lg border border-healthcare-border bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-healthcare-muted mb-1">Fee (₹)</label>
                        <input
                          type="number"
                          value={ct.fee}
                          onChange={e =>
                            updateConsultationType(index, { fee: parseInt(e.target.value) || 0 })
                          }
                          min={0}
                          className="w-full px-3 py-2 rounded-lg border border-healthcare-border bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-healthcare-muted mb-1">Duration (min)</label>
                        <input
                          type="number"
                          value={ct.duration}
                          onChange={e =>
                            updateConsultationType(index, { duration: parseInt(e.target.value) || 15 })
                          }
                          min={5}
                          max={180}
                          className="w-full px-3 py-2 rounded-lg border border-healthcare-border bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addConsultationType}
                  className="w-full py-3 border-2 border-dashed border-healthcare-border rounded-xl text-healthcare-muted hover:border-primary-500 hover:text-primary-600 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Another Service
                </button>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep('profile')}
                  className="flex items-center gap-2 px-6 py-3 text-healthcare-muted hover:text-healthcare-text transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={saveConsultationTypes}
                  disabled={consultationTypes.some(ct => !ct.name || !ct.fee) || saving}
                  className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Availability */}
          {step === 'availability' && (
            <motion.div
              key="availability"
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
                  <h2 className="text-xl font-bold text-healthcare-text">Your Schedule</h2>
                  <p className="text-sm text-healthcare-muted">Set your weekly availability</p>
                </div>
              </div>

              <div className="space-y-3">
                {DAYS_OF_WEEK.map(day => {
                  const slot = availability.find(a => a.dayOfWeek === day);
                  const isActive = slot?.isActive ?? false;

                  return (
                    <div
                      key={day}
                      className={`p-4 rounded-xl border transition-all ${
                        isActive
                          ? 'bg-primary-50 border-primary-200'
                          : 'bg-slate-50 border-healthcare-border'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isActive}
                            onChange={() => toggleAvailabilityDay(day)}
                            className="w-5 h-5 rounded border-healthcare-border text-primary-500 focus:ring-primary-500"
                          />
                          <span className={`font-medium ${isActive ? 'text-healthcare-text' : 'text-healthcare-muted'}`}>
                            {DAY_LABELS[day]}
                          </span>
                        </label>

                        {isActive && (
                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              value={slot?.startTime || '09:00'}
                              onChange={e => updateAvailabilityTime(day, 'startTime', e.target.value)}
                              className="px-3 py-1.5 rounded-lg border border-healthcare-border bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                            />
                            <span className="text-healthcare-muted">to</span>
                            <input
                              type="time"
                              value={slot?.endTime || '17:00'}
                              onChange={e => updateAvailabilityTime(day, 'endTime', e.target.value)}
                              className="px-3 py-1.5 rounded-lg border border-healthcare-border bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Duration & Buffer */}
              <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-healthcare-border">
                <h3 className="font-medium text-healthcare-text mb-4">Appointment Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-healthcare-muted mb-2">
                      Default Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={profile.defaultDuration}
                      onChange={e =>
                        setProfile(prev => ({ ...prev, defaultDuration: parseInt(e.target.value) || 15 }))
                      }
                      min={5}
                      max={120}
                      className="w-full px-4 py-2 rounded-lg border border-healthcare-border bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-healthcare-muted mb-2">
                      Buffer Between Appointments (min)
                    </label>
                    <input
                      type="number"
                      value={profile.bufferTime}
                      onChange={e =>
                        setProfile(prev => ({ ...prev, bufferTime: parseInt(e.target.value) || 0 }))
                      }
                      min={0}
                      max={60}
                      className="w-full px-4 py-2 rounded-lg border border-healthcare-border bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep('consultation')}
                  className="flex items-center gap-2 px-6 py-3 text-healthcare-muted hover:text-healthcare-text transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={saveAvailability}
                  disabled={!availability.some(a => a.isActive) || saving}
                  className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Rules */}
          {step === 'rules' && (
            <motion.div
              key="rules"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-xl p-8 border border-healthcare-border"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-healthcare-text">Booking Rules</h2>
                  <p className="text-sm text-healthcare-muted">Set your appointment policies</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Booking Window */}
                <div className="p-4 bg-slate-50 rounded-xl border border-healthcare-border">
                  <h3 className="font-medium text-healthcare-text mb-4">Booking Window</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-healthcare-muted mb-2">
                        Minimum advance booking (hours)
                      </label>
                      <input
                        type="number"
                        value={rules.minAdvanceBooking / 60}
                        onChange={e =>
                          setRules(prev => ({
                            ...prev,
                            minAdvanceBooking: (parseInt(e.target.value) || 1) * 60,
                          }))
                        }
                        min={0}
                        className="w-full px-4 py-2 rounded-lg border border-healthcare-border bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-healthcare-muted mb-2">
                        Maximum advance booking (days)
                      </label>
                      <input
                        type="number"
                        value={rules.maxAdvanceBooking / 1440}
                        onChange={e =>
                          setRules(prev => ({
                            ...prev,
                            maxAdvanceBooking: (parseInt(e.target.value) || 30) * 1440,
                          }))
                        }
                        min={1}
                        max={90}
                        className="w-full px-4 py-2 rounded-lg border border-healthcare-border bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Cancellation & Rescheduling */}
                <div className="p-4 bg-slate-50 rounded-xl border border-healthcare-border">
                  <h3 className="font-medium text-healthcare-text mb-4">Cancellation & Rescheduling</h3>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rules.allowCancellation}
                        onChange={e =>
                          setRules(prev => ({ ...prev, allowCancellation: e.target.checked }))
                        }
                        className="w-5 h-5 rounded border-healthcare-border text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-healthcare-text">Allow patients to cancel appointments</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rules.allowRescheduling}
                        onChange={e =>
                          setRules(prev => ({ ...prev, allowRescheduling: e.target.checked }))
                        }
                        className="w-5 h-5 rounded border-healthcare-border text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-healthcare-text">Allow patients to reschedule appointments</span>
                    </label>
                    {rules.allowRescheduling && (
                      <div className="ml-8">
                        <label className="block text-sm text-healthcare-muted mb-2">
                          Maximum reschedules per appointment
                        </label>
                        <input
                          type="number"
                          value={rules.maxReschedules}
                          onChange={e =>
                            setRules(prev => ({
                              ...prev,
                              maxReschedules: parseInt(e.target.value) || 1,
                            }))
                          }
                          min={1}
                          max={5}
                          className="w-32 px-4 py-2 rounded-lg border border-healthcare-border bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Notifications */}
                <div className="p-4 bg-slate-50 rounded-xl border border-healthcare-border">
                  <h3 className="font-medium text-healthcare-text mb-4">Notifications</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rules.sendConfirmation}
                        onChange={e =>
                          setRules(prev => ({ ...prev, sendConfirmation: e.target.checked }))
                        }
                        className="w-5 h-5 rounded border-healthcare-border text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-healthcare-text">Send booking confirmation</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rules.sendReminder}
                        onChange={e =>
                          setRules(prev => ({ ...prev, sendReminder: e.target.checked }))
                        }
                        className="w-5 h-5 rounded border-healthcare-border text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-healthcare-text">Send appointment reminder</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep('availability')}
                  className="flex items-center gap-2 px-6 py-3 text-healthcare-muted hover:text-healthcare-text transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={saveRulesAndComplete}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Complete Setup
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

              <h2 className="text-2xl font-bold text-healthcare-text mb-2">You're All Set!</h2>
              <p className="text-healthcare-muted mb-6">
                Patients can now book appointments using your booking link
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
                    href={`/${profile.slug}`}
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
                  <strong>💡 Pro Tip:</strong> Add this URL to your Google Business Profile's "Book"
                  button to let patients book directly from Google Search & Maps.
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

export default function SetupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SetupContent />
    </Suspense>
  );
}
