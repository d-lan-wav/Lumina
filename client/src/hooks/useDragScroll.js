import { useEffect, useRef } from 'react';

const RUBBER_LIMIT = 140;

function rubber(excess) {
  return (1 - 1 / ((excess * 0.55) / RUBBER_LIMIT + 1)) * RUBBER_LIMIT;
}

export default function useDragScroll(ref) {
  const state = useRef({
    isDown: false,
    moved: false,
    startX: 0,
    base: 0,
    target: 0,
    current: 0,
    raf: null
  });

  useEffect(() => {
    const el = ref.current;
    const d = state.current;

    const getMax = () => el.scrollWidth - el.clientWidth;
    const clamp = (value) => Math.max(0, Math.min(getMax(), value));

    const animate = () => {
      d.current += (d.target - d.current) * 0.14;
      if (Math.abs(d.target - d.current) < 0.4) d.current = d.target;
      const clamped = clamp(d.current);
      el.scrollLeft = clamped;
      el.style.setProperty('--overscroll', `${clamped - d.current}px`);
      if (d.current === d.target) {
        d.raf = null;
        return;
      }
      d.raf = requestAnimationFrame(animate);
    };

    const goTo = (value) => {
      d.target = value;
      if (!d.raf) d.raf = requestAnimationFrame(animate);
    };

    const handleMove = (e) => {
      if (!d.isDown) return;
      const dx = e.pageX - d.startX;
      if (Math.abs(dx) > 5) d.moved = true;
      const raw = d.base - dx;
      const max = getMax();
      if (raw < 0) goTo(-rubber(-raw));
      else if (raw > max) goTo(max + rubber(raw - max));
      else goTo(raw);
    };

    const handleUp = () => {
      if (!d.isDown) return;
      d.isDown = false;
      el.style.cursor = 'grab';
      goTo(clamp(d.target));
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      if (d.raf) cancelAnimationFrame(d.raf);
      d.raf = null;
    };
  }, [ref]);

  const onMouseDown = (e) => {
    const d = state.current;
    const el = ref.current;
    e.preventDefault();
    d.isDown = true;
    d.moved = false;
    d.startX = e.pageX;
    d.base = Math.max(0, Math.min(el.scrollWidth - el.clientWidth, d.current));
    d.target = d.current;
    el.style.cursor = 'grabbing';
  };

  const onClickCapture = (e) => {
    if (state.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      state.current.moved = false;
    }
  };

  return { onMouseDown, onClickCapture };
}