import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';

export function BadgeToast() {
  const { newBadgeUnlocked, clearBadgeAlert } = useStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!newBadgeUnlocked) return;
    setVisible(true);
    const timer = window.setTimeout(() => {
      setVisible(false);
      window.setTimeout(clearBadgeAlert, 350);
    }, 4200);
    return () => window.clearTimeout(timer);
  }, [newBadgeUnlocked, clearBadgeAlert]);

  if (!newBadgeUnlocked) return null;

  return (
    <div className={`badge-toast ${visible ? 'is-visible' : ''}`} role="status" aria-live="polite">
      <div className="badge-toast-copy">
        <p>Achievement unlocked</p>
        <strong>{newBadgeUnlocked.name}</strong>
        <span>{newBadgeUnlocked.description}</span>
      </div>
      <button onClick={() => { setVisible(false); window.setTimeout(clearBadgeAlert, 350); }} aria-label="Dismiss achievement">Close</button>
      <div className="badge-toast-progress" />
    </div>
  );
}
