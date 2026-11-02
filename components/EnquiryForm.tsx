import { addEnquiryAction } from '@/app/actions';
import { Notice } from '@/components/ui';
import { ActionIcon } from '@/components/ActionIcon';

const SERVICES = ['Video production', 'Social media design', 'Influencer marketing', 'Meta Ads', 'Branding'];

export function EnquiryForm({ searchParams, returnTo = '/contact' }: {
  searchParams?: { sent?: string; error?: string };
  returnTo?: '/' | '/contact';
}) {
  return (
    <div className="enquiry-panel">
      <div className="enquiry-intro">
        <p className="eyebrow">LET’S MAKE SOMETHING WORK</p>
        <h2>Tell us what you’re building.</h2>
        <p className="muted">Share a few details and our team will get back to you to discuss the right next step.</p>
        <p className="enquiry-promise"><span>01</span> A real conversation <span>02</span> Clear next steps</p>
      </div>
      <div>
        <Notice notice={searchParams?.sent ? 'Thanks for reaching out. We will contact you shortly.' : undefined} error={searchParams?.error} />
        <form action={addEnquiryAction} className="form enquiry-form">
          <input type="hidden" name="returnTo" value={returnTo} />
          <div className="hp" hidden aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          <div className="form-2">
            <label>Your name *<input name="name" required minLength={2} autoComplete="name" placeholder="Name" /></label>
            <label>Mobile number *<input name="mobile" required pattern="[0-9]{10}" minLength={10} maxLength={10} inputMode="numeric" autoComplete="tel-national" placeholder="10 digit number" title="Enter a 10 digit mobile number" /></label>
            <label>Work email<input name="email" type="email" autoComplete="email" placeholder="you@company.com" /></label>
            <label>Business / brand<input name="business" autoComplete="organization" placeholder="Your business name" /></label>
          </div>
          <fieldset className="service-choices"><legend>What can we help with?</legend><div>{SERVICES.map((service) => <label key={service} className="check"><input type="checkbox" name="services" value={service} />{service}</label>)}</div></fieldset>
          <label>Approximate monthly budget<select name="budget" defaultValue=""><option value="">Choose if you know</option><option>Under ₹10,000</option><option>₹10,000–₹25,000</option><option>₹25,000–₹50,000</option><option>₹50,000+</option><option>Let’s discuss</option></select></label>
          <label>Tell us a little about your goals<textarea name="message" rows={4} maxLength={500} placeholder="What are you promoting, and what would success look like?" /></label>
          <div className="enquiry-submit"><button className="btn btn-primary" type="submit"><ActionIcon name="send" /> Send enquiry</button><span className="muted">No obligation. We’ll reply using your contact details.</span></div>
        </form>
      </div>
    </div>
  );
}
