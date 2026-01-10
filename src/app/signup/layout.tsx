import { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/constants';

/**
 * Signup Page Layout with SEO Metadata
 * This page should not be indexed by search engines (noindex)
 */
export const metadata: Metadata = {
  title: 'Start Free Trial | Sign Up for Clinic Appointment Software',
  description: 'Sign up for TDAppointments clinic appointment booking software. Start your 14-day free trial. No credit card required. Get started in minutes.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/signup`,
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
