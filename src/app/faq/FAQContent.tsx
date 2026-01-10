'use client';

import { useState, useMemo } from 'react';
import { Container } from '@/components/ui/Container';
import { FAQ_ITEMS } from '@/lib/constants';
import { 
  MessageCircleQuestion, 
  Search, 
  DollarSign, 
  Shield, 
  Settings, 
  HelpCircle,
  Users,
  Calendar,
  CreditCard,
  Mail,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

// Extended FAQ items organized by category
const EXTENDED_FAQ_ITEMS = [
  // General Questions
  {
    category: 'General',
    icon: HelpCircle,
    items: FAQ_ITEMS.slice(7, 8).concat([
      {
        question: 'What is TDAppointments?',
        answer: 'TDAppointments is a cloud-based healthcare appointment booking and clinic management SaaS platform designed for clinics, hospitals, doctors, and healthcare administrators. It helps healthcare providers manage appointments, patient records, teleconsultations, and automate communication via WhatsApp, all from one comprehensive dashboard.',
      },
    ]),
  },
  // Getting Started
  {
    category: 'Getting Started',
    icon: Settings,
    items: [
      FAQ_ITEMS[4], // How fast can I go live?
      FAQ_ITEMS[6], // Do you provide training and onboarding?
      {
        question: 'What do I need to get started?',
        answer: 'To get started with TDAppointments, you need: a valid email address, basic clinic information (name, address, phone), doctor details and schedules, and a payment method for subscription. No technical expertise is required. Our team will guide you through the entire setup process, which typically takes less than 24 hours.',
      },
      {
        question: 'Can I import my existing patient data?',
        answer: 'Yes! We provide data import tools and assistance to help you migrate your existing patient records. Our support team can help you export data from your current system and import it into TDAppointments. For Enterprise customers, we offer dedicated data migration support as part of onboarding.',
      },
      {
        question: 'Is there a mobile app?',
        answer: 'TDAppointments is fully responsive and works seamlessly on all mobile devices through your web browser. While we don\'t have a dedicated mobile app yet, the web platform is optimized for mobile use, allowing you to manage appointments, view patient records, and handle all functions from your smartphone or tablet. A mobile app is in development.',
      },
    ],
  },
  // Pricing & Plans
  {
    category: 'Pricing',
    icon: DollarSign,
    items: [
      FAQ_ITEMS[7], // How much does TDAppointments cost?
      FAQ_ITEMS[5], // Can I try before I buy?
      {
        question: 'Are there any hidden fees?',
        answer: 'No hidden fees! The pricing you see is transparent. Subscription fees are charged annually. Payment gateway transaction fees (typically 2-3%) apply only when patients make payments for consultations through the platform. There are no setup fees, cancellation fees, or additional charges for basic features.',
      },
      {
        question: 'What happens if I exceed my plan limits?',
        answer: 'If you exceed the limits of your current plan (such as number of appointments or storage), we\'ll notify you and offer options to upgrade. We don\'t automatically charge for overages. Instead, we work with you to find the right plan that fits your needs. Enterprise plans can be customized to accommodate any volume.',
      },
      {
        question: 'Can I change my plan later?',
        answer: 'Yes! You can upgrade or downgrade your plan at any time. Upgrades take effect immediately, and you\'ll be charged a prorated amount. Downgrades take effect at your next billing cycle. Your data and settings are preserved when changing plans.',
      },
      {
        question: 'Do you offer discounts for annual subscriptions?',
        answer: 'Our pricing is already optimized for annual subscriptions, which is why all plans are billed yearly. We offer the best value with annual billing. Enterprise customers can negotiate custom pricing based on their specific needs and volume requirements.',
      },
    ],
  },
  // Features & Functionality
  {
    category: 'Features',
    icon: Calendar,
    items: [
      FAQ_ITEMS[8], // What features are included?
      FAQ_ITEMS[1], // Can I use my own WhatsApp number?
      FAQ_ITEMS[3], // Does it support multiple doctors?
      FAQ_ITEMS[9], // Does TDAppointments integrate with Google My Business?
      {
        question: 'Can patients book appointments online?',
        answer: 'Yes! Patients can book appointments 24/7 through your custom booking page link, directly from Google My Business (Professional and Enterprise plans), or via WhatsApp integration. They can view available time slots, select consultation types, and make payments online if required.',
      },
      {
        question: 'Can patients cancel or reschedule appointments?',
        answer: 'Yes, patients can cancel or reschedule appointments through the booking confirmation email or WhatsApp link. You can configure cancellation windows (e.g., minimum 24 hours notice) and rescheduling rules in your dashboard settings. Automatic notifications are sent for all changes.',
      },
      {
        question: 'How does teleconsultation work?',
        answer: 'TDAppointments includes a teleconsultation platform powered by Twilio. Doctors can conduct HD video or voice consultations with patients directly from the dashboard. Patients receive a secure link to join the consultation. The platform includes built-in scheduling, payment collection, and prescription management. Available in Professional and Enterprise plans.',
      },
      {
        question: 'Can I generate prescriptions?',
        answer: 'Yes! Our prescription management feature allows you to create, store, and print A4-format prescriptions. You can save prescription templates, access patient prescription history, and generate prescriptions during consultations. All prescriptions are stored securely in patient records.',
      },
      {
        question: 'Do you provide analytics and reports?',
        answer: 'Yes! Professional and Enterprise plans include comprehensive analytics and monthly reports. You can track appointments, revenue, patient demographics, popular time slots, no-show rates, and more. Reports can be exported in PDF or CSV format for further analysis.',
      },
    ],
  },
  // Security & Privacy
  {
    category: 'Security',
    icon: Shield,
    items: [
      FAQ_ITEMS[2], // Is patient data secure?
      {
        question: 'Is TDAppointments HIPAA compliant?',
        answer: 'TDAppointments is designed to support HIPAA compliance with administrative, physical, and technical safeguards. We execute Business Associate Agreements (BAAs) with healthcare providers and implement encryption, access controls, and audit logging. However, HIPAA compliance is a shared responsibility, and healthcare providers must also implement their own compliance programs. See our HIPAA Compliance page for details.',
      },
      {
        question: 'Where is my data stored?',
        answer: 'Your data is stored in secure, HIPAA-compliant cloud data centers with SOC 2 Type II certification. We use leading cloud infrastructure providers that meet international security standards. Data is encrypted at rest and in transit, with redundant backups stored in multiple geographic locations.',
      },
      {
        question: 'Who can access my patient data?',
        answer: 'Only authorized users you grant access to can view patient data. TDAppointments employees only access customer data when necessary for support or maintenance, and all access is logged and monitored. Patient data is isolated by clinic, so each healthcare provider can only access their own data.',
      },
      {
        question: 'What happens to my data if I cancel?',
        answer: 'Upon cancellation, you can export all your data before your account is closed. We retain your data for 30 days after cancellation (as required by law) and then permanently delete it, except where retention is required by healthcare regulations. You\'ll receive a data export file with all your patient records, appointments, and clinic information.',
      },
    ],
  },
  // Payments & Billing
  {
    category: 'Payments',
    icon: CreditCard,
    items: [
      FAQ_ITEMS[4], // What payment methods do you support?
      {
        question: 'How do patients pay for consultations?',
        answer: 'Patients can pay online when booking appointments or before teleconsultations using UPI, credit/debit cards, net banking, or digital wallets (Paytm, PhonePe, GPay). Payment can be made optional or required based on your settings. All payments are processed securely through PCI DSS compliant payment gateways.',
      },
      {
        question: 'How do I receive payments from patients?',
        answer: 'Payments made by patients are processed through integrated payment gateways and settled directly to your registered bank account according to the payment gateway\'s settlement cycle (typically T+2 days). You\'ll receive detailed transaction reports in your dashboard, and all payments are automatically reflected in your revenue analytics.',
      },
      {
        question: 'Are there transaction fees?',
        answer: 'Payment gateway transaction fees (typically 2-3% per transaction) apply when patients make payments through the platform. These fees are standard across the industry and are charged by the payment gateway, not TDAppointments. You can choose to pass these fees to patients or absorb them in your consultation fees.',
      },
      {
        question: 'Can I offer refunds?',
        answer: 'Yes, you can process refunds directly from your dashboard. Refunds are processed through the same payment gateway and typically take 5-7 business days to reflect in the patient\'s account, depending on the payment method used.',
      },
    ],
  },
  // Support & Help
  {
    category: 'Support',
    icon: HelpCircle,
    items: [
      {
        question: 'What kind of support do you provide?',
        answer: 'We provide comprehensive support including: email support with 2-hour response time during business hours, help center with documentation and tutorials, video tutorials and onboarding sessions, live chat support (Professional and Enterprise), and dedicated account manager for Enterprise customers. Basic plan includes email support and access to help center.',
      },
      {
        question: 'What are your support hours?',
        answer: 'Email support is available Monday-Friday, 9 AM - 6 PM IST, with response within 2 hours during business hours. Enterprise customers receive priority support with faster response times and extended hours. Critical issues are addressed 24/7 for all customers.',
      },
      {
        question: 'Do you provide training?',
        answer: 'Yes! All plans include free onboarding and access to video tutorials and documentation. Professional and Enterprise plans include dedicated onboarding calls with implementation specialists who will help you set up your account, configure settings, and train your team. We also offer ongoing training sessions and webinars.',
      },
      {
        question: 'Can I customize the system for my needs?',
        answer: 'Basic and Professional plans include standard customization options like branding, consultation types, and appointment rules. Enterprise plans offer extensive customization including custom integrations, API access, white-label options, and tailored features based on your specific requirements. Contact us to discuss your customization needs.',
      },
    ],
  },
];

export function FAQContent() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const categories = ['All', ...EXTENDED_FAQ_ITEMS.map(cat => cat.category)];

  // Filter FAQs based on category and search
  const filteredFAQs = useMemo(() => {
    let items = EXTENDED_FAQ_ITEMS.flatMap(category => 
      category.items.map(item => ({ ...item, category: category.category, icon: category.icon }))
    );

    if (selectedCategory !== 'All') {
      items = items.filter(item => item.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.question.toLowerCase().includes(query) || 
        item.answer.toLowerCase().includes(query)
      );
    }

    return items;
  }, [selectedCategory, searchQuery]);

  const toggleItem = (question: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(question)) {
      newOpenItems.delete(question);
    } else {
      newOpenItems.add(question);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <>
      {/* Page Header */}
      <section className="pt-24 pb-8 bg-gradient-to-b from-primary-50 to-white">
        <Container>
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <MessageCircleQuestion className="w-6 h-6 text-primary-600" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-healthcare-text mb-2">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h1>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              Find answers to common questions about TDAppointments
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-white border border-slate-300 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <section className="py-6 bg-white">
        <Container size="md">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {categories.map((category) => {
              const categoryData = EXTENDED_FAQ_ITEMS.find(c => c.category === category);
              const Icon = categoryData?.icon || HelpCircle;
              
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs transition-all ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {category}
                </button>
              );
            })}
          </div>

          {/* FAQ Items */}
          <div className="space-y-2">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((item, index) => {
                const isOpen = openItems.has(item.question);
                const Icon = item.icon;
                
                return (
                  <motion.div
                    key={item.question}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:border-primary-300 transition-all hover:shadow-sm"
                  >
                    <button
                      onClick={() => toggleItem(item.question)}
                      className="w-full flex items-start gap-3 p-3.5 text-left"
                    >
                      <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        isOpen ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-sm md:text-base leading-snug transition-colors ${
                          isOpen ? 'text-primary-700' : 'text-slate-900'
                        }`}>
                          {item.question}
                        </h3>
                        {!isOpen && item.category && (
                          <span className="inline-block mt-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {item.category}
                          </span>
                        )}
                      </div>

                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                          isOpen ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        <ChevronDown className="w-3 h-3" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-3.5 ml-10 pr-4 text-sm text-slate-700 leading-relaxed">
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <MessageCircleQuestion className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-700 mb-1">No FAQs found</h3>
                <p className="text-sm text-slate-500">
                  Try adjusting your search or category filter
                </p>
              </div>
            )}
          </div>

          {/* Contact Support CTA */}
          <div className="mt-8 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200 p-6 text-center">
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              Still have questions?
            </h2>
            <p className="text-sm text-slate-700 mb-4 max-w-xl mx-auto">
              Our support team is here to help. Get in touch and we'll respond within 2 hours during business hours.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="mailto:info@techdr.in"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md"
              >
                <Mail className="w-4 h-4" />
                Email Support
              </a>
              <a
                href="tel:+919032292171"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-primary-600 rounded-lg text-sm font-medium border border-primary-600 hover:bg-primary-50 transition-colors"
              >
                <Phone className="w-4 h-4" />
                +91 90322 92171
              </a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
