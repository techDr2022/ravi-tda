# Twilio WhatsApp - Quick Start

## 🚀 5-Minute Setup

### 1. Get Twilio Credentials
```bash
# Sign up at https://www.twilio.com/try-twilio
# Get from Console: Account SID, Auth Token, WhatsApp number
```

### 2. Add to .env
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### 3. Run Migration
```bash
npx prisma migrate dev --name add_whatsapp_messaging
```

### 4. Test
```bash
# Create an appointment → Check WhatsApp for confirmation message
# View logs: GET /api/admin/messages
```

## 📝 Quick Commands

### View Message Logs
```bash
# All messages
GET /api/admin/messages

# Filter by status
GET /api/admin/messages?status=SENT

# Filter by date
GET /api/admin/messages?startDate=2024-01-01&endDate=2024-12-31

# Filter by type
GET /api/admin/messages?messageType=APPOINTMENT_CONFIRMATION
```

### Test Webhook (Local)
```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Use ngrok URL in Twilio webhook settings
```

## 🔍 Troubleshooting

| Issue | Solution |
|-------|----------|
| Messages not sending | Check env vars, Twilio credentials, phone format |
| Webhook not working | Verify URL is accessible, check server logs |
| Status not updating | Ensure webhook is configured in Twilio Console |

## 📚 Full Guide
See `TWILIO_SETUP_GUIDE.md` for complete documentation.
