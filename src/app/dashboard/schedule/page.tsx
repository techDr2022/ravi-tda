'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  X,
  CalendarOff,
  Palmtree,
  Clock,
  AlertCircle,
  Check,
  Loader2,
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  isPast,
  startOfDay,
} from 'date-fns';

interface BlockedSlot {
  id: string;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  reason?: string | null;
  isFullDay: boolean;
}

export default function SchedulePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'single' | 'range'>('single');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [blockType, setBlockType] = useState<'fullday' | 'partial'>('fullday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  // Fetch blocked slots
  const fetchBlockedSlots = useCallback(async () => {
    try {
      const start = format(startOfMonth(subMonths(currentMonth, 1)), 'yyyy-MM-dd');
      const end = format(endOfMonth(addMonths(currentMonth, 2)), 'yyyy-MM-dd');
      
      const res = await fetch(`/api/doctor/blocked-slots?startDate=${start}&endDate=${end}`);
      if (res.ok) {
        const data = await res.json();
        setBlockedSlots(data.blockedSlots);
      }
    } catch (err) {
      console.error('Failed to fetch blocked slots:', err);
    }
    setLoading(false);
  }, [currentMonth]);

  useEffect(() => {
    fetchBlockedSlots();
  }, [fetchBlockedSlots]);

  // Get days for calendar
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get day of week offset for first day
  const startDayOffset = monthStart.getDay();

  // Check if a date is blocked
  const isDateBlocked = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return blockedSlots.some(slot => slot.date === dateStr && slot.isFullDay);
  };

  // Get blocked info for a date
  const getBlockedInfo = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return blockedSlots.filter(slot => slot.date === dateStr);
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    if (isPast(startOfDay(date)) && !isToday(date)) return;
    
    setSelectedDate(date);
    setRangeStart(format(date, 'yyyy-MM-dd'));
    setRangeEnd(format(date, 'yyyy-MM-dd'));
    setBlockReason('');
    setBlockType('fullday');
    setModalMode('single');
    setShowModal(true);
  };

  // Add single blocked date
  const handleAddBlock = async () => {
    setSaving(true);
    setError(null);

    try {
      const body: any = {
        date: format(selectedDate!, 'yyyy-MM-dd'),
        reason: blockReason || null,
      };

      if (blockType === 'partial') {
        body.startTime = startTime;
        body.endTime = endTime;
      }

      const res = await fetch('/api/doctor/blocked-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to block date');
      }

      setSuccess('Date blocked successfully');
      setShowModal(false);
      fetchBlockedSlots();
    } catch (err: any) {
      setError(err.message);
    }

    setSaving(false);
  };

  // Add date range (vacation)
  const handleAddVacation = async () => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/doctor/blocked-slots', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: rangeStart,
          endDate: rangeEnd,
          reason: blockReason || 'Vacation',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add vacation');
      }

      setSuccess(data.message);
      setShowModal(false);
      fetchBlockedSlots();
    } catch (err: any) {
      setError(err.message);
    }

    setSaving(false);
  };

  // Remove blocked date
  const handleRemoveBlock = async (id: string) => {
    try {
      const res = await fetch(`/api/doctor/blocked-slots?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setBlockedSlots(prev => prev.filter(slot => slot.id !== id));
        setSuccess('Block removed');
      }
    } catch (err) {
      console.error('Failed to remove block:', err);
    }
  };

  // Clear messages after timeout
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-healthcare-text">Schedule Management</h1>
          <p className="text-healthcare-muted mt-1">
            Block dates when you're unavailable or on vacation
          </p>
        </div>
        <button
          onClick={() => {
            setModalMode('range');
            setRangeStart('');
            setRangeEnd('');
            setBlockReason('Vacation');
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
        >
          <Palmtree className="w-4 h-4" />
          Add Vacation
        </button>
      </div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
          >
            <Check className="w-5 h-5 text-green-500" />
            <span className="text-green-700">{success}</span>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-healthcare-border p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-healthcare-text">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div
                key={day}
                className="text-center text-sm font-medium text-healthcare-muted py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for offset */}
              {Array.from({ length: startDayOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Day cells */}
              {calendarDays.map(day => {
                const blocked = isDateBlocked(day);
                const blockedInfo = getBlockedInfo(day);
                const hasPartialBlock = blockedInfo.some(b => !b.isFullDay);
                const isPastDate = isPast(startOfDay(day)) && !isToday(day);
                const today = isToday(day);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleDateClick(day)}
                    disabled={isPastDate}
                    className={`
                      aspect-square p-1 rounded-lg text-sm font-medium transition-all relative
                      ${isPastDate ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-slate-100 cursor-pointer'}
                      ${today ? 'ring-2 ring-primary-500' : ''}
                      ${blocked ? 'bg-red-100 text-red-700 hover:bg-red-200' : ''}
                      ${hasPartialBlock && !blocked ? 'bg-amber-50' : ''}
                    `}
                  >
                    <span className="relative z-10">{format(day, 'd')}</span>
                    {blocked && (
                      <CalendarOff className="w-3 h-3 absolute bottom-1 right-1 text-red-500" />
                    )}
                    {hasPartialBlock && !blocked && (
                      <Clock className="w-3 h-3 absolute bottom-1 right-1 text-amber-500" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-6 mt-6 pt-4 border-t border-healthcare-border">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 bg-red-100 rounded" />
              <span className="text-healthcare-muted">Full day blocked</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 bg-amber-50 rounded" />
              <span className="text-healthcare-muted">Partial block</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded ring-2 ring-primary-500" />
              <span className="text-healthcare-muted">Today</span>
            </div>
          </div>
        </div>

        {/* Blocked Dates List */}
        <div className="bg-white rounded-2xl border border-healthcare-border p-6">
          <h3 className="font-semibold text-healthcare-text mb-4 flex items-center gap-2">
            <CalendarOff className="w-5 h-5 text-red-500" />
            Blocked Dates
          </h3>

          {blockedSlots.length === 0 ? (
            <div className="text-center py-8 text-healthcare-muted">
              <CalendarOff className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No blocked dates</p>
              <p className="text-sm mt-1">Click on a date to block it</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {blockedSlots
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map(slot => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                  >
                    <div>
                      <p className="font-medium text-healthcare-text">
                        {format(new Date(slot.date), 'EEE, MMM d, yyyy')}
                      </p>
                      {slot.isFullDay ? (
                        <p className="text-sm text-red-600">Full day</p>
                      ) : (
                        <p className="text-sm text-amber-600">
                          {slot.startTime} - {slot.endTime}
                        </p>
                      )}
                      {slot.reason && (
                        <p className="text-xs text-healthcare-muted mt-1">{slot.reason}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveBlock(slot.id)}
                      className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Block Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-healthcare-text">
                  {modalMode === 'single' ? 'Block Date' : 'Add Vacation'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Mode Toggle */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setModalMode('single')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      modalMode === 'single'
                        ? 'bg-primary-500 text-white'
                        : 'bg-slate-100 text-healthcare-text hover:bg-slate-200'
                    }`}
                  >
                    Single Day
                  </button>
                  <button
                    onClick={() => setModalMode('range')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      modalMode === 'range'
                        ? 'bg-primary-500 text-white'
                        : 'bg-slate-100 text-healthcare-text hover:bg-slate-200'
                    }`}
                  >
                    Date Range
                  </button>
                </div>

                {modalMode === 'single' ? (
                  <>
                    {/* Selected Date */}
                    <div>
                      <label className="block text-sm font-medium text-healthcare-text mb-2">
                        Date
                      </label>
                      <div className="px-4 py-3 bg-slate-100 rounded-xl">
                        {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a date'}
                      </div>
                    </div>

                    {/* Block Type */}
                    <div>
                      <label className="block text-sm font-medium text-healthcare-text mb-2">
                        Block Type
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setBlockType('fullday')}
                          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                            blockType === 'fullday'
                              ? 'bg-red-100 text-red-700 ring-2 ring-red-500'
                              : 'bg-slate-100 text-healthcare-text hover:bg-slate-200'
                          }`}
                        >
                          Full Day
                        </button>
                        <button
                          onClick={() => setBlockType('partial')}
                          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                            blockType === 'partial'
                              ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-500'
                              : 'bg-slate-100 text-healthcare-text hover:bg-slate-200'
                          }`}
                        >
                          Specific Hours
                        </button>
                      </div>
                    </div>

                    {/* Time Range (for partial block) */}
                    {blockType === 'partial' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-healthcare-text mb-2">
                            From
                          </label>
                          <input
                            type="time"
                            value={startTime}
                            onChange={e => setStartTime(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-healthcare-border focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-healthcare-text mb-2">
                            To
                          </label>
                          <input
                            type="time"
                            value={endTime}
                            onChange={e => setEndTime(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-healthcare-border focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-healthcare-text mb-2">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={rangeStart}
                          onChange={e => setRangeStart(e.target.value)}
                          min={format(new Date(), 'yyyy-MM-dd')}
                          className="w-full px-4 py-2 rounded-xl border border-healthcare-border focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-healthcare-text mb-2">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={rangeEnd}
                          onChange={e => setRangeEnd(e.target.value)}
                          min={rangeStart || format(new Date(), 'yyyy-MM-dd')}
                          className="w-full px-4 py-2 rounded-xl border border-healthcare-border focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-healthcare-text mb-2">
                    Reason (optional)
                  </label>
                  <input
                    type="text"
                    value={blockReason}
                    onChange={e => setBlockReason(e.target.value)}
                    placeholder="e.g., Vacation, Conference, Personal"
                    className="w-full px-4 py-3 rounded-xl border border-healthcare-border focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 border border-healthcare-border rounded-xl text-healthcare-text hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={modalMode === 'single' ? handleAddBlock : handleAddVacation}
                    disabled={saving || (modalMode === 'range' && (!rangeStart || !rangeEnd))}
                    className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CalendarOff className="w-4 h-4" />
                    )}
                    {modalMode === 'single' ? 'Block Date' : 'Block Dates'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
