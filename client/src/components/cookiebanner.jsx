import { useState, useEffect } from 'react';

function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('cookiesAccepted');
    if (!accepted) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#000',
      color: '#E4E4E1',
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '12px',
      fontSize: '13px',
      zIndex: 100
    }}>
      <p>Usamos almacenamiento local del navegador para recordar tus preferencias. Sin rastreo ni publicidad. <a href="/privacidad" style={{ color: 'var(--accent)' }}>Más información</a></p>
      <button onClick={handleAccept} style={{
        background: 'var(--accent)',
        color: '#E4E4E1',
        border: 'none',
        borderRadius: '6px',
        padding: '8px 16px',
        fontFamily: 'inherit',
        cursor: 'pointer'
      }}>Entendido</button>
    </div>
  );
}

export default CookieBanner;