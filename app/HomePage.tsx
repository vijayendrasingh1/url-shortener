'use client';
import { useState } from 'react';

export default function HomePage() {
  const [realUrl, setRealUrl] = useState('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [image, setImage] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [result, setResult] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        realUrl,
        preview: { title, description: desc, image },
        customSlug: customSlug || undefined,
      }),
    });
    const json = await res.json();
    setResult(json.shortUrl || json.error);
  };

  return (
    <div style={{ maxWidth: 600, margin: '100px auto', padding: 20, fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: '2rem' }}>URL Shortener + Facebook Cloaker</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input placeholder="Monetized Real URL" value={realUrl} onChange={e => setRealUrl(e.target.value)} required />
        <input placeholder="Preview Title (high-trust)" value={title} onChange={e => setTitle(e.target.value)} required />
        <input placeholder="Preview Description" value={desc} onChange={e => setDesc(e.target.value)} required />
        <input placeholder="Preview Image URL" value={image} onChange={e => setImage(e.target.value)} required />
        <input placeholder="Custom slug (optional)" value={customSlug} onChange={e => setCustomSlug(e.target.value)} />
        <button type="submit" style={{ padding: 12, background: '#000', color: '#fff', border: 'none', borderRadius: 8 }}>Create Short Link</button>
      </form>
      {result && <p style={{ marginTop: 30, wordBreak: 'break-all', background: '#f0f0f0', padding: 15, borderRadius: 8 }}>{result}</p>}
    </div>
  );
}
