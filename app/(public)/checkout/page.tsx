import Link from 'next/link';
import { createOrderAction } from '@/app/actions';
import { getPackageBySlug } from '@/lib/repo';
import { inr, today } from '@/lib/format';
import { ActionIcon } from '@/components/ActionIcon';

export default async function CheckoutPage({ searchParams }: { searchParams: { package?: string; error?: string } }) {
  const slug = searchParams.package || '';
  const pkg = slug ? await getPackageBySlug(slug) : undefined;

  if (!pkg || !pkg.active) {
    return (
      <section className="container section narrow checkout-page checkout-empty">
        <p className="eyebrow">Checkout</p>
        <h1>This plan is not available</h1>
        <p className="muted">It may have been updated. Choose one of our current monthly plans to continue.</p>
        <Link className="btn btn-primary" href="/packages"><ActionIcon name="package" /> View packages</Link>
      </section>
    );
  }

  const months = pkg.durationMonths;
  const includes = [
    ...(pkg.videos ? [`${pkg.videos} ${pkg.videos === 1 ? 'video' : 'videos'}`] : []),
    ...(pkg.posters ? [`${pkg.posters} ${pkg.posters === 1 ? 'poster' : 'posters'}`] : []),
    ...pkg.deliverables,
  ];

  return (
    <section className="container section checkout-page">
      <header className="checkout-head">
        <p className="eyebrow">Secure order · Step 2 of 3</p>
        <h1>Almost there. Tell us where to start.</h1>
        <ol className="checkout-steps" aria-label="Order progress">
          <li className="is-done"><span aria-hidden="true"><ActionIcon name="check" /></span> Choose plan</li>
          <li className="is-current" aria-current="step"><span>2</span> Your details</li>
          <li><span>3</span> We confirm</li>
        </ol>
      </header>

      {searchParams.error && (
        <div className="notice error checkout-error" role="alert">{searchParams.error}</div>
      )}

      <div className="checkout-grid">
        <aside className="checkout-aside" aria-label="Order summary">
          <div className="card checkout-summary">
            <p className="eyebrow">Your plan</p>
            <h2>{pkg.name}</h2>
            <p className="checkout-duration">{months} {months === 1 ? 'month' : 'months'} · monthly plan</p>
            <p className="checkout-price">{inr(pkg.price)}</p>
            {includes.length > 0 && (
              <ul className="checkout-includes">
                {includes.map((item) => (
                  <li key={item}><ActionIcon name="check" /> {item}</li>
                ))}
              </ul>
            )}
            <Link className="checkout-change" href="/packages">← Change plan</Link>
          </div>
          <div className="card checkout-next">
            <h3>What happens next</h3>
            <ol>
              <li><strong>We reach out.</strong> A team member confirms your details on call or WhatsApp.</li>
              <li><strong>You pay securely.</strong> We send payment details once the plan is confirmed.</li>
              <li><strong>Work begins.</strong> Your plan starts on the date you choose.</li>
            </ol>
          </div>
        </aside>

        <form action={createOrderAction} className="checkout-form">
          <input type="hidden" name="packageSlug" value={pkg.slug} />
          <div className="hp" hidden aria-hidden="true">
            <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
          </div>

          <fieldset className="checkout-group">
            <legend>Your details</legend>
            <div className="checkout-row">
              <label>Full name *
                <input name="name" required minLength={2} autoComplete="name" placeholder="As on your ID" />
              </label>
              <label>Mobile number *
                <input name="mobile" required pattern="\d{10}" inputMode="numeric" autoComplete="tel-national" maxLength={10} placeholder="10 digits" />
              </label>
            </div>
            <label>Email (optional)
              <input name="email" type="email" autoComplete="email" placeholder="you@business.com" />
            </label>
          </fieldset>

          <fieldset className="checkout-group">
            <legend>Your business</legend>
            <div className="checkout-row">
              <label>Business name *
                <input name="business" required autoComplete="organization" />
              </label>
              <label>City *
                <input name="city" required autoComplete="address-level2" />
              </label>
            </div>
            <label>GST number (optional)
              <input name="gst" maxLength={15} autoCapitalize="characters" placeholder="15 characters" />
            </label>
          </fieldset>

          <fieldset className="checkout-group">
            <legend>Preferences</legend>
            <div className="checkout-row">
              <label>Preferred start date (optional)
                <input name="startDate" type="date" min={today()} />
              </label>
            </div>
            <label>Goal or message (optional)
              <textarea name="goal" rows={3} maxLength={500} placeholder="What do you want this plan to achieve?" />
            </label>
          </fieldset>

          <label className="checkout-agree">
            <input type="checkbox" name="agree" required />
            <span>I agree to the terms and understand the order is confirmed after payment.</span>
          </label>

          <button className="btn btn-primary checkout-submit" type="submit">
            <ActionIcon name="lock" /> Place order · {inr(pkg.price)}
          </button>
          <p className="checkout-fine">Your details are used only to confirm this order.</p>
        </form>
      </div>
    </section>
  );
}
