import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'URL Shortener',
  description: 'Monetized URL shortener with Facebook bot cloaking',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
