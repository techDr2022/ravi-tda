import Link from 'next/link';
import {
  Calendar,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Shield,
  Award,
  Globe,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SITE_CONFIG } from '@/lib/constants';

/**
 * Footer component with links, contact info, and trust signals
 * SEO-optimized with schema-ready structure
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Features', href: '/#features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'How It Works', href: '/#how-it-works' },
      { label: 'Dashboard Demo', href: '/#dashboard' },
      { label: 'Integrations', href: '/#features' },
    ],
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
      { label: 'Partners', href: '/partners' },
    ],
    support: [
      { label: 'Help Center', href: '/help' },
      { label: 'Documentation', href: '/docs' },
      { label: 'API Reference', href: '/api' },
      { label: 'Status', href: '/status' },
      { label: 'FAQs', href: '/faq' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'HIPAA Compliance', href: '/hipaa' },
      { label: 'Data Security', href: '/security' },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com/tdappointments', label: 'Twitter' },
    { icon: Linkedin, href: 'https://linkedin.com/company/tdappointments', label: 'LinkedIn' },
    { icon: Facebook, href: 'https://facebook.com/tdappointments', label: 'Facebook' },
    { icon: Instagram, href: 'https://instagram.com/tdappointments', label: 'Instagram' },
  ];

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      {/* Main Footer Content */}
      <Container size="xl">
        <div className="py-16 md:py-20">
          {/* Top Section with Logo and Trust Badges */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-12 pb-12 border-b border-white/10">
            {/* Logo and Description */}
            <div className="lg:col-span-4">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl">
                  TD<span className="text-primary-400">Appointments</span>
                </span>
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm">
                {SITE_CONFIG.description}
              </p>
              {/* Trust Badges */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg">
                  <Shield className="w-4 h-4 text-primary-400" />
                  <span className="text-xs text-slate-300">HIPAA Ready</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg">
                  <Award className="w-4 h-4 text-secondary-400" />
                  <span className="text-xs text-slate-300">Google Partner</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg">
                  <Globe className="w-4 h-4 text-accent-400" />
                  <span className="text-xs text-slate-300">GMB Verified</span>
                </div>
              </div>
            </div>

            {/* Links Grid */}
            <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
              {/* Product Links */}
              <div>
                <h3 className="font-semibold text-white mb-4 text-sm">Product</h3>
                <ul className="space-y-3">
                  {footerLinks.product.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-slate-400 hover:text-white text-sm transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company Links */}
              <div>
                <h3 className="font-semibold text-white mb-4 text-sm">Company</h3>
                <ul className="space-y-3">
                  {footerLinks.company.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-slate-400 hover:text-white text-sm transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support Links */}
              <div>
                <h3 className="font-semibold text-white mb-4 text-sm">Support</h3>
                <ul className="space-y-3">
                  {footerLinks.support.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-slate-400 hover:text-white text-sm transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal Links */}
              <div>
                <h3 className="font-semibold text-white mb-4 text-sm">Legal</h3>
                <ul className="space-y-3">
                  {footerLinks.legal.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-slate-400 hover:text-white text-sm transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Contact and Social Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            {/* Contact Info */}
            <div className="flex flex-wrap gap-6">
              <a
                href="mailto:info@techdr.in"
                className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
              >
                <Mail className="w-4 h-4" />
                info@techdr.in
              </a>
              <a
                href="tel:+919032292171"
                className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
              >
                <Phone className="w-4 h-4" />
                +91 90322 92171
              </a>
              <span className="flex items-center gap-2 text-slate-400 text-sm">
                <MapPin className="w-4 h-4" />
                India
              </span>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </Container>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <Container size="xl">
          <div className="py-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © {currentYear} TDAppointments. All rights reserved.
            </p>
            <p className="text-slate-500 text-sm">
              Made with ❤️ for Healthcare Professionals — Powered by{' '}
              <a 
                href="https://techdr.in" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
              >
                TechDr
              </a>
            </p>
          </div>
        </Container>
      </div>
    </footer>
  );
}

export default Footer;
