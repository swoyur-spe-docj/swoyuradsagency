import { getSettings } from '@/lib/repo';
import { settingsAction } from '@/app/actions';
import { THEMES } from '@/lib/themes';
import { Notice } from '@/components/ui';
import type { ThemeKey } from '@/lib/types';
import { requirePermission } from '@/lib/session-user';

export default async function SettingsPage({ searchParams }: { searchParams: { notice?: string; error?: string } }) {
  await requirePermission('settings');
  const s = await getSettings();
  return (
    <>
      <h1>Settings</h1>
      <Notice notice={searchParams.notice} error={searchParams.error} />
      <form action={settingsAction} className="form">
        <section className="card">
          <h2>Company</h2>
          <div className="form-2">
            <label>Company name<input name="companyName" defaultValue={s.companyName} required /></label>
            <label>Address<input name="address" defaultValue={s.address} /></label>
            <label>Phone<input name="phone" defaultValue={s.phone} /></label>
            <label>WhatsApp number (with country code, digits only)<input name="whatsapp" defaultValue={s.whatsapp} /></label>
            <label>Email<input name="email" type="email" defaultValue={s.email} /></label>
            <label>Instagram handle or URL<input name="instagram" defaultValue={s.instagram} placeholder="@yourbrand or instagram.com/yourbrand" /></label>
            <label>Facebook page URL<input name="facebook" defaultValue={s.facebook} placeholder="facebook.com/yourpage" /></label>
            <label>LinkedIn page URL<input name="linkedin" defaultValue={s.linkedin} placeholder="linkedin.com/company/yourbrand" /></label>
            <label>YouTube channel URL<input name="youtube" defaultValue={s.youtube} placeholder="youtube.com/@yourbrand" /></label>
          </div>
        </section>

        <section className="card">
          <h2>Payment details (shown to customers after confirmation)</h2>
          <div className="form-2">
            <label>UPI ID<input name="upiId" defaultValue={s.upiId} /></label>
            <label>Bank name<input name="bankName" defaultValue={s.bankName} /></label>
            <label>Account holder<input name="accountHolder" defaultValue={s.accountHolder} /></label>
            <label>Account number<input name="accountNumber" defaultValue={s.accountNumber} /></label>
            <label>IFSC<input name="ifsc" defaultValue={s.ifsc} /></label>
          </div>
        </section>

        <section className="card">
          <h2>Website theme</h2>
          <div className="form-2">
            {(Object.keys(THEMES) as ThemeKey[]).map((k) => {
              const t = THEMES[k];
              return (
                <label key={k} className="theme-opt">
                  <input type="radio" name="theme" value={k} defaultChecked={s.theme === k} style={{ width: 'auto', marginTop: 4 }} />
                  <span>
                    <strong style={{ color: 'var(--text)' }}>{t.label}</strong>
                    <br />
                    <span>{t.desc}</span>
                    <span className="swatches">
                      {[t.bg, t.primary, t.accent, t.border].map((c) => <span key={c} style={{ background: c }} />)}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
          <p className="muted" style={{ fontSize: 13 }}>Save to apply. The theme changes the public site and the admin panel.</p>
        </section>

        <div><button className="btn btn-primary" type="submit">Save settings</button></div>
      </form>
    </>
  );
}
