'use client';

/**
 * Walk-In Booking Form
 * 
 * Used by Reception and Manager to book appointments for walk-in patients.
 * Includes patient source tracking.
 */

import { useState, useEffect } from 'react';
import { usePermissions, Permission } from '@/hooks/usePermissions';
import { PatientSource, BookingType } from '@prisma/client';

interface ConsultationType {
  id: string;
  name: string;
  type: string;
  duration: number;
  // Fee only visible to admin
  fee?: number;
}

interface WalkInBookingFormProps {
  consultationTypes: ConsultationType[];
  onSubmit: (data: WalkInBookingData) => Promise<void>;
  onCancel: () => void;
}

interface WalkInBookingData {
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  consultationTypeId: string;
  date: string;
  startTime: string;
  reasonForVisit?: string;
  bookingType: BookingType;
  patientSource: PatientSource;
  referredBy?: string;
  sourceDetails?: string;
}

const SOURCE_OPTIONS: { value: PatientSource; label: string; description: string }[] = [
  { value: 'WALK_IN', label: 'Walk-In', description: 'Patient walked in without appointment' },
  { value: 'REFERRED', label: 'Referred', description: 'Referred by another patient or doctor' },
  { value: 'GOOGLE', label: 'Google', description: 'Found via Google search' },
  { value: 'WEBSITE', label: 'Website', description: 'Booked through clinic website' },
  { value: 'SOCIAL', label: 'Social Media', description: 'Found via social media' },
  { value: 'OTHER', label: 'Other', description: 'Other source' },
];

export function WalkInBookingForm({
  consultationTypes,
  onSubmit,
  onCancel,
}: WalkInBookingFormProps) {
  const { canViewFinancials, can } = usePermissions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<WalkInBookingData>({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    consultationTypeId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    reasonForVisit: '',
    bookingType: 'WALK_IN',
    patientSource: 'WALK_IN',
    referredBy: '',
    sourceDetails: '',
  });
  
  // Check permission
  if (!can(Permission.APPOINTMENT_CREATE)) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">You do not have permission to book appointments.</p>
      </div>
    );
  }
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!formData.patientName || !formData.patientPhone || !formData.consultationTypeId || !formData.startTime) {
        throw new Error('Please fill in all required fields');
      }
      
      // Validate phone number (Indian format)
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(formData.patientPhone)) {
        throw new Error('Please enter a valid 10-digit phone number');
      }
      
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book appointment');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Generate time slots for today
  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    for (let hour = 8; hour < 21; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        // Skip past times for today
        if (formData.date === new Date().toISOString().split('T')[0]) {
          if (hour < currentHour || (hour === currentHour && minute <= currentMinute)) {
            continue;
          }
        }
        
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(2000, 0, 1, hour, minute).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
        
        slots.push({ value: timeStr, label: displayTime });
      }
    }
    
    return slots;
  };
  
  const timeSlots = generateTimeSlots();
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      {/* Patient Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
          Patient Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter patient name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="patientPhone"
              value={formData.patientPhone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="10-digit phone number"
              maxLength={10}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email (Optional)
            </label>
            <input
              type="email"
              name="patientEmail"
              value={formData.patientEmail}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="patient@email.com"
            />
          </div>
        </div>
      </div>
      
      {/* Patient Source Tracking */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
          How did the patient find us?
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {SOURCE_OPTIONS.map(option => (
            <label
              key={option.value}
              className={`
                flex flex-col p-4 border rounded-lg cursor-pointer transition-all
                ${formData.patientSource === option.value 
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500' 
                  : 'border-gray-200 hover:border-gray-300'}
              `}
            >
              <input
                type="radio"
                name="patientSource"
                value={option.value}
                checked={formData.patientSource === option.value}
                onChange={handleChange}
                className="sr-only"
              />
              <span className="font-medium text-gray-900">{option.label}</span>
              <span className="text-xs text-gray-500 mt-1">{option.description}</span>
            </label>
          ))}
        </div>
        
        {formData.patientSource === 'REFERRED' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Referred By
            </label>
            <input
              type="text"
              name="referredBy"
              value={formData.referredBy}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Name of referrer"
            />
          </div>
        )}
        
        {formData.patientSource === 'OTHER' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source Details
            </label>
            <input
              type="text"
              name="sourceDetails"
              value={formData.sourceDetails}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="How did they hear about us?"
            />
          </div>
        )}
      </div>
      
      {/* Appointment Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
          Appointment Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Consultation Type <span className="text-red-500">*</span>
            </label>
            <select
              name="consultationTypeId"
              value={formData.consultationTypeId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select consultation type</option>
              {consultationTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name} ({type.duration} min)
                  {/* Fee only shown to admin */}
                  {canViewFinancials && type.fee !== undefined && ` - ₹${type.fee}`}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time <span className="text-red-500">*</span>
            </label>
            <select
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select time</option>
              {timeSlots.map(slot => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Visit
          </label>
          <textarea
            name="reasonForVisit"
            value={formData.reasonForVisit}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Brief description of the reason for visit..."
          />
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Booking...' : 'Book Appointment'}
        </button>
      </div>
    </form>
  );
}
