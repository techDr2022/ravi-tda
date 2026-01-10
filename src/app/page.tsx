import { Metadata } from 'next';
import {
  Hero,
  WhyTDAppointments,
  Features,
  DashboardPreview,
  HowItWorks,
  Pricing,
  ClientsSlider,
  FAQ,
  GeoSEO,
  BlogPreview,
  FinalCTA,
} from '@/components/sections';
import { SITE_CONFIG, FAQ_ITEMS } from '@/lib/constants';

/**
 * Homepage SEO Metadata
 * Optimised for healthcare appointment booking SaaS keywords
 * Title: 55-60 characters, Description: 150-160 characters (British English)
 */
export const metadata: Metadata = {
  title: 'Clinic Appointment Booking Software, Doctor Booking System',
  description: 'Automate clinic bookings, WhatsApp reminders, and payments for healthcare practices. Trusted by 1200+ clinics across India and globally. Start free trial.',
  keywords: [
    'clinic appointment booking software',
    'doctor appointment system',
    'hospital appointment management software',
    'healthcare appointment booking SaaS',
    'WhatsApp appointment reminders for clinics',
    'clinic management software India',
    'appointment scheduling system',
    'telemedicine appointment booking',
  ],
  alternates: {
    canonical: SITE_CONFIG.url,
  },
  openGraph: {
    title: 'TDAppointments: Clinic Appointment Booking Software for Healthcare',
    description: 'Automate clinic bookings, WhatsApp reminders, and payments for healthcare practices. Trusted by 1200+ clinics globally.',
    url: SITE_CONFIG.url,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clinic Appointment Booking Software, Doctor Booking System',
    description: 'Automate clinic bookings, WhatsApp reminders, and payments for healthcare practices.',
  },
};

/**
 * Homepage - Main landing page with all sections
 * Optimized for conversions and SEO
 */
export default function HomePage() {
  return (
    <>
      {/* FAQ Schema Markup - GEO Optimised for AI Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQ_ITEMS.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
              },
            })),
          }),
        }}
      />

      {/* HowTo Schema - GEO Optimised: Helps AI understand step-by-step processes */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'How to Set Up TDAppointments Clinic Appointment Booking Software',
            description: 'Step-by-step guide to setting up TDAppointments for your clinic in less than 24 hours',
            totalTime: 'PT30M',
            estimatedCost: {
              '@type': 'MonetaryAmount',
              currency: 'INR',
              value: '7999',
            },
            step: [
              {
                '@type': 'HowToStep',
                position: 1,
                name: 'Subscribe to a Plan',
                text: 'Choose your plan (Basic ₹7,999/year, Professional ₹12,999/year, or Enterprise - Contact Us, all excluding GST) and complete transaction via secure payment gateway. All plans include a 14-day free trial with no credit card required.',
                url: `${SITE_CONFIG.url}/pricing`,
              },
              {
                '@type': 'HowToStep',
                position: 2,
                name: 'Instant Dashboard Access',
                text: 'Get immediate access to your personalised clinic dashboard after subscription. You will receive login credentials via email.',
              },
              {
                '@type': 'HowToStep',
                position: 3,
                name: 'Add Clinic & Doctors',
                text: 'Set up your clinic profile with name, address, phone number, and specialities. Add doctors with their individual schedules, consultation types, and fees.',
              },
              {
                '@type': 'HowToStep',
                position: 4,
                name: 'Enable Bookings',
                text: 'Connect Google My Business for Book Now button integration, configure available time slots, and enable online appointment bookings. Set up WhatsApp Business API for automated reminders.',
              },
              {
                '@type': 'HowToStep',
                position: 5,
                name: 'Start Receiving Appointments',
                text: 'Your patients can now book appointments 24/7 through your booking page, Google My Business, or directly via WhatsApp. You will receive real-time notifications for all bookings.',
              },
            ],
          }),
        }}
      />

      {/* WebPage Schema with MainEntity - GEO Optimised: Helps AI understand page purpose */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            '@id': `${SITE_CONFIG.url}/#webpage`,
            url: SITE_CONFIG.url,
            name: 'TDAppointments - Clinic Appointment Booking Software',
            description: SITE_CONFIG.description,
            inLanguage: 'en-IN',
            isPartOf: {
              '@type': 'WebSite',
              name: 'TDAppointments',
              url: SITE_CONFIG.url,
            },
            about: {
              '@type': 'Thing',
              name: 'Healthcare Appointment Booking Software',
              description: 'Cloud-based SaaS platform for managing clinic appointments, patient records, and teleconsultations',
            },
            mainEntity: {
              '@type': 'SoftwareApplication',
              name: 'TDAppointments',
              applicationCategory: 'HealthApplication',
              operatingSystem: 'Web',
            },
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Home',
                  item: SITE_CONFIG.url,
                },
              ],
            },
          }),
        }}
      />

      {/* Hero Section - Above the fold content */}
      <Hero />

      {/* Why TDAppointments - Value propositions */}
      <WhyTDAppointments />

      {/* Features Section - Product capabilities */}
      <Features />

      {/* Dashboard Preview - Interactive demo */}
      <DashboardPreview />

      {/* How It Works - Onboarding steps */}
      <HowItWorks />

      {/* Pricing Section - Plans and pricing */}
      <Pricing />

      {/* Clients/Doctors Slider - Testimonials */}
      <ClientsSlider />

      {/* GEO SEO Section - Location-based content */}
      <GeoSEO />

      {/* Blog Preview - Latest articles */}
      <BlogPreview />

      {/* FAQ Section - Common questions */}
      <FAQ />

      {/* Final CTA - Strong call to action */}
      <FinalCTA />
    </>
  );
}
