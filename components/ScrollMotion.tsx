'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export function ScrollMotion() {
  const pathname = usePathname();
  const previousPath = useRef<string | null>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    let parallaxAnimation: Animation | undefined;

    if (previousPath.current && previousPath.current !== pathname && !reducedMotion) {
      const target = document.querySelector<HTMLElement>('main, .admin-main, .admin-login');
      if (target) {
        target.animate(
          [
            { translate: '0 5px' },
            { translate: '0 0' },
          ],
          { duration: 480, easing: 'cubic-bezier(.2,.75,.25,1)' }
        );
      }
    }
    previousPath.current = pathname;

    const progress = document.querySelector<HTMLElement>('.scroll-progress');
    const hero = document.querySelector<HTMLElement>('.hero');
    const heroVisual = document.querySelector<HTMLElement>('.hero-visual');
    const updateScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const value = Math.max(0, Math.min(1, window.scrollY / maxScroll));
        progress?.style.setProperty('--scroll-progress', String(value));
        progress?.setAttribute('aria-valuenow', String(Math.round(value * 100)));
        if (hero && heroVisual && !reducedMotion) {
          const offset = Math.max(-14, Math.min(14, hero.getBoundingClientRect().top * -0.035));
          const keyframes = [{ translate: `0 ${offset}px` }];
          if (!parallaxAnimation) {
            parallaxAnimation = heroVisual.animate(keyframes, { duration: 0, fill: 'both' });
          } else if (parallaxAnimation.effect instanceof KeyframeEffect) {
            parallaxAnimation.effect.setKeyframes(keyframes);
          }
        }
      });
    };
    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll);
    updateScroll();

    let observer: IntersectionObserver | undefined;
    const revealElements = Array.from(document.querySelectorAll<HTMLElement>(
      'main > .section, main > .contact-hero, main > .hero, .page-endcap, .service-detail, .enquiry-panel, .dashboard-welcome, .admin-main .card, .admin-main .stat'
    ));
    if (!reducedMotion && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.animate(
            [
              { translate: '0 8px' },
              { translate: '0 0' },
            ],
            { duration: 720, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'both' }
          );
          observer?.unobserve(entry.target);
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
      revealElements.forEach((element) => {
        observer?.observe(element);
      });
    }

    const tiltTargets = reducedMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches
      ? []
      : Array.from(document.querySelectorAll<HTMLElement>('.tilt-card, .grid-4 > .card'));
    const pointerHandlers = tiltTargets.map((element) => {
      const onMove = (event: PointerEvent) => {
        const rect = element.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
        element.style.setProperty('--tilt-x', `${(x - 0.5) * 7}deg`);
        element.style.setProperty('--tilt-y', `${(0.5 - y) * 6}deg`);
        element.style.setProperty('--shine-x', `${x * 100}%`);
        element.style.setProperty('--shine-y', `${y * 100}%`);
      };
      const onLeave = () => {
        element.style.setProperty('--tilt-x', '0deg');
        element.style.setProperty('--tilt-y', '0deg');
        element.style.setProperty('--shine-x', '50%');
        element.style.setProperty('--shine-y', '50%');
      };
      element.addEventListener('pointermove', onMove, { passive: true });
      element.addEventListener('pointerleave', onLeave, { passive: true });
      return () => {
        element.removeEventListener('pointermove', onMove);
        element.removeEventListener('pointerleave', onLeave);
      };
    });

    return () => {
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
      cancelAnimationFrame(frame);
      parallaxAnimation?.cancel();
      observer?.disconnect();
      pointerHandlers.forEach((cleanup) => cleanup());
    };
  }, [pathname]);

  return <div className="scroll-progress" role="progressbar" aria-label="Page scroll progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0} />;
}
