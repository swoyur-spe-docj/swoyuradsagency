import type { ReactNode } from 'react';
import './globals.css';
import './polish.css';
import { getSettings } from '@/lib/repo';
import { DEFAULT_THEME, isThemeKey, THEMES, themeCss } from '@/lib/themes';
import { cookies, headers } from 'next/headers';
import { environmentIssues } from '@/lib/env';
import { SetupRequired } from '@/components/SetupRequired';
import { ScrollMotion } from '@/components/ScrollMotion';

export const dynamic = 'force-dynamic';

export default async function RootLayout({ children }: { children: ReactNode }) {
  const issues = environmentIssues();
  const cookieTheme = (await cookies()).get('padmaarc_theme')?.value;
  let savedTheme: string | undefined;
  if (!issues.length) {
    try {
      savedTheme = (await getSettings()).theme;
    } catch {
      // A stale/unavailable settings backend must not discard the user's theme cookie.
    }
  }
  const theme = savedTheme && isThemeKey(savedTheme)
    ? savedTheme
    : cookieTheme && isThemeKey(cookieTheme)
      ? cookieTheme
      : DEFAULT_THEME;
  const nonce = (await headers()).get('x-nonce') || undefined;
  return (
    <html lang="en" data-theme={theme}>
      <head>
        <title>The Padmaarc Advertising — Creative that moves business</title>
        <meta name="description" content="Independent advertising and creative studio in Sitamarhi, Bihar. Brand strategy, video, design, social media and performance marketing." />
        <meta name="theme-color" content={THEMES[theme as keyof typeof THEMES].bg} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/padmaarc-mark.svg" type="image/svg+xml" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="The Padmaarc Advertising" />
        <meta property="og:title" content="The Padmaarc Advertising — Creative that moves business" />
        <meta property="og:description" content="Brand strategy, video, design, social media and Meta Ads for ambitious businesses in Sitamarhi, Bihar." />
        <meta name="twitter:card" content="summary_large_image" />
        <style nonce={nonce} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: themeCss(theme) }} />
      </head>
      <body>{issues.length ? <SetupRequired issues={issues} /> : <><ScrollMotion />{children}</>}</body>
    </html>
  );
}
