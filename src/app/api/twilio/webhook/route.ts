/**
 * Twilio Webhook Handler
 * Receives status updates for WhatsApp messages
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateMessageStatus } from '@/lib/twilio';

/**
 * POST - Handle Twilio webhook for message status updates
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const messageSid = formData.get('MessageSid') as string;
    const messageStatus = formData.get('MessageStatus') as string;

    if (!messageSid || !messageStatus) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Update message status in database
    await updateMessageStatus(messageSid, messageStatus);

    // Return TwiML response (Twilio expects 200 OK)
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Twilio webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
