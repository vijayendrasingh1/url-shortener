import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import HomePage from './HomePage';   // ← Yeh line important hai

export default function Home() {
  const headersList = headers();
  const host = headersList.get('host') || '';

  // Sirf custom domain pe redirect karo
  if (host === 'piclink.belanter.in' || host === 'www.piclink.belanter.in') {
    redirect('https://www.airbridge.io/en');
  }

  // Baaki sab (Vercel URL) pe normal form page dikhao
  return <HomePage />;
}
