import type { ReactNode, SVGProps } from 'react';

type IconName = 'mail' | 'phone' | 'pin' | 'bell' | 'user' | 'arrow' | 'whatsapp' | 'menu';

const shapes: Record<IconName, ReactNode> = {
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></>,
  phone: <path d="M7 3h3l1.2 4.3-2 1.5a15 15 0 0 0 6 6l1.5-2L21 14v3c0 1.1-.9 2-2 2A16 16 0 0 1 5 5c0-1.1.9-2 2-2Z"/>,
  pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
  user: <><circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/></>,
  arrow: <><path d="M7 17 17 7M7 7h10v10"/></>,
  whatsapp: <><path d="M20.2 11.7a8.2 8.2 0 0 1-12.1 7.2L4 20l1.1-4A8.2 8.2 0 1 1 20.2 11.7Z"/><path d="M8.2 8.2c.2-.5.5-.5.8-.5h.5c.2 0 .4.1.5.4l.7 1.6c.1.3.1.5-.1.7l-.6.7c-.2.2-.2.4 0 .7.4.7 1 1.3 1.7 1.7.3.2.5.2.7 0l.8-.9c.2-.2.4-.2.7-.1l1.5.7c.3.1.4.3.4.5 0 .3-.2 1-.6 1.3-.4.4-1 .6-1.6.6s-1.5-.3-2.5-.8c-1.2-.6-2.3-1.7-3-2.8-.7-1.1-.9-2-.9-2.6 0-.6.3-1.2.6-1.5Z"/></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
};

export function ContactIcon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{shapes[name]}</svg>;
}
