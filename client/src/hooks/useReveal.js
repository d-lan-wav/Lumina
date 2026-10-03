import { useEffect } from 'react';

export default function useReveal(trigger, selector = '.movie-card') {
  useEffect(() => {
    const items = document.querySelectorAll(selector);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          entry.target.classList.remove('visible');
        }
      });
    }, { threshold: 0.1 });
    items.forEach(item => observer.observe(item));
    return () => observer.disconnect();
  }, [trigger, selector]);
}