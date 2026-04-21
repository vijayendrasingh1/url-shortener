import { NextRequest, NextResponse } from 'next/server';
import { getLink, type LinkData } from '@/lib/links';

const BOT_USER_AGENTS = [
  'facebookexternalhit', 'Facebot', 'facebookcatalog', 'meta-externalagent',
  'twitterbot', 'X-Twitter', 'LinkedInBot', 'Slackbot', 'WhatsApp',
  'TelegramBot', 'Discordbot', 'bot', 'crawler', 'preview'
];

function isSocialCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot));
}

function generatePreviewHTML(slug: string, linkData: LinkData, req: NextRequest): string {
  const { preview } = linkData;
  const shortUrl = `${req.nextUrl.origin}/s/${slug}`;   // ← Yeh important hai

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${preview.title}</title>
    
    <meta property="og:title" content="${preview.title}" />
    <meta property="og:description" content="${preview.description}" />
    <meta property="og:image" content="${preview.image}" />
    <meta property="og:url" content="${shortUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Airbridge" />
    
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${preview.title}" />
    <meta name="twitter:description" content="${preview.description}" />
    <meta name="twitter:image" content="${preview.image}" />
    
    <link rel="canonical" href="https://www.airbridge.io/en" />
    
    <meta name="robots" content="noindex,nofollow" />
</head>
<body style="margin:0; padding:40px; font-family:system-ui; background:#f8f9fa; text-align:center;">
    <div style="max-width:600px; margin:0 auto;">
        <h1 style="font-size:28px; margin-bottom:16px;">${preview.title}</h1>
        <p style="font-size:18px; line-height:1.5; margin-bottom:30px;">${preview.description}</p>
        <img src="${preview.image}" alt="${preview.title}" style="max-width:100%; border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,0.15);">
    </div>
</body>
</html>`;
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const slug = params.slug;
    if (!slug) return NextResponse.next();

    const linkData = await getLink(slug);
    if (!linkData) {
      return NextResponse.redirect(new URL('/', request.url), { status: 302 });
    }

    const userAgent = request.headers.get('user-agent');
    const cloakingEnabled = process.env.ENABLE_BOT_CLOAKING === 'true';
    const isBot = isSocialCrawler(userAgent);

    if (cloakingEnabled && isBot) {
      const html = generatePreviewHTML(slug, linkData, request);
      return new NextResponse(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    return NextResponse.redirect(linkData.realUrl, { status: 302 });

  } catch (error) {
    console.error('Route Error:', error);
    return NextResponse.redirect(new URL('/', request.url), { status: 302 });
  }
}
