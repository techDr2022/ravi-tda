'use client';

import { motion } from 'framer-motion';
import {
  Globe,
  MessageCircle,
  Video,
  CreditCard,
  LayoutDashboard,
  FileText,
  BarChart3,
  Cloud,
  CheckCircle,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/ui/AnimatedSection';
import { FEATURES } from '@/lib/constants';

/**
 * Features Section - Comprehensive feature showcase with icons
 * SEO optimized with clear feature descriptions
 */
export function Features() {
  const iconMap: Record<string, React.ElementType> = {
    Globe,
    MessageCircle,
    Video,
    CreditCard,
    LayoutDashboard,
    FileText,
    BarChart3,
    Cloud,
  };

  const colorClasses = {
    primary: {
      bg: 'bg-primary-50',
      icon: 'text-primary-600',
      border: 'border-primary-100',
      gradient: 'from-primary-50 to-primary-100/50',
    },
    secondary: {
      bg: 'bg-secondary-50',
      icon: 'text-secondary-600',
      border: 'border-secondary-100',
      gradient: 'from-secondary-50 to-secondary-100/50',
    },
    accent: {
      bg: 'bg-accent-50',
      icon: 'text-accent-600',
      border: 'border-accent-100',
      gradient: 'from-accent-50 to-accent-100/50',
    },
  };

  return (
    <section id="features" className="section-padding bg-gradient-to-b from-slate-50 to-white relative">
      {/* Pattern Background */}
      <div className="absolute inset-0 pattern-grid opacity-50" />

      <Container size="xl" className="relative z-10">
        <AnimatedSection className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-primary-600 uppercase tracking-wider mb-3">
            Powerful Features
          </span>
          <h2 className="heading-lg text-healthcare-text mb-4">
            Everything You Need to Manage Appointments
          </h2>
          <p className="body-md max-w-2xl mx-auto">
            From booking to follow-up, our comprehensive suite of features helps you 
            deliver exceptional patient experiences while saving time and resources.
          </p>
        </AnimatedSection>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.08}>
          {FEATURES.map((feature) => {
            const Icon = iconMap[feature.icon];
            const colors = colorClasses[feature.color];

            return (
              <StaggerItem key={feature.title}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="h-full"
                >
                  <div className={`h-full bg-white rounded-2xl p-6 border ${colors.border} shadow-sm hover:shadow-healthcare transition-all duration-300 group`}>
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-6 h-6 ${colors.icon}`} />
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-semibold text-healthcare-text mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-healthcare-muted leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Feature Highlights */}
        <AnimatedSection delay={0.4} className="mt-16">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />
              </svg>
            </div>

            <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  Built for Healthcare Compliance
                </h3>
                <p className="text-primary-100 mb-6">
                  Our platform is designed with healthcare standards in mind. Secure, scalable, 
                  and compliant infrastructure to protect your patients' data.
                </p>
                <ul className="space-y-3">
                  {[
                    'Bank-grade encryption',
                    'Daily automated backups',
                    '99.9% uptime SLA',
                    'HIPAA-ready infrastructure',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary-200 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Security Badge */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 rounded-3xl blur-2xl" />
                  <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                    <div className="w-24 h-24 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                      <Cloud className="w-12 h-12 text-white" />
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-1">99.9%</div>
                      <div className="text-primary-200 text-sm">Uptime Guaranteed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </Container>
    </section>
  );
}

export default Features;
