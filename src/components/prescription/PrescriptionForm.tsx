'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Printer } from 'lucide-react';

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

interface PrescriptionFormProps {
  appointmentId: string;
  initialData?: {
    diagnosis?: string;
    chiefComplaint?: string;
    medicines: Medicine[];
    advice?: string;
    followUpDate?: string;
    followUpNotes?: string;
  };
  onSave?: () => void;
  onClose?: () => void;
}

export default function PrescriptionForm({
  appointmentId,
  initialData,
  onSave,
  onClose,
}: PrescriptionFormProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    diagnosis: initialData?.diagnosis || '',
    chiefComplaint: initialData?.chiefComplaint || '',
    medicines: initialData?.medicines || [
      { name: '', dosage: '', frequency: '', duration: '', instructions: '' },
    ],
    advice: initialData?.advice || '',
    followUpDate: initialData?.followUpDate || '',
    followUpNotes: initialData?.followUpNotes || '',
  });

  const handleMedicineChange = (index: number, field: keyof Medicine, value: string) => {
    const updated = [...formData.medicines];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, medicines: updated });
  };

  const addMedicine = () => {
    setFormData({
      ...formData,
      medicines: [
        ...formData.medicines,
        { name: '', dosage: '', frequency: '', duration: '', instructions: '' },
      ],
    });
  };

  const removeMedicine = (index: number) => {
    if (formData.medicines.length > 1) {
      const updated = formData.medicines.filter((_, i) => i !== index);
      setFormData({ ...formData, medicines: updated });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Validate medicines
    const validMedicines = formData.medicines.filter(
      m => m.name && m.dosage && m.frequency && m.duration
    );

    if (validMedicines.length === 0) {
      setError('Please add at least one medicine with all required fields');
      setSaving(false);
      return;
    }

    try {
      const method = initialData ? 'PUT' : 'POST';
      const res = await fetch(`/api/appointments/${appointmentId}/prescription`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          medicines: validMedicines,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save prescription');
      }

      if (onSave) {
        onSave();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.open(`/prescription/${appointmentId}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">
            {initialData ? 'Edit Prescription' : 'Create Prescription'}
          </h2>
          <div className="flex items-center gap-2">
            {initialData && (
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Chief Complaint */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Chief Complaint
            </label>
            <textarea
              value={formData.chiefComplaint}
              onChange={e => setFormData({ ...formData, chiefComplaint: e.target.value })}
              placeholder="Patient's main complaint..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>

          {/* Diagnosis */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Diagnosis
            </label>
            <textarea
              value={formData.diagnosis}
              onChange={e => setFormData({ ...formData, diagnosis: e.target.value })}
              placeholder="Diagnosis..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>

          {/* Medicines */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700">
                Medicines
              </label>
              <button
                type="button"
                onClick={addMedicine}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add Medicine
              </button>
            </div>

            <div className="space-y-3">
              {formData.medicines.map((medicine, index) => (
                <div
                  key={index}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-medium text-slate-600">
                      Medicine {index + 1}
                    </span>
                    {formData.medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedicine(index)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <input
                        type="text"
                        placeholder="Medicine name *"
                        value={medicine.name}
                        onChange={e => handleMedicineChange(index, 'name', e.target.value)}
                        required
                        className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Dosage (e.g., 500mg) *"
                        value={medicine.dosage}
                        onChange={e => handleMedicineChange(index, 'dosage', e.target.value)}
                        required
                        className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <input
                        type="text"
                        placeholder="Frequency (e.g., 2 times daily) *"
                        value={medicine.frequency}
                        onChange={e => handleMedicineChange(index, 'frequency', e.target.value)}
                        required
                        className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Duration (e.g., 5 days) *"
                        value={medicine.duration}
                        onChange={e => handleMedicineChange(index, 'duration', e.target.value)}
                        required
                        className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Special instructions (optional)"
                      value={medicine.instructions || ''}
                      onChange={e => handleMedicineChange(index, 'instructions', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advice */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Advice
            </label>
            <textarea
              value={formData.advice}
              onChange={e => setFormData({ ...formData, advice: e.target.value })}
              placeholder="General advice for the patient..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>

          {/* Follow-up */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Follow-up Date
              </label>
              <input
                type="date"
                value={formData.followUpDate}
                onChange={e => setFormData({ ...formData, followUpDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Follow-up Notes
              </label>
              <input
                type="text"
                value={formData.followUpNotes}
                onChange={e => setFormData({ ...formData, followUpNotes: e.target.value })}
                placeholder="Follow-up instructions..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Prescription
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
