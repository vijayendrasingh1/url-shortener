import { Redis } from '@upstash/redis';
import { nanoid } from 'nanoid';

const redis = Redis.fromEnv();

export type PreviewData = {
  title: string;
  description: string;
  image: string;
};

export type LinkData = {
  realUrl: string;
  preview: PreviewData;
};

export async function createShortLink(
  realUrl: string,
  preview: PreviewData,
  customSlug?: string
): Promise<string> {
  try {
    let slug = customSlug || nanoid(8);

    if (customSlug) {
      const exists = await redis.exists(`link:${slug}`);
      if (exists) throw new Error('Slug already taken');
    } else {
      while (await redis.exists(`link:${slug}`)) {
        slug = nanoid(8);
      }
    }

    const data: LinkData = { realUrl, preview };
    await redis.set(`link:${slug}`, JSON.stringify(data), { ex: 60 * 60 * 24 * 365 });

    console.log('✅ Redis mein save ho gaya:', slug);
    return slug;
  } catch (err: any) {
    console.error('❌ Redis Error in createShortLink:', err.message);
    throw err;
  }
}

export async function getLink(slug: string): Promise<LinkData | null> {
  try {
    const raw = await redis.get<string>(`link:${slug}`);
    if (!raw) {
      console.log('⚠️ Link not found in Redis:', slug);
      return null;
    }
    return JSON.parse(raw);
  } catch (err: any) {
    console.error('❌ Redis Error in getLink:', err.message);
    return null;
  }
}
