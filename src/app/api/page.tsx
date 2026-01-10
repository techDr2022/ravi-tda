import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { SITE_CONFIG } from '@/lib/constants';
import { Code, Key, Webhook, BookOpen, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * API Reference Page SEO Metadata
 */
export const metadata: Metadata = {
  title: 'API Reference | TDAppointments',
  description: 'TDAppointments API documentation. Integrate appointment booking and clinic management features into your applications.',
  keywords: [
    'TDAppointments API',
    'appointment booking API',
    'healthcare API documentation',
    'clinic management API',
    'REST API',
  ],
  alternates: {
    canonical: `${SITE_CONFIG.url}/api`,
  },
  openGraph: {
    title: 'API Reference | TDAppointments',
    description: 'TDAppointments API documentation for developers. Integrate appointment booking features into your applications.',
    url: `${SITE_CONFIG.url}/api`,
    type: 'website',
  },
};

export default function APIReferencePage() {
  const apiEndpoints = [
    {
      method: 'GET',
      endpoint: '/api/v1/appointments',
      description: 'List all appointments',
      authentication: true,
    },
    {
      method: 'POST',
      endpoint: '/api/v1/appointments',
      description: 'Create a new appointment',
      authentication: true,
    },
    {
      method: 'GET',
      endpoint: '/api/v1/appointments/{id}',
      description: 'Get appointment details',
      authentication: true,
    },
    {
      method: 'PUT',
      endpoint: '/api/v1/appointments/{id}',
      description: 'Update appointment',
      authentication: true,
    },
    {
      method: 'DELETE',
      endpoint: '/api/v1/appointments/{id}',
      description: 'Cancel appointment',
      authentication: true,
    },
    {
      method: 'GET',
      endpoint: '/api/v1/patients',
      description: 'List all patients',
      authentication: true,
    },
    {
      method: 'POST',
      endpoint: '/api/v1/patients',
      description: 'Create a new patient',
      authentication: true,
    },
    {
      method: 'GET',
      endpoint: '/api/v1/patients/{id}',
      description: 'Get patient details',
      authentication: true,
    },
    {
      method: 'GET',
      endpoint: '/api/v1/doctors',
      description: 'List all doctors',
      authentication: true,
    },
    {
      method: 'GET',
      endpoint: '/api/v1/slots/available',
      description: 'Get available time slots',
      authentication: true,
    },
    {
      method: 'POST',
      endpoint: '/api/v1/webhooks',
      description: 'Register a webhook',
      authentication: true,
    },
  ];

  return (
    <>
      {/* Page Header */}
      <section className="pt-24 pb-8 bg-gradient-to-b from-primary-50 to-white">
        <Container>
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
                <Code className="w-8 h-8 text-primary-600" />
              </div>
            </div>
            <h1 className="heading-xl text-healthcare-text mb-4">
              API <span className="text-gradient">Reference</span>
            </h1>
            <p className="body-lg text-slate-600 max-w-2xl mx-auto">
              Complete API documentation for integrating TDAppointments into your applications
            </p>
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-white">
        <Container size="lg">
          {/* Authentication Section */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl border border-primary-200 p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Key className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Authentication</h2>
                <p className="text-slate-700 text-sm mb-4">
                  All API requests require authentication using an API key. Include your API key in the Authorization header:
                </p>
                <div className="bg-slate-900 rounded-lg p-4 text-sm font-mono text-slate-300">
                  <div>Authorization: Bearer YOUR_API_KEY</div>
                </div>
                <p className="text-sm text-slate-600 mt-4">
                  API keys are available for Enterprise plan customers. Contact us at{' '}
                  <a href="mailto:info@techdr.in" className="text-primary-600 hover:underline">
                    info@techdr.in
                  </a>{' '}
                  to request API access.
                </p>
              </div>
            </div>
          </div>

          {/* API Endpoints */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">API Endpoints</h2>
            <div className="space-y-3">
              {apiEndpoints.map((endpoint, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-slate-200 p-5 hover:border-primary-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4 flex-wrap">
                    <span
                      className={`px-3 py-1 rounded-md text-xs font-bold ${
                        endpoint.method === 'GET'
                          ? 'bg-blue-100 text-blue-700'
                          : endpoint.method === 'POST'
                          ? 'bg-green-100 text-green-700'
                          : endpoint.method === 'PUT'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {endpoint.method}
                    </span>
                    <code className="flex-1 font-mono text-sm text-slate-900 bg-slate-50 px-3 py-1 rounded">
                      {endpoint.endpoint}
                    </code>
                    {endpoint.authentication && (
                      <span className="flex items-center gap-1 text-xs text-slate-600">
                        <Lock className="w-3 h-3" />
                        Auth Required
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mt-3">{endpoint.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Webhooks Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Webhook className="w-6 h-6 text-accent-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Webhooks</h2>
                <p className="text-slate-700 text-sm mb-4">
                  Subscribe to real-time events in your TDAppointments account. Configure webhooks to receive notifications for:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm text-slate-700">
                  <li>New appointment bookings</li>
                  <li>Appointment cancellations</li>
                  <li>Appointment rescheduling</li>
                  <li>Payment confirmations</li>
                  <li>Patient registrations</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Rate Limits & Best Practices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-bold text-slate-900">Rate Limits</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>• <strong>Free tier:</strong> 100 requests/hour</li>
                <li>• <strong>Professional:</strong> 1,000 requests/hour</li>
                <li>• <strong>Enterprise:</strong> Custom limits</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-bold text-slate-900">Best Practices</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>• Always use HTTPS</li>
                <li>• Implement retry logic with exponential backoff</li>
                <li>• Cache responses when appropriate</li>
                <li>• Handle errors gracefully</li>
              </ul>
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl border border-primary-200 p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Need Help with Integration?
            </h2>
            <p className="text-slate-700 mb-6 max-w-2xl mx-auto">
              Our developer support team is here to help. Contact us for API access, integration assistance, or technical questions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="mailto:info@techdr.in"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
              >
                Email Developer Support
              </a>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 rounded-lg font-medium border-2 border-primary-600 hover:bg-primary-50 transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                View Full Documentation
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
