'use client';

import { useState, type ImgHTMLAttributes } from 'react';
import { BrandMark } from '@/components/BrandMark';

type Props = ImgHTMLAttributes<HTMLImageElement>;

/**
 * Image that never shows an empty or broken box.
 * If the remote file fails to load, it shows a branded placeholder instead.
 */
export function SafeImage({ src, alt = '', className = '', ...rest }: Props) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span className={`img-fallback ${className}`.trim()} role="img" aria-label={alt || 'Padmaarc studio image'}>
        <BrandMark width={56} height={56} className="img-fallback-mark" />
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className || undefined} onError={() => setFailed(true)} {...rest} />;
}
