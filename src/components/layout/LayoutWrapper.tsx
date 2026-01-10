'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

// Routes where we don't want the main header/footer
const EXCLUDED_ROUTES = ['/dashboard', '/login', '/signup', '/book', '/onboarding', '/setup'];

// Marketing/known routes that SHOULD have header/footer
const MARKETING_ROUTES = ['/', '/pricing', '/blog', '/about', '/contact', '/features', '/terms', '/privacy', '/faq', '/hipaa', '/security', '/help', '/docs', '/api', '/status'];

/**
 * LayoutWrapper - Conditionally renders Header and Footer
 * Hides them on dashboard, auth, setup, and public booking pages
 */
export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  
  // Check if current path should hide header/footer
  const isExcludedRoute = EXCLUDED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if it's a known marketing route
  const isMarketingRoute = MARKETING_ROUTES.includes(pathname) || 
    pathname.startsWith('/blog/');

  // Single-segment routes that aren't marketing pages are booking pages (e.g., /dr-john)
  const isBookingPage = !isMarketingRoute && 
    pathname !== '/' && 
    !pathname.includes('/', 1) && // Only one segment
    /^\/[a-z0-9-]+$/.test(pathname); // Matches slug pattern

  if (isExcludedRoute || isBookingPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
