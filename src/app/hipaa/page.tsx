import { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { SITE_CONFIG } from '@/lib/constants';
import { ShieldCheck, Lock, FileCheck, Users, AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * HIPAA Compliance Page SEO Metadata
 */
export const metadata: Metadata = {
  title: 'HIPAA Compliance | TDAppointments',
  description: 'TDAppointments HIPAA Compliance information. Learn how we comply with HIPAA regulations and protect Protected Health Information (PHI) in our healthcare software.',
  keywords: [
    'HIPAA compliance',
    'HIPAA compliant software',
    'healthcare data protection',
    'PHI protection',
    'HIPAA security',
    'healthcare privacy compliance',
  ],
  alternates: {
    canonical: `${SITE_CONFIG.url}/hipaa`,
  },
  openGraph: {
    title: 'HIPAA Compliance | TDAppointments',
    description: 'Learn how TDAppointments complies with HIPAA regulations and protects Protected Health Information.',
    url: `${SITE_CONFIG.url}/hipaa`,
    type: 'website',
  },
};

export default function HIPAACompliancePage() {
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
                <ShieldCheck className="w-8 h-8 text-primary-600" />
              </div>
            </div>
            <h1 className="heading-xl text-healthcare-text mb-4">
              HIPAA <span className="text-gradient">Compliance</span>
            </h1>
            <p className="body-lg text-slate-600 max-w-2xl mx-auto">
              Our commitment to protecting Protected Health Information (PHI) in accordance with HIPAA regulations
            </p>
            <p className="text-sm text-slate-500 mt-2">Last updated: {currentDate}</p>
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <Container size="md">
          <div className="prose prose-slate max-w-none">
            {/* Introduction */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl border border-primary-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">What is HIPAA?</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                The Health Insurance Portability and Accountability Act (HIPAA) of 1996 is a United States federal law 
                that establishes national standards for protecting sensitive patient health information. HIPAA requires 
                healthcare providers, health plans, and healthcare clearinghouses (known as "covered entities") and their 
                business associates to implement safeguards to protect Protected Health Information (PHI).
              </p>
              <p className="text-slate-700 leading-relaxed">
                TDAppointments is designed to help healthcare providers comply with HIPAA requirements by implementing 
                comprehensive administrative, physical, and technical safeguards to protect PHI.
              </p>
            </div>

            {/* Our Commitment */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <div className="flex items-start gap-3 mb-4">
                <ShieldCheck className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-bold text-slate-900">Our HIPAA Compliance Commitment</h2>
              </div>
              <p className="text-slate-700 leading-relaxed mb-4">
                TDAppointments is committed to maintaining HIPAA compliance and protecting PHI. While we implement 
                technical and administrative safeguards to support HIPAA compliance, it is important to understand that:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>HIPAA compliance is a shared responsibility between healthcare providers and their business associates</li>
                <li>Healthcare providers using TDAppointments are responsible for their own HIPAA compliance program</li>
                <li>We serve as a Business Associate and implement safeguards as required by the HIPAA Business Associate Agreement (BAA)</li>
                <li>Our platform is designed to support HIPAA compliance, but proper use and configuration by healthcare providers is essential</li>
              </ul>
            </div>

            {/* Administrative Safeguards */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <div className="flex items-start gap-3 mb-4">
                <FileCheck className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-bold text-slate-900">Administrative Safeguards</h2>
              </div>
              <p className="text-slate-700 leading-relaxed mb-4">
                We implement comprehensive administrative safeguards to ensure HIPAA compliance:
              </p>
              
              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Business Associate Agreements (BAA)</h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
                <li>We execute Business Associate Agreements with all healthcare providers using our platform</li>
                <li>BAAs outline our responsibilities for protecting PHI and complying with HIPAA requirements</li>
                <li>All agreements are reviewed by legal counsel and include standard HIPAA compliance provisions</li>
                <li>BAAs can be provided upon request during the onboarding process</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Workforce Training and Management</h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
                <li>All employees with access to PHI undergo HIPAA training upon hiring and annually thereafter</li>
                <li>Access to PHI is limited to authorized personnel on a need-to-know basis</li>
                <li>Regular security awareness training ensures staff understand their responsibilities</li>
                <li>Background checks are conducted for employees with access to sensitive data</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Security Officer and Incident Management</h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>Designated Security Officer oversees HIPAA compliance and security measures</li>
                <li>Incident response procedures are documented and tested regularly</li>
                <li>Security incidents are investigated and remediated according to HIPAA breach notification rules</li>
                <li>Breach notification procedures comply with HIPAA requirements (notification within 60 days)</li>
              </ul>
            </div>

            {/* Physical Safeguards */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <div className="flex items-start gap-3 mb-4">
                <Lock className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-bold text-slate-900">Physical Safeguards</h2>
              </div>
              <p className="text-slate-700 leading-relaxed mb-4">
                We implement robust physical safeguards to protect PHI stored and processed in our infrastructure:
              </p>
              
              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Data Center Security</h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
                <li>All data is hosted in HIPAA-compliant, SOC 2 Type II certified cloud data centers</li>
                <li>Data centers are located in secure facilities with 24/7 physical security monitoring</li>
                <li>Access to data centers requires multi-factor authentication and is logged and audited</li>
                <li>Environmental controls (fire suppression, climate control, backup power) protect infrastructure</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Device and Media Controls</h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>Workstations and devices that access PHI are encrypted and password-protected</li>
                <li>Removable media containing PHI is encrypted and tracked</li>
                <li>Secure disposal procedures ensure PHI is properly destroyed when no longer needed</li>
                <li>Mobile device management enforces security policies on company devices</li>
              </ul>
            </div>

            {/* Technical Safeguards */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Technical Safeguards</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Technical safeguards are critical for protecting PHI in our cloud-based platform:
              </p>
              
              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Access Controls</h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
                <li><strong>Unique User Identification:</strong> Each user has a unique identifier and secure authentication</li>
                <li><strong>Role-Based Access Control:</strong> Access to PHI is restricted based on job function and responsibilities</li>
                <li><strong>Multi-Factor Authentication:</strong> MFA is required for all accounts with access to PHI</li>
                <li><strong>Session Management:</strong> Automatic session timeout after periods of inactivity</li>
                <li><strong>Password Policies:</strong> Strong password requirements and regular password changes</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Encryption</h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
                <li><strong>Encryption in Transit:</strong> All data transmitted between users and our servers is encrypted using TLS 1.3</li>
                <li><strong>Encryption at Rest:</strong> All PHI stored in databases is encrypted using AES-256 encryption</li>
                <li><strong>Backup Encryption:</strong> All backups are encrypted before storage</li>
                <li><strong>Key Management:</strong> Encryption keys are managed securely using industry-standard key management systems</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Audit Controls</h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
                <li>Comprehensive audit logging tracks all access to PHI, including who, what, when, and from where</li>
                <li>Audit logs are retained for a minimum of 6 years as required by HIPAA</li>
                <li>Regular audit log reviews identify unauthorized access or suspicious activity</li>
                <li>Audit logs are tamper-proof and cannot be modified or deleted</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Transmission Security</h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>All API communications are secured using TLS encryption</li>
                <li>WhatsApp messages are transmitted through Twilio's secure infrastructure</li>
                <li>Email notifications use secure email protocols (TLS/SSL)</li>
                <li>Network segmentation and firewalls protect against unauthorized access</li>
              </ul>
            </div>

            {/* Data Breach Response */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-bold text-slate-900">Breach Notification and Response</h2>
              </div>
              <p className="text-slate-700 leading-relaxed mb-4">
                In the event of a security incident that may compromise PHI, we follow HIPAA breach notification requirements:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li><strong>Incident Detection:</strong> 24/7 security monitoring detects potential security incidents</li>
                <li><strong>Immediate Response:</strong> Security incidents are investigated immediately upon detection</li>
                <li><strong>Risk Assessment:</strong> We assess whether a breach occurred and the risk to PHI</li>
                <li><strong>Breach Notification:</strong> Covered entities are notified of breaches within 60 days as required by HIPAA</li>
                <li><strong>Remediation:</strong> Immediate steps are taken to contain and remediate security incidents</li>
                <li><strong>Documentation:</strong> All security incidents and breaches are thoroughly documented</li>
              </ul>
            </div>

            {/* Your Responsibilities */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <div className="flex items-start gap-3 mb-4">
                <Users className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-bold text-slate-900">Your Responsibilities as a Healthcare Provider</h2>
              </div>
              <p className="text-slate-700 leading-relaxed mb-4">
                HIPAA compliance is a shared responsibility. As a healthcare provider using TDAppointments, you must:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
                <li>Execute a Business Associate Agreement (BAA) with TDAppointments before using the Service with PHI</li>
                <li>Obtain patient authorization for collecting and storing PHI in accordance with HIPAA</li>
                <li>Implement your own HIPAA compliance program, including workforce training and policies</li>
                <li>Use strong, unique passwords and enable multi-factor authentication on your accounts</li>
                <li>Control access to your TDAppointments account and ensure only authorized personnel have access</li>
                <li>Report security incidents or suspected breaches to TDAppointments immediately</li>
                <li>Comply with minimum necessary standards when accessing and sharing PHI</li>
                <li>Maintain appropriate backup and recovery procedures for your data</li>
              </ul>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
                <p className="text-slate-700 leading-relaxed">
                  <strong>Important:</strong> While TDAppointments implements technical and administrative safeguards 
                  to support HIPAA compliance, you remain responsible for your own HIPAA compliance as a covered entity. 
                  Using our platform does not automatically make you HIPAA compliant. You must ensure your own compliance 
                  program, policies, and procedures are in place.
                </p>
              </div>
            </div>

            {/* Compliance Documentation */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Compliance Documentation and Certifications</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We maintain comprehensive documentation of our HIPAA compliance efforts:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li><strong>SOC 2 Type II:</strong> Annual SOC 2 audits validate our security controls and processes</li>
                <li><strong>Penetration Testing:</strong> Regular third-party penetration testing identifies and addresses vulnerabilities</li>
                <li><strong>Security Assessments:</strong> Annual security risk assessments evaluate our HIPAA compliance posture</li>
                <li><strong>Policy Documentation:</strong> Written policies and procedures document our security and compliance measures</li>
                <li><strong>BAAs:</strong> Business Associate Agreements are available for review and execution</li>
              </ul>
            </div>

            {/* Regular Updates */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Ongoing Compliance Efforts</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                HIPAA compliance is an ongoing process. We continuously:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>Monitor and update security controls to address evolving threats</li>
                <li>Conduct regular security training for our workforce</li>
                <li>Review and update policies and procedures</li>
                <li>Perform security assessments and risk analyses</li>
                <li>Stay current with HIPAA regulatory updates and guidance</li>
                <li>Update our platform to maintain compliance with changing requirements</li>
              </ul>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl border border-primary-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Questions About HIPAA Compliance?</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                If you have questions about our HIPAA compliance program or need to execute a Business Associate Agreement, 
                please contact us:
              </p>
              <div className="space-y-2 text-slate-700">
                <p>
                  <strong>Compliance Email:</strong>{' '}
                  <a href="mailto:compliance@tdappointments.com" className="text-primary-600 hover:text-primary-700 font-medium">
                    compliance@tdappointments.com
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
              <div className="mt-6 p-4 bg-white/50 rounded-lg border border-primary-200">
                <p className="text-sm text-slate-600">
                  <strong>Legal Disclaimer:</strong> This page provides general information about TDAppointments' HIPAA 
                  compliance efforts. It does not constitute legal advice. Healthcare providers should consult with legal 
                  counsel to ensure their own HIPAA compliance. While we implement safeguards to support HIPAA compliance, 
                  each healthcare provider is responsible for their own compliance program.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
