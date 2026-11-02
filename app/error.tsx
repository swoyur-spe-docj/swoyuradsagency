'use client';

import { friendlyError } from '@/lib/errors';
import { ActionIcon } from '@/components/ActionIcon';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="container section narrow center"><p className="eyebrow">TEMPORARY PROBLEM</p><h1>Something went wrong.</h1><p className="muted">{friendlyError(error)} If the problem continues, contact the studio.</p><button className="btn btn-primary" onClick={() => reset()}><ActionIcon name="arrow" /> Try again</button></main>;
}
