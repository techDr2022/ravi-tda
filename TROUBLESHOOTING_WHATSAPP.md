# WhatsApp Message Troubleshooting Guide

## Issue: No WhatsApp Message Received After Booking Appointment

### Step 1: Check Environment Variables

Your `.env` file should have:
```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+19124914455
```

**⚠️ IMPORTANT:** The `TWILIO_WHATSAPP_FROM` should have NO SPACES:
- ❌ Wrong: `whatsapp:+1 912 491 4455`
- ✅ Correct: `whatsapp:+19124914455`

### Step 2: Check Server Logs

1. **Check your terminal/console** where `npm run dev` is running
2. Look for error messages like:
   - `Twilio credentials not configured`
   - `Failed to send appointment confirmation`
   - Any Twilio API errors

### Step 3: Check Message Logs (Admin Only)

1. **Login as admin** to your dashboard
2. **Check message logs** via API:
   ```bash
   GET /api/admin/messages
   ```
3. Look for:
   - Message entries with status `FAILED`
   - Error messages in the `errorMessage` field
   - Check if message was even attempted

### Step 4: Verify Twilio Configuration

1. **Check Twilio Console:**
   - Go to https://console.twilio.com/
   - Navigate to **Monitor** → **Logs** → **Messaging**
   - Look for failed message attempts
   - Check error codes

2. **Common Twilio Errors:**
   - `21211`: Invalid 'To' phone number
   - `21608`: Unsubscribed recipient
   - `21610`: Message body too long
   - `30008`: Unknown destination handset

### Step 5: Verify Phone Number Format

The patient's phone number must be:
- In E.164 format: `+91XXXXXXXXXX` (for India)
- For India: `+91` + 10-digit number
- Example: `+919876543210`

### Step 6: Check Appointment Rules

1. **Verify notification settings:**
   - Go to Dashboard → Settings → Appointment Rules
   - Ensure `sendConfirmation` is enabled
   - Check if reminders are enabled

### Step 7: Test Manually

You can test sending a message manually:

```bash
# Using curl or Postman
POST /api/admin/messages/send
{
  "appointmentId": "your-appointment-id",
  "messageType": "APPOINTMENT_CONFIRMATION"
}
```

### Step 8: Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **No message sent** | Check if Twilio credentials are set, check server logs |
| **Message failed** | Verify phone number format, check Twilio account balance |
| **Message pending** | Check Twilio webhook configuration |
| **Wrong phone format** | Ensure phone is in E.164 format (`+91XXXXXXXXXX`) |
| **Twilio not configured** | Add environment variables and restart server |

### Step 9: Debug Steps

1. **Check if messaging service is called:**
   - Add console.log in `src/lib/appointment-service.ts` line 236
   - Check if `sendAppointmentConfirmation` is being called

2. **Check Twilio service:**
   - Add console.log in `src/lib/twilio.ts` line 190
   - Check if Twilio client is initialized

3. **Check message log creation:**
   - Query database: `SELECT * FROM message_logs ORDER BY created_at DESC LIMIT 5;`
   - Check if log entry was created

### Step 10: Quick Fixes

**Fix 1: Update .env file**
```bash
# Remove spaces from TWILIO_WHATSAPP_FROM
TWILIO_WHATSAPP_FROM=whatsapp:+19124914455
```

**Fix 2: Restart server**
```bash
# Stop server (Ctrl+C)
# Restart
npm run dev
```

**Fix 3: Check Twilio Sandbox**
- If using Twilio Sandbox, ensure recipient has joined
- Send "join [sandbox-keyword]" to your Twilio WhatsApp number

### Still Not Working?

1. **Check Twilio Account:**
   - Verify account has credits
   - Check if WhatsApp is enabled
   - Verify phone number is approved

2. **Check Database:**
   - Ensure `message_logs` table exists
   - Run: `npx prisma migrate dev`

3. **Check Code:**
   - Verify appointment has patient phone number
   - Check if appointment rules allow confirmation

4. **Contact Support:**
   - Check Twilio support: https://support.twilio.com
   - Review Twilio logs in console
