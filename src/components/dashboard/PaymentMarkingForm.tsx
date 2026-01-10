'use client';

/**
 * Payment Marking Form
 * 
 * Used by all roles to mark appointments as paid.
 * 
 * IMPORTANT: 
 * - Only ADMIN can see the payment amount
 * - Manager/Reception can mark payment but CANNOT see or modify the amount
 */

import { useState } from 'react';
import { usePermissions, Permission } from '@/hooks/usePermissions';
import { PaymentType } from '@prisma/client';
import { FinancialDataGate } from './RoleGate';

interface PaymentMarkingFormProps {
  appointmentId: string;
  // Only passed if user is ADMIN
  amount?: number;
  onSubmit: (data: PaymentMarkingData) => Promise<void>;
  onCancel: () => void;
}

interface PaymentMarkingData {
  appointmentId: string;
  paymentType: PaymentType;
  // Only ADMIN can set these
  amount?: number;
  externalPaymentId?: string;
  externalOrderId?: string;
}

export function PaymentMarkingForm({
  appointmentId,
  amount,
  onSubmit,
  onCancel,
}: PaymentMarkingFormProps) {
  const { canViewFinancials, can, role } = usePermissions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<PaymentMarkingData>({
    appointmentId,
    paymentType: 'CASH',
    amount: amount,
    externalPaymentId: '',
    externalOrderId: '',
  });
  
  // Check permission
  if (!can(Permission.PAYMENT_MARK_DONE)) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">You do not have permission to mark payments.</p>
      </div>
    );
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      // Prepare data based on role
      const submitData: PaymentMarkingData = {
        appointmentId: formData.appointmentId,
        paymentType: formData.paymentType,
      };
      
      // Only include financial fields for ADMIN
      if (canViewFinancials) {
        if (formData.amount) submitData.amount = formData.amount;
        if (formData.externalPaymentId) submitData.externalPaymentId = formData.externalPaymentId;
        if (formData.externalOrderId) submitData.externalOrderId = formData.externalOrderId;
      }
      
      await onSubmit(submitData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark payment');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
        <strong>Note:</strong> You are marking this appointment's payment as completed.
        {!canViewFinancials && (
          <span className="block mt-1 text-blue-600">
            The payment amount is pre-set and cannot be modified.
          </span>
        )}
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      {/* Payment Amount - ADMIN ONLY */}
      <FinancialDataGate>
        <div className="space-y-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700 font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
              />
            </svg>
            Admin-only: Financial Details
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Amount (₹)
            </label>
            <input
              type="number"
              value={formData.amount || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                amount: e.target.value ? Number(e.target.value) : undefined 
              }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter amount"
              min={0}
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to use the pre-set consultation fee
            </p>
          </div>
          
          {formData.paymentType === 'ONLINE_UPI' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  External Payment ID
                </label>
                <input
                  type="text"
                  value={formData.externalPaymentId || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    externalPaymentId: e.target.value 
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Payment gateway transaction ID"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  External Order ID
                </label>
                <input
                  type="text"
                  value={formData.externalOrderId || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    externalOrderId: e.target.value 
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Payment gateway order ID"
                />
              </div>
            </>
          )}
        </div>
      </FinancialDataGate>
      
      {/* Payment Type - All roles */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Payment Method <span className="text-red-500">*</span>
        </label>
        
        <div className="grid grid-cols-2 gap-4">
          <label
            className={`
              flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all
              ${formData.paymentType === 'CASH' 
                ? 'border-green-500 bg-green-50 ring-2 ring-green-500' 
                : 'border-gray-200 hover:border-gray-300'}
            `}
          >
            <input
              type="radio"
              name="paymentType"
              value="CASH"
              checked={formData.paymentType === 'CASH'}
              onChange={() => setFormData(prev => ({ ...prev, paymentType: 'CASH' }))}
              className="sr-only"
            />
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" 
                />
              </svg>
            </div>
            <div>
              <span className="font-medium text-gray-900">Cash</span>
              <span className="block text-xs text-gray-500">Paid in cash at clinic</span>
            </div>
          </label>
          
          <label
            className={`
              flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all
              ${formData.paymentType === 'ONLINE_UPI' 
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500' 
                : 'border-gray-200 hover:border-gray-300'}
            `}
          >
            <input
              type="radio"
              name="paymentType"
              value="ONLINE_UPI"
              checked={formData.paymentType === 'ONLINE_UPI'}
              onChange={() => setFormData(prev => ({ ...prev, paymentType: 'ONLINE_UPI' }))}
              className="sr-only"
            />
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" 
                />
              </svg>
            </div>
            <div>
              <span className="font-medium text-gray-900">Online/UPI</span>
              <span className="block text-xs text-gray-500">Paid via UPI or card</span>
            </div>
          </label>
        </div>
      </div>
      
      {/* Confirmation notice for non-admin */}
      {!canViewFinancials && (
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
          <p className="flex items-start gap-2">
            <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <span>
              By confirming, you are marking this payment as received. 
              The payment amount is based on the consultation type fee.
            </span>
          </p>
        </div>
      )}
      
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
          className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Mark as Paid
            </>
          )}
        </button>
      </div>
    </form>
  );
}
