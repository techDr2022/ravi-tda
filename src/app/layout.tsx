import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { LayoutWrapper } from '@/components/layout';
import { SITE_CONFIG } from '@/lib/constants';
import { CashfreeProvider, AuthProvider } from '@/components/providers';

// Custom fonts
const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
  display: 'swap',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
  display: 'swap',
});

/**
 * Root Layout SEO Metadata
 * Global metadata configuration for all pages
 * Individual pages can override specific fields
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    'healthcare appointment booking',
    'clinic management software',
    'doctor appointment system',
    'hospital appointment management software',
    'healthcare appointment booking SaaS',
    'WhatsApp appointment reminders for clinics',
    'clinic management software India',
    'appointment scheduling system',
    'telemedicine appointment booking',
    'google my business booking',
    'teleconsultation platform',
    'patient management system',
    'healthcare SaaS',
    'appointment booking india',
    'clinic software',
  ],
  authors: [{ name: 'TDAppointments', url: SITE_CONFIG.url }],
  creator: 'TDAppointments',
  publisher: 'TDAppointments',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: SITE_CONFIG.locale,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TDAppointments - Healthcare Appointment Booking System for Clinics and Hospitals',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    creator: SITE_CONFIG.twitter,
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Placeholder for Google Search Console verification
    // Replace with actual verification code from Google Search Console
    google: process.env.GOOGLE_SITE_VERIFICATION || 'google-site-verification-code',
    // Placeholder for Bing Webmaster Tools verification
    // Replace with actual verification code from Bing Webmaster Tools
    other: {
      'msvalidate.01': process.env.BING_SITE_VERIFICATION || 'bing-verification-code',
    },
  },
  alternates: {
    canonical: SITE_CONFIG.url,
  },
};

// Viewport configuration
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#008080' },
    { media: '(prefers-color-scheme: dark)', color: '#006666' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Preconnect to important origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Preconnect to Cashfree SDK for faster loading and better caching */}
        <link rel="preconnect" href="https://sdk.cashfree.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://sdk.cashfree.com" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* SoftwareApplication Schema - Primary structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'TDAppointments',
              applicationCategory: 'HealthApplication',
              operatingSystem: 'Web-based (Windows, macOS, Linux, iOS, Android compatible)',
              offers: {
                '@type': 'AggregateOffer',
                lowPrice: '7999',
                highPrice: '12999',
                priceCurrency: 'INR',
                offerCount: '2',
                availability: 'https://schema.org/InStock',
                priceSpecification: [
                  {
                    '@type': 'UnitPriceSpecification',
                    price: '7999',
                    priceCurrency: 'INR',
                    name: 'Basic Plan',
                    billingIncrement: 'P1Y',
                    billingDuration: 'P1Y',
                    valueAddedTaxIncluded: false,
                  },
                  {
                    '@type': 'UnitPriceSpecification',
                    price: '12999',
                    priceCurrency: 'INR',
                    name: 'Professional Plan',
                    billingIncrement: 'P1Y',
                    billingDuration: 'P1Y',
                    valueAddedTaxIncluded: false,
                  },
                ],
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.9',
                ratingCount: '200',
                bestRating: '5',
                worstRating: '1',
              },
              description: SITE_CONFIG.description,
              url: SITE_CONFIG.url,
              screenshot: `${SITE_CONFIG.url}/og-image.png`,
              featureList: [
                'Clinic appointment booking',
                'WhatsApp appointment reminders',
                'Teleconsultation platform',
                'Payment processing',
                'Patient management system',
                'Google My Business integration',
                'Analytics and reporting',
              ],
              // GEO Optimisation: Explicit feature descriptions for AI parsing
              applicationSubCategory: 'Clinic Management Software, Appointment Scheduling System, Telemedicine Platform',
              browserRequirements: 'Requires JavaScript. Requires HTML5. Requires CSS3. Compatible with all modern browsers: Chrome, Firefox, Safari, Edge.',
              deviceCompatibility: 'Web-based application accessible on Windows, macOS, Linux desktop computers, iOS and Android mobile devices',
              softwareRequirements: 'Modern web browser with JavaScript enabled',
              permissions: 'Internet connection required. WhatsApp Business API integration optional.',
              releaseNotes: 'Latest version includes automated WhatsApp reminders, Google My Business integration, and enhanced analytics dashboard',
              provider: {
                '@type': 'Organization',
                name: 'TDAppointments',
                url: SITE_CONFIG.url,
              },
              audience: {
                '@type': 'Audience',
                audienceType: 'Healthcare Providers, Clinics, Hospitals, Doctors',
              },
            }),
          }}
        />
        
        {/* SaaSProduct Schema - Additional structured data for SaaS products */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SaaSProduct',
              name: 'TDAppointments',
              description: SITE_CONFIG.description,
              url: SITE_CONFIG.url,
              category: 'Healthcare SaaS',
              offers: {
                '@type': 'Offer',
                priceCurrency: 'INR',
                price: '7999',
                priceSpecification: {
                  '@type': 'UnitPriceSpecification',
                  price: '7999',
                  priceCurrency: 'INR',
                  billingIncrement: 'P1Y',
                  billingDuration: 'P1Y',
                  valueAddedTaxIncluded: false,
                },
              },
            }),
          }}
        />
        
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'TDAppointments',
              url: SITE_CONFIG.url,
              logo: {
                '@type': 'ImageObject',
                url: `${SITE_CONFIG.url}/logo.png`,
                width: 512,
                height: 512,
              },
              image: `${SITE_CONFIG.url}/og-image.png`,
              sameAs: [
                'https://twitter.com/tdappointments',
                'https://linkedin.com/company/tdappointments',
                'https://facebook.com/tdappointments',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+91-98765-43210',
                contactType: 'customer service',
                areaServed: ['IN', 'AE', 'GB', 'US'],
                availableLanguage: ['en', 'hi'],
              },
              foundingDate: '2020',
              numberOfEmployees: {
                '@type': 'QuantitativeValue',
                value: '50',
              },
              // GEO Optimisation: Additional context for AI understanding
              knowsAbout: [
                'Healthcare Appointment Booking',
                'Clinic Management Software',
                'Telemedicine Solutions',
                'WhatsApp Business API Integration',
                'Patient Management Systems',
                'Healthcare SaaS',
              ],
              areaServed: {
                '@type': 'Place',
                name: 'Global',
                containedIn: [
                  { '@type': 'Country', name: 'India' },
                  { '@type': 'Country', name: 'United States' },
                  { '@type': 'Country', name: 'United Kingdom' },
                  { '@type': 'Country', name: 'United Arab Emirates' },
                ],
              },
            }),
          }}
        />

        {/* ItemList Schema - GEO Optimised: Helps AI understand feature lists */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: 'TDAppointments Key Features',
              description: 'Comprehensive list of features available in TDAppointments clinic appointment booking software',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Clinic Appointment Booking',
                  description: 'Online appointment scheduling system that allows patients to book appointments 24/7 through multiple channels including website, Google My Business, and WhatsApp',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'WhatsApp Appointment Reminders',
                  description: 'Automated WhatsApp notifications sent to patients for appointment confirmations, reminders, cancellations, and rescheduling using WhatsApp Business API',
                },
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: 'Teleconsultation Platform',
                  description: 'HD video and voice consultation platform powered by Twilio, allowing doctors to conduct remote consultations with integrated scheduling and payment collection',
                },
                {
                  '@type': 'ListItem',
                  position: 4,
                  name: 'Payment Processing',
                  description: 'Secure online transaction processing via payment gateway integration, supporting UPI, credit/debit cards, net banking, and digital wallets',
                },
                {
                  '@type': 'ListItem',
                  position: 5,
                  name: 'Patient Management System',
                  description: 'Comprehensive patient records management with medical history, appointment history, prescriptions, and document storage in secure cloud infrastructure',
                },
                {
                  '@type': 'ListItem',
                  position: 6,
                  name: 'Google My Business Integration',
                  description: 'Direct integration with Google My Business allowing patients to book appointments directly from Google Search and Maps via Book Now button',
                },
                {
                  '@type': 'ListItem',
                  position: 7,
                  name: 'Analytics and Reporting',
                  description: 'Monthly analytics and comprehensive reports on appointments, revenue, patient demographics, and clinic performance metrics',
                },
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-healthcare-background text-healthcare-text`}
      >
        <AuthProvider>
          <CashfreeProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </CashfreeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
