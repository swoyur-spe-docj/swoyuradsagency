import { phoneHref } from '@/lib/site-contact';

/** Floating WhatsApp button (every public page). Shown only when a WhatsApp number is set. */
export function WhatsAppFloat({ number }: { number: string }) {
  const digits = number.replace(/\D/g, '');
  if (digits.length < 8) return null;
  const message = encodeURIComponent('Hi Padmaarc, I would like to discuss a project.');
  return (
    <a className="wa-float" href={`https://wa.me/${digits}?text=${message}`} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp">
      <span className="wa-float-dot" aria-hidden="true" />
      <span>WhatsApp us</span>
    </a>
  );
}

/** Sticky bottom bar on phones: call, WhatsApp, and enquiry in one tap. */
export function MobileCta({ phone, whatsapp }: { phone: string; whatsapp: string }) {
  const digits = whatsapp.replace(/\D/g, '');
  return (
    <nav className="mobile-cta" aria-label="Quick contact">
      {phone ? <a href={phoneHref(phone)}>Call</a> : null}
      {digits.length >= 8 ? <a href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer">WhatsApp</a> : null}
      <a className="mobile-cta-primary" href="/contact#enquiry">Enquire</a>
    </nav>
  );
}
