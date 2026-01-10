import { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { SITE_CONFIG } from '@/lib/constants';
import { Shield, Lock, Server, Key, Eye, CheckCircle2, AlertTriangle } from 'lucide-react';

/**
 * Data Security Page SEO Metadata
 */
export const metadata: Metadata = {
  title: 'Data Security | TDAppointments',
  description: 'TDAppointments data security measures. Learn about our encryption, access controls, infrastructure security, and comprehensive data protection measures.',
  keywords: [
    'data security',
    'healthcare data protection',
    'encryption',
    'secure cloud hosting',
    'data backup',
    'cybersecurity',
    'patient data security',
  ],
  alternates: {
    canonical: `${SITE_CONFIG.url}/security`,
  },
  openGraph: {
    title: 'Data Security | TDAppointments',
    description: 'Learn about our comprehensive data security measures and infrastructure protection.',
    url: `${SITE_CONFIG.url}/security`,
    type: 'website',
  },
};

export default function DataSecurityPage() {
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
              Data <span className="text-gradient">Security</span>
            </h1>
            <p className="body-lg text-slate-600 max-w-2xl mx-auto">
              Comprehensive security measures protecting your data and patient information
            </p>
            <p className="text-sm text-slate-500 mt-2">Last updated: {currentDate}</p>
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <Container size="md">
          <div className="prose prose-slate max-w-none">
            {/* Overview */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl border border-primary-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Security Commitment</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                At TDAppointments, security is not an afterthought—it's built into every aspect of our platform. 
                We understand that healthcare data is highly sensitive, and we implement industry-leading security 
                measures to protect your information and your patients' Protected Health Information (PHI).
              </p>
              <p className="text-slate-700 leading-relaxed">
                Our security program follows international standards including HIPAA, SOC 2, and ISO 27001 frameworks, 
                ensuring your data is protected with bank-grade security measures.
              </p>
            </div>

            {/* Encryption */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <div className="flex items-start gap-3 mb-4">
                <Lock className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-bold text-slate-900">Encryption</h2>
              </div>
              
              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Encryption in Transit</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                All data transmitted between your devices and our servers is protected using industry-standard encryption:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
                <li><strong>TLS 1.3:</strong> All web traffic uses Transport Layer Security (TLS) 1.3, the latest encryption protocol</li>
                <li><strong>Perfect Forward Secrecy:</strong> Each session uses unique encryption keys, protecting past communications even if keys are compromised</li>
                <li><strong>HTTPS Everywhere:</strong> All connections are secured with HTTPS, preventing man-in-the-middle attacks</li>
                <li><strong>API Security:</strong> All API communications are encrypted and authenticated using secure tokens</li>
                <li><strong>WhatsApp Integration:</strong> Messages transmitted through Twilio's secure infrastructure with end-to-end encryption</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Encryption at Rest</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                All data stored in our databases and storage systems is encrypted:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
                <li><strong>AES-256 Encryption:</strong> Advanced Encryption Standard with 256-bit keys—the same standard used by banks and governments</li>
                <li><strong>Database Encryption:</strong> All databases encrypt data at the field level, protecting sensitive information</li>
                <li><strong>Backup Encryption:</strong> All backups are encrypted before storage, ensuring data remains protected even in backup systems</li>
                <li><strong>File Storage:</strong> Uploaded files, documents, and images are encrypted before storage</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Key Management</h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>Encryption keys are managed using industry-standard Key Management Services (KMS)</li>
                <li>Keys are rotated regularly according to security best practices</li>
                <li>Key access is strictly controlled and logged</li>
                <li>Keys never leave secure, encrypted storage</li>
              </ul>
            </div>

            {/* Access Controls */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <div className="flex items-start gap-3 mb-4">
                <Key className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-bold text-slate-900">Access Controls</h2>
              </div>
              
              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Authentication</h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
                <li><strong>Strong Password Requirements:</strong> Minimum complexity requirements, password length, and character variety</li>
                <li><strong>Multi-Factor Authentication (MFA):</strong> Required for all accounts, adding an extra layer of security beyond passwords</li>
                <li><strong>Single Sign-On (SSO):</strong> Enterprise customers can integrate with their existing identity providers</li>
                <li><strong>Session Management:</strong> Secure session tokens with automatic expiration after inactivity</li>
                <li><strong>Account Lockout:</strong> Protection against brute-force attacks with temporary account lockout after failed attempts</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Authorization</h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
                <li><strong>Role-Based Access Control (RBAC):</strong> Users are granted access based on their role and responsibilities</li>
                <li><strong>Principle of Least Privilege:</strong> Users only have access to data and features necessary for their job function</li>
                <li><strong>Granular Permissions:</strong> Fine-grained control over what users can view, edit, or delete</li>
                <li><strong>Patient Data Isolation:</strong> Healthcare providers can only access their own patient data, not data from other clinics</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Employee Access</h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>TDAppointments employees only access customer data when necessary for support or maintenance</li>
                <li>All employee access is logged, monitored, and requires approval</li>
                <li>Background checks are conducted for employees with access to sensitive data</li>
                <li>Regular access reviews ensure employees only have access they need</li>
              </ul>
            </div>

            {/* Infrastructure Security */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <div className="flex items-start gap-3 mb-4">
                <Server className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-bold text-slate-900">Infrastructure Security</h2>
              </div>
              
              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Cloud Infrastructure</h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
                <li><strong>HIPAA-Compliant Hosting:</strong> Data is hosted in HIPAA-compliant, SOC 2 Type II certified cloud data centers</li>
                <li><strong>Redundant Infrastructure:</strong> Multiple data centers ensure high availability and disaster recovery</li>
                <li><strong>99.9% Uptime SLA:</strong> Guaranteed service availability with redundant systems and automatic failover</li>
                <li><strong>Geographic Redundancy:</strong> Data is replicated across multiple geographic regions for disaster recovery</li>
                <li><strong>DDoS Protection:</strong> Advanced Distributed Denial of Service (DDoS) protection prevents service disruptions</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Network Security</h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
                <li><strong>Firewalls:</strong> Multi-layer firewall protection with strict access rules</li>
                <li><strong>Network Segmentation:</strong> Isolated network segments limit access to sensitive systems</li>
                <li><strong>Intrusion Detection:</strong> Real-time monitoring detects and prevents unauthorized access attempts</li>
                <li><strong>VPN Access:</strong> Employee access to infrastructure requires secure VPN connections</li>
                <li><strong>Regular Security Updates:</strong> All systems are patched regularly to address known vulnerabilities</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Physical Security</h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>Data centers are secured with 24/7 physical security monitoring</li>
                <li>Access requires biometric authentication and multi-factor verification</li>
                <li>All access to data centers is logged and audited</li>
                <li>Environmental controls protect against fire, floods, and other disasters</li>
                <li>Backup power generators ensure continuous operation during power outages</li>
              </ul>
            </div>

            {/* Data Backup and Recovery */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Data Backup and Recovery</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Comprehensive backup and recovery procedures ensure your data is never lost:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li><strong>Automated Daily Backups:</strong> Full database backups are performed daily and stored securely</li>
                <li><strong>Point-in-Time Recovery:</strong> Database transaction logs enable recovery to any point in time</li>
                <li><strong>Encrypted Backups:</strong> All backups are encrypted before storage, matching production security</li>
                <li><strong>Offsite Storage:</strong> Backups are stored in separate geographic locations for disaster recovery</li>
                <li><strong>Retention Period:</strong> Backups are retained for a minimum of 30 days, with longer retention available</li>
                <li><strong>Regular Testing:</strong> Backup and recovery procedures are tested regularly to ensure they work correctly</li>
                <li><strong>Recovery Time Objective (RTO):</strong> Less than 4 hours to restore service after a disaster</li>
                <li><strong>Recovery Point Objective (RPO):</strong> Maximum data loss of 1 hour in the event of a disaster</li>
              </ul>
            </div>

            {/* Monitoring and Logging */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <div className="flex items-start gap-3 mb-4">
                <Eye className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-bold text-slate-900">Monitoring and Logging</h2>
              </div>
              
              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Security Monitoring</h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
                <li><strong>24/7 Security Operations Center:</strong> Continuous monitoring of security events and threats</li>
                <li><strong>Real-Time Alerts:</strong> Immediate notifications for suspicious activity or security incidents</li>
                <li><strong>Threat Intelligence:</strong> Integration with threat intelligence feeds to detect emerging threats</li>
                <li><strong>Anomaly Detection:</strong> Machine learning algorithms detect unusual patterns that may indicate attacks</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">Comprehensive Logging</h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>All access to PHI and sensitive data is logged with timestamp, user, and action</li>
                <li>Audit logs are tamper-proof and cannot be modified or deleted</li>
                <li>Logs are retained for a minimum of 6 years as required by healthcare regulations</li>
                <li>Regular log reviews identify unauthorized access or policy violations</li>
                <li>Logs are encrypted and stored securely</li>
              </ul>
            </div>

            {/* Security Testing */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Security Testing and Assessments</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We regularly test and assess our security measures:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li><strong>Penetration Testing:</strong> Annual third-party penetration testing by certified security professionals</li>
                <li><strong>Vulnerability Scanning:</strong> Automated vulnerability scans are performed weekly</li>
                <li><strong>Code Security Reviews:</strong> All code changes are reviewed for security issues before deployment</li>
                <li><strong>Security Audits:</strong> Annual SOC 2 Type II audits validate our security controls</li>
                <li><strong>Bug Bounty Program:</strong> Security researchers are rewarded for responsibly reporting vulnerabilities</li>
                <li><strong>Third-Party Security Assessments:</strong> Independent security firms assess our security posture</li>
              </ul>
            </div>

            {/* Compliance */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Compliance and Certifications</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Our security program complies with industry standards and regulations:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li><strong>HIPAA:</strong> Compliant with Health Insurance Portability and Accountability Act requirements</li>
                <li><strong>SOC 2 Type II:</strong> Annual audits validate our security, availability, and confidentiality controls</li>
                <li><strong>GDPR:</strong> Compliant with General Data Protection Regulation for European users</li>
                <li><strong>ISO 27001:</strong> Security management system aligned with ISO 27001 standards</li>
                <li><strong>PCI DSS:</strong> Payment processing complies with Payment Card Industry Data Security Standards</li>
              </ul>
            </div>

            {/* Incident Response */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
                <h2 className="text-2xl font-bold text-slate-900">Incident Response</h2>
              </div>
              <p className="text-slate-700 leading-relaxed mb-4">
                We have a comprehensive incident response plan to quickly address security incidents:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li><strong>Incident Detection:</strong> Automated systems and security team monitor for security incidents</li>
                <li><strong>Response Team:</strong> Dedicated security incident response team available 24/7</li>
                <li><strong>Containment:</strong> Immediate steps to contain and limit the impact of security incidents</li>
                <li><strong>Investigation:</strong> Thorough investigation to understand the cause and scope of incidents</li>
                <li><strong>Remediation:</strong> Prompt remediation to eliminate threats and prevent recurrence</li>
                <li><strong>Notification:</strong> Affected customers are notified within 72 hours of discovering a security incident</li>
                <li><strong>Documentation:</strong> All incidents are documented and lessons learned are incorporated into security improvements</li>
              </ul>
            </div>

            {/* Your Role in Security */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Your Role in Security</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Security is a shared responsibility. You can help protect your data by:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>Using strong, unique passwords and enabling multi-factor authentication</li>
                <li>Limiting access to your account to authorized personnel only</li>
                <li>Keeping your devices and browsers updated with the latest security patches</li>
                <li>Not sharing your account credentials with others</li>
                <li>Logging out of shared or public computers</li>
                <li>Reporting suspicious activity or security concerns immediately</li>
                <li>Regularly reviewing access logs and user permissions</li>
                <li>Educating your team about security best practices</li>
              </ul>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl border border-primary-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Security Questions or Concerns?</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                If you have security questions, need to report a security incident, or want more information about our 
                security measures, please contact us:
              </p>
              <div className="space-y-2 text-slate-700">
                <p>
                  <strong>Security Email:</strong>{' '}
                  <a href="mailto:security@tdappointments.com" className="text-primary-600 hover:text-primary-700 font-medium">
                    security@tdappointments.com
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
                  <strong>Note:</strong> If you discover a security vulnerability, please report it responsibly to 
                  <a href="mailto:security@tdappointments.com" className="text-primary-600 hover:text-primary-700 font-medium ml-1">
                    security@tdappointments.com
                  </a>
                  . We appreciate responsible disclosure and will work with you to address any issues.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
