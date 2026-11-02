import { loginAction } from '@/app/actions';
import { Notice } from '@/components/ui';
import { redirect } from 'next/navigation';
import { BrandMark } from '@/components/BrandMark';
import { currentUser } from '@/lib/session-user';
import { publicSiteUrl } from '@/lib/env';

export const metadata = { robots: { index: false, follow: false, nocache: true } };

export default async function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  if (await currentUser()) redirect('/admin');
  return (
    <section className="container section narrow admin-login">
      <div className="admin-login-head"><div className="admin-login-brand"><BrandMark width="44" height="44" /><span><strong>Padmaarc</strong><small>STUDIO CONTROL</small></span></div></div>
      <h1>Admin login</h1>
      <p className="muted">Padmaarc admin panel. Authorized users only.</p>
      <Notice error={searchParams.error} />
      <form action={loginAction} className="form">
        <label>Email <span className="muted">(team accounts only)</span><input name="email" type="email" autoComplete="username" placeholder="Leave blank for studio owner" /></label>
        <p className="muted">Studio owner: sign in with the configured admin password. Add team accounts after you enter the workspace.</p>
        <label>Password<input name="password" type="password" required autoComplete="current-password" /></label>
        <div><button className="btn btn-primary" type="submit">Login</button></div>
      </form>
      <div className="admin-login-footer"><a href={publicSiteUrl()}>← Back to public site</a><span>Private studio workspace</span></div>
    </section>
  );
}
