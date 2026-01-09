/**
 * Clinic Data Store
 * Uses localStorage for demo - in production, this would connect to a database
 */

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  consultationFee: number;
  availableSlots: string[];
  image?: string;
}

export interface ClinicData {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  workingHours: string;
  rating: number;
  reviewCount: number;
  doctors: Doctor[];
  subscription: {
    plan: string;
    status: 'active' | 'trial' | 'expired';
    startDate: string;
    endDate?: string;
  };
  onboardingComplete: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'tdappointments_clinic';

// Generate a unique clinic ID from email
export function generateClinicId(email: string): string {
  return email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
}

// Generate default time slots
export function generateDefaultSlots(): string[] {
  return [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM', '05:30 PM'
  ];
}

// Create default clinic data after subscription
export function createClinicFromSubscription(
  email: string,
  name: string,
  plan: string
): ClinicData {
  const clinicId = generateClinicId(email);
  
  const clinic: ClinicData = {
    id: clinicId,
    name: name ? `${name}'s Clinic` : 'My Clinic',
    address: '',
    phone: '',
    email: email,
    workingHours: '9:00 AM - 6:00 PM',
    rating: 5.0,
    reviewCount: 0,
    doctors: [
      {
        id: `dr-${Date.now()}`,
        name: name || 'Doctor',
        specialty: 'General Physician',
        consultationFee: 500,
        availableSlots: generateDefaultSlots(),
      }
    ],
    subscription: {
      plan: plan,
      status: 'active',
      startDate: new Date().toISOString(),
    },
    onboardingComplete: false,
    createdAt: new Date().toISOString(),
  };

  saveClinic(clinic);
  return clinic;
}

// Save clinic data
export function saveClinic(clinic: ClinicData): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clinic));
  }
}

// Get clinic data
export function getClinic(): ClinicData | null {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }
  return null;
}

// Update clinic data
export function updateClinic(updates: Partial<ClinicData>): ClinicData | null {
  const clinic = getClinic();
  if (clinic) {
    const updated = { ...clinic, ...updates };
    saveClinic(updated);
    return updated;
  }
  return null;
}

// Add a doctor
export function addDoctor(doctor: Omit<Doctor, 'id'>): Doctor | null {
  const clinic = getClinic();
  if (clinic) {
    const newDoctor: Doctor = {
      ...doctor,
      id: `dr-${Date.now()}`,
    };
    clinic.doctors.push(newDoctor);
    saveClinic(clinic);
    return newDoctor;
  }
  return null;
}

// Update a doctor
export function updateDoctor(doctorId: string, updates: Partial<Doctor>): Doctor | null {
  const clinic = getClinic();
  if (clinic) {
    const index = clinic.doctors.findIndex(d => d.id === doctorId);
    if (index !== -1) {
      clinic.doctors[index] = { ...clinic.doctors[index], ...updates };
      saveClinic(clinic);
      return clinic.doctors[index];
    }
  }
  return null;
}

// Remove a doctor
export function removeDoctor(doctorId: string): boolean {
  const clinic = getClinic();
  if (clinic) {
    clinic.doctors = clinic.doctors.filter(d => d.id !== doctorId);
    saveClinic(clinic);
    return true;
  }
  return false;
}

// Get clinic by ID (for public booking page)
export function getClinicById(clinicId: string): ClinicData | null {
  const clinic = getClinic();
  if (clinic && clinic.id === clinicId) {
    return clinic;
  }
  // In production, this would fetch from database
  return null;
}

// Check if onboarding is complete
export function isOnboardingComplete(): boolean {
  const clinic = getClinic();
  return clinic?.onboardingComplete ?? false;
}

// Mark onboarding as complete
export function completeOnboarding(): void {
  updateClinic({ onboardingComplete: true });
}

// Clear clinic data (for testing)
export function clearClinic(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}
