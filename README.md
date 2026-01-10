# TDAppointments - Healthcare Appointment Booking SaaS

![TDAppointments](https://img.shields.io/badge/TDAppointments-Healthcare%20SaaS-008080?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square)

**Smart Appointment Booking for Healthcare Clinics & Hospitals**

A high-converting, SEO-optimized, GEO-friendly landing website for a healthcare appointment booking SaaS platform. Built with Next.js 14, Tailwind CSS, and Framer Motion.

## 🚀 Features

### Core Functionality
- **Google My Business "Book Now" Integration** - Direct appointment booking from Google
- **WhatsApp Automation (Twilio)** - Appointment confirmations, reminders, cancellations, and reschedule notifications
- **Teleconsultation (Twilio)** - HD video and voice consultations
- **Razorpay Payments** - Secure online consultation payments
- **Individual Clinic Dashboard** - Real-time appointment tracking
- **Patient Management System** - Complete patient records
- **Monthly Analytics & Reports** - Comprehensive insights
- **Multi-clinic & Multi-doctor Support** - Scalable for healthcare groups
- **Patient Data Export** - CSV export with admin-only access
- **Prescription Management** - A4 printable prescriptions

### Technical Features
- ⚡ **Next.js 14 App Router** - Latest React framework features
- 🎨 **Tailwind CSS** - Utility-first styling with custom healthcare theme
- 🎭 **Framer Motion** - Smooth, professional animations
- 📱 **Mobile-first Design** - Fully responsive
- 🔍 **SEO Optimized** - Meta tags, schema markup, semantic HTML
- 🌍 **GEO SEO** - Location-targeted content blocks
- 🔐 **Auth Flow** - Email + OTP authentication (mock)
- 💳 **Razorpay Integration** - Full subscription payment flow with real API

## 📁 Project Structure

```
tdappointments/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with SEO
│   │   ├── page.tsx            # Homepage
│   │   ├── pricing/
│   │   │   └── page.tsx        # Pricing page
│   │   ├── login/
│   │   │   └── page.tsx        # Login page
│   │   ├── signup/
│   │   │   └── page.tsx        # Signup with Razorpay
│   │   └── dashboard/
│   │       ├── layout.tsx      # Dashboard layout
│   │       ├── page.tsx        # Dashboard home
│   │       ├── appointments/   # Appointments management
│   │       ├── patients/       # Patient records
│   │       └── settings/       # Account settings
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx      # Navigation header
│   │   │   └── Footer.tsx      # Site footer
│   │   ├── sections/
│   │   │   ├── Hero.tsx        # Hero section
│   │   │   ├── WhyTDAppointments.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── DashboardPreview.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── Pricing.tsx
│   │   │   ├── FAQ.tsx
│   │   │   ├── GeoSEO.tsx
│   │   │   └── FinalCTA.tsx
│   │   └── ui/
│   │       ├── Button.tsx      # Reusable button
│   │       ├── Container.tsx   # Layout container
│   │       └── AnimatedSection.tsx
│   ├── lib/
│   │   ├── constants.ts        # Site configuration
│   │   └── razorpay.ts         # Payment utilities
│   └── types/
│       └── index.ts            # TypeScript types
├── public/
│   └── manifest.json           # PWA manifest
├── tailwind.config.ts          # Custom Tailwind theme
└── package.json
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tdappointments.git
   cd tdappointments
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Razorpay keys and other configuration.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 📝 Environment Variables

Create a `.env.local` file with:

```env
# Razorpay Configuration
# Get your keys from https://dashboard.razorpay.com/app/keys

# Public key (safe to expose in frontend)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx

# Secret key (keep this private - server-side only)
RAZORPAY_KEY_SECRET=your_secret_key

# Optional: Webhook secret for verifying webhooks
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Twilio WhatsApp Configuration
# Get from https://console.twilio.com/
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Site URL (for SEO)
NEXT_PUBLIC_SITE_URL=https://tdappointments.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tdappointments

# NextAuth
NEXTAUTH_SECRET=your_secret_key_here
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 💳 Razorpay Integration

The application includes a complete Razorpay payment integration:

### API Routes
- `POST /api/payments/create-order` - Creates a Razorpay order
- `POST /api/payments/verify` - Verifies payment signature

### Client-Side Components
- `RazorpayProvider` - Loads the Razorpay SDK
- `initializeRazorpayCheckout()` - Handles the complete checkout flow

### Payment Flow
1. User selects a plan and clicks "Subscribe"
2. Frontend calls `/api/payments/create-order` to create an order
3. Razorpay checkout modal opens
4. User completes payment
5. Frontend sends payment details to `/api/payments/verify`
6. Server verifies the signature using HMAC-SHA256
7. User is redirected to dashboard on success

### Testing
Use Razorpay test mode keys for development:
- Test Card: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits
- OTP: `1234`

## 📱 Twilio WhatsApp Integration

The application includes automated WhatsApp messaging via Twilio:

### Features
- **Automatic Messages**: Sent on appointment creation, cancellation, and reschedule
- **Message Templates**: Pre-built templates for confirmations, reminders, cancellations
- **Message Logging**: All messages logged in database (admin-only access)
- **Status Tracking**: Real-time status updates (sent, delivered, read, failed)

### Setup
See **[TWILIO_SETUP_GUIDE.md](./TWILIO_SETUP_GUIDE.md)** for complete step-by-step setup instructions.

### Quick Start
1. Get Twilio credentials from [Twilio Console](https://console.twilio.com/)
2. Add to `.env`: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`
3. Run migration: `npx prisma migrate dev --name add_whatsapp_messaging`
4. Configure webhook: Set `https://yourdomain.com/api/twilio/webhook` in Twilio Console

### API Routes
- `POST /api/twilio/webhook` - Receives status updates from Twilio
- `GET /api/admin/messages` - View message logs (admin-only)

### Message Types
- **APPOINTMENT_CONFIRMATION** - Sent when appointment is created
- **APPOINTMENT_REMINDER** - Sent before appointment (configurable)
- **APPOINTMENT_CANCELLATION** - Sent when appointment is cancelled
- **APPOINTMENT_RESCHEDULE** - Sent when appointment is rescheduled

## 🎨 Design System

### Colors
- **Primary (Teal)**: `#008080` - Medical trust and professionalism
- **Secondary (Coral)**: `#ff7040` - CTAs and highlights
- **Accent (Blue)**: `#1995e1` - Interactive elements

### Typography
- **Headings**: Geist Sans (Bold)
- **Body**: Geist Sans (Regular)
- **Mono**: Geist Mono (Code blocks)

## 📱 Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with all sections |
| `/pricing` | Detailed pricing plans |
| `/login` | User authentication |
| `/signup` | Registration + payment |
| `/dashboard` | Protected dashboard home |
| `/dashboard/appointments` | Appointment management |
| `/dashboard/patients` | Patient records |
| `/dashboard/settings` | Account settings |

## 🔐 Demo Credentials

For testing the login flow:
- **Email**: `demo@tdappointments.com`
- **Password**: `demo123`
- **OTP**: `123456`

## 📊 SEO Features

- ✅ Meta titles and descriptions
- ✅ Open Graph tags
- ✅ Twitter Card support
- ✅ Schema.org structured data (SoftwareApplication, Organization, FAQ)
- ✅ Semantic HTML5 structure
- ✅ Mobile-friendly responsive design
- ✅ Fast loading times (<2s target)
- ✅ Core Web Vitals optimized

## 🌍 GEO Targeting

Location-specific content blocks for:
- India (Hyderabad, Delhi, Mumbai, Bangalore)
- UAE (Dubai, Abu Dhabi)
- UK (London, Manchester)
- USA (New York, Los Angeles)

## 💳 Pricing Plans

| Plan | Price | Target |
|------|-------|--------|
| Basic | ₹2,999/mo | Small clinics |
| Professional | ₹5,999/mo | Growing practices |
| Enterprise | ₹9,999/mo | Multi-location groups |

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Other Platforms
Build for production:
```bash
npm run build
npm run start
```

## 📄 License

MIT License - feel free to use for your own projects.

## 🤝 Support

- Email: info@techdr.in
- Phone: +91 90322 92171
- Twitter: [@tdappointments](https://twitter.com/tdappointments)

---

Made with ❤️ for Healthcare Professionals
