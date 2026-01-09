'use client';

import { motion } from 'framer-motion';
import { TrendingDown, Star, Clock } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/ui/AnimatedSection';
import { WHY_US_POINTS } from '@/lib/constants';

/**
 * Why TDAppointments Section - 3 column layout with key value propositions
 * Focused on conversion-driving benefits
 */
export function WhyTDAppointments() {
  const iconMap: Record<string, React.ElementType> = {
    TrendingDown,
    Star,
    Clock,
  };

  return (
    <section className="section-padding bg-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 via-accent-400 to-secondary-400" />
      
      <Container size="xl">
        <AnimatedSection className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-primary-600 uppercase tracking-wider mb-3">
            Why Choose Us
          </span>
          <h2 className="heading-lg text-healthcare-text mb-4">
            Why Clinics Love TDAppointments
          </h2>
          <p className="body-md max-w-2xl mx-auto">
            Join hundreds of healthcare providers who have transformed their patient 
            experience and operational efficiency.
          </p>
        </AnimatedSection>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8" staggerDelay={0.15}>
          {WHY_US_POINTS.map((point, index) => {
            const Icon = iconMap[point.icon];
            const gradients = [
              'from-primary-500 to-primary-600',
              'from-secondary-500 to-secondary-600',
              'from-accent-500 to-accent-600',
            ];

            return (
              <StaggerItem key={point.title}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="relative group h-full"
                >
                  {/* Card */}
                  <div className="h-full bg-white rounded-2xl p-8 border border-healthcare-border shadow-card hover:shadow-card-hover transition-all duration-300">
                    {/* Stat Badge */}
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradients[index]} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-bold bg-gradient-to-r ${gradients[index]} bg-clip-text text-transparent`}>
                          {point.stat}
                        </div>
                        <div className="text-xs text-healthcare-muted uppercase tracking-wide">
                          {point.statLabel}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold text-healthcare-text mb-3">
                      {point.title}
                    </h3>
                    <p className="text-healthcare-muted leading-relaxed">
                      {point.description}
                    </p>

                    {/* Hover Decoration */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradients[index]} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  </div>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Social Proof */}
        <AnimatedSection delay={0.4} className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 bg-slate-50 rounded-full px-6 py-3">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 border-2 border-white flex items-center justify-center text-xs font-bold text-white"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div className="text-sm">
              <span className="font-semibold text-healthcare-text">1200+ clinics</span>
              <span className="text-healthcare-muted"> are growing with us</span>
            </div>
          </div>
        </AnimatedSection>
      </Container>
    </section>
  );
}

export default WhyTDAppointments;
