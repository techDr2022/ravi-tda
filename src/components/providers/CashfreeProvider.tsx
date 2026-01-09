'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
    async function loadScript() {
      try {
        const loaded = await loadCashfreeScript();
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
    <CashfreeContext.Provider value={{ isLoaded, isLoading, error }}>
      {children}
    </CashfreeContext.Provider>
  );
}

export default CashfreeProvider;
