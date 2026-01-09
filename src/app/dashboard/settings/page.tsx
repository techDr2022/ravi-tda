'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  User,
  Building2,
  Bell,
  Clock,
  Save,
  Plus,
  Trash2,
  X,
  Stethoscope,
  IndianRupee,
  CheckCircle,
  Loader2,
  Video,
  PhoneCall,
  AlertCircle,
  Link2,
  Copy,
  Calendar,
  Shield,
} from 'lucide-react';

interface DoctorProfile {
  id: string;
  name: string;
  slug: string;
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
  defaultDuration: number;
  bufferTime: number;
}

interface ConsultationType {
  id: string;
  name: string;
  type: 'IN_PERSON' | 'VIDEO_CALL' | 'PHONE_CALL';
  description?: string;
  fee: number;
  duration: number;
  isActive: boolean;
}

interface Availability {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface AppointmentRules {
  minAdvanceBooking: number;
  maxAdvanceBooking: number;
  allowCancellation: boolean;
  cancellationWindow: number;
  allowRescheduling: boolean;
  reschedulingWindow: number;
  maxReschedules: number;
  requirePayment: boolean;
}

const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile state
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [consultationTypes, setConsultationTypes] = useState<ConsultationType[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [rules, setRules] = useState<AppointmentRules | null>(null);

  // Modal state
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState<ConsultationType | null>(null);
  const [consultationForm, setConsultationForm] = useState({
    name: '',
    type: 'IN_PERSON' as 'IN_PERSON' | 'VIDEO_CALL' | 'PHONE_CALL',
    fee: 500,
    duration: 15,
    description: '',
  });

  // Load profile data
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/doctor/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile(data.profile);
          setConsultationTypes(data.profile.consultationTypes || []);
          setAvailability(data.profile.availability || []);
          setRules(data.profile.appointmentRules || {
            minAdvanceBooking: 60,
            maxAdvanceBooking: 43200,
            allowCancellation: true,
            cancellationWindow: 240,
            allowRescheduling: true,
            reschedulingWindow: 240,
            maxReschedules: 2,
            requirePayment: false,
          });
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  // Show message helper
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Save profile
  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await fetch('/api/doctor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        showMessage('success', 'Profile saved successfully');
      } else {
        throw new Error('Failed to save');
      }
    } catch (err) {
      showMessage('error', 'Failed to save profile');
    }
    setSaving(false);
  };

  // Save consultation type
  const saveConsultationType = async () => {
    setSaving(true);
    try {
      const method = editingConsultation ? 'PUT' : 'POST';
      const body = editingConsultation
        ? { ...consultationForm, id: editingConsultation.id }
        : consultationForm;

      const res = await fetch('/api/doctor/consultation-types', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        if (editingConsultation) {
          setConsultationTypes(prev =>
            prev.map(ct => (ct.id === editingConsultation.id ? data.consultationType : ct))
          );
        } else {
          setConsultationTypes(prev => [...prev, data.consultationType]);
        }
        setShowConsultationModal(false);
        showMessage('success', 'Consultation type saved');
      }
    } catch (err) {
      showMessage('error', 'Failed to save consultation type');
    }
    setSaving(false);
  };

  // Delete consultation type
  const deleteConsultationType = async (id: string) => {
    if (!confirm('Are you sure you want to delete this consultation type?')) return;
    try {
      const res = await fetch(`/api/doctor/consultation-types?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setConsultationTypes(prev => prev.filter(ct => ct.id !== id));
        showMessage('success', 'Consultation type deleted');
      }
    } catch (err) {
      showMessage('error', 'Failed to delete');
    }
  };

  // Save availability
  const saveAvailability = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/doctor/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability }),
      });
      if (res.ok) {
        showMessage('success', 'Availability saved');
      }
    } catch (err) {
      showMessage('error', 'Failed to save availability');
    }
    setSaving(false);
  };

  // Save rules
  const saveRules = async () => {
    if (!rules) return;
    setSaving(true);
    try {
      const res = await fetch('/api/doctor/rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rules),
      });
      if (res.ok) {
        showMessage('success', 'Appointment rules saved');
      }
    } catch (err) {
      showMessage('error', 'Failed to save rules');
    }
    setSaving(false);
  };

  // Toggle availability day
  const toggleAvailabilityDay = (day: string) => {
    const existing = availability.find(a => a.dayOfWeek === day);
    if (existing) {
      setAvailability(prev => prev.filter(a => a.dayOfWeek !== day));
    } else {
      setAvailability(prev => [
        ...prev,
        {
          id: `new-${day}`,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          isActive: true,
        },
      ]);
    }
  };

  // Update availability time
  const updateAvailabilityTime = (day: string, field: 'startTime' | 'endTime', value: string) => {
    setAvailability(prev =>
      prev.map(a => (a.dayOfWeek === day ? { ...a, [field]: value } : a))
    );
  };

  // Get consultation type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'IN_PERSON': return Building2;
      case 'VIDEO_CALL': return Video;
      case 'PHONE_CALL': return PhoneCall;
      default: return Building2;
    }
  };

  // Copy booking URL
  const copyBookingUrl = () => {
    if (profile) {
      navigator.clipboard.writeText(`${window.location.origin}/${profile.slug}`);
      showMessage('success', 'Booking URL copied!');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'consultation', label: 'Consultation Types', icon: Stethoscope },
    { id: 'availability', label: 'Availability', icon: Clock },
    { id: 'rules', label: 'Booking Rules', icon: Shield },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
          <p className="text-slate-500">Manage your profile and booking preferences</p>
        </div>
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                message.type === 'success'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="bg-white rounded-2xl border border-slate-200 p-2 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-teal-50 text-teal-600'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Booking URL Card */}
          {profile && (
            <div className="mt-4 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Link2 className="w-4 h-4" />
                <span className="font-medium text-sm">Your Booking URL</span>
              </div>
              <code className="text-xs text-teal-100 block truncate mb-3">
                /{profile.slug}
              </code>
              <button
                onClick={copyBookingUrl}
                className="w-full py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy URL
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && profile && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-800">Profile Information</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Specialization *
                  </label>
                  <input
                    type="text"
                    value={profile.specialization}
                    onChange={e => setProfile({ ...profile, specialization: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Qualifications
                  </label>
                  <input
                    type="text"
                    value={profile.qualifications || ''}
                    onChange={e => setProfile({ ...profile, qualifications: e.target.value })}
                    placeholder="MBBS, MD, etc."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Experience (years)
                  </label>
                  <input
                    type="number"
                    value={profile.experience || ''}
                    onChange={e => setProfile({ ...profile, experience: parseInt(e.target.value) || undefined })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                  <textarea
                    value={profile.bio || ''}
                    onChange={e => setProfile({ ...profile, bio: e.target.value })}
                    rows={3}
                    placeholder="Tell patients about yourself..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Clinic Name
                  </label>
                  <input
                    type="text"
                    value={profile.clinicName || ''}
                    onChange={e => setProfile({ ...profile, clinicName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={profile.phone || ''}
                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={profile.address || ''}
                    onChange={e => setProfile({ ...profile, address: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                  <input
                    type="text"
                    value={profile.city || ''}
                    onChange={e => setProfile({ ...profile, city: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Default Duration (mins)
                  </label>
                  <input
                    type="number"
                    value={profile.defaultDuration}
                    onChange={e => setProfile({ ...profile, defaultDuration: parseInt(e.target.value) || 15 })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <button
                onClick={saveProfile}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 text-white rounded-xl hover:bg-teal-600 disabled:bg-slate-300 transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Profile
              </button>
            </div>
          )}

          {/* Consultation Types Tab */}
          {activeTab === 'consultation' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">Consultation Types</h2>
                <button
                  onClick={() => {
                    setEditingConsultation(null);
                    setConsultationForm({
                      name: '',
                      type: 'IN_PERSON',
                      fee: 500,
                      duration: 15,
                      description: '',
                    });
                    setShowConsultationModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Type
                </button>
              </div>

              <div className="space-y-3">
                {consultationTypes.map(ct => {
                  const TypeIcon = getTypeIcon(ct.type);
                  return (
                    <div
                      key={ct.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                          <TypeIcon className="w-6 h-6 text-teal-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-800">{ct.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <IndianRupee className="w-3 h-3" />₹{ct.fee}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />{ct.duration} min
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingConsultation(ct);
                            setConsultationForm({
                              name: ct.name,
                              type: ct.type,
                              fee: ct.fee,
                              duration: ct.duration,
                              description: ct.description || '',
                            });
                            setShowConsultationModal(true);
                          }}
                          className="p-2 text-slate-400 hover:text-teal-600 hover:bg-white rounded-lg transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteConsultationType(ct.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {consultationTypes.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <Stethoscope className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>No consultation types added yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Availability Tab */}
          {activeTab === 'availability' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-800">Weekly Availability</h2>
              <p className="text-slate-500 text-sm">
                Set your working hours for each day of the week
              </p>

              <div className="space-y-3">
                {DAYS_OF_WEEK.map(day => {
                  const dayAvailability = availability.find(a => a.dayOfWeek === day);
                  const isActive = !!dayAvailability;

                  return (
                    <div
                      key={day}
                      className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
                        isActive ? 'bg-teal-50 border border-teal-200' : 'bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleAvailabilityDay(day)}
                          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                            isActive
                              ? 'bg-teal-500 border-teal-500 text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {isActive && <CheckCircle className="w-4 h-4" />}
                        </button>
                        <span className="font-medium text-slate-700 w-24">
                          {day.charAt(0) + day.slice(1).toLowerCase()}
                        </span>
                      </div>

                      {isActive && dayAvailability && (
                        <div className="flex items-center gap-3">
                          <input
                            type="time"
                            value={dayAvailability.startTime}
                            onChange={e => updateAvailabilityTime(day, 'startTime', e.target.value)}
                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                          <span className="text-slate-400">to</span>
                          <input
                            type="time"
                            value={dayAvailability.endTime}
                            onChange={e => updateAvailabilityTime(day, 'endTime', e.target.value)}
                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                      )}

                      {!isActive && (
                        <span className="text-slate-400 text-sm">Unavailable</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={saveAvailability}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 text-white rounded-xl hover:bg-teal-600 disabled:bg-slate-300 transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Availability
              </button>
            </div>
          )}

          {/* Rules Tab */}
          {activeTab === 'rules' && rules && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-800">Booking Rules</h2>

              <div className="space-y-6">
                {/* Advance Booking */}
                <div className="p-4 bg-slate-50 rounded-xl space-y-4">
                  <h3 className="font-medium text-slate-700">Advance Booking</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-600 mb-2">
                        Minimum advance booking (hours)
                      </label>
                      <input
                        type="number"
                        value={Math.round(rules.minAdvanceBooking / 60)}
                        onChange={e => setRules({ ...rules, minAdvanceBooking: parseInt(e.target.value) * 60 || 60 })}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-2">
                        Maximum advance booking (days)
                      </label>
                      <input
                        type="number"
                        value={Math.round(rules.maxAdvanceBooking / 1440)}
                        onChange={e => setRules({ ...rules, maxAdvanceBooking: parseInt(e.target.value) * 1440 || 43200 })}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Cancellation */}
                <div className="p-4 bg-slate-50 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-slate-700">Allow Cancellation</h3>
                    <button
                      onClick={() => setRules({ ...rules, allowCancellation: !rules.allowCancellation })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        rules.allowCancellation ? 'bg-teal-500' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          rules.allowCancellation ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                  {rules.allowCancellation && (
                    <div>
                      <label className="block text-sm text-slate-600 mb-2">
                        Cancellation window (hours before appointment)
                      </label>
                      <input
                        type="number"
                        value={Math.round(rules.cancellationWindow / 60)}
                        onChange={e => setRules({ ...rules, cancellationWindow: parseInt(e.target.value) * 60 || 240 })}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  )}
                </div>

                {/* Rescheduling */}
                <div className="p-4 bg-slate-50 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-slate-700">Allow Rescheduling</h3>
                    <button
                      onClick={() => setRules({ ...rules, allowRescheduling: !rules.allowRescheduling })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        rules.allowRescheduling ? 'bg-teal-500' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          rules.allowRescheduling ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                  {rules.allowRescheduling && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-slate-600 mb-2">
                          Rescheduling window (hours)
                        </label>
                        <input
                          type="number"
                          value={Math.round(rules.reschedulingWindow / 60)}
                          onChange={e => setRules({ ...rules, reschedulingWindow: parseInt(e.target.value) * 60 || 240 })}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-600 mb-2">
                          Max reschedules allowed
                        </label>
                        <input
                          type="number"
                          value={rules.maxReschedules}
                          onChange={e => setRules({ ...rules, maxReschedules: parseInt(e.target.value) || 2 })}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={saveRules}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 text-white rounded-xl hover:bg-teal-600 disabled:bg-slate-300 transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Rules
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Consultation Type Modal */}
      <AnimatePresence>
        {showConsultationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowConsultationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800">
                  {editingConsultation ? 'Edit' : 'Add'} Consultation Type
                </h3>
                <button
                  onClick={() => setShowConsultationModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={consultationForm.name}
                    onChange={e => setConsultationForm({ ...consultationForm, name: e.target.value })}
                    placeholder="e.g., General Consultation"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Type *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'IN_PERSON', label: 'In-Person', icon: Building2 },
                      { value: 'VIDEO_CALL', label: 'Video', icon: Video },
                      { value: 'PHONE_CALL', label: 'Phone', icon: PhoneCall },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setConsultationForm({ ...consultationForm, type: opt.value as any })}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                          consultationForm.type === opt.value
                            ? 'border-teal-500 bg-teal-50 text-teal-600'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <opt.icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Fee (₹) *</label>
                    <input
                      type="number"
                      value={consultationForm.fee}
                      onChange={e => setConsultationForm({ ...consultationForm, fee: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Duration (mins) *</label>
                    <input
                      type="number"
                      value={consultationForm.duration}
                      onChange={e => setConsultationForm({ ...consultationForm, duration: parseInt(e.target.value) || 15 })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowConsultationModal(false)}
                  className="flex-1 py-3 border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveConsultationType}
                  disabled={saving || !consultationForm.name || !consultationForm.fee}
                  className="flex-1 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 disabled:bg-slate-300 transition-colors flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingConsultation ? 'Update' : 'Add'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
