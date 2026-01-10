/**
 * Dashboard Metadata Configuration
 * All dashboard pages should have noindex to prevent search engine indexing
 * Note: This is a TypeScript file that can be imported and used
 */

import { Metadata } from 'next';

export const dashboardMetadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  },
};
