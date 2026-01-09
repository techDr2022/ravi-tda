'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircleQuestion } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/ui/AnimatedSection';
import { FAQ_ITEMS } from '@/lib/constants';

/**
 * FAQ Section - Accordion-style frequently asked questions
 * SEO-optimized with schema markup compatibility
 */
export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="section-padding bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 pattern-dots opacity-30" />

      <Container size="lg" className="relative z-10">
        <AnimatedSection className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-primary-600 uppercase tracking-wider mb-3">
            Got Questions?
          </span>
          <h2 className="heading-lg text-healthcare-text mb-4">
            Frequently Asked Questions
          </h2>
          <p className="body-md max-w-2xl mx-auto">
            Everything you need to know about TDAppointments. Can't find what you're 
            looking for? Contact our support team.
          </p>
        </AnimatedSection>

        <div className="max-w-3xl mx-auto">
          <StaggerContainer staggerDelay={0.08}>
            {FAQ_ITEMS.map((item, index) => (
              <StaggerItem key={index}>
                <div className="mb-4">
                  <motion.button
                    onClick={() => toggleFAQ(index)}
                    className={`w-full flex items-start gap-4 p-6 rounded-xl text-left transition-all duration-300 ${
                      openIndex === index
                        ? 'bg-primary-50 border-2 border-primary-200'
                        : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {/* Question Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      openIndex === index ? 'bg-primary-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      <MessageCircleQuestion className="w-4 h-4" />
                    </div>

                    {/* Question Text */}
                    <div className="flex-1">
                      <h3 className={`font-semibold pr-8 transition-colors ${
                        openIndex === index ? 'text-primary-700' : 'text-healthcare-text'
                      }`}>
                        {item.question}
                      </h3>
                    </div>

                    {/* Toggle Icon */}
                    <motion.div
                      animate={{ rotate: openIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        openIndex === index ? 'bg-primary-500 text-white' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </motion.button>

                  {/* Answer */}
                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 py-4 ml-12 text-healthcare-muted leading-relaxed">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>

        {/* Support CTA */}
        <AnimatedSection delay={0.4} className="mt-12 text-center">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-8 border border-slate-200">
            <h3 className="text-xl font-semibold text-healthcare-text mb-2">
              Still have questions?
            </h3>
            <p className="text-healthcare-muted mb-4">
              Our support team is here to help you 24/7.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="mailto:support@tdappointments.com"
                className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700 transition-colors"
              >
                support@tdappointments.com
              </a>
              <span className="hidden sm:block text-slate-300">|</span>
              <a
                href="tel:+919876543210"
                className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700 transition-colors"
              >
                +91 98765 43210
              </a>
            </div>
          </div>
        </AnimatedSection>
      </Container>
    </section>
  );
}

export default FAQ;
