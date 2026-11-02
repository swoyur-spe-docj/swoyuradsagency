import type { ReactNode } from 'react';
import { InstagramBrandIcon } from '@/components/MenuBrandIcons';

const paths: Record<string, ReactNode> = {
  Instagram: <><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="18" cy="6" r=".8" fill="currentColor"/></>,
  Facebook: <path d="M14 21v-8h3l.5-3H14V8c0-.9.3-1.5 1.6-1.5h2V3.8c-.4-.1-1.5-.2-2.8-.2-2.8 0-4.8 1.7-4.8 4.9V10H7v3h3v8z" fill="currentColor" stroke="none"/>,
  LinkedIn: <><path d="M5 9v10M5 5v.1M10 19v-6a3 3 0 0 1 6 0v6M10 10v9M19 19v-6a3 3 0 0 0-6 0"/><circle cx="5" cy="5" r="1" fill="currentColor"/></>,
  YouTube: <><path d="M21 8.2a2.5 2.5 0 0 0-1.8-1.8C17.6 6 12 6 12 6s-5.6 0-7.2.4A2.5 2.5 0 0 0 3 8.2 26 26 0 0 0 2.6 12 26 26 0 0 0 3 15.8a2.5 2.5 0 0 0 1.8 1.8C6.4 18 12 18 12 18s5.6 0 7.2-.4a2.5 2.5 0 0 0 1.8-1.8 26 26 0 0 0 .4-3.8 26 26 0 0 0-.4-3.8Z"/><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none"/></>,
  Telegram: <path d="m21.8 4.4-3.3 15.5c-.2 1.1-.9 1.4-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.2-8.3c.4-.4-.1-.6-.6-.3L6 12.9l-4.9-1.5c-1.1-.3-1.1-1.1.2-1.6L20.4 2.6c.9-.3 1.7.2 1.4 1.8Z" fill="currentColor" stroke="none"/>,
};

export function SocialLinks({ links, className = 'social-links' }: { links: [string, string][]; className?: string }) {
  return <nav className={className} aria-label="Social media">{links.map(([name, href]) => <a key={name} href={href} aria-label={name} target="_blank" rel="noopener noreferrer">{name === 'Instagram' ? <InstagramBrandIcon /> : <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name] || <circle cx="12" cy="12" r="9"/>}</svg>}<span>{name}</span><span aria-hidden="true">↗</span></a>)}</nav>;
}
