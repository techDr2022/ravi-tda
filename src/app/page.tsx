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

// Page-specific SEO metadata
export const metadata: Metadata = {
  title: 'Healthcare Appointment Booking System for Clinics & Hospitals',
  description: SITE_CONFIG.description,
  alternates: {
    canonical: SITE_CONFIG.url,
  },
};

/**
 * Homepage - Main landing page with all sections
 * Optimized for conversions and SEO
 */
export default function HomePage() {
  return (
    <>
      {/* FAQ Schema Markup */}
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
