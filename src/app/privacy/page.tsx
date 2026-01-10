import { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { SITE_CONFIG } from '@/lib/constants';
import { Shield, Lock, Eye, FileText, Users, Globe } from 'lucide-react';

/**
 * Privacy Policy Page SEO Metadata
 */
export const metadata: Metadata = {
  title: 'Privacy Policy | TDAppointments',
  description: 'TDAppointments Privacy Policy. Learn how we collect, use, and protect your personal information and patient data in compliance with healthcare regulations.',
  keywords: [
    'privacy policy',
    'data protection',
    'healthcare privacy',
    'patient data security',
    'HIPAA compliance',
  ],
  alternates: {
    canonical: `${SITE_CONFIG.url}/privacy`,
  },
  openGraph: {
    title: 'Privacy Policy | TDAppointments',
    description: 'Learn how we collect, use, and protect your personal information and patient data.',
    url: `${SITE_CONFIG.url}/privacy`,
    type: 'website',
  },
};

export default function PrivacyPolicyPage() {
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
                <Shield className="w-8 h-8 text-primary-600" />
              </div>
            </div>
            <h1 className="heading-xl text-healthcare-text mb-4">
              Privacy <span className="text-gradient">Policy</span>
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
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Introduction</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                TDAppointments ("we," "our," or "us") is committed to protecting your privacy and the privacy of your patients. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
                healthcare appointment booking and clinic management software ("Service").
              </p>
              <p className="text-slate-700 leading-relaxed">
                By using TDAppointments, you agree to the collection and use of information in accordance with this policy. 
                We comply with applicable healthcare data protection laws, including HIPAA (Health Insurance Portability and 
                Accountability Act) in the United States and similar regulations in other jurisdictions.
              </p>
            </div>

            {/* Information We Collect */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <div className="flex items-start gap-3 mb-4">
                <FileText className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-bold text-slate-900">2. Information We Collect</h2>
              </div>
              
              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">2.1 Information You Provide</h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
                <li><strong>Account Information:</strong> Name, email address, phone number, clinic name, address, and business registration details</li>
                <li><strong>Doctor Information:</strong> Name, specialisation, qualifications, experience, consultation fees, and availability schedules</li>
                <li><strong>Patient Information:</strong> Name, phone number, email address, age, gender, medical history, appointment history, prescriptions, and consultation notes</li>
                <li><strong>Payment Information:</strong> Billing address, payment method details (processed securely through payment gateways), and transaction history</li>
                <li><strong>Communication Data:</strong> Messages sent through the platform, WhatsApp messages, and email communications</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">2.2 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li><strong>Usage Data:</strong> IP address, browser type, device information, operating system, access times, and pages viewed</li>
                <li><strong>Cookies and Tracking:</strong> Session cookies, authentication tokens, and analytics data to improve service functionality</li>
                <li><strong>Location Data:</strong> General location information based on IP address (used for regional compliance and service optimization)</li>
              </ul>
            </div>

            {/* How We Use Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <div className="flex items-start gap-3 mb-4">
                <Eye className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-bold text-slate-900">3. How We Use Your Information</h2>
              </div>
              
              <p className="text-slate-700 leading-relaxed mb-4">We use the collected information for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li><strong>Service Delivery:</strong> To provide, maintain, and improve our appointment booking and clinic management services</li>
                <li><strong>Appointment Management:</strong> To schedule, confirm, remind, cancel, and manage appointments between patients and healthcare providers</li>
                <li><strong>Communication:</strong> To send appointment confirmations, reminders via WhatsApp, email notifications, and important service updates</li>
                <li><strong>Payment Processing:</strong> To process subscription payments, consultation fees, and generate invoices</li>
                <li><strong>Patient Records:</strong> To maintain secure patient medical records, prescription history, and consultation notes as required by healthcare providers</li>
                <li><strong>Analytics and Reporting:</strong> To generate clinic analytics, appointment reports, revenue reports, and patient demographics for authorized users</li>
                <li><strong>Account Management:</strong> To manage user accounts, authenticate users, and provide customer support</li>
                <li><strong>Legal Compliance:</strong> To comply with legal obligations, respond to lawful requests, and protect our rights and the rights of our users</li>
                <li><strong>Security:</strong> To detect, prevent, and address security issues, fraud, and unauthorized access</li>
              </ul>
            </div>

            {/* Data Sharing and Disclosure */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <div className="flex items-start gap-3 mb-4">
                <Users className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-bold text-slate-900">4. Data Sharing and Disclosure</h2>
              </div>
              
              <p className="text-slate-700 leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information or patient data to third parties. We may share 
                information only in the following circumstances:
              </p>
              
              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">4.1 Service Providers</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                We work with trusted third-party service providers who assist in operating our platform:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
                <li><strong>Cloud Hosting:</strong> Secure cloud infrastructure providers with HIPAA-compliant data centers</li>
                <li><strong>Payment Processors:</strong> Secure payment gateway providers (Razorpay, Cashfree) for processing transactions</li>
                <li><strong>Communication Services:</strong> Twilio for WhatsApp messaging and teleconsultation services</li>
                <li><strong>Analytics:</strong> Service analytics providers (with data anonymization) to improve platform performance</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mb-4">
                All service providers are contractually obligated to maintain the confidentiality and security of your data 
                and are prohibited from using it for any purpose other than providing services to us.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">4.2 Legal Requirements</h3>
              <p className="text-slate-700 leading-relaxed">
                We may disclose information when required by law, court order, or government regulation, or to protect 
                the rights, property, or safety of TDAppointments, our users, or others.
              </p>
            </div>

            {/* Data Security */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <div className="flex items-start gap-3 mb-4">
                <Lock className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-bold text-slate-900">5. Data Security</h2>
              </div>
              
              <p className="text-slate-700 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li><strong>Encryption:</strong> All data is encrypted in transit (TLS 1.3) and at rest (AES-256 encryption)</li>
                <li><strong>Access Controls:</strong> Role-based access controls ensure only authorized personnel can access sensitive data</li>
                <li><strong>Authentication:</strong> Multi-factor authentication and secure password policies</li>
                <li><strong>Regular Audits:</strong> Security audits, vulnerability assessments, and penetration testing</li>
                <li><strong>Backup and Recovery:</strong> Automated daily backups with encrypted storage and disaster recovery procedures</li>
                <li><strong>Infrastructure:</strong> HIPAA-compliant cloud infrastructure with 99.9% uptime guarantee</li>
                <li><strong>Monitoring:</strong> 24/7 security monitoring and incident response procedures</li>
              </ul>
              
              <p className="text-slate-700 leading-relaxed mt-6">
                Despite our security measures, no method of transmission over the Internet or electronic storage is 100% secure. 
                We cannot guarantee absolute security but are committed to protecting your data to the best of our abilities.
              </p>
            </div>

            {/* Data Retention */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Data Retention</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We retain your information for as long as necessary to provide our services and comply with legal obligations:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li><strong>Active Accounts:</strong> Data is retained while your account is active and for a reasonable period thereafter</li>
                <li><strong>Patient Records:</strong> Patient medical records are retained as required by healthcare regulations (typically 7-10 years minimum)</li>
                <li><strong>Legal Requirements:</strong> Some data may be retained longer as required by law or for legitimate business purposes</li>
                <li><strong>Account Deletion:</strong> Upon account deletion request, we will delete or anonymize your data within 30 days, except where retention is required by law</li>
              </ul>
            </div>

            {/* Your Rights */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Your Rights</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Depending on your jurisdiction, you may have the following rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li><strong>Access:</strong> Request access to your personal information and patient data</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal retention requirements)</li>
                <li><strong>Data Portability:</strong> Request a copy of your data in a structured, machine-readable format</li>
                <li><strong>Objection:</strong> Object to processing of your information for certain purposes</li>
                <li><strong>Withdrawal of Consent:</strong> Withdraw consent for data processing where consent is the legal basis</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-6">
                To exercise these rights, please contact us at <a href="mailto:privacy@tdappointments.com" className="text-primary-600 hover:text-primary-700 font-medium">privacy@tdappointments.com</a>
              </p>
            </div>

            {/* Cookies and Tracking */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Cookies and Tracking Technologies</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to improve your experience:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li><strong>Essential Cookies:</strong> Required for authentication and core functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-6">
                You can control cookies through your browser settings. However, disabling certain cookies may limit 
                functionality of the Service.
              </p>
            </div>

            {/* International Data Transfers */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <div className="flex items-start gap-3 mb-4">
                <Globe className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-bold text-slate-900">9. International Data Transfers</h2>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence. 
                We ensure that appropriate safeguards are in place to protect your data in accordance with this Privacy 
                Policy and applicable data protection laws, including standard contractual clauses and adequacy decisions 
                where required.
              </p>
            </div>

            {/* Children's Privacy */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Children's Privacy</h2>
              <p className="text-slate-700 leading-relaxed">
                Our Service is not intended for individuals under the age of 18. We do not knowingly collect personal 
                information from children. If we become aware that we have collected information from a child without 
                parental consent, we will take steps to delete that information. Parents or guardians who believe their 
                child's information has been collected should contact us immediately.
              </p>
            </div>

            {/* Changes to Privacy Policy */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Changes to This Privacy Policy</h2>
              <p className="text-slate-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by 
                posting the new Privacy Policy on this page and updating the "Last updated" date. We may also notify 
                you via email or through the Service. Your continued use of the Service after such changes constitutes 
                acceptance of the updated Privacy Policy.
              </p>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl border border-primary-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Contact Us</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, 
                please contact us:
              </p>
              <div className="space-y-2 text-slate-700">
                <p>
                  <strong>Email:</strong>{' '}
                  <a href="mailto:privacy@tdappointments.com" className="text-primary-600 hover:text-primary-700 font-medium">
                    privacy@tdappointments.com
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
