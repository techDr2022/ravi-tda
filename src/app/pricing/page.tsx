import { Metadata } from 'next';
import { Pricing, FAQ, FinalCTA } from '@/components/sections';
import { Container } from '@/components/ui/Container';
import { SITE_CONFIG } from '@/lib/constants';

// Page-specific SEO metadata
export const metadata: Metadata = {
  title: 'Pricing - Affordable Healthcare Booking Plans',
  description:
    'Simple, transparent pricing for TDAppointments. Choose from Basic (₹2,999/mo), Professional (₹5,999/mo), or Enterprise (₹9,999/mo). Start with a 14-day free trial.',
  alternates: {
    canonical: `${SITE_CONFIG.url}/pricing`,
  },
  openGraph: {
    title: 'TDAppointments Pricing - Affordable Healthcare Booking Plans',
    description:
      'Simple, transparent pricing for TDAppointments. Start with a 14-day free trial. No credit card required.',
    url: `${SITE_CONFIG.url}/pricing`,
  },
};

/**
 * Pricing Page - Dedicated page for pricing information
 * Includes pricing comparison, FAQ, and conversion CTA
 */
export default function PricingPage() {
  return (
    <>
      {/* Pricing Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: 'TDAppointments',
            description: SITE_CONFIG.description,
            brand: {
              '@type': 'Brand',
              name: 'TDAppointments',
            },
            offers: [
              {
                '@type': 'Offer',
                name: 'Basic Plan',
                price: '2999',
                priceCurrency: 'INR',
                priceValidUntil: '2025-12-31',
                availability: 'https://schema.org/InStock',
              },
              {
                '@type': 'Offer',
                name: 'Professional Plan',
                price: '5999',
                priceCurrency: 'INR',
                priceValidUntil: '2025-12-31',
                availability: 'https://schema.org/InStock',
              },
              {
                '@type': 'Offer',
                name: 'Enterprise Plan',
                price: '9999',
                priceCurrency: 'INR',
                priceValidUntil: '2025-12-31',
                availability: 'https://schema.org/InStock',
              },
            ],
          }),
        }}
      />

      {/* Page Header */}
      <section className="pt-32 pb-8 bg-gradient-to-b from-primary-50 to-white">
        <Container>
          <div className="text-center">
            <h1 className="heading-xl text-healthcare-text mb-4">
              Simple, Transparent <span className="text-gradient">Pricing</span>
            </h1>
            <p className="body-lg max-w-2xl mx-auto">
              No hidden fees. No long-term contracts. Start with a 14-day free trial 
              and upgrade anytime as your clinic grows.
            </p>
          </div>
        </Container>
      </section>

      {/* Pricing Section without header */}
      <Pricing showHeader={false} />

      {/* FAQ Section */}
      <FAQ />

      {/* Final CTA */}
      <FinalCTA />
    </>
  );
}
