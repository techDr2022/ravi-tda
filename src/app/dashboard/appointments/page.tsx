'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  MessageSquare,
  Send,
  CheckCheck,
  AlertTriangle,
} from 'lucide-react';
import { format, parse, addDays, subDays, startOfDay, isToday, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { PrescriptionForm } from '@/components/prescription';
import { usePermissions } from '@/hooks/usePermissions';
import { BookingType, PatientSource, PaymentStatus, MessageStatus, AppointmentStatus } from '@prisma/client';

interface Appointment {
  id: string;
  bookingRef: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  bookingType: BookingType;
  patientSource: PatientSource;
  fee?: number; // Only visible to ADMIN
  reasonForVisit?: string;
  notes?: string;
  patient: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    source: PatientSource;
  };
  consultationType: {
    id: string;
    name: string;
    type: string;
    duration: number;
    fee?: number; // Only visible to ADMIN
  };
  payment?: {
    id: string;
    status: PaymentStatus;
    paymentType: string;
    amount?: number; // Only visible to ADMIN
    paidAt?: string;
  };
  hasPrescription: boolean;
  latestMessage?: {
    status: MessageStatus;
    messageType: string;
    deliveredAt?: string;
    readAt?: string;
    createdAt: string;
  };
}

export default function AppointmentsPage() {
  const { role, canViewFinancials, isLoading: authLoading } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
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
    if (authLoading) return;
    
    setLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const params = new URLSearchParams({ date: dateStr, limit: '100' });
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const res = await fetch(`/api/clinic/appointments?${params}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      } else {
        console.error('Failed to fetch appointments:', res.statusText);
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, statusFilter, authLoading]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Filter by search
  const filteredAppointments = useMemo(() => {
    if (!searchQuery) return appointments;
    const query = searchQuery.toLowerCase();
    return appointments.filter(apt => 
      apt.patient.name.toLowerCase().includes(query) ||
      apt.patient.phone.includes(query) ||
      apt.bookingRef.toLowerCase().includes(query)
    );
  }, [appointments, searchQuery]);

  // Update appointment status
  const updateStatus = async (appointmentId: string, status: string) => {
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch('/api/clinic/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, status }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update status');
      }

      await fetchAppointments();
      setShowActionModal(false);
      setSelectedAppointment(null);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
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
    CHECKED_IN: 'bg-blue-100 text-blue-700 border-blue-200',
    IN_PROGRESS: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    COMPLETED: 'bg-slate-100 text-slate-700 border-slate-200',
    CANCELLED: 'bg-red-100 text-red-700 border-red-200',
    NO_SHOW: 'bg-gray-100 text-gray-700 border-gray-200',
    RESCHEDULED: 'bg-purple-100 text-purple-700 border-purple-200',
  };

  // Payment status colors
  const paymentStatusColors: Record<string, string> = {
    PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    PAID: 'bg-green-50 text-green-700 border-green-200',
    REFUNDED: 'bg-blue-50 text-blue-700 border-blue-200',
    FAILED: 'bg-red-50 text-red-700 border-red-200',
    CANCELLED: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  // Patient source badge colors
  const sourceBadgeColors: Record<PatientSource, string> = {
    WALK_IN: 'bg-blue-50 text-blue-700 border-blue-200',
    REFERRED: 'bg-purple-50 text-purple-700 border-purple-200',
    GOOGLE: 'bg-green-50 text-green-700 border-green-200',
    WEBSITE: 'bg-teal-50 text-teal-700 border-teal-200',
    SOCIAL: 'bg-pink-50 text-pink-700 border-pink-200',
    OTHER: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  // WhatsApp message status icon
  const getMessageStatusIcon = (message?: Appointment['latestMessage']) => {
    if (!message) return null;
    
    switch (message.status) {
      case 'SENT':
        return <Send className="w-3.5 h-3.5 text-blue-500" />;
      case 'DELIVERED':
        return <CheckCheck className="w-3.5 h-3.5 text-green-500" />;
      case 'READ':
        return <CheckCheck className="w-3.5 h-3.5 text-blue-600" />;
      case 'FAILED':
        return <AlertTriangle className="w-3.5 h-3.5 text-red-500" />;
      case 'PENDING':
        return <Clock className="w-3.5 h-3.5 text-gray-400" />;
      default:
        return null;
    }
  };

  // Date navigation helpers
  const navigateDate = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      setSelectedDate(new Date());
    } else if (direction === 'prev') {
      setSelectedDate(subDays(selectedDate, 1));
    } else {
      setSelectedDate(addDays(selectedDate, 1));
    }
    setShowDatePicker(false);
  };

  // Get week days for calendar view
  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [selectedDate]);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showDatePicker && !target.closest('[data-date-picker]')) {
        setShowDatePicker(false);
      }
    };

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDatePicker]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Appointments</h1>
          <p className="text-slate-500 text-sm">Manage and track all appointments</p>
        </div>
        <button
          onClick={fetchAppointments}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-teal-600 hover:bg-teal-50 rounded-xl transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col lg:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by patient name, phone, or booking ref..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {/* Date Navigation */}
        <div className="relative flex items-center gap-2" data-date-picker>
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Previous day"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors text-sm font-medium min-w-[140px] justify-center ${
              isToday(selectedDate)
                ? 'bg-teal-50 text-teal-700 border-teal-200'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            {isToday(selectedDate) ? 'Today' : format(selectedDate, 'MMM d, yyyy')}
          </button>

          <button
            onClick={() => navigateDate('next')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Next day"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>

          {!isToday(selectedDate) && (
            <button
              onClick={() => navigateDate('today')}
              className="px-3 py-2 text-xs text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
            >
              Today
            </button>
          )}

          {/* Date Picker Dropdown */}
          <AnimatePresence>
            {showDatePicker && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-4 min-w-[280px]"
                data-date-picker
              >
                <input
                  type="date"
                  value={format(selectedDate, 'yyyy-MM-dd')}
                  onChange={e => {
                    setSelectedDate(new Date(e.target.value));
                    setShowDatePicker(false);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  max={format(addDays(new Date(), 365), 'yyyy-MM-dd')}
                />
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <div className="grid grid-cols-7 gap-1 text-xs text-slate-500 mb-2">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                      <div key={i} className="text-center font-medium">{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {weekDays.map(day => (
                      <button
                        key={day.toISOString()}
                        onClick={() => {
                          setSelectedDate(day);
                          setShowDatePicker(false);
                        }}
                        className={`p-2 text-xs rounded-lg transition-colors ${
                          format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                            ? 'bg-teal-600 text-white'
                            : isToday(day)
                            ? 'bg-teal-50 text-teal-700 font-medium'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {format(day, 'd')}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CHECKED_IN">Checked In</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="NO_SHOW">No Show</option>
        </select>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Table Header (Desktop) */}
        <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
          <div className="col-span-3">Patient</div>
          <div className="col-span-1">Time</div>
          <div className="col-span-1">Type</div>
          <div className="col-span-2">Source</div>
          <div className="col-span-1">Payment</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Actions</div>
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
            <p className="text-slate-500 text-sm">
              {statusFilter !== 'all' || searchQuery
                ? 'Try changing your filters'
                : 'No appointments scheduled for this date'}
            </p>
          </div>
        ) : (
          /* Appointments */
          <div className="divide-y divide-slate-100">
            {filteredAppointments.map((apt, index) => {
              const TypeIcon = getTypeIcon(apt.consultationType.type);
              const isWalkIn = apt.bookingType === 'WALK_IN';
              
              return (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-4 px-6 py-4 transition-colors items-center ${
                    isWalkIn ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Patient */}
                  <div className="lg:col-span-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {apt.patient.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-800 truncate">{apt.patient.name}</p>
                      <p className="text-xs text-slate-500 truncate">{apt.patient.phone}</p>
                      {isWalkIn && (
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          <User className="w-3 h-3" />
                          Walk-in
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Time */}
                  <div className="lg:col-span-1 flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-slate-700 font-medium">
                      {formatTime(apt.startTime)}
                    </span>
                  </div>

                  {/* Type */}
                  <div className="lg:col-span-1 flex items-center gap-2 text-sm">
                    <TypeIcon className="w-4 h-4 text-teal-500 shrink-0" />
                    <span className="text-slate-700 truncate">{apt.consultationType.name}</span>
                  </div>

                  {/* Source & WhatsApp Status */}
                  <div className="lg:col-span-2 flex flex-col gap-1.5">
                    {/* Patient Source Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border w-fit ${
                        sourceBadgeColors[apt.patientSource]
                      }`}
                    >
                      {apt.patientSource.replace('_', ' ')}
                    </span>
                    
                    {/* WhatsApp Message Status */}
                    {apt.latestMessage && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        {getMessageStatusIcon(apt.latestMessage)}
                        <span className="capitalize">{apt.latestMessage.status.toLowerCase()}</span>
                      </div>
                    )}
                  </div>

                  {/* Payment Status */}
                  <div className="lg:col-span-1">
                    {apt.payment ? (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${
                          paymentStatusColors[apt.payment.status] || paymentStatusColors.PENDING
                        }`}
                      >
                        {apt.payment.status === 'PAID' && <CheckCircle2 className="w-3 h-3" />}
                        {apt.payment.status === 'PENDING' && <Clock className="w-3 h-3" />}
                        {apt.payment.status === 'FAILED' && <XCircle className="w-3 h-3" />}
                        {apt.payment.status}
                        {canViewFinancials && apt.payment.amount && (
                          <span className="ml-1 font-semibold">₹{apt.payment.amount.toLocaleString()}</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">No payment</span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="lg:col-span-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border ${
                        statusColors[apt.status] || statusColors.PENDING
                      }`}
                    >
                      {apt.status === 'CONFIRMED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {apt.status === 'CANCELLED' && <XCircle className="w-3.5 h-3.5" />}
                      {apt.status === 'COMPLETED' && <Check className="w-3.5 h-3.5" />}
                      {apt.status === 'NO_SHOW' && <AlertCircle className="w-3.5 h-3.5" />}
                      {apt.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="lg:col-span-2 flex items-center gap-2">
                    {/* One-click Prescription Access */}
                    {apt.hasPrescription ? (
                      <button
                        onClick={() => handlePrintPrescription(apt.id)}
                        className="p-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors"
                        title="View/Print Prescription"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePrescriptionClick(apt.id)}
                        className="p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                        title="Create Prescription"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    )}
                    
                    {/* More Actions */}
                    <button
                      onClick={() => {
                        setSelectedAppointment(apt);
                        setShowActionModal(true);
                        setActionError(null);
                      }}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      title="More actions"
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
              className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800">Appointment Actions</h3>
                <button
                  onClick={() => setShowActionModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Appointment Info */}
              <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedAppointment.patient.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{selectedAppointment.patient.name}</p>
                    <p className="text-sm text-slate-500">{selectedAppointment.patient.phone}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-slate-500">Time:</span>{' '}
                    <span className="text-slate-700 font-medium">{formatTime(selectedAppointment.startTime)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Ref:</span>{' '}
                    <span className="text-slate-700 font-mono text-xs">{selectedAppointment.bookingRef}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Status:</span>{' '}
                    <span className="text-slate-700">{selectedAppointment.status}</span>
                  </div>
                  {canViewFinancials && selectedAppointment.fee && (
                    <div>
                      <span className="text-slate-500">Fee:</span>{' '}
                      <span className="text-slate-700 font-medium">₹{selectedAppointment.fee}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Error */}
              {actionError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {actionError}
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                {selectedAppointment.status === 'PENDING' && (
                  <button
                    onClick={() => updateStatus(selectedAppointment.id, 'CONFIRMED')}
                    disabled={actionLoading}
                    className="w-full py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:bg-slate-300 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
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
                      className="w-full py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-slate-300 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
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
                      className="w-full py-2.5 bg-slate-500 text-white rounded-lg hover:bg-slate-600 disabled:bg-slate-300 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
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
                      className="w-full py-2.5 border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:bg-slate-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
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
                  className="w-full py-2.5 border-2 border-teal-200 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <FileText className="w-4 h-4" />
                  {selectedAppointment.hasPrescription ? 'Edit Prescription' : 'Create Prescription'}
                </button>

                {selectedAppointment.hasPrescription && (
                  <button
                    onClick={() => {
                      setShowActionModal(false);
                      handlePrintPrescription(selectedAppointment.id);
                    }}
                    className="w-full py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Printer className="w-4 h-4" />
                    Print Prescription
                  </button>
                )}

                {/* Call Patient */}
                <a
                  href={`tel:${selectedAppointment.patient.phone}`}
                  className="w-full py-2.5 border-2 border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
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