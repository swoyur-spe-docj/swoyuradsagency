'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BackToHome() {
  const pathname = usePathname() || '/';
  if (pathname === '/') return null;
  return <div className="back-home-wrap"><Link className="back-home-button" href="/" aria-label="Back to the Padmaarc home page"><span aria-hidden="true">←</span> Back to home</Link></div>;
}
