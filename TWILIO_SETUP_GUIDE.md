# Twilio WhatsApp Messaging Setup Guide

Complete step-by-step guide to set up and use Twilio WhatsApp messaging in your TDAppointments app.

## 📋 Prerequisites

- Node.js and npm installed
- PostgreSQL database running
- Twilio account (free trial available)
- Admin access to your application

---

## Step 1: Create Twilio Account

1. **Sign up for Twilio**
   - Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
   - Create a free account (includes $15.50 credit for testing)

2. **Verify your account**
   - Complete email verification
   - Verify your phone number (for testing)

3. **Get your credentials**
   - Go to [Twilio Console Dashboard](https://console.twilio.com/)
   - Find your **Account SID** and **Auth Token**
   - Keep these secure - you'll need them in Step 3

---

## Step 2: Set Up WhatsApp Business API

1. **Enable WhatsApp Sandbox** (for testing)
   - In Twilio Console, go to **Messaging** → **Try it out** → **Send a WhatsApp message**
   - Follow the instructions to join the sandbox
   - You'll get a WhatsApp number like: `whatsapp:+14155238886`

2. **For Production** (after testing):
   - Apply for WhatsApp Business API access
   - Complete business verification
   - Get your production WhatsApp number

3. **Note your WhatsApp number**
   - Format: `whatsapp:+14155238886`
   - You'll need this for the `TWILIO_WHATSAPP_FROM` environment variable

---

## Step 3: Configure Environment Variables

1. **Open your `.env` file** (or `.env.local`)

2. **Add Twilio credentials:**
   ```env
   # Twilio Configuration
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
   ```

3. **Replace the values:**
   - `TWILIO_ACCOUNT_SID`: Your Account SID from Twilio Console
   - `TWILIO_AUTH_TOKEN`: Your Auth Token from Twilio Console
   - `TWILIO_WHATSAPP_FROM`: Your WhatsApp number (format: `whatsapp:+14155238886`)

4. **Save the file**

---

## Step 4: Run Database Migration

1. **Open terminal** in your project directory

2. **Generate Prisma client** (if not already done):
   ```bash
   npx prisma generate
   ```

3. **Create and run migration:**
   ```bash
   npx prisma migrate dev --name add_whatsapp_messaging
   ```

4. **Verify migration:**
   - Check that `message_logs` table was created
   - You can verify in your database or run:
     ```bash
     npx prisma studio
     ```

---

## Step 5: Configure Twilio Webhook (For Status Updates)

1. **Get your webhook URL:**
   - Development: `http://your-ngrok-url.ngrok.io/api/twilio/webhook`
   - Production: `https://yourdomain.com/api/twilio/webhook`

2. **Set up webhook in Twilio Console:**
   - Go to **Messaging** → **Settings** → **WhatsApp Sandbox Settings**
   - Under **Status Callback URL**, enter your webhook URL
   - Save changes

3. **For local development:**
   - Use [ngrok](https://ngrok.com/) to expose your local server:
     ```bash
     ngrok http 3000
     ```
   - Use the ngrok URL as your webhook URL

---

## Step 6: Test the Integration

### Test 1: Create an Appointment (Confirmation Message)

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Book a test appointment:**
   - Go to your booking page
   - Fill in patient details (use a phone number you can access)
   - Complete the booking

3. **Check WhatsApp:**
   - You should receive a confirmation message on WhatsApp
   - Message includes appointment details, date, time, booking reference

4. **Check message logs:**
   - As admin, go to: `GET /api/admin/messages`
   - You should see the message log entry

### Test 2: Cancel an Appointment (Cancellation Message)

1. **Cancel a test appointment** from the dashboard

2. **Check WhatsApp:**
   - You should receive a cancellation message

### Test 3: Reschedule an Appointment (Reschedule Message)

1. **Reschedule a test appointment** from the dashboard

2. **Check WhatsApp:**
   - You should receive a reschedule message with old and new dates

---

## Step 7: Configure Clinic Notification Settings

1. **Login as admin** to your dashboard

2. **Go to Appointment Rules** (Settings → Appointment Rules)

3. **Configure notifications:**
   - ✅ **Send Confirmation**: Enable/disable confirmation messages
   - ✅ **Send Reminder**: Enable/disable reminder messages
   - ⏰ **Reminder Hours**: Set when to send reminders (default: 24 hours before)

4. **Save settings**

---

## Step 8: View Message Logs (Admin Only)

### Via API:

1. **Get all messages:**
   ```bash
   GET /api/admin/messages
   ```

2. **Filter by status:**
   ```bash
   GET /api/admin/messages?status=SENT
   ```

3. **Filter by date range:**
   ```bash
   GET /api/admin/messages?startDate=2024-01-01&endDate=2024-12-31
   ```

4. **Filter by message type:**
   ```bash
   GET /api/admin/messages?messageType=APPOINTMENT_CONFIRMATION
   ```

5. **Combine filters:**
   ```bash
   GET /api/admin/messages?status=DELIVERED&messageType=APPOINTMENT_REMINDER&startDate=2024-01-01
   ```

### Response includes:
- Message logs with details
- Pagination info
- Statistics (total, pending, sent, delivered, read, failed)

---

## Step 9: Set Up Reminder Scheduler (Optional)

To automatically send reminders before appointments, you'll need a cron job or scheduled task:

### Option 1: Next.js API Route with Cron (Recommended)

1. **Create a cron job endpoint:**
   ```typescript
   // src/app/api/cron/send-reminders/route.ts
   ```

2. **Use a service like:**
   - [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
   - [EasyCron](https://www.easycron.com/)
   - [Cron-job.org](https://cron-job.org/)

3. **Schedule to run every hour:**
   - Check appointments happening in X hours (based on `reminderHours` setting)
   - Send reminder messages

### Option 2: Background Worker

Use a background job processor like:
- BullMQ
- Agenda.js
- Node-cron

---

## Step 10: Production Deployment

1. **Update environment variables** in your production environment:
   - Add Twilio credentials to production `.env`
   - Use production WhatsApp number

2. **Update webhook URL:**
   - Set production webhook URL in Twilio Console
   - Ensure HTTPS is enabled

3. **Test in production:**
   - Create a test appointment
   - Verify messages are sent
   - Check message logs

4. **Monitor:**
   - Check Twilio Console for message delivery rates
   - Monitor message logs for failures
   - Set up alerts for failed messages

---

## 🔧 Troubleshooting

### Messages not sending?

1. **Check environment variables:**
   ```bash
   # Verify they're loaded
   console.log(process.env.TWILIO_ACCOUNT_SID)
   ```

2. **Check Twilio credentials:**
   - Verify Account SID and Auth Token are correct
   - Check if account has sufficient credits

3. **Check phone number format:**
   - Must be in E.164 format: `whatsapp:+91XXXXXXXXXX`
   - For India: `whatsapp:+91` + 10-digit number

4. **Check Twilio Console:**
   - Go to **Monitor** → **Logs** → **Messaging**
   - Look for error messages

### Webhook not receiving updates?

1. **Verify webhook URL is accessible:**
   ```bash
   curl https://yourdomain.com/api/twilio/webhook
   ```

2. **Check Twilio webhook configuration:**
   - Ensure URL is set correctly in Twilio Console
   - Use HTTPS in production

3. **Check server logs:**
   - Look for webhook requests in your server logs
   - Verify the endpoint is being called

### Message status not updating?

1. **Check webhook is configured:**
   - Status updates come via webhook
   - Ensure webhook URL is set in Twilio Console

2. **Verify webhook handler:**
   - Check `/api/twilio/webhook` route is working
   - Test with a manual webhook call

---

## 📱 Message Templates

The system includes these message templates:

1. **Appointment Confirmation**
   - Sent when appointment is created
   - Includes: doctor name, date, time, booking ref, clinic info

2. **Appointment Reminder**
   - Sent before appointment (configurable hours)
   - Includes: appointment details, reminder to arrive early

3. **Appointment Cancellation**
   - Sent when appointment is cancelled
   - Includes: cancellation reason (if provided)

4. **Appointment Reschedule**
   - Sent when appointment is rescheduled
   - Includes: old and new appointment details

---

## 🔒 Security Notes

- ✅ Messages are sent **only from backend** (never from client)
- ✅ Message logs are **admin-only** (enforced at API level)
- ✅ All messages are logged for audit purposes
- ✅ Webhook endpoint should be protected (consider adding authentication)

---

## 📊 Monitoring

### Check Message Statistics:

```bash
GET /api/admin/messages
```

Response includes:
```json
{
  "stats": {
    "total": 150,
    "pending": 5,
    "sent": 100,
    "delivered": 40,
    "read": 3,
    "failed": 2
  }
}
```

### Twilio Console:
- Monitor message delivery rates
- Check for failed messages
- View message logs and analytics

---

## ✅ Checklist

- [ ] Twilio account created
- [ ] WhatsApp Sandbox enabled
- [ ] Environment variables configured
- [ ] Database migration completed
- [ ] Webhook URL configured
- [ ] Test appointment created (confirmation sent)
- [ ] Test cancellation (cancellation sent)
- [ ] Test reschedule (reschedule sent)
- [ ] Message logs accessible (admin)
- [ ] Production deployment ready

---

## 🆘 Support

- **Twilio Docs**: [https://www.twilio.com/docs/whatsapp](https://www.twilio.com/docs/whatsapp)
- **Twilio Support**: [https://support.twilio.com](https://support.twilio.com)
- **Project Issues**: Check your project's issue tracker

---

## 🎉 You're All Set!

Your Twilio WhatsApp messaging is now configured and ready to use. Messages will automatically be sent when:
- ✅ Appointments are created
- ✅ Appointments are cancelled
- ✅ Appointments are rescheduled

All messages are logged and can be viewed by admins only.
