import type { ThemeKey } from './types';

export const DEFAULT_THEME: ThemeKey = 'corporate_blue';

// Edit colors here. The CSS variables are generated from this object.
export const THEMES: Record<ThemeKey, {
  label: string; desc: string; bg: string; surface: string; primary: string; accent: string;
  text: string; muted: string; border: string; onPrimary: string; markDark: string; markLight: string;
  radius: string; heading: string; body: string;
}> = {
  corporate_blue: {
    label: 'Orange (Padmaarc Ignite)',
    desc: 'Deep ink with a bold orange call-to-action and a violet glow. Built for performance advertising.',
    bg: '#0B0F1A', surface: '#141B2D', primary: '#FF6B35', accent: '#7C5CFF',
    text: '#F5F7FB', muted: '#A7B0C6', border: '#232C44', onPrimary: '#0B0F1A',
    markDark: '#FF6B35', markLight: '#FFB38F',
    radius: '12px',
    heading: "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
    body: "Inter, system-ui, sans-serif",
  },
  emerald_growth: {
    label: 'Green (Lotus Dusk)',
    desc: 'Deep teal with mint and warm apricot sand. Fresh and calm, with a warm contrast.',
    bg: '#0C1614', surface: '#15252A', primary: '#7FD6BC', accent: '#F3B77A',
    text: '#F3F6F4', muted: '#A7BBB6', border: '#263C40', onPrimary: '#0C1614',
    markDark: '#5CC2A6', markLight: '#D2F3E8',
    radius: '12px',
    heading: "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
    body: "Inter, system-ui, sans-serif",
  },
};

export function isThemeKey(value: string): value is ThemeKey {
  return Object.prototype.hasOwnProperty.call(THEMES, value);
}

export function themeCss(key: ThemeKey): string {
  // Only the selected theme's variables are written, so no other theme can show up on the page.
  const t = THEMES[key];
  // RGB triplets let CSS build translucent glows with rgba(), which older Android WebViews support (color-mix() is not).
  const rgb = (hex: string) => { const n = parseInt(hex.slice(1), 16); return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`; };
  return `:root[data-theme="${key}"]{--primary-rgb:${rgb(t.primary)};--accent-rgb:${rgb(t.accent)};--bg:${t.bg};--surface:${t.surface};--primary:${t.primary};--accent:${t.accent};--text:${t.text};--muted:${t.muted};--border:${t.border};--on-primary:${t.onPrimary};--mark-dark:${t.markDark};--mark-light:${t.markLight};--radius:${t.radius};--font-heading:${t.heading};--font-body:${t.body};}`;
}
