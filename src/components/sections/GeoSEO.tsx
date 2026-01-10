'use client';

import { motion } from 'framer-motion';
import { MapPin, Globe, Search, TrendingUp, Video, MessageCircle, Building2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/ui/AnimatedSection';
import { GEO_SEO_CONTENT } from '@/lib/constants';

/**
 * GEO SEO Section - Location-specific content blocks for SEO
 * Targets various geographic and industry-specific keywords
 * Modern card-based grid layout
 */
export function GeoSEO() {
  const iconMap = [
    <MapPin key="mappin" className="w-4 h-4" />,
    <Building2 key="building" className="w-4 h-4" />,
    <Building2 key="building2" className="w-4 h-4" />,
    <Video key="video" className="w-4 h-4" />,
    <MessageCircle key="message" className="w-4 h-4" />,
  ];

  const gradientClasses = [
    'from-primary-500 to-primary-600',
    'from-accent-500 to-accent-600',
    'from-secondary-500 to-secondary-600',
    'from-primary-500 to-accent-500',
    'from-accent-500 to-secondary-500',
  ];

  return (
    <section className="py-4 md:py-6 lg:py-8 bg-gradient-to-b from-white via-slate-50 to-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-200/20 rounded-full blur-3xl" />

      <Container size="xl" className="relative z-10">
        <AnimatedSection className="text-center mb-4">
          <span className="inline-block text-xs font-semibold text-primary-600 uppercase tracking-wider mb-1">
            Comprehensive Healthcare Solutions
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-healthcare-text mb-2">
            Powerful Tools for Every Healthcare Practice
          </h2>
          <p className="text-xs max-w-2xl mx-auto text-healthcare-muted">
            From appointment booking to teleconsultation, discover how TDAppointments 
            streamlines operations for clinics and hospitals across India and beyond.
          </p>
        </AnimatedSection>

        {/* SEO Content Blocks - Grid Layout */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8" staggerDelay={0.08}>
          {GEO_SEO_CONTENT.map((content, index) => (
            <StaggerItem key={index}>
              <motion.article
                whileHover={{ y: -4, scale: 1.01 }}
                className="group relative bg-white rounded-xl p-4 border border-healthcare-border/50 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradientClasses[index]} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                {/* Icon with Gradient Background */}
                <div className="relative mb-3">
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${gradientClasses[index]} text-white shadow-md transform group-hover:scale-105 transition-transform duration-300`}>
                    {iconMap[index]}
                  </div>
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className="text-base font-bold text-healthcare-text mb-1.5 group-hover:text-primary-600 transition-colors duration-300">
                    {content.title}
                  </h3>
                  <p className="text-healthcare-muted leading-relaxed mb-2 text-xs">
                    {content.description}
                  </p>
                  
                  {/* Keywords as tags - Enhanced styling */}
                  <div className="flex flex-wrap gap-1">
                    {content.keywords.map((keyword, keywordIndex) => (
                      <motion.span
                        key={keyword}
                        initial={{ opacity: 0.7 }}
                        whileHover={{ opacity: 1, scale: 1.03 }}
                        className="text-[9px] px-1.5 py-0.5 bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 rounded-md border border-slate-200/50 font-medium hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 transition-all duration-200"
                      >
                        {keyword}
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* Decorative corner element */}
                <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${gradientClasses[index]} opacity-0 group-hover:opacity-5 rounded-bl-full transition-opacity duration-300`} />
              </motion.article>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Location Grid - Enhanced */}
        <AnimatedSection delay={0.3} className="mb-8">
          <div className="text-center mb-4">
            <h3 className="text-base font-semibold text-healthcare-text mb-1">
              Serving Healthcare Providers Globally
            </h3>
            <p className="text-xs text-healthcare-muted">
              Trusted by clinics and hospitals across multiple countries
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'India', flag: '🇮🇳', clinics: '1500+', colorClass: 'text-primary-600' },
              { name: 'UAE', flag: '🇦🇪', clinics: '250+', colorClass: 'text-accent-600' },
              { name: 'UK', flag: '🇬🇧', clinics: '100+', colorClass: 'text-secondary-600' },
              { name: 'USA', flag: '🇺🇸', clinics: '150+', colorClass: 'text-primary-600' },
            ].map((location, i) => (
              <motion.div
                key={location.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                whileHover={{ y: -6, scale: 1.05 }}
                className="bg-white rounded-xl p-4 text-center border border-healthcare-border shadow-sm hover:shadow-lg transition-all duration-300 group"
              >
                <div className="text-4xl mb-2 transform group-hover:scale-110 transition-transform duration-300">
                  {location.flag}
                </div>
                <div className="font-bold text-healthcare-text text-base mb-1">{location.name}</div>
                <div className={`text-xs font-semibold ${location.colorClass}`}>{location.clinics} Clinics</div>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        {/* Trust Metrics - Enhanced */}
        <AnimatedSection delay={0.5}>
          <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-2xl p-6 md:p-8 text-white overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-72 h-72 bg-accent-300 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            </div>
            
            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: '1200+', label: 'Active Clinics', icon: '🏥' },
                { value: '50K+', label: 'Appointments/Month', icon: '📅' },
                { value: '4.9★', label: 'Customer Rating', icon: '⭐' },
                { value: '99.9%', label: 'Uptime SLA', icon: '⚡' },
              ].map((metric, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                  className="transform transition-transform duration-300"
                >
                  <div className="text-2xl mb-1">{metric.icon}</div>
                  <div className="text-2xl md:text-3xl font-bold mb-1">{metric.value}</div>
                  <div className="text-primary-200 text-xs font-medium">{metric.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </Container>
    </section>
  );
}

export default GeoSEO;
