'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { loadRazorpayScript } from '@/lib/razorpay';

interface RazorpayContextType {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
}

const RazorpayContext = createContext<RazorpayContextType>({
  isLoaded: false,
  isLoading: true,
  error: null,
});

export function useRazorpay() {
  return useContext(RazorpayContext);
}

interface RazorpayProviderProps {
  children: ReactNode;
}

/**
 * RazorpayProvider - Loads the Razorpay SDK and provides context
 * Wrap your app with this provider to enable Razorpay payments
 */
export function RazorpayProvider({ children }: RazorpayProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadScript() {
      try {
        const loaded = await loadRazorpayScript();
        if (loaded) {
          setIsLoaded(true);
        } else {
          setError('Failed to load payment gateway');
        }
      } catch {
        setError('Failed to load payment gateway');
      } finally {
        setIsLoading(false);
      }
    }

    loadScript();
  }, []);

  return (
    <RazorpayContext.Provider value={{ isLoaded, isLoading, error }}>
      {children}
    </RazorpayContext.Provider>
  );
}

export default RazorpayProvider;
