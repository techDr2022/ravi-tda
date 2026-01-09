// TDAppointments - Constants and Configuration

export const SITE_CONFIG = {
  name: 'TDAppointments',
  tagline: 'Smart Appointment Booking for Healthcare Clinics & Hospitals',
  description: 'Automate bookings, reminders, payments, and teleconsultations – all from one dashboard. Trusted by 1200+ clinics across India, USA, UK, and Middle East.',
  url: 'https://tdappointments.com',
  locale: 'en_IN',
  twitter: '@tdappointments',
};

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/#features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/blog', label: 'Blog' },
  { href: '/#faq', label: 'FAQ' },
] as const;

export const TRUST_BADGES = [
  { icon: 'CheckCircle', text: '1200+ Clinics Trust Us' },
  { icon: 'Shield', text: 'RWG Partner' },
  { icon: 'MapPin', text: 'GMB Book Now Enabled' },
] as const;

export const WHY_US_POINTS = [
  {
    title: 'Reduce No-Shows by 60%',
    description: 'Automated WhatsApp reminders ensure patients never forget their appointments',
    icon: 'TrendingDown',
    stat: '60%',
    statLabel: 'Reduction',
  },
  {
    title: 'Increase Google Reviews',
    description: 'Post-consultation review reminders help boost your clinic\'s online reputation',
    icon: 'Star',
    stat: '4.8★',
    statLabel: 'Avg Rating',
  },
  {
    title: 'Save Staff Time',
    description: 'Automation handles bookings, reminders, and follow-ups so your team can focus on care',
    icon: 'Clock',
    stat: '10+ hrs',
    statLabel: 'Saved Weekly',
  },
] as const;

export const FEATURES = [
  {
    title: 'GMB Book Now Button',
    description: 'Direct Google integration for instant appointment bookings from your business listing',
    icon: 'Globe',
    color: 'primary',
  },
  {
    title: 'WhatsApp Automation',
    description: 'Appointment confirmations, reminders, and review requests via WhatsApp Business API',
    icon: 'MessageCircle',
    color: 'accent',
  },
  {
    title: 'Teleconsultation (Twilio)',
    description: 'HD video and voice consultations with built-in scheduling and payment collection',
    icon: 'Video',
    color: 'secondary',
  },
  {
    title: 'Razorpay Payments',
    description: 'Secure online consultation payments with automatic invoicing and reconciliation',
    icon: 'CreditCard',
    color: 'primary',
  },
  {
    title: 'Clinic Dashboard',
    description: 'Individual dashboards for each clinic with real-time appointment tracking',
    icon: 'LayoutDashboard',
    color: 'accent',
  },
  {
    title: 'Patient Records',
    description: 'Secure cloud-based patient management with history and document storage',
    icon: 'FileText',
    color: 'secondary',
  },
  {
    title: 'Monthly Analytics',
    description: 'Comprehensive reports on appointments, revenue, and patient demographics',
    icon: 'BarChart3',
    color: 'primary',
  },
  {
    title: 'Secure Cloud Hosting',
    description: 'HIPAA-compliant infrastructure with 99.9% uptime and daily backups',
    icon: 'Cloud',
    color: 'accent',
  },
] as const;

export const DASHBOARD_TABS = [
  { id: 'appointments', label: 'Appointments', icon: 'Calendar' },
  { id: 'patients', label: 'Patients', icon: 'Users' },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
  { id: 'payments', label: 'Payments', icon: 'CreditCard' },
  { id: 'reviews', label: 'Reviews', icon: 'Star' },
] as const;

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Subscribe to a Plan',
    description: 'Choose your plan and complete payment via Razorpay',
    icon: 'CreditCard',
  },
  {
    step: 2,
    title: 'Instant Dashboard Access',
    description: 'Get immediate access to your personalized clinic dashboard',
    icon: 'Zap',
  },
  {
    step: 3,
    title: 'Add Clinic & Doctors',
    description: 'Set up your clinic profile and add doctors with their schedules',
    icon: 'Building2',
  },
  {
    step: 4,
    title: 'Enable Bookings',
    description: 'Connect GMB, configure slots, and enable online bookings',
    icon: 'ToggleRight',
  },
  {
    step: 5,
    title: 'Start Receiving Appointments',
    description: 'Your patients can now book appointments 24/7',
    icon: 'CalendarCheck',
  },
] as const;

export const PRICING_PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 2999,
    period: 'month',
    description: 'Perfect for small clinics getting started',
    popular: false,
    features: [
      'Appointment booking',
      'WhatsApp notifications',
      'Clinic dashboard',
      'Patient management',
      'Email support',
    ],
    notIncluded: [
      'Google Book Now',
      'Review reminders',
      'Analytics',
      'Teleconsultation',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 5999,
    period: 'month',
    description: 'For growing practices that need automation',
    popular: true,
    features: [
      'Everything in Basic',
      'Google Book Now integration',
      'WhatsApp review reminders',
      'Monthly analytics',
      'Razorpay payments',
      'Teleconsultation (Twilio)',
      'Priority support',
    ],
    notIncluded: [
      'Multi-branch support',
      'API access',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 9999,
    period: 'month',
    description: 'For multi-location healthcare groups',
    popular: false,
    features: [
      'Everything in Professional',
      'Multi-branch clinics',
      'Dedicated account manager',
      'Custom integrations',
      'API access',
      'SLA support',
      'White-label options',
    ],
    notIncluded: [],
  },
] as const;

export const FAQ_ITEMS = [
  {
    question: 'Is TDAppointments suitable for small clinics?',
    answer: 'Absolutely! Our Basic plan is specifically designed for small clinics and solo practitioners. You get appointment booking, WhatsApp notifications, and a complete clinic dashboard at just ₹2,999/month.',
  },
  {
    question: 'Can I use my own WhatsApp number?',
    answer: 'Yes! We integrate with WhatsApp Business API, allowing you to use your clinic\'s existing WhatsApp Business number. All messages go from your number, maintaining your brand identity.',
  },
  {
    question: 'Is patient data secure?',
    answer: 'Security is our top priority. We use bank-grade encryption, store data on secure cloud servers with daily backups, and comply with healthcare data protection standards. Your patient data is never shared with third parties.',
  },
  {
    question: 'Does it support multiple doctors?',
    answer: 'Yes! All plans support multiple doctors. Each doctor can have their own schedule, availability, and consultation fees. The Professional and Enterprise plans offer advanced multi-doctor management features.',
  },
  {
    question: 'How fast can I go live?',
    answer: 'You can be live in less than 24 hours! After subscription, you get instant dashboard access. Add your clinic details, doctor schedules, and you\'re ready to accept bookings.',
  },
  {
    question: 'What payment methods do you support?',
    answer: 'We integrate with Razorpay, supporting all major payment methods including UPI, credit/debit cards, net banking, and wallets. Patients can pay online when booking or before teleconsultations.',
  },
  {
    question: 'Can I try before I buy?',
    answer: 'Yes! We offer a 14-day free trial on all plans. No credit card required. Experience the full feature set and decide if TDAppointments is right for your practice.',
  },
  {
    question: 'Do you provide training and onboarding?',
    answer: 'Yes, we provide free onboarding for all plans. Professional and Enterprise plans include dedicated onboarding calls. We also have video tutorials and documentation available 24/7.',
  },
] as const;

export const GEO_SEO_CONTENT = [
  {
    title: 'Appointment Booking Software in India',
    description: 'Leading healthcare appointment management system trusted by 1200+ clinics across India. Designed for Indian healthcare practices with Razorpay integration and WhatsApp automation.',
    keywords: ['appointment booking india', 'clinic software india', 'doctor appointment system'],
  },
  {
    title: 'Healthcare Booking System for Clinics',
    description: 'Comprehensive clinic management solution with online booking, patient records, and automated reminders. Perfect for single and multi-specialty clinics.',
    keywords: ['clinic booking system', 'healthcare scheduling', 'medical appointment software'],
  },
  {
    title: 'Hospital Appointment System in Hyderabad',
    description: 'Trusted by leading hospitals in Hyderabad for managing OPD appointments. Integrate with Google My Business and enable online booking for your hospital.',
    keywords: ['hospital software hyderabad', 'appointment system hyderabad', 'healthcare IT hyderabad'],
  },
  {
    title: 'Teleconsultation Software for Doctors',
    description: 'Secure video consultation platform powered by Twilio. Offer teleconsultation services with integrated scheduling, payments, and prescription management.',
    keywords: ['telemedicine software', 'video consultation doctors', 'online doctor consultation'],
  },
  {
    title: 'WhatsApp Appointment Booking System',
    description: 'Automated WhatsApp notifications for appointment confirmations, reminders, and review requests. Integrate with WhatsApp Business API for your clinic.',
    keywords: ['whatsapp booking system', 'whatsapp appointment reminders', 'clinic whatsapp automation'],
  },
] as const;

export const SAMPLE_APPOINTMENTS = [
  { id: 1, patient: 'Rahul Sharma', time: '10:00 AM', type: 'Follow-up', status: 'confirmed' },
  { id: 2, patient: 'Priya Patel', time: '10:30 AM', type: 'New Consultation', status: 'confirmed' },
  { id: 3, patient: 'Amit Kumar', time: '11:00 AM', type: 'Video Call', status: 'pending' },
  { id: 4, patient: 'Sunita Devi', time: '11:30 AM', type: 'Check-up', status: 'confirmed' },
  { id: 5, patient: 'Vikram Singh', time: '12:00 PM', type: 'Follow-up', status: 'cancelled' },
] as const;

export const SAMPLE_STATS = {
  totalAppointments: 156,
  todayAppointments: 12,
  completedToday: 8,
  revenue: 45600,
  newPatients: 23,
  reviewsThisMonth: 45,
} as const;
