'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Video,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Loader2,
  Building2,
  PhoneCall,
  Phone,
  User,
  X,
  Check,
  AlertCircle,
  RefreshCw,
  FileText,
  Printer,
} from 'lucide-react';
import { format, parse, addDays, subDays, startOfDay, isToday } from 'date-fns';
import { PrescriptionForm } from '@/components/prescription';

interface Appointment {
  id: string;
  bookingRef: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  fee: number;
  reasonForVisit?: string;
  notes?: string;
  patient: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  consultationType: {
    id: string;
    name: string;
    type: string;
    fee: number;
  };
}

export default function AppointmentsPage() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState<any>(null);

  // Fetch appointments
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const params = new URLSearchParams({ date: dateStr });
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const res = await fetch(`/api/doctor/appointments?${params}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments);
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    }
    setLoading(false);
  }, [selectedDate, statusFilter]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Filter by search
  const filteredAppointments = appointments.filter(apt => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      apt.patient.name.toLowerCase().includes(query) ||
      apt.patient.phone.includes(query) ||
      apt.bookingRef.toLowerCase().includes(query)
    );
  });

  // Update appointment status
  const updateStatus = async (appointmentId: string, status: string) => {
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch('/api/doctor/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, status }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update status');
      }

      // Refresh appointments
      await fetchAppointments();
      setShowActionModal(false);
      setSelectedAppointment(null);
    } catch (err: any) {
      setActionError(err.message);
    }
    setActionLoading(false);
  };

  // Load prescription data
  const loadPrescription = async (appointmentId: string) => {
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/prescription`);
      if (res.ok) {
        const data = await res.json();
        setPrescriptionData(data.prescription);
        return data.prescription;
      }
      return null;
    } catch (err) {
      console.error('Failed to load prescription:', err);
      return null;
    }
  };

  // Handle prescription button click
  const handlePrescriptionClick = async (appointmentId: string) => {
    const prescription = await loadPrescription(appointmentId);
    setPrescriptionData(prescription);
    setShowPrescriptionForm(true);
  };

  // Handle print prescription
  const handlePrintPrescription = (appointmentId: string) => {
    window.open(`/prescription/${appointmentId}`, '_blank');
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

  // Format time
  const formatTime = (time: string) => {
    try {
      return format(parse(time, 'HH:mm', new Date()), 'h:mm a');
    } catch {
      return time;
    }
  };

  // Status colors
  const statusColors: Record<string, string> = {
    CONFIRMED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
    COMPLETED: 'bg-blue-100 text-blue-700 border-blue-200',
    CANCELLED: 'bg-red-100 text-red-700 border-red-200',
    NO_SHOW: 'bg-slate-100 text-slate-700 border-slate-200',
    RESCHEDULED: 'bg-purple-100 text-purple-700 border-purple-200',
  };

  // Stats
  const stats = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
    pending: appointments.filter(a => a.status === 'PENDING').length,
    completed: appointments.filter(a => a.status === 'COMPLETED').length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Appointments</h1>
          <p className="text-slate-500">Manage and track all your appointments</p>
        </div>
        <button
          onClick={fetchAppointments}
          className="flex items-center gap-2 px-4 py-2 text-teal-600 hover:bg-teal-50 rounded-xl transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by patient name, phone, or booking ref..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {/* Date Picker */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
          <Calendar className="w-4 h-4 text-slate-400" />
          <button
            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            className="p-1 hover:bg-slate-200 rounded"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedDate(new Date())}
            className={`text-sm font-medium min-w-[120px] text-center ${
              isToday(selectedDate) ? 'text-teal-600' : 'text-slate-700'
            }`}
          >
            {isToday(selectedDate) ? 'Today' : format(selectedDate, 'MMM d, yyyy')}
          </button>
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            className="p-1 hover:bg-slate-200 rounded"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">All Status</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
            <span className="text-xl font-bold">{stats.total}</span>
          </div>
          <span className="text-sm text-slate-500">Total</span>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <span className="text-xl font-bold">{stats.confirmed}</span>
          </div>
          <span className="text-sm text-slate-500">Confirmed</span>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <span className="text-xl font-bold">{stats.pending}</span>
          </div>
          <span className="text-sm text-slate-500">Pending</span>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <span className="text-xl font-bold">{stats.completed}</span>
          </div>
          <span className="text-sm text-slate-500">Completed</span>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Table Header (Desktop) */}
        <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
          <div className="col-span-3">Patient</div>
          <div className="col-span-2">Time</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Fee</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1">Actions</div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
          </div>
        ) : filteredAppointments.length === 0 ? (
          /* Empty State */
          <div className="py-16 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">No appointments found</h3>
            <p className="text-slate-500">
              {statusFilter !== 'all'
                ? 'Try changing your filters'
                : 'No appointments scheduled for this date'}
            </p>
          </div>
        ) : (
          /* Appointments */
          <div className="divide-y divide-slate-100">
            {filteredAppointments.map((apt, index) => {
              const TypeIcon = getTypeIcon(apt.consultationType.type);
              return (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-6 py-4 hover:bg-slate-50 transition-colors items-center"
                >
                  {/* Patient */}
                  <div className="lg:col-span-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {apt.patient.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{apt.patient.name}</p>
                      <p className="text-xs text-slate-500">{apt.patient.phone}</p>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="lg:col-span-2 flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700">
                      {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
                    </span>
                  </div>

                  {/* Type */}
                  <div className="lg:col-span-2 flex items-center gap-2 text-sm">
                    <TypeIcon className="w-4 h-4 text-teal-500" />
                    <span className="text-slate-700">{apt.consultationType.name}</span>
                  </div>

                  {/* Fee */}
                  <div className="lg:col-span-2 text-sm font-medium text-slate-700">
                    ₹{apt.fee.toLocaleString()}
                  </div>

                  {/* Status */}
                  <div className="lg:col-span-2">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
                        statusColors[apt.status] || statusColors.PENDING
                      }`}
                    >
                      {apt.status === 'CONFIRMED' && <CheckCircle2 className="w-3 h-3" />}
                      {apt.status === 'CANCELLED' && <XCircle className="w-3 h-3" />}
                      {apt.status === 'COMPLETED' && <Check className="w-3 h-3" />}
                      {apt.status.charAt(0) + apt.status.slice(1).toLowerCase().replace('_', ' ')}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="lg:col-span-1 flex items-center gap-2">
                    {apt.consultationType.type === 'VIDEO_CALL' && apt.status === 'CONFIRMED' && (
                      <button className="p-2 bg-teal-100 text-teal-600 rounded-lg hover:bg-teal-200 transition-colors">
                        <Video className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedAppointment(apt);
                        setShowActionModal(true);
                        setActionError(null);
                      }}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Modal */}
      <AnimatePresence>
        {showActionModal && selectedAppointment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowActionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800">Appointment Actions</h3>
                <button
                  onClick={() => setShowActionModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Appointment Info */}
              <div className="bg-slate-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedAppointment.patient.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{selectedAppointment.patient.name}</p>
                    <p className="text-sm text-slate-500">{selectedAppointment.patient.phone}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-slate-500">Time:</span>{' '}
                    <span className="text-slate-700">{formatTime(selectedAppointment.startTime)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Fee:</span>{' '}
                    <span className="text-slate-700">₹{selectedAppointment.fee}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Ref:</span>{' '}
                    <span className="text-slate-700 font-mono">{selectedAppointment.bookingRef}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Status:</span>{' '}
                    <span className="text-slate-700">{selectedAppointment.status}</span>
                  </div>
                </div>
              </div>

              {/* Error */}
              {actionError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4" />
                  {actionError}
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                {selectedAppointment.status === 'PENDING' && (
                  <button
                    onClick={() => updateStatus(selectedAppointment.id, 'CONFIRMED')}
                    disabled={actionLoading}
                    className="w-full py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:bg-slate-300 transition-colors flex items-center justify-center gap-2"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Confirm Appointment
                  </button>
                )}

                {(selectedAppointment.status === 'CONFIRMED' || selectedAppointment.status === 'PENDING') && (
                  <>
                    <button
                      onClick={() => updateStatus(selectedAppointment.id, 'COMPLETED')}
                      disabled={actionLoading}
                      className="w-full py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-slate-300 transition-colors flex items-center justify-center gap-2"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Mark as Completed
                    </button>

                    <button
                      onClick={() => updateStatus(selectedAppointment.id, 'NO_SHOW')}
                      disabled={actionLoading}
                      className="w-full py-3 bg-slate-500 text-white rounded-xl hover:bg-slate-600 disabled:bg-slate-300 transition-colors flex items-center justify-center gap-2"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                      Mark as No-Show
                    </button>

                    <button
                      onClick={() => updateStatus(selectedAppointment.id, 'CANCELLED')}
                      disabled={actionLoading}
                      className="w-full py-3 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 disabled:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Cancel Appointment
                    </button>
                  </>
                )}

                {/* Prescription */}
                <button
                  onClick={async () => {
                    setShowActionModal(false);
                    await handlePrescriptionClick(selectedAppointment.id);
                  }}
                  className="w-full py-3 border-2 border-primary-200 text-primary-600 rounded-xl hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  {prescriptionData ? 'Edit Prescription' : 'Create Prescription'}
                </button>

                {prescriptionData && (
                  <button
                    onClick={() => {
                      setShowActionModal(false);
                      handlePrintPrescription(selectedAppointment.id);
                    }}
                    className="w-full py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Print Prescription
                  </button>
                )}

                {/* Call Patient */}
                <a
                  href={`tel:${selectedAppointment.patient.phone}`}
                  className="w-full py-3 border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Call Patient
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prescription Form Modal */}
      {showPrescriptionForm && selectedAppointment && (
        <PrescriptionForm
          appointmentId={selectedAppointment.id}
          initialData={prescriptionData ? {
            diagnosis: prescriptionData.diagnosis || undefined,
            chiefComplaint: prescriptionData.chiefComplaint || undefined,
            medicines: (prescriptionData.medicines as any[]) || [],
            advice: prescriptionData.advice || undefined,
            followUpDate: prescriptionData.followUpDate 
              ? format(new Date(prescriptionData.followUpDate), 'yyyy-MM-dd')
              : undefined,
            followUpNotes: prescriptionData.followUpNotes || undefined,
          } : undefined}
          onSave={() => {
            setShowPrescriptionForm(false);
            loadPrescription(selectedAppointment.id);
            fetchAppointments();
          }}
          onClose={() => {
            setShowPrescriptionForm(false);
            setPrescriptionData(null);
          }}
        />
      )}
    </div>
  );
}
