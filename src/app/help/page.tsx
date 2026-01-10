import { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { SITE_CONFIG } from '@/lib/constants';
import { HelpCircle, BookOpen, Video, MessageCircle, Mail, Phone, Search } from 'lucide-react';
import Link from 'next/link';

/**
 * Help Center Page SEO Metadata
 */
export const metadata: Metadata = {
  title: 'Help Center | TDAppointments',
  description: 'Get help with TDAppointments. Access documentation, tutorials, FAQs, video guides, and contact our support team for assistance.',
  keywords: [
    'TDAppointments help',
    'clinic software support',
    'appointment booking help',
    'healthcare software documentation',
    'technical support',
  ],
  alternates: {
    canonical: `${SITE_CONFIG.url}/help`,
  },
  openGraph: {
    title: 'Help Center | TDAppointments',
    description: 'Get help with TDAppointments. Access documentation, tutorials, FAQs, and contact support.',
    url: `${SITE_CONFIG.url}/help`,
    type: 'website',
  },
};

export default function HelpCenterPage() {
  const helpSections = [
    {
      icon: BookOpen,
      title: 'Getting Started',
      description: 'New to TDAppointments? Start here with step-by-step guides.',
      links: [
        { label: 'Quick Start Guide', href: '/docs/getting-started' },
        { label: 'Setting Up Your Clinic', href: '/docs/setup-clinic' },
        { label: 'Adding Doctors', href: '/docs/add-doctors' },
        { label: 'Configuring Appointments', href: '/docs/appointments' },
      ],
    },
    {
      icon: Video,
      title: 'Video Tutorials',
      description: 'Watch video guides to learn how to use TDAppointments.',
      links: [
        { label: 'Dashboard Overview', href: '/docs/videos/dashboard' },
        { label: 'Patient Management', href: '/docs/videos/patients' },
        { label: 'WhatsApp Integration', href: '/docs/videos/whatsapp' },
        { label: 'Payment Setup', href: '/docs/videos/payments' },
      ],
    },
    {
      icon: MessageCircle,
      title: 'Common Questions',
      description: 'Find answers to frequently asked questions.',
      links: [
        { label: 'View All FAQs', href: '/faq' },
        { label: 'Pricing Questions', href: '/faq?category=Pricing' },
        { label: 'Technical Issues', href: '/faq?category=Support' },
        { label: 'Feature Guides', href: '/faq?category=Features' },
      ],
    },
    {
      icon: Search,
      title: 'Search Documentation',
      description: 'Search our knowledge base for specific topics.',
      links: [
        { label: 'Full Documentation', href: '/docs' },
        { label: 'API Reference', href: '/api' },
        { label: 'Troubleshooting', href: '/docs/troubleshooting' },
        { label: 'Best Practices', href: '/docs/best-practices' },
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
                <HelpCircle className="w-8 h-8 text-primary-600" />
              </div>
            </div>
            <h1 className="heading-xl text-healthcare-text mb-4">
              Help <span className="text-gradient">Center</span>
            </h1>
            <p className="body-lg text-slate-600 max-w-2xl mx-auto">
              Find answers, tutorials, and guides to get the most out of TDAppointments
            </p>
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-white">
        <Container size="lg">
          {/* Help Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {helpSections.map((section, index) => {
              const Icon = section.icon;
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
                      <h2 className="text-xl font-bold text-slate-900 mb-2">{section.title}</h2>
                      <p className="text-sm text-slate-600">{section.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <Link
                          href={link.href}
                          className="text-sm text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 bg-primary-600 rounded-full"></span>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Contact Support Section */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl border border-primary-200 p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Still Need Help?
            </h2>
            <p className="text-slate-700 mb-6 max-w-2xl mx-auto">
              Our support team is available to assist you. Contact us via email or phone for personalized help.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="mailto:info@techdr.in"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
              >
                <Mail className="w-5 h-5" />
                Email Support
              </a>
              <a
                href="tel:+919032292171"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 rounded-lg font-medium border-2 border-primary-600 hover:bg-primary-50 transition-colors"
              >
                <Phone className="w-5 h-5" />
                +91 90322 92171
              </a>
            </div>
            <p className="text-sm text-slate-600 mt-4">
              Response time: Within 2 hours during business hours (Mon-Fri, 9 AM - 6 PM IST)
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
