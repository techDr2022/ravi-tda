'use client';

import { motion } from 'framer-motion';
import {
  CreditCard,
  Zap,
  Building2,
  ToggleRight,
  CalendarCheck,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/ui/AnimatedSection';
import { HOW_IT_WORKS } from '@/lib/constants';

/**
 * How It Works Section - Step-by-step onboarding process
 * Clear visual flow showing the simple setup process
 */
export function HowItWorks() {
  const iconMap: Record<string, React.ElementType> = {
    CreditCard,
    Zap,
    Building2,
    ToggleRight,
    CalendarCheck,
  };

  return (
    <section id="how-it-works" className="section-padding bg-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary-100 rounded-full blur-3xl -translate-y-1/2 opacity-30" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-accent-100 rounded-full blur-3xl -translate-y-1/2 opacity-30" />

      <Container size="xl" className="relative z-10">
        <AnimatedSection className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-primary-600 uppercase tracking-wider mb-3">
            Simple Setup
          </span>
          <h2 className="heading-lg text-healthcare-text mb-4">
            Go Live in 5 Simple Steps
          </h2>
          <p className="body-md max-w-2xl mx-auto">
            Get your clinic online in less than 24 hours. Our streamlined onboarding 
            process makes it easy to start accepting appointments right away.
          </p>
        </AnimatedSection>

        {/* Desktop Timeline */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-200 via-accent-200 to-secondary-200" />

            <StaggerContainer className="grid grid-cols-5 gap-6" staggerDelay={0.15}>
              {HOW_IT_WORKS.map((step, index) => {
                const Icon = iconMap[step.icon];
                const colors = [
                  { bg: 'bg-primary-500', light: 'bg-primary-50', text: 'text-primary-600' },
                  { bg: 'bg-primary-600', light: 'bg-primary-50', text: 'text-primary-600' },
                  { bg: 'bg-accent-500', light: 'bg-accent-50', text: 'text-accent-600' },
                  { bg: 'bg-accent-600', light: 'bg-accent-50', text: 'text-accent-600' },
                  { bg: 'bg-secondary-500', light: 'bg-secondary-50', text: 'text-secondary-600' },
                ];
                const color = colors[index];

                return (
                  <StaggerItem key={step.step}>
                    <motion.div
                      whileHover={{ y: -10 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="text-center"
                    >
                      {/* Step Number with Icon */}
                      <div className="relative mb-8">
                        <div className={`w-16 h-16 mx-auto rounded-2xl ${color.bg} flex items-center justify-center shadow-lg relative z-10`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center">
                          <span className={`text-sm font-bold ${color.text}`}>{step.step}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="text-lg font-semibold text-healthcare-text mb-2">
                        {step.title}
                      </h3>
                      <p className="text-sm text-healthcare-muted leading-relaxed">
                        {step.description}
                      </p>
                    </motion.div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        </div>

        {/* Mobile Timeline */}
        <div className="lg:hidden">
          <StaggerContainer className="space-y-6">
            {HOW_IT_WORKS.map((step, index) => {
              const Icon = iconMap[step.icon];
              const isLast = index === HOW_IT_WORKS.length - 1;

              return (
                <StaggerItem key={step.step}>
                  <div className="flex gap-4">
                    {/* Timeline */}
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      {!isLast && (
                        <div className="flex-1 w-0.5 bg-gradient-to-b from-primary-300 to-primary-100 my-2" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                          Step {step.step}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-healthcare-text mb-1">
                        {step.title}
                      </h3>
                      <p className="text-sm text-healthcare-muted">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>

        {/* Time Badge */}
        <AnimatedSection delay={0.5} className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white px-8 py-4 rounded-full shadow-lg">
            <Zap className="w-5 h-5" />
            <span className="font-semibold">Average setup time: 30 minutes</span>
          </div>
        </AnimatedSection>
      </Container>
    </section>
  );
}

export default HowItWorks;
