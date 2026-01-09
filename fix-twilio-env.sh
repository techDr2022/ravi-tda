#!/bin/bash
# Fix TWILIO_WHATSAPP_FROM format in .env file

echo "Fixing TWILIO_WHATSAPP_FROM format..."

# Remove spaces from TWILIO_WHATSAPP_FROM
if [ -f .env ]; then
  sed -i.bak 's/TWILIO_WHATSAPP_FROM=whatsapp:+1 912 491 4455/TWILIO_WHATSAPP_FROM=whatsapp:+19124914455/' .env
  echo "✅ Fixed! Updated .env file"
  echo "Old format: whatsapp:+1 912 491 4455"
  echo "New format: whatsapp:+19124914455"
  echo ""
  echo "⚠️  Please restart your server (npm run dev) for changes to take effect"
else
  echo "❌ .env file not found"
fi
