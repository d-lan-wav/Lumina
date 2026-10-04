import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

function Intro() {
  const rootRef = useRef(null);
  const [done, setDone] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    if (done) return;
    let cancelled = false;
    document.body.style.overflow = 'hidden';

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true, onComplete: () => setDone(true) });

      tl.fromTo('.intro-light', { scaleY: 0, opacity: 0 }, { scaleY: 1, opacity: 1, duration: 1, ease: 'power3.out' })
        .to('.intro-light', { opacity: 0.55, duration: 0.45, yoyo: true, repeat: 1, ease: 'sine.inOut' })
        .to('.intro-light', { height: window.innerHeight * 1.4, duration: 0.6, ease: 'power3.in' })
        .to('.intro-bloom', { opacity: 1, duration: 0.6, ease: 'power2.in' }, '<')
        .to('.intro-light', { opacity: 0, duration: 0.3, ease: 'power1.out' }, '-=0.15')
        .to('.intro-left', { xPercent: -100, duration: 1.1, ease: 'power4.inOut' }, '<')
        .to('.intro-right', { xPercent: 100, duration: 1.1, ease: 'power4.inOut' }, '<')
        .to('.intro-bloom', { scaleX: 3, opacity: 0, duration: 0.9, ease: 'power1.out' }, '<0.15');

      document.fonts.ready.then(() => {
        if (!cancelled) tl.play();
      });
    }, rootRef);

    return () => {
      cancelled = true;
      ctx.revert();
      document.body.style.overflow = '';
    };
  }, [done]);

  if (done) return null;

  return (
    <div className="intro" ref={rootRef} aria-hidden="true">
      <div className="intro-panel intro-left" />
      <div className="intro-panel intro-right" />
      <div className="intro-bloom" />
      <div className="intro-light" />
    </div>
  );
}

export default Intro;