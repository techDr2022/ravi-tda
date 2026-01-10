'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircleQuestion } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/ui/AnimatedSection';
import { FAQ_ITEMS } from '@/lib/constants';

/**
 * FAQ Section - Two-column layout with questions distributed left and right
 * SEO-optimized with schema markup compatibility
 */
export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Split FAQ items into left and right columns
  const leftColumnItems = FAQ_ITEMS.filter((_, index) => index % 2 === 0);
  const rightColumnItems = FAQ_ITEMS.filter((_, index) => index % 2 === 1);

  // Helper function to get original index from column item
  const getOriginalIndex = (columnIndex: number, isRightColumn: boolean) => {
    return isRightColumn ? columnIndex * 2 + 1 : columnIndex * 2;
  };

  return (
    <section id="faq" className="section-padding bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 pattern-dots opacity-30" />

      <Container size="lg" className="relative z-10">
        <AnimatedSection className="text-center mb-8">
          <span className="inline-block text-xs font-semibold text-primary-600 uppercase tracking-wider mb-2">
            Got Questions?
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-healthcare-text mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-healthcare-muted max-w-2xl mx-auto">
            Everything you need to know about TDAppointments. Can't find what you're 
            looking for? Contact our support team.
          </p>
        </AnimatedSection>

        {/* Two-Column FAQ Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 max-w-6xl mx-auto">
          {/* Left Column */}
          <div className="space-y-3">
            <StaggerContainer staggerDelay={0.08}>
              {leftColumnItems.map((item, columnIndex) => {
                const originalIndex = getOriginalIndex(columnIndex, false);
                return (
                  <StaggerItem key={originalIndex}>
                    <div className="mb-3">
                      <motion.button
                        onClick={() => toggleFAQ(originalIndex)}
                        className={`w-full flex items-start gap-3 p-4 rounded-lg text-left transition-all duration-300 ${
                          openIndex === originalIndex
                            ? 'bg-primary-50 border-2 border-primary-200 shadow-sm'
                            : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                        }`}
                        whileHover={{ scale: 1.005 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        {/* Question Icon */}
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                          openIndex === originalIndex ? 'bg-primary-500 text-white' : 'bg-slate-200 text-slate-500'
                        }`}>
                          <MessageCircleQuestion className="w-4 h-4" />
                        </div>

                        {/* Question Text */}
                        <div className="flex-1">
                          <h3 className={`font-semibold pr-6 transition-colors text-sm ${
                            openIndex === originalIndex ? 'text-primary-700' : 'text-healthcare-text'
                          }`}>
                            {item.question}
                          </h3>
                        </div>

                        {/* Toggle Icon */}
                        <motion.div
                          animate={{ rotate: openIndex === originalIndex ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            openIndex === originalIndex ? 'bg-primary-500 text-white' : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          <ChevronDown className="w-3 h-3" />
                        </motion.div>
                      </motion.button>

                      {/* Answer */}
                      <AnimatePresence>
                        {openIndex === originalIndex && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 py-3 ml-11 text-healthcare-muted leading-relaxed text-xs md:text-sm">
                              {item.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            <StaggerContainer staggerDelay={0.08}>
              {rightColumnItems.map((item, columnIndex) => {
                const originalIndex = getOriginalIndex(columnIndex, true);
                return (
                  <StaggerItem key={originalIndex}>
                    <div className="mb-3">
                      <motion.button
                        onClick={() => toggleFAQ(originalIndex)}
                        className={`w-full flex items-start gap-3 p-4 rounded-lg text-left transition-all duration-300 ${
                          openIndex === originalIndex
                            ? 'bg-primary-50 border-2 border-primary-200 shadow-sm'
                            : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                        }`}
                        whileHover={{ scale: 1.005 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        {/* Question Icon */}
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                          openIndex === originalIndex ? 'bg-primary-500 text-white' : 'bg-slate-200 text-slate-500'
                        }`}>
                          <MessageCircleQuestion className="w-4 h-4" />
                        </div>

                        {/* Question Text */}
                        <div className="flex-1">
                          <h3 className={`font-semibold pr-6 transition-colors text-sm ${
                            openIndex === originalIndex ? 'text-primary-700' : 'text-healthcare-text'
                          }`}>
                            {item.question}
                          </h3>
                        </div>

                        {/* Toggle Icon */}
                        <motion.div
                          animate={{ rotate: openIndex === originalIndex ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            openIndex === originalIndex ? 'bg-primary-500 text-white' : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          <ChevronDown className="w-3 h-3" />
                        </motion.div>
                      </motion.button>

                      {/* Answer */}
                      <AnimatePresence>
                        {openIndex === originalIndex && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 py-3 ml-11 text-healthcare-muted leading-relaxed text-xs md:text-sm">
                              {item.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        </div>

        {/* Support CTA */}
        <AnimatedSection delay={0.4} className="mt-8 text-center">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
            <h3 className="text-lg font-semibold text-healthcare-text mb-2">
              Still have questions?
            </h3>
            <p className="text-sm text-healthcare-muted mb-3">
              Our support team is here to help you 24/7.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm">
              <a
                href="mailto:support@tdappointments.com"
                className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700 transition-colors"
              >
                support@tdappointments.com
              </a>
              <span className="hidden sm:block text-slate-300">|</span>
              <a
                href="tel:+919032292171"
                className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700 transition-colors"
              >
                +91 90322 92171
              </a>
            </div>
          </div>
        </AnimatedSection>
      </Container>
    </section>
  );
}

export default FAQ;
