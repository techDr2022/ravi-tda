import { Metadata } from 'next';
import { SITE_CONFIG, FAQ_ITEMS } from '@/lib/constants';
import { FAQContent } from './FAQContent';

/**
 * FAQs Page SEO Metadata
 */
export const metadata: Metadata = {
  title: 'FAQs - Frequently Asked Questions | TDAppointments',
  description: 'Find answers to common questions about TDAppointments healthcare appointment booking software. Learn about pricing, features, security, support, and more.',
  keywords: [
    'TDAppointments FAQ',
    'appointment booking software questions',
    'clinic management software FAQ',
    'healthcare booking system help',
    'appointment software support',
  ],
  alternates: {
    canonical: `${SITE_CONFIG.url}/faq`,
  },
  openGraph: {
    title: 'FAQs - Frequently Asked Questions | TDAppointments',
    description: 'Find answers to common questions about TDAppointments healthcare appointment booking software.',
    url: `${SITE_CONFIG.url}/faq`,
    type: 'website',
  },
};

/**
 * FAQs Page - Comprehensive FAQ page with categories and search
 * Server component wrapper that renders the client component
 */
export default function FAQPage() {
  // Generate FAQ schema markup for SEO
  const faqSchema = {
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
  };

  return (
    <>
      {/* FAQ Schema Markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <FAQContent />
    </>
  );
}
