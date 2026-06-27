import React, { useState, useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';
import Dashboard from './components/Dashboard.jsx';
import { Link2, Sparkles, Shield, Zap, BarChart2, Sun, Moon } from 'lucide-react';
import { Footer } from './components/Footer.jsx';

export default function App() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh' }}>
      
      {/* SIGNED OUT: LANDING AND LANDING HEADER */}
      <SignedOut>
        <header
          style={{
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-surface)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          <div
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              padding: '16px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  background: 'var(--primary)',
                  padding: '8px',
                  borderRadius: '8px',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(21, 21, 125, 0.2)',
                }}
              >
                <Link2 size={18} />
              </div>
              <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--primary)' }}>
                Snap<span style={{ color: 'var(--accent)' }}>Link</span>
              </span>
            </div>

            <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button className="btn-theme-toggle" onClick={toggleTheme} title="Toggle Day/Night Mode">
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
              <SignInButton mode="modal">
                <button className="btn-outline" style={{ fontSize: '13px', padding: '8px 16px' }}>
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="btn-primary" style={{ fontSize: '13px', padding: '8px 16px' }}>
                  Get Started
                </button>
              </SignUpButton>
            </nav>
          </div>
        </header>
        <div style={{ maxWidth: '1000px', margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--tertiary-fixed)',
              border: '1px solid var(--border-color)',
              borderRadius: '50px',
              padding: '6px 16px',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--primary)',
              marginBottom: '24px',
            }}
          >
            <Sparkles size={14} />
            <span>Introducing SnapLink v2.0 Enterprise</span>
          </div>

          <h1
            className="landing-title"
            style={{
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: '20px',
              color: 'var(--primary)',
            }}
          >
            Enterprise Link Management. <br />
            Real-time Analytics. Redis-powered Speed.
          </h1>

          <p
            style={{
              fontSize: '18px',
              color: 'var(--text-secondary)',
              maxWidth: '650px',
              margin: '0 auto 40px auto',
              lineHeight: 1.6,
            }}
          >
            Create, brand, and track shortened links instantly. Backed by a secure Clerk Authentication backend, Prisma with MongoDB database engines, and in-memory Redis caches.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '80px' }}>
            <SignUpButton mode="modal">
              <button className="btn-primary" style={{ padding: '14px 32px', fontSize: '15px' }}>
                Create Free Account
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="btn-outline" style={{ padding: '14px 32px', fontSize: '15px' }}>
                Explore Platform Demo
              </button>
            </SignInButton>
          </div>

          <div className="features-grid">
            <div className="bento-card" style={{ textAlign: 'left' }}>
              <div
                style={{
                  background: 'var(--tertiary-fixed)',
                  color: 'var(--primary)',
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <Zap size={20} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px' }}>Redis-Driven Caching</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Redirection records are served directly from cache in under a millisecond, optimizing throughput and response speeds.
              </p>
            </div>

            <div className="bento-card" style={{ textAlign: 'left' }}>
              <div
                style={{
                  background: 'var(--secondary-fixed)',
                  color: 'var(--secondary)',
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <BarChart2 size={20} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px' }}>Geographics Analytics</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Log and view click maps, browser ratios, and OS metrics resolved dynamically in the background without affecting redirect flow.
              </p>
            </div>

            <div className="bento-card" style={{ textAlign: 'left' }}>
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: 'var(--success)',
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <Shield size={20} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px' }}>Secured Accounts</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Secure link directories protected by Clerk. Customize limits, custom backhalves, and set link expiration dates.
              </p>
            </div>
          </div>
        </div>

        <Footer variant="landing" />
      </SignedOut>

      <SignedIn>
        <Dashboard theme={theme} setTheme={setTheme} />
      </SignedIn>
    </div>
  );
}
