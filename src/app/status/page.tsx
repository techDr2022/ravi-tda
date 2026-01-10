import { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { SITE_CONFIG } from '@/lib/constants';
import { Activity, CheckCircle2, XCircle, AlertCircle, Clock, Server, Database, Cloud } from 'lucide-react';

/**
 * Status Page SEO Metadata
 */
export const metadata: Metadata = {
  title: 'System Status | TDAppointments',
  description: 'TDAppointments system status and uptime monitoring. Check the current status of our services and infrastructure.',
  keywords: [
    'TDAppointments status',
    'system status',
    'uptime monitoring',
    'service health',
    'downtime status',
  ],
  alternates: {
    canonical: `${SITE_CONFIG.url}/status`,
  },
  openGraph: {
    title: 'System Status | TDAppointments',
    description: 'Check the current status of TDAppointments services and infrastructure.',
    url: `${SITE_CONFIG.url}/status`,
    type: 'website',
  },
};

export default function StatusPage() {
  // Mock status data - In production, this would come from a real status monitoring service
  const services = [
    {
      name: 'API Service',
      status: 'operational',
      uptime: '99.99%',
      responseTime: '120ms',
      icon: Activity,
    },
    {
      name: 'Web Application',
      status: 'operational',
      uptime: '99.98%',
      responseTime: '85ms',
      icon: Cloud,
    },
    {
      name: 'Database',
      status: 'operational',
      uptime: '99.99%',
      responseTime: '45ms',
      icon: Database,
    },
    {
      name: 'Payment Gateway',
      status: 'operational',
      uptime: '99.97%',
      responseTime: '200ms',
      icon: CheckCircle2,
    },
    {
      name: 'WhatsApp Integration',
      status: 'operational',
      uptime: '99.95%',
      responseTime: '150ms',
      icon: Server,
    },
    {
      name: 'Teleconsultation',
      status: 'operational',
      uptime: '99.96%',
      responseTime: '180ms',
      icon: Cloud,
    },
  ];

  const recentIncidents = [
    {
      date: '2024-01-15',
      title: 'Scheduled Maintenance',
      status: 'resolved',
      description: 'Database optimization completed successfully',
      duration: '30 minutes',
    },
    {
      date: '2024-01-10',
      title: 'Minor API Latency',
      status: 'resolved',
      description: 'Temporary increase in API response times resolved',
      duration: '15 minutes',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 bg-green-100';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'down':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return CheckCircle2;
      case 'degraded':
        return AlertCircle;
      case 'down':
        return XCircle;
      default:
        return Clock;
    }
  };

  return (
    <>
      {/* Page Header */}
      <section className="pt-24 pb-8 bg-gradient-to-b from-primary-50 to-white">
        <Container>
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
                <Activity className="w-8 h-8 text-primary-600" />
              </div>
            </div>
            <h1 className="heading-xl text-healthcare-text mb-4">
              System <span className="text-gradient">Status</span>
            </h1>
            <p className="body-lg text-slate-600 max-w-2xl mx-auto">
              Real-time status of TDAppointments services and infrastructure
            </p>
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-white">
        <Container size="lg">
          {/* Overall Status */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 p-8 mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <h2 className="text-3xl font-bold text-green-900">All Systems Operational</h2>
            </div>
            <p className="text-green-700 text-sm">
              All services are running normally. Last checked: {new Date().toLocaleString()}
            </p>
          </div>

          {/* Services Status */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Service Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service, index) => {
                const StatusIcon = getStatusIcon(service.status);
                const Icon = service.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl border border-slate-200 p-6 hover:border-primary-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{service.name}</h3>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(
                          service.status
                        )}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600">Uptime:</span>
                        <div className="font-semibold text-slate-900">{service.uptime}</div>
                      </div>
                      <div>
                        <span className="text-slate-600">Response Time:</span>
                        <div className="font-semibold text-slate-900">{service.responseTime}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Incidents */}
          {recentIncidents.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Recent Incidents</h2>
              <div className="space-y-4">
                {recentIncidents.map((incident, index) => {
                  const StatusIcon = getStatusIcon(incident.status);
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-xl border border-slate-200 p-6 hover:border-primary-300 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-slate-900">{incident.title}</h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(
                                incident.status
                              )}`}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{incident.description}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>{incident.date}</span>
                            <span>•</span>
                            <span>Duration: {incident.duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Status History */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Status History</h2>
            <div className="space-y-2 text-sm text-slate-600">
              <p>• Last 30 days uptime: <strong className="text-slate-900">99.98%</strong></p>
              <p>• Last 90 days uptime: <strong className="text-slate-900">99.97%</strong></p>
              <p>• Last 365 days uptime: <strong className="text-slate-900">99.96%</strong></p>
            </div>
          </div>

          {/* Subscribe to Updates */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl border border-primary-200 p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Stay Updated
            </h2>
            <p className="text-slate-700 mb-6 max-w-2xl mx-auto">
              Subscribe to status updates via email or RSS feed to be notified of any incidents or maintenance windows.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="mailto:status@tdappointments.com?subject=Subscribe to Status Updates"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
              >
                Subscribe via Email
              </a>
              <a
                href="/status/rss"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 rounded-lg font-medium border-2 border-primary-600 hover:bg-primary-50 transition-colors"
              >
                RSS Feed
              </a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
