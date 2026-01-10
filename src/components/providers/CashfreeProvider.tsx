'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Script from 'next/script';
import { loadCashfreeScript } from '@/lib/cashfree';

interface CashfreeContextType {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
}

const CashfreeContext = createContext<CashfreeContextType>({
  isLoaded: false,
  isLoading: true,
  error: null,
});

export function useCashfree() {
  return useContext(CashfreeContext);
}

interface CashfreeProviderProps {
  children: ReactNode;
}

/**
 * CashfreeProvider - Loads the Cashfree SDK and provides context
 * Wrap your app with this provider to enable Cashfree payments
 */
export function CashfreeProvider({ children }: CashfreeProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if already loaded
    if (typeof window !== 'undefined' && 'Cashfree' in window) {
      setIsLoaded(true);
      setIsLoading(false);
    }
  }, []);

  return (
    <>
      {/* Use Next.js Script component for better caching and optimization
          Strategy: afterInteractive - loads after page becomes interactive
          This optimizes initial page load while ensuring script is available when needed */}
      <Script
        src="https://sdk.cashfree.com/js/v3/cashfree.js"
        strategy="afterInteractive" // Load after page becomes interactive - better for caching
        crossOrigin="anonymous"
        onLoad={() => {
          setIsLoaded(true);
          setIsLoading(false);
        }}
        onError={() => {
          // Fallback to dynamic loading if Next.js Script fails
          loadCashfreeScript()
            .then((loaded) => {
              if (loaded) {
                setIsLoaded(true);
              } else {
                setError('Failed to load payment gateway');
              }
              setIsLoading(false);
            })
            .catch(() => {
              setError('Failed to load payment gateway');
              setIsLoading(false);
            });
        }}
      />
      <CashfreeContext.Provider value={{ isLoaded, isLoading, error }}>
        {children}
      </CashfreeContext.Provider>
    </>
  );
}

export default CashfreeProvider;
