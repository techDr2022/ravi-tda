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

// SEO Metadata
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
    'hospital booking system',
    'telemedicine software',
    'whatsapp appointment booking',
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
        alt: 'TDAppointments - Healthcare Appointment Booking System',
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
    google: 'google-site-verification-code',
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
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'TDAppointments',
              applicationCategory: 'HealthApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'AggregateOffer',
                lowPrice: '2999',
                highPrice: '9999',
                priceCurrency: 'INR',
                offerCount: '3',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.9',
                ratingCount: '200',
              },
              description: SITE_CONFIG.description,
              url: SITE_CONFIG.url,
              provider: {
                '@type': 'Organization',
                name: 'TDAppointments',
                url: SITE_CONFIG.url,
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
              logo: `${SITE_CONFIG.url}/logo.png`,
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
                availableLanguage: ['English', 'Hindi'],
              },
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
