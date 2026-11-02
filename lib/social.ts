// Builds safe HTTPS links for configured social profiles and contact details.
// Only each platform's own domains are accepted, so arbitrary link destinations are rejected.
export type SocialPlatform = 'instagram' | 'facebook' | 'linkedin' | 'youtube' | 'telegram';

const HOSTS: Record<SocialPlatform, string[]> = {
  instagram: ['instagram.com', 'www.instagram.com'],
  facebook: ['facebook.com', 'www.facebook.com', 'm.facebook.com'],
  linkedin: ['linkedin.com', 'www.linkedin.com'],
  youtube: ['youtube.com', 'www.youtube.com', 'youtu.be', 'www.youtu.be'],
  telegram: ['t.me', 'www.t.me', 'telegram.me', 'www.telegram.me'],
};

export function socialUrl(platform: SocialPlatform, configured: string): string {
  const value = configured.trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      if (!HOSTS[platform].includes(parsed.hostname.toLowerCase())) return '';
      parsed.protocol = 'https:';
      return parsed.toString();
    } catch {
      return '';
    }
  }
  const handle = value.replace(/^@/, '').replace(/^\/+|\/+$/g, '');
  if (!/^[\p{L}\p{N}._-]+$/u.test(handle)) return '';
  const encoded = encodeURIComponent(handle);
  if (platform === 'instagram') return `https://www.instagram.com/${encoded}/`;
  if (platform === 'facebook') return `https://www.facebook.com/${encoded}`;
  if (platform === 'linkedin') return `https://www.linkedin.com/company/${encoded}/`;
  if (platform === 'telegram') return `https://t.me/${encoded}`;
  return `https://www.youtube.com/@${encoded}`;
}
