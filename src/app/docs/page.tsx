import { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { SITE_CONFIG } from '@/lib/constants';
import { BookOpen, FileText, Video, Code, Settings, Users, Calendar, Shield, CreditCard } from 'lucide-react';
import Link from 'next/link';

/**
 * Documentation Page SEO Metadata
 */
export const metadata: Metadata = {
  title: 'Documentation | TDAppointments',
  description: 'Complete TDAppointments documentation. Learn how to set up, use, and customize your clinic appointment booking system.',
  keywords: [
    'TDAppointments documentation',
    'clinic software guide',
    'appointment booking tutorial',
    'healthcare software docs',
    'setup guide',
  ],
  alternates: {
    canonical: `${SITE_CONFIG.url}/docs`,
  },
  openGraph: {
    title: 'Documentation | TDAppointments',
    description: 'Complete TDAppointments documentation and guides for healthcare appointment booking software.',
    url: `${SITE_CONFIG.url}/docs`,
    type: 'website',
  },
};

export default function DocumentationPage() {
  const docCategories = [
    {
      icon: BookOpen,
      title: 'Getting Started',
      description: 'Quick start guides and setup instructions',
      articles: [
        { title: 'Introduction to TDAppointments', href: '/docs/getting-started/introduction' },
        { title: 'Creating Your Account', href: '/docs/getting-started/account-setup' },
        { title: 'Setting Up Your First Clinic', href: '/docs/getting-started/clinic-setup' },
        { title: 'Adding Your First Doctor', href: '/docs/getting-started/adding-doctors' },
      ],
    },
    {
      icon: Calendar,
      title: 'Appointments',
      description: 'Manage appointments and schedules',
      articles: [
        { title: 'Configuring Appointment Slots', href: '/docs/appointments/slots' },
        { title: 'Setting Up Availability', href: '/docs/appointments/availability' },
        { title: 'Managing Bookings', href: '/docs/appointments/managing' },
        { title: 'Cancellation & Rescheduling', href: '/docs/appointments/cancellation' },
      ],
    },
    {
      icon: Users,
      title: 'Patient Management',
      description: 'Manage patient records and information',
      articles: [
        { title: 'Patient Profiles', href: '/docs/patients/profiles' },
        { title: 'Patient History', href: '/docs/patients/history' },
        { title: 'Patient Records', href: '/docs/patients/records' },
        { title: 'Prescription Management', href: '/docs/patients/prescriptions' },
      ],
    },
    {
      icon: Settings,
      title: 'Configuration',
      description: 'Customize your clinic settings',
      articles: [
        { title: 'Clinic Settings', href: '/docs/configuration/clinic-settings' },
        { title: 'Notification Settings', href: '/docs/configuration/notifications' },
        { title: 'WhatsApp Integration', href: '/docs/configuration/whatsapp' },
        { title: 'Google My Business Setup', href: '/docs/configuration/gmb' },
      ],
    },
    {
      icon: CreditCard,
      title: 'Payments',
      description: 'Payment processing and billing',
      articles: [
        { title: 'Payment Gateway Setup', href: '/docs/payments/gateway-setup' },
        { title: 'Managing Payments', href: '/docs/payments/managing' },
        { title: 'Refunds & Disputes', href: '/docs/payments/refunds' },
        { title: 'Payment Reports', href: '/docs/payments/reports' },
      ],
    },
    {
      icon: Shield,
      title: 'Security & Privacy',
      description: 'Security settings and data protection',
      articles: [
        { title: 'Security Best Practices', href: '/docs/security/best-practices' },
        { title: 'HIPAA Compliance', href: '/docs/security/hipaa' },
        { title: 'Data Backup & Recovery', href: '/docs/security/backup' },
        { title: 'Access Control', href: '/docs/security/access-control' },
      ],
    },
    {
      icon: Video,
      title: 'Video Tutorials',
      description: 'Watch step-by-step video guides',
      articles: [
        { title: 'Dashboard Overview', href: '/docs/videos/dashboard' },
        { title: 'Appointment Management', href: '/docs/videos/appointments' },
        { title: 'Patient Management', href: '/docs/videos/patients' },
        { title: 'Analytics & Reports', href: '/docs/videos/analytics' },
      ],
    },
    {
      icon: Code,
      title: 'API & Integrations',
      description: 'Developer resources and API documentation',
      articles: [
        { title: 'API Overview', href: '/api' },
        { title: 'Authentication', href: '/api/auth' },
        { title: 'Webhooks', href: '/api/webhooks' },
        { title: 'Third-party Integrations', href: '/docs/integrations' },
      ],
    },
  ];

  return (
    <>
      {/* Page Header */}
      <section className="pt-24 pb-8 bg-gradient-to-b from-primary-50 to-white">
        <Container>
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-primary-600" />
              </div>
            </div>
            <h1 className="heading-xl text-healthcare-text mb-4">
              Documentation
            </h1>
            <p className="body-lg text-slate-600 max-w-2xl mx-auto">
              Complete guides and tutorials to help you master TDAppointments
            </p>
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-white">
        <Container size="lg">
          {/* Documentation Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {docCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:border-primary-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-bold text-slate-900 mb-1">{category.title}</h2>
                      <p className="text-xs text-slate-600">{category.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {category.articles.map((article, articleIndex) => (
                      <li key={articleIndex}>
                        <Link
                          href={article.href}
                          className="text-sm text-slate-700 hover:text-primary-600 hover:underline flex items-start gap-2"
                        >
                          <FileText className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
                          <span>{article.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Quick Links */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl border border-primary-200 p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4 text-center">
              Quick Links
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/faq"
                className="bg-white rounded-lg p-4 border border-primary-200 hover:border-primary-400 hover:shadow-md transition-all text-center"
              >
                <div className="text-primary-600 font-semibold mb-1">FAQs</div>
                <div className="text-sm text-slate-600">Common questions</div>
              </Link>
              <Link
                href="/api"
                className="bg-white rounded-lg p-4 border border-primary-200 hover:border-primary-400 hover:shadow-md transition-all text-center"
              >
                <div className="text-primary-600 font-semibold mb-1">API Reference</div>
                <div className="text-sm text-slate-600">Developer resources</div>
              </Link>
              <Link
                href="/help"
                className="bg-white rounded-lg p-4 border border-primary-200 hover:border-primary-400 hover:shadow-md transition-all text-center"
              >
                <div className="text-primary-600 font-semibold mb-1">Help Center</div>
                <div className="text-sm text-slate-600">Get support</div>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
