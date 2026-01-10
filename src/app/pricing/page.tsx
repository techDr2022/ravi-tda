import { Metadata } from 'next';
import { Pricing, FAQ, FinalCTA } from '@/components/sections';
import { Container } from '@/components/ui/Container';
import { SITE_CONFIG } from '@/lib/constants';

/**
 * Pricing Page SEO Metadata
 * Optimised for pricing and subscription keywords
 * Title: 55-60 characters, Description: 150-160 characters (British English)
 */
export const metadata: Metadata = {
  title: 'Pricing: Clinic Appointment Software Plans & Pricing',
  description: 'Simple, transparent pricing for clinic appointment booking software. Plans from ₹7,999/year. Start with a 14-day free trial. No credit card required.',
  keywords: [
    'clinic appointment software pricing',
    'healthcare booking system cost',
    'doctor appointment software price',
    'clinic management software plans',
    'appointment booking SaaS pricing India',
  ],
  alternates: {
    canonical: `${SITE_CONFIG.url}/pricing`,
  },
  openGraph: {
    title: 'TDAppointments Pricing: Clinic Appointment Software Plans',
    description: 'Simple, transparent pricing for clinic appointment booking software. Plans from ₹7,999/year. Start with a 14-day free trial.',
    url: `${SITE_CONFIG.url}/pricing`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Pricing: Clinic Appointment Software Plans & Pricing',
    description: 'Simple, transparent pricing for clinic appointment booking software. Plans from ₹7,999/year.',
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
                price: '7999',
                priceCurrency: 'INR',
                priceValidUntil: '2025-12-31',
                availability: 'https://schema.org/InStock',
                priceSpecification: {
                  '@type': 'UnitPriceSpecification',
                  price: '7999',
                  priceCurrency: 'INR',
                  valueAddedTaxIncluded: false,
                },
              },
              {
                '@type': 'Offer',
                name: 'Professional Plan',
                price: '12999',
                priceCurrency: 'INR',
                priceValidUntil: '2025-12-31',
                availability: 'https://schema.org/InStock',
                priceSpecification: {
                  '@type': 'UnitPriceSpecification',
                  price: '12999',
                  priceCurrency: 'INR',
                  valueAddedTaxIncluded: false,
                },
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
