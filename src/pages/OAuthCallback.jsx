import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function OAuthCallback() {
  const [params] = useSearchParams();
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const status   = params.get('status');
    const provider = params.get('provider');
    const email    = params.get('email');
    const reason   = params.get('reason');

    // Write to localStorage — original tab listens via the 'storage' event.
    // This works even when window.opener is null (cross-origin redirect chain).
    localStorage.setItem('oauth_result', JSON.stringify({ status, provider, email, reason, ts: Date.now() }));

    window.close();

    // If window.close() had no effect (tab was opened manually), show a message.
    setTimeout(() => setClosed(true), 500);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Figtree, sans-serif', color: '#64748B' }}>
      <p>{closed ? 'Puedes cerrar esta pestaña.' : 'Cerrando esta pestaña…'}</p>
    </div>
  );
}
