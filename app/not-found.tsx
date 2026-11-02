import Link from 'next/link';
import { ActionIcon } from '@/components/ActionIcon';
export default function NotFound() {
  return (
    <section className="container section center">
      <p className="eyebrow">404 · PAGE NOT FOUND</p>
      <h1>We couldn’t find that page.</h1>
      <p className="muted">The address may have changed, or the page may no longer be available.</p>
      <Link className="btn btn-primary" href="/"><ActionIcon name="home" /> Go to home</Link>
    </section>
  );
}
