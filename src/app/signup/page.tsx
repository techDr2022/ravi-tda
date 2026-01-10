'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  User,
  Building2,
  Phone,
  ArrowRight,
  Calendar,
  Eye,
  EyeOff,
  CheckCircle,
  Shield,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { PRICING_PLANS } from '@/lib/constants';

// Google Icon SVG Component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

/**
 * Signup Page Content - Registration with optional plan pre-selection
 * Includes Google OAuth and payment gateway subscription integration
 */
function SignupContent() {
  const searchParams = useSearchParams();
  const planFromUrl = searchParams.get('plan');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    clinicName: '',
    password: '',
    plan: planFromUrl || 'professional',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [step, setStep] = useState<'details' | 'otp' | 'payment'>('details');
  const [otp, setOtp] = useState('');

  const selectedPlan = PRICING_PLANS.find((p) => p.id === formData.plan);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn('google', { callbackUrl: '/dashboard?welcome=true' });
    } catch (err) {
      console.error('Google sign up error:', err);
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (step === 'details') {
      setStep('otp');
    } else if (step === 'otp') {
      // Verify OTP (mock)
      if (otp === '123456') {
        setStep('payment');
      }
    }
    setIsLoading(false);
  };

  const handlePayment = async () => {
    // If Enterprise plan, redirect to contact page
    if (selectedPlan?.contactUs) {
      window.location.href = '/contact';
      return;
    }

    setIsLoading(true);

    // Simulate payment gateway checkout
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // On successful payment, redirect to dashboard
    window.location.href = '/dashboard?welcome=true';
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 pattern-dots opacity-30" />

      <Container size="md" className="relative z-10">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-3 bg-white rounded-2xl shadow-card-hover p-8 border border-healthcare-border"
          >
            {/* Logo */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center gap-2 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </Link>
              <h1 className="text-2xl font-bold text-healthcare-text mb-2">
                {step === 'details' && 'Start Your Free Trial'}
                {step === 'otp' && 'Verify Your Email'}
                {step === 'payment' && 'Complete Setup'}
              </h1>
              <p className="text-healthcare-muted">
                {step === 'details' && 'Create your TDAppointments account'}
                {step === 'otp' && 'Enter the OTP sent to your email'}
                {step === 'payment' && 'Subscribe to start accepting appointments'}
              </p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {['details', 'otp', 'payment'].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step === s
                        ? 'bg-primary-500 text-white'
                        : ['details', 'otp', 'payment'].indexOf(step) > i
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {['details', 'otp', 'payment'].indexOf(step) > i ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  {i < 2 && (
                    <div
                      className={`w-12 h-0.5 ${
                        ['details', 'otp', 'payment'].indexOf(step) > i
                          ? 'bg-green-500'
                          : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step: Details */}
            {step === 'details' && (
              <>
                {/* Google Sign Up Button */}
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={handleGoogleSignUp}
                    disabled={isGoogleLoading || isLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGoogleLoading ? (
                      <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <GoogleIcon className="w-5 h-5" />
                    )}
                    <span>{isGoogleLoading ? 'Signing up...' : 'Sign up with Google'}</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-slate-500">or sign up with email</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-healthcare-text mb-2">
                        Your Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="w-5 h-5 text-healthcare-muted" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Dr. John Doe"
                          required
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-healthcare-border bg-slate-50 text-healthcare-text placeholder:text-healthcare-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-healthcare-text mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Phone className="w-5 h-5 text-healthcare-muted" />
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 90322 92171"
                          required
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-healthcare-border bg-slate-50 text-healthcare-text placeholder:text-healthcare-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-healthcare-text mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="w-5 h-5 text-healthcare-muted" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="doctor@clinic.com"
                        required
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-healthcare-border bg-slate-50 text-healthcare-text placeholder:text-healthcare-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Clinic Name */}
                  <div>
                    <label className="block text-sm font-medium text-healthcare-text mb-2">
                      Clinic / Hospital Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Building2 className="w-5 h-5 text-healthcare-muted" />
                      </div>
                      <input
                        type="text"
                        name="clinicName"
                        value={formData.clinicName}
                        onChange={handleChange}
                        placeholder="City Care Clinic"
                        required
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-healthcare-border bg-slate-50 text-healthcare-text placeholder:text-healthcare-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-healthcare-text mb-2">
                      Create Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-healthcare-muted" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Minimum 8 characters"
                        required
                        minLength={8}
                        className="w-full pl-12 pr-12 py-3 rounded-xl border border-healthcare-border bg-slate-50 text-healthcare-text placeholder:text-healthcare-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-healthcare-muted hover:text-healthcare-text transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Plan Selection */}
                  <div>
                    <label className="block text-sm font-medium text-healthcare-text mb-2">
                      Select Plan
                    </label>
                    <select
                      name="plan"
                      value={formData.plan}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-healthcare-border bg-slate-50 text-healthcare-text focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    >
                      {PRICING_PLANS.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} - {plan.contactUs ? 'Contact Us' : `₹${plan.price?.toLocaleString()}/year`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      required
                      className="w-4 h-4 mt-1 rounded border-healthcare-border text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-healthcare-muted">
                      I agree to the{' '}
                      <Link href="/terms" className="text-primary-600 hover:underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-primary-600 hover:underline">
                        Privacy Policy
                      </Link>
                    </span>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    size="lg"
                    fullWidth
                    disabled={isLoading || isGoogleLoading}
                    icon={
                      isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ArrowRight className="w-5 h-5" />
                      )
                    }
                  >
                    {isLoading ? 'Creating Account...' : 'Continue with Email'}
                  </Button>
                </form>
              </>
            )}

            {/* Step: OTP Verification */}
            {step === 'otp' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center mb-4">
                  <p className="text-healthcare-muted">
                    We've sent a 6-digit code to <strong>{formData.email}</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-healthcare-text mb-2 text-center">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    required
                    className="w-full px-4 py-4 rounded-xl border border-healthcare-border bg-slate-50 text-healthcare-text text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="p-4 bg-primary-50 border border-primary-200 rounded-xl text-center">
                  <p className="text-sm text-primary-700">
                    <strong>Demo:</strong> Use OTP <strong>123456</strong> to proceed
                  </p>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  fullWidth
                  disabled={isLoading || otp.length !== 6}
                  icon={
                    isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ArrowRight className="w-5 h-5" />
                    )
                  }
                >
                  {isLoading ? 'Verifying...' : 'Verify & Continue'}
                </Button>

                <p className="text-center text-sm text-healthcare-muted">
                  Didn't receive the code?{' '}
                  <button type="button" className="text-primary-600 hover:underline font-medium">
                    Resend OTP
                  </button>
                </p>
              </form>
            )}

            {/* Step: Payment */}
            {step === 'payment' && (
              <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-xl border border-healthcare-border">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-healthcare-text">
                        {selectedPlan?.name} Plan
                      </h3>
                      <p className="text-sm text-healthcare-muted">
                        14-day free trial, then billed yearly
                      </p>
                    </div>
                    <div className="text-right">
                      {selectedPlan?.contactUs ? (
                        <div className="text-xl font-bold text-healthcare-text">
                          Contact Us
                        </div>
                      ) : (
                        <>
                          <div className="text-2xl font-bold text-healthcare-text">
                            ₹{selectedPlan?.price?.toLocaleString()}
                          </div>
                          <div className="text-sm text-healthcare-muted">/year (excluding GST)</div>
                        </>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {selectedPlan?.features.slice(0, 4).map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-healthcare-muted">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                  <Shield className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-green-700">
                    Secure transactions powered by our payment gateway. Cancel anytime.
                  </p>
                </div>

                {selectedPlan?.contactUs ? (
                  <Button
                    onClick={handlePayment}
                    size="lg"
                    fullWidth
                    icon={<ArrowRight className="w-5 h-5" />}
                  >
                    Contact Sales
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handlePayment}
                      size="lg"
                      fullWidth
                      disabled={isLoading}
                      icon={
                        isLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <ArrowRight className="w-5 h-5" />
                        )
                      }
                    >
                      {isLoading ? 'Processing...' : 'Start Free Trial'}
                    </Button>
                    <p className="text-center text-xs text-healthcare-muted">
                      You won't be charged during the 14-day trial period.
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Sign In Link */}
            <div className="mt-8 text-center">
              <p className="text-healthcare-muted">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-primary-600 hover:text-primary-700 font-semibold"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </motion.div>

          {/* Side Benefits */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-2 space-y-6"
          >
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
              <h3 className="font-semibold mb-4">What you'll get:</h3>
              <ul className="space-y-3">
                {[
                  'Instant dashboard access',
                  'Google Book Now integration',
                  'WhatsApp notifications',
                  'Teleconsultation ready',
                  'Patient management',
                  '14-day free trial',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary-200" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-healthcare-border">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 border-2 border-white flex items-center justify-center text-xs font-bold text-white"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-healthcare-muted">+200 clinics</span>
              </div>
              <p className="text-sm text-healthcare-muted italic">
                "TDAppointments reduced our no-shows by 60% and our staff saves 10+ hours every week!"
              </p>
              <p className="text-sm font-medium text-healthcare-text mt-2">
                — Dr. Priya Sharma, City Care Clinic
              </p>
            </div>
          </motion.div>
        </div>
      </Container>
    </div>
  );
}

/**
 * Signup Page - Wrapped in Suspense for useSearchParams
 */
export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SignupContent />
    </Suspense>
  );
}
