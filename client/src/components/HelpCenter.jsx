import React from 'react';
import { Plus, HelpCircle } from 'lucide-react';

export const HelpCenter = () => {
  return (
    <div className="bento-card" style={{ gridColumn: 'span 12', padding: '32px' }}>
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Help Center & FAQ</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Learn how to manage your links, track analytics, and solve common issues.</p>
      </div>

      <div className="help-center-grid">
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} />
            Platform Quick Start Guide
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '16px' }}>
              <h4 style={{ fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>1. Shortening a URL</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Navigate to the <strong>Links & Creator</strong> tab. Paste your long destination URL in the form, optional title, and customized backhalf. Hit <strong>Create Short Link</strong>.
              </p>
            </div>

            <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '16px' }}>
              <h4 style={{ fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>2. Viewing Performance Analytics</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Select a shortened link in the database table. The real-time metric counters (Clicks, Visitors, CTR) and the traffic graph will instantly update to display that campaign's logs.
              </p>
            </div>

            <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '16px' }}>
              <h4 style={{ fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>3. Multi-Zoom Timeline inspection</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Switch the range filter to <strong>30 Days</strong> or <strong>All Time</strong>. Use the <code>+</code> and <code>-</code> zoom buttons next to the chart legends to expand the graph horizontally for close, pixel-perfect inspection of your daily clicks.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--accent)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={18} />
            Troubleshooting & Solutions (FAQ)
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="faq-item">
              <h3 style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '8px' }}>Issue: Custom Alias / Backhalf is Taken</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Link backhalves must be globally unique across SnapLink. If your preferred alias is taken, try appending a campaign year, numbers, or brand abbreviations (e.g. <code>/summer-promo-24</code>).
              </p>
            </div>

            <div className="faq-item">
              <h3 style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '8px' }}>Issue: Redirect Lands on a Blank/Broken Page</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Verify that your destination URL is fully qualified and begins with <code>http://</code> or <code>https://</code>. Re-create the link if there is a typo in the original URL.
              </p>
            </div>

            <div className="faq-item">
              <h3 style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '8px' }}>Issue: Links showing "Expired" and not resolving</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                When setting an expiration timer, our server blocks traffic once that timestamp passes. Delete the expired record and shorten the destination URL again with a longer expiration window or none.
              </p>
            </div>

            <div className="faq-item">
              <h3 style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '8px' }}>Issue: IP Geolocation shows "Unknown"</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                This happens when visitor requests come from secure corporate VPNs or internal local network interfaces that hide public IP geolocation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
