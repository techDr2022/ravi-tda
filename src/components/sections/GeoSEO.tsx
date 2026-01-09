'use client';

import { motion } from 'framer-motion';
import { MapPin, Globe, Search, TrendingUp } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/ui/AnimatedSection';
import { GEO_SEO_CONTENT } from '@/lib/constants';

/**
 * GEO SEO Section - Location-specific content blocks for SEO
 * Targets various geographic and industry-specific keywords
 */
export function GeoSEO() {
  return (
    <section className="section-padding bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary-50/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-accent-50/30 to-transparent" />

      <Container size="xl" className="relative z-10">
        <AnimatedSection className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-primary-600 uppercase tracking-wider mb-3">
            Serving Healthcare Globally
          </span>
          <h2 className="heading-lg text-healthcare-text mb-4">
            Trusted by Healthcare Providers Worldwide
          </h2>
          <p className="body-md max-w-2xl mx-auto">
            From small clinics in Hyderabad to multi-specialty hospitals in Dubai, 
            TDAppointments powers healthcare bookings across India, USA, UK, and the Middle East.
          </p>
        </AnimatedSection>

        {/* Location Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { name: 'India', flag: '🇮🇳', clinics: '150+' },
            { name: 'UAE', flag: '🇦🇪', clinics: '25+' },
            { name: 'UK', flag: '🇬🇧', clinics: '15+' },
            { name: 'USA', flag: '🇺🇸', clinics: '10+' },
          ].map((location, i) => (
            <AnimatedSection key={location.name} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-white rounded-xl p-6 text-center border border-healthcare-border shadow-sm hover:shadow-healthcare transition-all"
              >
                <div className="text-4xl mb-2">{location.flag}</div>
                <div className="font-semibold text-healthcare-text">{location.name}</div>
                <div className="text-sm text-primary-600">{location.clinics} Clinics</div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>

        {/* SEO Content Blocks */}
        <StaggerContainer className="space-y-6" staggerDelay={0.1}>
          {GEO_SEO_CONTENT.map((content, index) => (
            <StaggerItem key={index}>
              <motion.article
                whileHover={{ x: 4 }}
                className="bg-white rounded-xl p-6 md:p-8 border border-healthcare-border shadow-sm hover:shadow-healthcare transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    index % 3 === 0 ? 'bg-primary-100 text-primary-600' :
                    index % 3 === 1 ? 'bg-accent-100 text-accent-600' :
                    'bg-secondary-100 text-secondary-600'
                  }`}>
                    {index % 4 === 0 ? <MapPin className="w-6 h-6" /> :
                     index % 4 === 1 ? <Globe className="w-6 h-6" /> :
                     index % 4 === 2 ? <Search className="w-6 h-6" /> :
                     <TrendingUp className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-healthcare-text mb-2">
                      {content.title}
                    </h3>
                    <p className="text-healthcare-muted leading-relaxed mb-3">
                      {content.description}
                    </p>
                    {/* Keywords as tags (hidden visually but present for SEO) */}
                    <div className="flex flex-wrap gap-2">
                      {content.keywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.article>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Trust Metrics */}
        <AnimatedSection delay={0.4} className="mt-16">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 md:p-12 text-white">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: '1200+', label: 'Active Clinics' },
                { value: '50K+', label: 'Appointments/Month' },
                { value: '4.9★', label: 'Customer Rating' },
                { value: '99.9%', label: 'Uptime SLA' },
              ].map((metric, i) => (
                <div key={i}>
                  <div className="text-3xl md:text-4xl font-bold mb-1">{metric.value}</div>
                  <div className="text-primary-200 text-sm">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </Container>
    </section>
  );
}

export default GeoSEO;
