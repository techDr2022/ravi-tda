import { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { SITE_CONFIG } from '@/lib/constants';
import { FileText, AlertTriangle, CheckCircle, XCircle, Shield } from 'lucide-react';

/**
 * Terms of Service Page SEO Metadata
 */
export const metadata: Metadata = {
  title: 'Terms of Service | TDAppointments',
  description: 'TDAppointments Terms of Service. Read our terms and conditions for using our healthcare appointment booking and clinic management software.',
  keywords: [
    'terms of service',
    'terms and conditions',
    'user agreement',
    'service terms',
    'healthcare software terms',
  ],
  alternates: {
    canonical: `${SITE_CONFIG.url}/terms`,
  },
  openGraph: {
    title: 'Terms of Service | TDAppointments',
    description: 'Read our terms and conditions for using our healthcare appointment booking software.',
    url: `${SITE_CONFIG.url}/terms`,
    type: 'website',
  },
};

export default function TermsOfServicePage() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      {/* Page Header */}
      <section className="pt-32 pb-12 bg-gradient-to-b from-primary-50 to-white">
        <Container>
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
                <FileText className="w-8 h-8 text-primary-600" />
              </div>
            </div>
            <h1 className="heading-xl text-healthcare-text mb-4">
              Terms of <span className="text-gradient">Service</span>
            </h1>
            <p className="body-lg text-slate-600 max-w-2xl mx-auto">
              Last updated: {currentDate}
            </p>
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <Container size="md">
          <div className="prose prose-slate max-w-none">
            {/* Introduction */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Welcome to TDAppointments. These Terms of Service ("Terms") constitute a legally binding agreement 
                between you ("User," "you," or "your") and TDAppointments ("we," "us," or "our") regarding your use 
                of our healthcare appointment booking and clinic management software ("Service").
              </p>
              <p className="text-slate-700 leading-relaxed">
                By accessing or using TDAppointments, you agree to be bound by these Terms. If you do not agree to 
                these Terms, you may not use our Service. These Terms apply to all users, including healthcare providers, 
                clinics, hospitals, patients, and administrators.
              </p>
            </div>

            {/* Description of Service */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <div className="flex items-start gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-bold text-slate-900">2. Description of Service</h2>
              </div>
              <p className="text-slate-700 leading-relaxed mb-4">
                TDAppointments is a cloud-based Software-as-a-Service (SaaS) platform that provides:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>Online appointment booking and scheduling for healthcare providers</li>
                <li>Clinic and patient management systems</li>
                <li>Automated WhatsApp appointment reminders and confirmations</li>
                <li>Teleconsultation platform with video and voice capabilities</li>
                <li>Secure payment processing for consultations</li>
                <li>Google My Business integration for direct booking</li>
                <li>Analytics and reporting tools</li>
                <li>Prescription management and patient records</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-6">
                We reserve the right to modify, suspend, or discontinue any part of the Service at any time with or 
                without notice. We are not liable to you or any third party for any modification, suspension, or 
                discontinuation of the Service.
              </p>
            </div>

            {/* User Accounts */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. User Accounts</h2>
              
              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">3.1 Account Registration</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                To use certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and update your account information to keep it accurate and complete</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">3.2 Account Eligibility</h3>
              <p className="text-slate-700 leading-relaxed">
                You must be at least 18 years old to create an account. By creating an account, you represent and 
                warrant that you are of legal age and have the authority to enter into these Terms. Healthcare providers 
                must have valid professional licenses where applicable.
              </p>
            </div>

            {/* Acceptable Use */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <div className="flex items-start gap-3 mb-4">
                <Shield className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-bold text-slate-900">4. Acceptable Use Policy</h2>
              </div>
              <p className="text-slate-700 leading-relaxed mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
                <li>Use the Service for any illegal purpose or in violation of any laws or regulations</li>
                <li>Violate any healthcare privacy laws, including HIPAA, GDPR, or local data protection regulations</li>
                <li>Upload, transmit, or distribute any malicious code, viruses, or harmful software</li>
                <li>Attempt to gain unauthorized access to the Service or other users' accounts</li>
                <li>Interfere with or disrupt the Service, servers, or networks connected to the Service</li>
                <li>Use automated systems (bots, scrapers) to access the Service without authorization</li>
                <li>Impersonate any person or entity or falsely claim affiliation with any entity</li>
                <li>Share your account credentials with others or allow unauthorized access to your account</li>
                <li>Use the Service to send spam, unsolicited messages, or promotional content</li>
                <li>Reverse engineer, decompile, or attempt to extract the source code of the Service</li>
                <li>Remove, alter, or obscure any proprietary notices or labels on the Service</li>
              </ul>
              <p className="text-slate-700 leading-relaxed">
                We reserve the right to suspend or terminate your account immediately for violation of this Acceptable 
                Use Policy.
              </p>
            </div>

            {/* Subscription and Payment */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Subscription and Payment Terms</h2>
              
              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">5.1 Subscription Plans</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                TDAppointments offers subscription plans with different features and pricing tiers. All prices are 
                in Indian Rupees (INR) and exclude applicable taxes (GST). Subscription fees are billed annually.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">5.2 Free Trial</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                We offer a 14-day free trial for new users. No credit card is required during the trial period. 
                At the end of the trial, your subscription will automatically convert to the selected paid plan 
                unless you cancel before the trial expires.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">5.3 Payment</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Payment must be made through our secure payment gateway. You authorize us to charge your payment 
                method for all subscription fees and any applicable taxes. All fees are non-refundable except as 
                required by law or as explicitly stated in these Terms.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">5.4 Auto-Renewal</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Subscriptions automatically renew at the end of each billing period unless you cancel before the 
                renewal date. You may cancel your subscription at any time through your account settings.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">5.5 Price Changes</h3>
              <p className="text-slate-700 leading-relaxed">
                We reserve the right to modify subscription prices. Price changes will be communicated to you at 
                least 30 days before they take effect. Continued use of the Service after a price change constitutes 
                acceptance of the new pricing.
              </p>
            </div>

            {/* Intellectual Property */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Intellectual Property Rights</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                The Service, including all software, designs, text, graphics, logos, and other content, is owned by 
                TDAppointments and protected by copyright, trademark, and other intellectual property laws. You are 
                granted a limited, non-exclusive, non-transferable license to use the Service in accordance with 
                these Terms.
              </p>
              <p className="text-slate-700 leading-relaxed">
                You retain ownership of all data and content you upload to the Service ("User Content"). By uploading 
                User Content, you grant us a worldwide, non-exclusive license to use, store, and process your User 
                Content solely for the purpose of providing the Service to you.
              </p>
            </div>

            {/* Patient Data and Privacy */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Patient Data and Privacy</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                As a healthcare provider using TDAppointments, you are responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
                <li>Obtaining proper patient consent for collecting, storing, and processing patient data</li>
                <li>Complying with all applicable healthcare privacy laws, including HIPAA, GDPR, and local regulations</li>
                <li>Maintaining the confidentiality and security of patient information</li>
                <li>Using the Service only for legitimate healthcare purposes</li>
                <li>Not sharing patient data with unauthorized third parties</li>
              </ul>
              <p className="text-slate-700 leading-relaxed">
                TDAppointments implements security measures to protect patient data, but you remain responsible for 
                your compliance with healthcare privacy regulations. Our Privacy Policy describes how we handle 
                personal information and patient data.
              </p>
            </div>

            {/* Disclaimer of Warranties */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-bold text-slate-900">8. Disclaimer of Warranties</h2>
              </div>
              <p className="text-slate-700 leading-relaxed mb-4">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS 
                OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
                <li>Warranties of merchantability, fitness for a particular purpose, or non-infringement</li>
                <li>Warranties that the Service will be uninterrupted, secure, error-free, or available at all times</li>
                <li>Warranties regarding the accuracy, reliability, or completeness of any information provided through the Service</li>
                <li>Warranties that defects will be corrected or that the Service is free of viruses or harmful components</li>
              </ul>
              <p className="text-slate-700 leading-relaxed">
                We do not provide medical advice, diagnosis, or treatment. The Service is a management tool and does 
                not replace professional medical judgment or the physician-patient relationship. Healthcare providers 
                are solely responsible for all medical decisions and patient care.
              </p>
            </div>

            {/* Limitation of Liability */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <div className="flex items-start gap-3 mb-4">
                <XCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-bold text-slate-900">9. Limitation of Liability</h2>
              </div>
              <p className="text-slate-700 leading-relaxed mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, TDAPPOINTMENTS SHALL NOT BE LIABLE FOR:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
                <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, revenue, data, or business opportunities</li>
                <li>Service interruptions, downtime, or technical failures</li>
                <li>Errors or omissions in the Service or any content provided</li>
                <li>Medical malpractice, misdiagnosis, or patient harm resulting from use of the Service</li>
              </ul>
              <p className="text-slate-700 leading-relaxed">
                Our total liability for any claims arising from or related to the Service shall not exceed the amount 
                you paid us in the 12 months preceding the claim. Some jurisdictions do not allow the exclusion or 
                limitation of certain damages, so some of the above limitations may not apply to you.
              </p>
            </div>

            {/* Indemnification */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Indemnification</h2>
              <p className="text-slate-700 leading-relaxed">
                You agree to indemnify, defend, and hold harmless TDAppointments, its officers, directors, employees, 
                and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising 
                from: (a) your use of the Service; (b) your violation of these Terms; (c) your violation of any rights 
                of another party; (d) your violation of any applicable laws or regulations; or (e) any patient data or 
                content you submit through the Service.
              </p>
            </div>

            {/* Termination */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Termination</h2>
              
              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">11.1 Termination by You</h3>
              <p className="text-slate-700 leading-relaxed mb-6">
                You may cancel your subscription and terminate your account at any time through your account settings 
                or by contacting us. Upon termination, your access to the Service will cease, and you will not be 
                entitled to a refund of any prepaid fees.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">11.2 Termination by Us</h3>
              <p className="text-slate-700 leading-relaxed mb-6">
                We may suspend or terminate your account immediately if you violate these Terms, engage in fraudulent 
                activity, fail to pay subscription fees, or for any other reason we deem necessary to protect the 
                Service or other users.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">11.3 Effect of Termination</h3>
              <p className="text-slate-700 leading-relaxed">
                Upon termination, your right to use the Service will immediately cease. We may delete your account 
                and data after a reasonable retention period as required by law. You are responsible for exporting 
                your data before termination.
              </p>
            </div>

            {/* Governing Law */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Governing Law and Dispute Resolution</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                These Terms shall be governed by and construed in accordance with the laws of India, without regard 
                to its conflict of law provisions. Any disputes arising from or related to these Terms or the Service 
                shall be subject to the exclusive jurisdiction of the courts in India.
              </p>
              <p className="text-slate-700 leading-relaxed">
                Before filing a claim, you agree to first contact us to attempt to resolve the dispute informally. 
                If we cannot resolve the dispute within 60 days, you may proceed with formal legal action.
              </p>
            </div>

            {/* Changes to Terms */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">13. Changes to Terms</h2>
              <p className="text-slate-700 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify you of material changes by 
                posting the updated Terms on this page and updating the "Last updated" date. We may also notify you 
                via email or through the Service. Your continued use of the Service after such changes constitutes 
                acceptance of the updated Terms.
              </p>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl border border-primary-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">14. Contact Information</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                If you have questions about these Terms, please contact us:
              </p>
              <div className="space-y-2 text-slate-700">
                <p>
                  <strong>Email:</strong>{' '}
                  <a href="mailto:legal@tdappointments.com" className="text-primary-600 hover:text-primary-700 font-medium">
                    legal@tdappointments.com
                  </a>
                </p>
                <p>
                  <strong>Support Email:</strong>{' '}
                  <a href="mailto:info@techdr.in" className="text-primary-600 hover:text-primary-700 font-medium">
                    info@techdr.in
                  </a>
                </p>
                <p>
                  <strong>Phone:</strong>{' '}
                  <a href="tel:+919032292171" className="text-primary-600 hover:text-primary-700 font-medium">
                    +91 90322 92171
                  </a>
                </p>
                <p>
                  <strong>Address:</strong> India
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
