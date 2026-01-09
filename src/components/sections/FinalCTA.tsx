'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Phone, Clock, CheckCircle } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { ButtonLink } from '@/components/ui/Button';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

/**
 * Final CTA Section - Strong call-to-action before footer
 * Emphasizes urgency and easy onboarding
 */
export function FinalCTA() {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-slate-900" />
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="cta-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#cta-grid)" />
        </svg>
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 left-[10%] w-20 h-20 bg-white/10 rounded-2xl backdrop-blur-sm hidden lg:flex items-center justify-center"
      >
        <Calendar className="w-10 h-10 text-white/50" />
      </motion.div>

      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute bottom-20 right-[10%] w-16 h-16 bg-white/10 rounded-xl backdrop-blur-sm hidden lg:flex items-center justify-center"
      >
        <Phone className="w-8 h-8 text-white/50" />
      </motion.div>

      <Container size="lg" className="relative z-10">
        <AnimatedSection className="text-center">
          {/* Urgency Badge */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/20"
          >
            <Clock className="w-4 h-4 text-secondary-400" />
            <span className="text-sm font-medium text-white">
              Go live in under 24 hours
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h2
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight"
          >
            Start Accepting Appointments
            <br />
            <span className="text-secondary-400">in 24 Hours</span>
          </motion.h2>

          {/* Sub-headline */}
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-primary-100 max-w-2xl mx-auto mb-10"
          >
            Join 1200+ clinics that have transformed their patient booking experience. 
            Start your 14-day free trial today – no credit card required.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <ButtonLink
              href="/signup"
              variant="secondary"
              size="lg"
              icon={<ArrowRight className="w-5 h-5" />}
            >
              Start Free Trial
            </ButtonLink>
            <ButtonLink
              href="/contact"
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10"
            >
              Book a Demo
            </ButtonLink>
          </motion.div>

          {/* Trust Points */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-6 md:gap-8"
          >
            {[
              'Free 14-day trial',
              'No credit card required',
              'Cancel anytime',
              '24/7 support',
            ].map((point) => (
              <div key={point} className="flex items-center gap-2 text-primary-100">
                <CheckCircle className="w-4 h-4 text-secondary-400" />
                <span className="text-sm">{point}</span>
              </div>
            ))}
          </motion.div>
        </AnimatedSection>
      </Container>
    </section>
  );
}

export default FinalCTA;
