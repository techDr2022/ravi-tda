'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle,
  Shield,
  MapPin,
  Star,
  Users,
  Calendar,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { ButtonLink } from '@/components/ui/Button';
import { TRUST_BADGES } from '@/lib/constants';

/**
 * Hero Section - Main landing section with headline, CTAs, and trust signals
 * SEO-optimized headline targeting healthcare appointment booking keywords
 */
export function Hero() {
  const iconMap: Record<string, React.ElementType> = {
    CheckCircle,
    Shield,
    MapPin,
  };

  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-mesh-gradient opacity-60" />
      <div className="absolute inset-0 pattern-dots opacity-30" />
      
      {/* Floating Healthcare Icons */}
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-32 right-[15%] hidden lg:block"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center shadow-healthcare rotate-12">
          <Calendar className="w-8 h-8 text-primary-600" />
        </div>
      </motion.div>
      
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute bottom-40 left-[10%] hidden lg:block"
      >
        <div className="w-14 h-14 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-xl flex items-center justify-center shadow-healthcare -rotate-6">
          <Star className="w-6 h-6 text-secondary-600" />
        </div>
      </motion.div>
      
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-1/2 right-[8%] hidden xl:block"
      >
        <div className="w-12 h-12 bg-gradient-to-br from-accent-100 to-accent-200 rounded-lg flex items-center justify-center shadow-healthcare rotate-6">
          <Users className="w-5 h-5 text-accent-600" />
        </div>
      </motion.div>

      <Container size="xl" className="relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Pre-headline Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 rounded-full px-4 py-2 mb-6"
          >
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-primary-700">
              Trusted by 1200+ Healthcare Clinics
            </span>
          </motion.div>

          {/* Main Headline - SEO Optimized */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="heading-xl text-healthcare-text mb-6"
          >
            Healthcare Appointment{' '}
            <span className="text-gradient">Booking System</span>{' '}
            for Clinics & Hospitals
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="body-lg max-w-2xl mx-auto mb-8"
          >
            Automate bookings, reminders, payments, and teleconsultations – 
            all from one powerful dashboard. Go live in 24 hours.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <ButtonLink
              href="/signup"
              size="lg"
              icon={<ArrowRight className="w-5 h-5" />}
            >
              Start Free Trial
            </ButtonLink>
            <ButtonLink
              href="/pricing"
              variant="outline"
              size="lg"
            >
              View Pricing
            </ButtonLink>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4 md:gap-6"
          >
            {TRUST_BADGES.map((badge, index) => {
              const Icon = iconMap[badge.icon];
              return (
                <motion.div
                  key={badge.text}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  className="trust-badge"
                >
                  <Icon className="w-4 h-4 text-primary-600" />
                  <span>{badge.text}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Hero Image/Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 relative"
        >
          <div className="relative max-w-5xl mx-auto">
            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary-400/20 via-accent-400/20 to-secondary-400/20 rounded-3xl blur-2xl" />
            
            {/* Dashboard Preview Card */}
            <div className="relative bg-white rounded-2xl shadow-card-hover overflow-hidden border border-healthcare-border">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-healthcare-border">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-white px-4 py-1.5 rounded-lg text-xs text-slate-500 border border-slate-200">
                    dashboard.tdappointments.com
                  </div>
                </div>
              </div>
              
              {/* Dashboard Preview Content */}
              <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Stats Cards */}
                  {[
                    { label: "Today's Appointments", value: '12', icon: Calendar, color: 'primary' },
                    { label: 'New Patients', value: '23', icon: Users, color: 'accent' },
                    { label: 'Reviews This Month', value: '45', icon: Star, color: 'secondary' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                      className={`bg-white rounded-xl p-5 border border-healthcare-border shadow-sm hover:shadow-healthcare transition-shadow`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-healthcare-muted mb-1">{stat.label}</p>
                          <p className="text-3xl font-bold text-healthcare-text">{stat.value}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          stat.color === 'primary' ? 'bg-primary-100 text-primary-600' :
                          stat.color === 'accent' ? 'bg-accent-100 text-accent-600' :
                          'bg-secondary-100 text-secondary-600'
                        }`}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

export default Hero;
