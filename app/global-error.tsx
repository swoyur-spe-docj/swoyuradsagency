'use client';

import { useEffect, useState } from 'react';
import './globals.css';
import { friendlyError } from '@/lib/errors';
import { isThemeKey, THEMES, themeCss } from '@/lib/themes';
import type { ThemeKey } from '@/lib/types';

// Shown only for the instant before the saved theme is read from the cookie.
// Neutral on purpose, so no brand colour (and never the other theme) can flash.
const NEUTRAL_BG = '#0B0F1A';
const NEUTRAL_TEXT = '#F5F7FB';

/** The theme chosen in admin is also stored in a cookie, so this page can match it even when the layout failed. */
function savedTheme(): ThemeKey | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )padmaarc_theme=([^;]+)/);
  const value = match ? decodeURIComponent(match[1]) : '';
  return isThemeKey(value) ? value : 'corporate_blue';
}

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [theme, setTheme] = useState<ThemeKey | null>(null);
  useEffect(() => { setTheme(savedTheme()); }, []);
  const colours = theme ? THEMES[theme] : null;
  return (
    <html lang="en" data-theme={theme ?? undefined}>
      <head>
        <meta name="theme-color" content={colours?.bg ?? NEUTRAL_BG} />
        {theme && <style dangerouslySetInnerHTML={{ __html: themeCss(theme) }} />}
      </head>
      <body style={{ background: colours?.bg ?? NEUTRAL_BG, color: colours?.text ?? NEUTRAL_TEXT }}>
        <main className="container section narrow center">
          <p className="eyebrow">TEMPORARY PROBLEM</p>
          <h1>Something went wrong.</h1>
          <p className="muted">{friendlyError(error)} If the problem continues, contact the studio.</p>
          <button className="btn btn-primary" onClick={() => reset()}>Try again</button>
        </main>
      </body>
    </html>
  );
}
