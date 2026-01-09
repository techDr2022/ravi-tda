'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Users,
  BarChart3,
  CreditCard,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  Video,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { DASHBOARD_TABS, SAMPLE_APPOINTMENTS, SAMPLE_STATS } from '@/lib/constants';

/**
 * Dashboard Preview Section - Interactive preview of the clinic dashboard
 * Shows different tabs to demonstrate product capabilities
 */
export function DashboardPreview() {
  const [activeTab, setActiveTab] = useState('appointments');

  const iconMap: Record<string, React.ElementType> = {
    Calendar,
    Users,
    BarChart3,
    CreditCard,
    Star,
  };

  const statusColors = {
    confirmed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const statusIcons = {
    confirmed: CheckCircle2,
    pending: Clock,
    cancelled: XCircle,
  };

  return (
    <section id="dashboard" className="section-padding bg-slate-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-50/50 to-transparent" />
      
      <Container size="xl" className="relative z-10">
        <AnimatedSection className="text-center mb-12">
          <span className="inline-block text-sm font-semibold text-primary-600 uppercase tracking-wider mb-3">
            Dashboard Preview
          </span>
          <h2 className="heading-lg text-healthcare-text mb-4">
            Your Clinic Dashboard at a Glance
          </h2>
          <p className="body-md max-w-2xl mx-auto">
            A powerful, intuitive dashboard designed specifically for healthcare professionals. 
            Manage everything from one place.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div className="max-w-5xl mx-auto">
            {/* Dashboard Container */}
            <div className="bg-white rounded-2xl shadow-card-hover overflow-hidden border border-healthcare-border">
              {/* Dashboard Header */}
              <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">City Care Clinic</div>
                    <div className="text-slate-400 text-xs">Dr. Sharma's Dashboard</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-green-400 text-xs">Online</span>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="border-b border-healthcare-border bg-slate-50">
                <div className="flex overflow-x-auto scrollbar-hide">
                  {DASHBOARD_TABS.map((tab) => {
                    const Icon = iconMap[tab.icon];
                    const isActive = activeTab === tab.id;
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors relative ${
                          isActive 
                            ? 'text-primary-600' 
                            : 'text-healthcare-muted hover:text-healthcare-text'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                        {isActive && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6 min-h-[400px]">
                <AnimatePresence mode="wait">
                  {activeTab === 'appointments' && (
                    <motion.div
                      key="appointments"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Stats Row */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {[
                          { label: 'Total Today', value: SAMPLE_STATS.todayAppointments, color: 'primary' },
                          { label: 'Completed', value: SAMPLE_STATS.completedToday, color: 'green' },
                          { label: 'Pending', value: SAMPLE_STATS.todayAppointments - SAMPLE_STATS.completedToday, color: 'yellow' },
                          { label: 'Video Calls', value: 3, color: 'accent' },
                        ].map((stat, i) => (
                          <div key={i} className="bg-slate-50 rounded-xl p-4">
                            <div className="text-2xl font-bold text-healthcare-text">{stat.value}</div>
                            <div className="text-xs text-healthcare-muted">{stat.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Appointments List */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-healthcare-text">Today's Appointments</h4>
                        {SAMPLE_APPOINTMENTS.map((apt) => {
                          const StatusIcon = statusIcons[apt.status];
                          return (
                            <div
                              key={apt.id}
                              className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                  {apt.patient.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-medium text-healthcare-text">{apt.patient}</div>
                                  <div className="text-sm text-healthcare-muted flex items-center gap-2">
                                    <Clock className="w-3 h-3" />
                                    {apt.time}
                                    {apt.type === 'Video Call' && <Video className="w-3 h-3 text-accent-500" />}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-healthcare-muted hidden sm:block">{apt.type}</span>
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusColors[apt.status]}`}>
                                  <StatusIcon className="w-3 h-3" />
                                  {apt.status}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'patients' && (
                    <motion.div
                      key="patients"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="text-center py-12"
                    >
                      <Users className="w-16 h-16 text-primary-200 mx-auto mb-4" />
                      <h4 className="text-xl font-semibold text-healthcare-text mb-2">
                        Patient Management
                      </h4>
                      <p className="text-healthcare-muted max-w-md mx-auto">
                        Complete patient records with history, prescriptions, and documents. 
                        All securely stored in the cloud.
                      </p>
                    </motion.div>
                  )}

                  {activeTab === 'analytics' && (
                    <motion.div
                      key="analytics"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="text-center py-12"
                    >
                      <BarChart3 className="w-16 h-16 text-accent-200 mx-auto mb-4" />
                      <h4 className="text-xl font-semibold text-healthcare-text mb-2">
                        Monthly Analytics
                      </h4>
                      <p className="text-healthcare-muted max-w-md mx-auto">
                        Comprehensive reports on appointments, revenue trends, patient demographics, 
                        and review performance.
                      </p>
                    </motion.div>
                  )}

                  {activeTab === 'payments' && (
                    <motion.div
                      key="payments"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="text-center py-12"
                    >
                      <CreditCard className="w-16 h-16 text-secondary-200 mx-auto mb-4" />
                      <h4 className="text-xl font-semibold text-healthcare-text mb-2">
                        Payment Processing
                      </h4>
                      <p className="text-healthcare-muted max-w-md mx-auto">
                        Razorpay-powered payments for teleconsultations. Auto-invoicing and 
                        reconciliation built-in.
                      </p>
                    </motion.div>
                  )}

                  {activeTab === 'reviews' && (
                    <motion.div
                      key="reviews"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="text-center py-12"
                    >
                      <Star className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
                      <h4 className="text-xl font-semibold text-healthcare-text mb-2">
                        Review Management
                      </h4>
                      <p className="text-healthcare-muted max-w-md mx-auto">
                        Automated Google review requests after consultations. Track and respond 
                        to reviews from one place.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </Container>
    </section>
  );
}

export default DashboardPreview;
