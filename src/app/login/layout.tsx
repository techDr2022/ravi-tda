import { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/constants';

/**
 * Login Page Layout with SEO Metadata
 * This page should not be indexed by search engines (noindex)
 */
export const metadata: Metadata = {
  title: 'Login to Your Clinic Dashboard | TDAppointments',
  description: 'Sign in to access your clinic appointment booking dashboard. Manage appointments, patients, and clinic settings.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/login`,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
