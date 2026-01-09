'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight, Shield, Star, CheckCircle, AlertCircle } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/ui/AnimatedSection';
import { PRICING_PLANS } from '@/lib/constants';
import { initializeCashfreeCheckout, PaymentResult } from '@/lib/cashfree';

interface PricingProps {
  showHeader?: boolean;
}

type PaymentStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Pricing Section - Displays 3 pricing tiers with feature comparison
 * Integrated with Cashfree for subscription payments
 */
export function Pricing({ showHeader = true }: PricingProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [paymentMessage, setPaymentMessage] = useState<string>('');

  // Handle subscription with Cashfree
  const handleSubscribe = async (planId: string) => {
    setLoadingPlan(planId);
    setPaymentStatus('loading');
    setPaymentMessage('');

    try {
      // Initialize Cashfree checkout
      const result: PaymentResult = await initializeCashfreeCheckout(planId, {
        // You can prefill user info if available from auth context
        // name: user?.name,
        // email: user?.email,
        // phone: user?.phone,
      });

      if (result.success) {
        setPaymentStatus('success');
        setPaymentMessage('Payment successful! Redirecting to your dashboard...');
        
        // Redirect to dashboard after successful payment
        setTimeout(() => {
          window.location.href = `/dashboard?plan=${planId}&order=${result.orderId}`;
        }, 2000);
      } else {
        // Handle cancellation vs actual error differently
        if (result.error === 'Payment cancelled') {
          setPaymentStatus('idle');
          setPaymentMessage('');
        } else {
          setPaymentStatus('error');
          setPaymentMessage(result.error || 'Payment failed. Please try again.');
        }
      }
    } catch {
      setPaymentStatus('error');
      setPaymentMessage('Something went wrong. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  // Close notification
  const closeNotification = () => {
    setPaymentStatus('idle');
    setPaymentMessage('');
  };

  return (
    <section id="pricing" className="section-padding bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-40" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-100 rounded-full blur-3xl opacity-40" />

      {/* Payment Status Notification */}
      <AnimatePresence>
        {paymentMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50"
          >
            <div
              className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg ${
                paymentStatus === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {paymentStatus === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className="font-medium">{paymentMessage}</span>
              {paymentStatus === 'error' && (
                <button
                  onClick={closeNotification}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Container size="xl" className="relative z-10">
        {showHeader && (
          <AnimatedSection className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-primary-600 uppercase tracking-wider mb-3">
              Simple Pricing
            </span>
            <h2 className="heading-lg text-healthcare-text mb-4">
              Choose Your Perfect Plan
            </h2>
            <p className="body-md max-w-2xl mx-auto">
              Transparent pricing with no hidden fees. Start with a 14-day free trial 
              on any plan. No credit card required.
            </p>
          </AnimatedSection>
        )}

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto" staggerDelay={0.15}>
          {PRICING_PLANS.map((plan) => (
            <StaggerItem key={plan.id}>
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`relative h-full rounded-2xl overflow-hidden ${
                  plan.popular
                    ? 'ring-2 ring-primary-500 shadow-healthcare-lg'
                    : 'border border-healthcare-border shadow-card'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-center py-2 text-sm font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <Star className="w-4 h-4" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className={`bg-white p-8 h-full flex flex-col ${plan.popular ? 'pt-14' : ''}`}>
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-bold text-healthcare-text mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-healthcare-muted mb-4">
                      {plan.description}
                    </p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-sm text-healthcare-muted">₹</span>
                      <span className="text-4xl font-bold text-healthcare-text">
                        {plan.price.toLocaleString()}
                      </span>
                      <span className="text-healthcare-muted">/{plan.period}</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="flex-1 mb-8">
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-sm text-healthcare-text">{feature}</span>
                        </li>
                      ))}
                      {plan.notIncluded.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 opacity-50">
                          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <X className="w-3 h-3 text-slate-400" />
                          </div>
                          <span className="text-sm text-healthcare-muted line-through">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <Button
                    variant={plan.popular ? 'primary' : 'outline'}
                    size="lg"
                    fullWidth
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loadingPlan !== null || paymentStatus === 'success'}
                    icon={loadingPlan === plan.id ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ArrowRight className="w-5 h-5" />
                    )}
                  >
                    {loadingPlan === plan.id 
                      ? 'Processing...' 
                      : paymentStatus === 'success' 
                        ? 'Redirecting...'
                        : 'Subscribe & Access Dashboard'}
                  </Button>

                  {/* Trial Badge */}
                  <p className="text-center text-xs text-healthcare-muted mt-4">
                    14-day free trial • No credit card required
                  </p>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Money Back Guarantee */}
        <AnimatedSection delay={0.4} className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 bg-green-50 border border-green-200 rounded-full px-6 py-3">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              30-day money-back guarantee • Cancel anytime
            </span>
          </div>
        </AnimatedSection>

        {/* Secure Payment Badge */}
        <AnimatedSection delay={0.45} className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-healthcare-muted">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Secured by <strong className="text-primary-600">Cashfree</strong> • PCI DSS Compliant</span>
          </div>
        </AnimatedSection>

        {/* Enterprise CTA */}
        <AnimatedSection delay={0.5} className="mt-12">
          <div className="bg-slate-900 rounded-2xl p-8 md:p-12 text-center">
            <h3 className="text-2xl font-bold text-white mb-3">
              Need a Custom Solution?
            </h3>
            <p className="text-slate-300 max-w-xl mx-auto mb-6">
              For healthcare groups with multiple locations or specific integration requirements, 
              we offer custom enterprise solutions.
            </p>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => window.location.href = '/contact'}
            >
              Contact Sales
            </Button>
          </div>
        </AnimatedSection>
      </Container>
    </section>
  );
}

export default Pricing;
