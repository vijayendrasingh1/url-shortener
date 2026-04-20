import { NextRequest, NextResponse } from 'next/server';
import { createShortLink } from '@/lib/links';

export async function POST(req: NextRequest) {
  try {
    const { realUrl, preview, customSlug } = await req.json();

    if (!realUrl || !preview?.title || !preview?.description || !preview?.image) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const slug = await createShortLink(realUrl, preview, customSlug);

    return NextResponse.json({
      success: true,
      shortUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/s/${slug}`,
      slug,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
