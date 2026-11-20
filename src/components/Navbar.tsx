import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Preferences } from './Preferences';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { LEVEL_TIERS } from '../lib/arena-data';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/toolkit', label: 'Financial Toolkit' },
  { to: '/arena', label: 'FINSOUL Arena' },
  { to: '/boardroom', label: 'Boardroom' },
];

export const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const arena = pathname.startsWith('/arena');
  const { xp, level, streak } = useStore();
  const tier = LEVEL_TIERS.find((item) => item.level === level) ?? LEVEL_TIERS[0];
  const levelProgress = Math.min(100, Math.max(0, ((xp - tier.minXp) / (tier.maxXp - tier.minXp)) * 100));

  return (
    <header className={`site-header ${arena ? 'is-dark' : ''}`}>
      <div className="site-header-inner">
        <button className="wordmark" onClick={() => navigate('/')} aria-label="FINSOUL home">
          FIN<span>SOUL</span>
        </button>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              {({ isActive }) => <>{item.label}{isActive && <motion.span className="nav-active-indicator" layoutId="nav-active-indicator" transition={{ type: 'spring', stiffness: 420, damping: 38 }} />}</>}
            </NavLink>
          ))}
        </nav>
        <div className="header-actions">
          <span className="nav-progress" aria-label={`Level ${level}, ${xp} experience points, ${streak} day streak`}><span className="nav-streak">{streak}d</span><span className="nav-level">LV {level}</span><span className="nav-xp-track"><i style={{ width: `${levelProgress}%` }} /></span></span>
          <button className="header-preferences" onClick={() => setPrefsOpen(true)}>Settings</button>
          <button className="mobile-menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}>
            {menuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          <div className="nav-mobile-progress"><span>{streak} day streak</span><span>Level {level} · {xp} XP</span><span className="nav-xp-track"><i style={{ width: `${levelProgress}%` }} /></span></div>
          {links.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              {({ isActive }) => <>{item.label}{isActive && <motion.span className="nav-active-indicator" layoutId="mobile-nav-active-indicator" transition={{ type: 'spring', stiffness: 420, damping: 38 }} />}</>}
            </NavLink>
          ))}
          <button className="nav-link" onClick={() => { setPrefsOpen(true); setMenuOpen(false); }}>Settings</button>
        </nav>
      )}
      {prefsOpen && <Preferences onClose={() => setPrefsOpen(false)} />}
    </header>
  );
};
