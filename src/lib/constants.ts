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
  { icon: 'Shield', text: 'Google Partner' },
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
    title: 'Secure Payments',
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
    description: 'Choose your plan and complete transaction via secure payment gateway',
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
    price: 7999,
    period: 'year',
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
    price: 12999,
    period: 'year',
    description: 'For growing practices that need automation',
    popular: true,
    features: [
      'Everything in Basic',
      'Google Book Now integration',
      'WhatsApp review reminders',
      'Monthly analytics',
      'Secure payments',
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
    price: null,
    period: 'year',
    description: 'For multi-location healthcare groups',
    popular: false,
    contactUs: true,
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
    answer: 'Absolutely! Our Basic plan is specifically designed for small clinics and solo practitioners. You get appointment booking, WhatsApp notifications, and a complete clinic dashboard at just ₹7,999/year (excluding GST). The system is built to scale with your practice, so you can upgrade to Professional or Enterprise plans as your clinic grows.',
  },
  {
    question: 'Can I use my own WhatsApp number?',
    answer: 'Yes! We integrate with WhatsApp Business API, allowing you to use your clinic\'s existing WhatsApp Business number. All messages go from your number, maintaining your brand identity. The integration process takes less than 48 hours and our support team will guide you through the setup.',
  },
  {
    question: 'Is patient data secure?',
    answer: 'Security is our top priority. We use bank-grade encryption (AES-256), store data on secure cloud servers with daily automated backups, and comply with healthcare data protection standards including HIPAA guidelines. Your patient data is never shared with third parties, and all access is logged and monitored. We conduct regular security audits and maintain SOC 2 compliance.',
  },
  {
    question: 'Does it support multiple doctors?',
    answer: 'Yes! All plans support multiple doctors. Each doctor can have their own schedule, availability, consultation fees, and speciality settings. The Professional and Enterprise plans offer advanced multi-doctor management features including department-wise scheduling, doctor-specific dashboards, and advanced reporting per doctor.',
  },
  {
    question: 'How fast can I go live?',
    answer: 'You can be live in less than 24 hours! After subscription, you get instant dashboard access. Simply add your clinic details, doctor schedules, consultation types, and available time slots. Once configured, you can share your booking link or enable Google My Business integration to start receiving appointments immediately.',
  },
  {
    question: 'What payment methods do you support?',
    answer: 'We integrate with secure payment gateways, supporting all major transaction methods including UPI, credit/debit cards, net banking, and digital wallets (Paytm, PhonePe, GPay). Patients can complete transactions online when booking appointments or before teleconsultations. All transactions are processed securely and automatically reflected in your dashboard with detailed transaction reports.',
  },
  {
    question: 'Can I try before I buy?',
    answer: 'Yes! We offer a 14-day free trial on all plans with full feature access. No credit card required. During the trial, you can experience the complete feature set including appointment booking, WhatsApp reminders, patient management, and analytics. Our support team is available to help you during the trial period.',
  },
  {
    question: 'Do you provide training and onboarding?',
    answer: 'Yes, we provide free onboarding and training for all plans. Professional and Enterprise plans include dedicated onboarding calls with our implementation specialists. We also have comprehensive video tutorials, step-by-step documentation, and a knowledge base available 24/7. Our support team responds to queries within 2 hours during business hours.',
  },
  // GEO Optimisation: Additional FAQs that AI search engines commonly query
  {
    question: 'What is TDAppointments and who is it for?',
    answer: 'TDAppointments is a cloud-based healthcare appointment booking and clinic management SaaS platform designed for clinics, hospitals, doctors, and healthcare administrators. It is suitable for solo practitioners, small clinics, multi-speciality practices, and large hospital networks across India, USA, UK, and Middle East. The platform helps healthcare providers manage appointments, patient records, teleconsultations, and automate communication via WhatsApp.',
  },
  {
    question: 'How much does TDAppointments cost?',
    answer: 'TDAppointments offers three pricing plans: Basic at ₹7,999/year, Professional at ₹12,999/year, and Enterprise (Contact Us for pricing). All prices exclude GST. All plans include a 14-day free trial with no credit card required. Pricing is in Indian Rupees (INR) and billed yearly. The Basic plan is perfect for small clinics, Professional for growing practices needing automation, and Enterprise for multi-location healthcare groups.',
  },
  {
    question: 'What features are included in TDAppointments?',
    answer: 'TDAppointments includes online appointment booking, WhatsApp automated reminders and confirmations, teleconsultation platform via Twilio, secure payment processing, patient management system with records and history, Google My Business Book Now integration, monthly analytics and reports, multi-doctor scheduling, prescription management, and secure cloud hosting with 99.9% uptime guarantee.',
  },
  {
    question: 'Does TDAppointments integrate with Google My Business?',
    answer: 'Yes! TDAppointments fully integrates with Google My Business, allowing patients to book appointments directly from your Google Business listing via the Book Now button. This feature is included in Professional and Enterprise plans. The integration helps you accept bookings directly from Google Search and Maps, improving your online visibility and reducing no-shows.',
  },
] as const;

export const GEO_SEO_CONTENT = [
  {
    title: 'Appointment Booking Software in India',
    description: 'Leading healthcare appointment management system trusted by 1200+ clinics across India. Designed for Indian healthcare practices with secure payment gateway integration and WhatsApp automation.',
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
