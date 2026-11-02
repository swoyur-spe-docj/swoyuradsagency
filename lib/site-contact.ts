import type { Settings } from './types';
import { socialUrl, type SocialPlatform } from './social';

/** Public business contact defaults. Supabase admin settings override these values. */
export const DEFAULT_SITE_CONTACT = {
  phone: '+91 95234 37987',
  whatsapp: '919523437987',
  email: 'thepadmaarc@gmail.com',
  instagram: '@the_padmaarc',
  facebook: '', // Add the verified Facebook page URL in Admin → Settings.
  linkedin: '', // Add the verified LinkedIn profile URL in Admin → Settings.
  youtube: '', // Add the verified YouTube channel URL in Admin → Settings.
} as const;

/** Optional profiles without a settings field stay empty until a real URL is supplied. */
export const OPTIONAL_SOCIAL_PROFILES: Partial<Record<SocialPlatform, string>> = {
  telegram: '', // Add a verified t.me profile here when one exists.
};

export function phoneHref(phone: string): string {
  const number = phone.trim().replace(/[^\d+]/g, '');
  return number ? `tel:${number}` : '';
}

export function emailHref(email: string, subject: string, body: string): string {
  const recipient = email.trim();
  if (!recipient) return '';
  return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function configuredSocialLinks(settings: Pick<Settings, 'instagram' | 'facebook' | 'linkedin' | 'youtube'>): [string, string][] {
  const candidates: [string, SocialPlatform, string][] = [
    ['Instagram', 'instagram', settings.instagram || DEFAULT_SITE_CONTACT.instagram],
    ['Facebook', 'facebook', settings.facebook],
    ['LinkedIn', 'linkedin', settings.linkedin],
    ['YouTube', 'youtube', settings.youtube],
    ['Telegram', 'telegram', OPTIONAL_SOCIAL_PROFILES.telegram ?? ''],
  ];
  return candidates
    .map(([label, platform, profile]) => [label, socialUrl(platform, profile)] as [string, string])
    .filter(([, href]) => Boolean(href));
}
