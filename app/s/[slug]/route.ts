import { NextRequest, NextResponse } from 'next/server';
import { getLink, type LinkData } from '@/lib/links';

const BOT_USER_AGENTS = [
  'facebookexternalhit', 'Facebot', 'twitterbot', 'X-Twitter',
  'LinkedInBot', 'Slackbot', 'WhatsApp', 'TelegramBot',
  'Discordbot', 'bot', 'crawler', 'preview', 'meta-externalagent'
];

function isSocialCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot));
}

function generatePreviewHTML(slug: string, linkData: LinkData, req: NextRequest): string {
  const { preview } = linkData;
  const shortUrl = `${req.nextUrl.origin}/s/${slug}`;

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
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${preview.title}" />
    <meta name="twitter:description" content="${preview.description}" />
    <meta name="twitter:image" content="${preview.image}" />
    <meta name="robots" content="noindex,nofollow" />
</head>
<body style="font-family: system-ui; padding: 40px; text-align: center; background: #f8f9fa;">
    <h1 style="font-size: 2rem;">${preview.title}</h1>
    <p style="font-size: 1.2rem; max-width: 600px; margin: 20px auto;">${preview.description}</p>
    <img src="${preview.image}" alt="${preview.title}" style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);" />
</body>
</html>`;
}

export const dynamic = 'force-dynamic';   // ← Yeh line important hai

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

    // Real user → monetized redirect
    return NextResponse.redirect(linkData.realUrl, { status: 302 });

  } catch (error) {
    console.error('Short link error:', error);
    // Agar error aaye to homepage pe redirect kar do (user ko blank page na dikhe)
    return NextResponse.redirect(new URL('/', request.url), { status: 302 });
  }
}
