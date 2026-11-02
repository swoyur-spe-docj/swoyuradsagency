import type { SVGAttributes } from 'react';

// Padmaarc lotus mark. Its two colours come from the active theme (--mark-dark and --mark-light),
// so the logo always matches the theme the admin selected.
const MARK_INNER = "<g fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"> <path class=\"mark-light\" d=\"M10 31C14 16 24 8 32 7M54 31C50 16 40 8 32 7\" stroke=\"#C9CFDD\" stroke-width=\"2.4\"/> <path class=\"mark-dark\" d=\"M32 12C21 23 20 37 32 49 44 37 43 23 32 12Z\" fill=\"#8A93A8\" stroke=\"#8A93A8\" stroke-width=\"1.5\"/> <path class=\"mark-light\" d=\"M28 47C18 41 13 33 13 25 23 27 29 34 32 46M36 47C46 41 51 33 51 25 41 27 35 34 32 46\" fill=\"#C9CFDD\" stroke=\"#C9CFDD\" stroke-width=\"1.5\"/> <path class=\"mark-dark\" d=\"M7 39C15 37 23 40 30 49 21 53 12 49 7 39ZM57 39C49 37 41 40 34 49 43 53 52 49 57 39Z\" fill=\"#8A93A8\" stroke=\"#8A93A8\" stroke-width=\"1.5\"/> </g>";

type Props = { className?: string; width?: number | string; height?: number | string; alt?: string } & Omit<SVGAttributes<SVGSVGElement>, 'width' | 'height'>;

export function BrandMark({ className, width = 34, height = 34 }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      width={width}
      height={height}
      role="img"
      aria-label="Padmaarc lotus mark"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: MARK_INNER }}
    />
  );
}
