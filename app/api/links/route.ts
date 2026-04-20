import { NextRequest, NextResponse } from 'next/server';
import { createShortLink } from '@/lib/links';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { realUrl, preview, customSlug } = body;

    console.log('📥 API received:', { realUrl, previewTitle: preview?.title, customSlug });

    if (!realUrl || !preview?.title || !preview?.description || !preview?.image) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const slug = await createShortLink(realUrl, preview, customSlug);

    const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/s/${slug}`;

    console.log('✅ Short link created successfully:', shortUrl);

    return NextResponse.json({
      success: true,
      shortUrl,
      slug,
    });

  } catch (err: any) {
    console.error('❌ API Error:', err.message);
    return NextResponse.json({
      error: err.message || 'Something went wrong while creating link',
      details: err.stack
    }, { status: 500 });
  }
}
