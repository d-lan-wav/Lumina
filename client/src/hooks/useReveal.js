import { useEffect } from 'react';

export default function useReveal(trigger) {
  useEffect(() => {
    const cards = document.querySelectorAll('.movie-card');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          entry.target.classList.remove('visible');
        }
      });
    }, { threshold: 0.1 });
    cards.forEach(card => observer.observe(card));
    return () => observer.disconnect();
  }, [trigger]);
}