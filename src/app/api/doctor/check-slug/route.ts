/**
 * Check Slug Availability API
 */

import { NextRequest, NextResponse } from 'next/server';
import { isSlugAvailable } from '@/lib/doctor-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug) || slug.length < 3) {
      return NextResponse.json({
        available: false,
        message: 'Slug must be at least 3 characters and contain only lowercase letters, numbers, and hyphens'
      });
    }

    const available = await isSlugAvailable(slug);

    return NextResponse.json({
      available,
      message: available ? 'This URL is available' : 'This URL is already taken'
    });
  } catch (error) {
    console.error('Check slug error:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}
