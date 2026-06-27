import React, { useState, useEffect, useMemo } from 'react';
import { useAuth, useUser, UserButton } from '@clerk/clerk-react';
import {
  Link2,
  Plus,
  Trash2,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  Calendar,
  BarChart3,
  Clock,
  Laptop,
  Globe,
  MousePointerClick,
  ArrowRight,
  RefreshCw,
  Download,
  Settings,
  HelpCircle,
  MessageSquare,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Monitor,
  Smartphone,
  Info,
  Minus,
  Sun,
  Moon,
} from 'lucide-react';
import { Footer } from './Footer.jsx';
import { HelpCenter } from './HelpCenter.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Dashboard({ theme, setTheme }) {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLinkId, setSelectedLinkId] = useState(() => {
    return localStorage.getItem('snaplink_selectedLinkId') || null;
  });

  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('snaplink_activeTab') || 'links';
  });
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    if (selectedLinkId) localStorage.setItem('snaplink_selectedLinkId', selectedLinkId);
    else localStorage.removeItem('snaplink_selectedLinkId');
  }, [selectedLinkId]);

  useEffect(() => {
    if (activeTab) localStorage.setItem('snaplink_activeTab', activeTab);
  }, [activeTab]);

  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiration, setExpiration] = useState('');
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [copiedCode, setCopiedCode] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [activeQrUrl, setActiveQrUrl] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [zoomLevel, setZoomLevel] = useState(1);

  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false);

  useEffect(() => {
    setZoomLevel(1);
  }, [timeRange]);

  const fetchLinks = async (showRefresher = false) => {
    if (showRefresher) setRefreshing(true);
    else setLoading(true);

    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/links`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch links');
      }

      const data = await res.json();
      setLinks(data);
      if (data.length > 0) {
        const storedId = localStorage.getItem('snaplink_selectedLinkId');

        const linkExists = storedId && data.some(link => link.id === storedId);
        if (!linkExists) {
          setSelectedLinkId(data[0].id);
        }
      } else {
        setSelectedLinkId(null);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading links. Please check your backend server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    const toast = document.getElementById('dashboard-toast');
    if (toast) {
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);
    }
  };

  const handleCopy = (shortCode) => {
    const fullUrl = `${API_URL}/${shortCode}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedCode(shortCode);
    showToast('Copied short link to clipboard! 📋');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          originalUrl,
          customAlias: customAlias || undefined,
          expiration: expiration || undefined,
          title: title || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to shorten URL');
      }

      setOriginalUrl('');
      setCustomAlias('');
      setExpiration('');
      setTitle('');
      
      setLinks([data, ...links]);
      setSelectedLinkId(data.id);
      showToast('Link shortened successfully! 🚀');
      setActiveTab('links'); // Redirect to table tab on mobile
    } catch (err) {
      setFormError(err.message || 'An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/links/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to delete link');
      }

      setLinks(links.filter((link) => link.id !== id));
      if (selectedLinkId === id) {
        const remaining = links.filter((link) => link.id !== id);
        setSelectedLinkId(remaining.length > 0 ? remaining[0].id : null);
      }
      showToast('Link deleted successfully.');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete link.');
    }
  };

  const selectedLink = useMemo(() => {
    return links.find((link) => link.id === selectedLinkId) || null;
  }, [links, selectedLinkId]);

  const handleExport = () => {
    if (!selectedLink) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(selectedLink, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `snaplink_analytics_${selectedLink.shortCode}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported report successfully! 📥');
  };

  const analytics = useMemo(() => {
    if (!selectedLink) return null;

    const nowMs = Date.now();
    const filterDays = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : null;

    const filteredClicks = selectedLink.clicks.filter((c) => {
      if (filterDays === null) return true;
      const ts = new Date(c.timestamp).getTime();
      return ts >= nowMs - filterDays * 24 * 60 * 60 * 1000;
    });

    const trendDays = timeRange === '7d' ? 7 : 30;
    const currentPeriodStartMs = nowMs - trendDays * 24 * 60 * 60 * 1000;
    const previousPeriodStartMs = nowMs - 2 * trendDays * 24 * 60 * 60 * 1000;

    const currentPeriodClicks = selectedLink.clicks.filter((c) => {
      const ts = new Date(c.timestamp).getTime();
      return ts >= currentPeriodStartMs && ts <= nowMs;
    });

    const previousPeriodClicks = selectedLink.clicks.filter((c) => {
      const ts = new Date(c.timestamp).getTime();
      return ts >= previousPeriodStartMs && ts < currentPeriodStartMs;
    });

    const currentClicksCount = currentPeriodClicks.length;
    const previousClicksCount = previousPeriodClicks.length;
    let totalClicksChange = 0;
    if (previousClicksCount > 0) {
      totalClicksChange = ((currentClicksCount - previousClicksCount) / previousClicksCount) * 100;
    } else if (currentClicksCount > 0) {
      totalClicksChange = 100.0;
    }

    const currentUniqueIps = new Set(currentPeriodClicks.map((c) => c.ip));
    const previousUniqueIps = new Set(previousPeriodClicks.map((c) => c.ip));
    const currentVisitorsCount = currentUniqueIps.size;
    const previousVisitorsCount = previousUniqueIps.size;
    let uniqueVisitorsChange = 0;
    if (previousVisitorsCount > 0) {
      uniqueVisitorsChange = ((currentVisitorsCount - previousVisitorsCount) / previousVisitorsCount) * 100;
    } else if (currentVisitorsCount > 0) {
      uniqueVisitorsChange = 100.0;
    }

    const currentCtrVal = currentClicksCount > 0 ? (currentVisitorsCount / currentClicksCount) * 10 : 0;
    const previousCtrVal = previousClicksCount > 0 ? (previousVisitorsCount / previousClicksCount) * 10 : 0;
    let ctrChange = 0;
    if (previousCtrVal > 0) {
      ctrChange = ((currentCtrVal - previousCtrVal) / previousCtrVal) * 100;
    } else if (currentCtrVal > 0) {
      ctrChange = 100.0;
    }

    const browsers = {};
    const osList = {};
    const countries = {};
    const uniqueIps = new Set();

    filteredClicks.forEach((c) => {
      browsers[c.browser] = (browsers[c.browser] || 0) + 1;
      osList[c.os] = (osList[c.os] || 0) + 1;
      countries[c.country] = (countries[c.country] || 0) + 1;
      uniqueIps.add(c.ip);
    });

    const sortGroup = (record) => {
      const total = filteredClicks.length || 1;
      return Object.entries(record)
        .map(([name, count]) => ({
          name,
          count,
          percentage: Math.round((count / total) * 100),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);
    };

    const daysToShow = timeRange === '7d' ? 7 : timeRange === '30d' ? 15 : 30;
    const dailyDesktop = {};
    const dailyMobile = {};
    const dateLabels = [];

    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      dateLabels.push(key);
      dailyDesktop[key] = 0;
      dailyMobile[key] = 0;
    }

    filteredClicks.forEach((c) => {
      const clickDate = new Date(c.timestamp).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
      
      if (clickDate in dailyDesktop) {
        const isDesktopOS = /windows|mac/i.test(c.os);
        if (isDesktopOS) {
          dailyDesktop[clickDate]++;
        } else {
          dailyMobile[clickDate]++;
        }
      }
    });

    const chartData = dateLabels.map((day) => ({
      day,
      desktop: dailyDesktop[day],
      mobile: dailyMobile[day],
      total: dailyDesktop[day] + dailyMobile[day],
    }));

    return {
      browsers: sortGroup(browsers),
      osList: sortGroup(osList),
      countries: sortGroup(countries),
      chartData,
      totalClicks: filteredClicks.length,
      uniqueVisitors: uniqueIps.size,
      ctr: filteredClicks.length > 0 ? ((uniqueIps.size / filteredClicks.length) * 10).toFixed(2) : '0.00',
      totalClicksChange,
      uniqueVisitorsChange,
      ctrChange,
    };
  }, [selectedLink, timeRange]);

  const svgChartPaths = useMemo(() => {
    if (!analytics || !analytics.chartData.length) return null;
    const data = analytics.chartData;
    const maxVal = Math.max(...data.map((d) => Math.max(d.desktop, d.mobile)), 5);
    const baseWidth = 1000;
    const svgWidth = baseWidth * (1 + (zoomLevel - 1) * 0.5);
    const height = 300;
    const paddingX = 2;
    const paddingY = 40;

    const getPoints = (accessor) => {
      return data.map((d, index) => {
        const x = paddingX + (index * (svgWidth - paddingX * 2)) / (data.length - 1);
        const y = height - paddingY - (accessor(d) * (height - paddingY * 2)) / maxVal;
        return { x, y };
      });
    };

    const getLinePath = (points) => {
      if (points.length === 0) return '';
      let path = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const cpX1 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
        const cpY1 = points[i - 1].y;
        const cpX2 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
        const cpY2 = points[i].y;
        path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y}`;
      }
      return path;
    };

    const desktopPoints = getPoints((d) => d.desktop);
    const mobilePoints = getPoints((d) => d.mobile);

    return {
      desktopPath: getLinePath(desktopPoints),
      mobilePath: getLinePath(mobilePoints),
      desktopPoints,
      mobilePoints,
      svgWidth,
      height,
      paddingX,
    };
  }, [analytics, zoomLevel, timeRange]);

  const activeMapHotspots = useMemo(() => {
    if (!analytics || !analytics.countries.length) return [];

    const countryCoords = {
      'United States': { top: '28.9%', left: '23.1%' },
      'Canada': { top: '18.9%', left: '20.6%' },
      'United Kingdom': { top: '20.6%', left: '49.4%' },
      'Germany': { top: '21.7%', left: '52.8%' },
      'France': { top: '24.4%', left: '50.6%' },
      'India': { top: '37.8%', left: '71.9%', colorClass: 'blue' },
      'Japan': { top: '30.0%', left: '88.3%', colorClass: 'blue' },
      'Australia': { top: '63.9%', left: '86.9%', colorClass: 'blue' },
      'Brazil': { top: '55.6%', left: '34.7%' },
      'Russia': { top: '16.7%', left: '75.0%' },
      'China': { top: '30.6%', left: '78.9%', colorClass: 'blue' },
      'Singapore': { top: '49.3%', left: '78.8%', colorClass: 'blue' },
      'South Africa': { top: '66.7%', left: '56.9%' },
      'Spain': { top: '27.8%', left: '48.9%' },
      'Italy': { top: '26.7%', left: '53.3%' },
      'Mexico': { top: '37.2%', left: '21.7%' },
      'Argentina': { top: '68.9%', left: '32.2%' },
      'Netherlands': { top: '21.1%', left: '51.4%' },
      'Sweden': { top: '15.6%', left: '54.2%' },
      'Switzerland': { top: '23.9%', left: '52.2%' },
      'New Zealand': { top: '73.3%', left: '98.3%', colorClass: 'blue' }
    };

    return analytics.countries
      .map((c) => {
        const coords = countryCoords[c.name];
        if (coords) {
          return { name: c.name, ...coords };
        }
        return null;
      })
      .filter((item) => item !== null);
  }, [analytics]);

  const [liveActiveUsers, setLiveActiveUsers] = useState(0);

  useEffect(() => {
    if (!analytics) return;
    const baseUsers = Math.max(1, analytics.uniqueVisitors || 1);
    setLiveActiveUsers(baseUsers);
    
    const interval = setInterval(() => {
      setLiveActiveUsers(prev => {
        const change = Math.floor(Math.random() * 6) - 2;
        const newValue = prev + change;
        if (newValue < 1) return 1;
        if (newValue > baseUsers + 10) return baseUsers + 3;
        return newValue;
      });
    }, 4000);
    
    return () => clearInterval(interval);
  }, [analytics]);

  const isSelectedLinkExpired = selectedLink?.expiration && new Date(selectedLink.expiration) <= new Date();

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>

      <div id="dashboard-toast" className="toast">
        <Check size={16} style={{ color: 'var(--success)' }} />
        <span>{toastMessage}</span>
      </div>

      <div className={`modal-overlay ${activeQrUrl ? 'show' : ''}`} onClick={() => setActiveQrUrl(null)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h3 style={{ marginBottom: '12px', fontWeight: 600, fontSize: '18px' }}>QR Code Generated</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
            Scan the QR code below to access the link.
          </p>
          {activeQrUrl && (
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(activeQrUrl)}`}
              alt="QR Code"
              style={{
                background: 'white',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                marginBottom: '24px',
                display: 'inline-block',
              }}
            />
          )}
          <div>
            <button className="btn-outline" style={{ width: '100%' }} onClick={() => setActiveQrUrl(null)}>
              Close Modal
            </button>
          </div>
        </div>
      </div>

      <div className={`modal-overlay ${deleteConfirmId ? 'show' : ''}`} onClick={() => setDeleteConfirmId(null)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h3 style={{ marginBottom: '12px', fontWeight: 600, fontSize: '18px', color: 'var(--error)' }}>Confirm Deletion</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
            Are you sure you want to delete this shortened link? This action cannot be undone and all analytics data will be permanently removed.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="btn-outline"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => setDeleteConfirmId(null)}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              style={{ flex: 1, backgroundColor: 'var(--error)', border: 'none', color: theme === 'dark' ? 'var(--bg-primary)' : '#fff', justifyContent: 'center', fontWeight: 'bold' }}
              onClick={() => {
                handleDelete(deleteConfirmId);
                setDeleteConfirmId(null);
              }}
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </div>

      <aside className="sidebar">
        <div className="px-2" style={{ marginBottom: '32px' }}>
          <span className="sidebar-logo">SnapLink</span>
          <p className="sidebar-subtitle">Enterprise Admin</p>
        </div>
        
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'links' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('links');
              setShowDetailedBreakdown(false);
            }}
          >
            <Link2 size={18} />
            <span>Links & Creator</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('analytics');
              setShowDetailedBreakdown(false);
            }}
          >
            <BarChart3 size={18} />
            <span>Analytics Dashboard</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'shorten' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('shorten');
              setShowDetailedBreakdown(false);
            }}
          >
            <Plus size={18} />
            <span>Quick Shorten</span>
          </button>
        </nav>

        <div className="sidebar-plan-card">
          <h4>Current Plan</h4>
          <p>Enterprise</p>
          <button className="btn-plan-upgrade">Upgrade Now</button>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', marginBottom: '8px' }}>
            <UserButton afterSignOutUrl="/" />
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.fullName || 'User Account'}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.primaryEmailAddress?.emailAddress || ''}
              </span>
            </div>
          </div>
          <button
            className={`nav-item ${activeTab === 'help' ? 'active' : ''}`}
            style={{ padding: '8px 16px' }}
            onClick={() => {
              setActiveTab('help');
              setShowDetailedBreakdown(false);
            }}
          >
            <HelpCircle size={16} />
            <span>Help Center</span>
          </button>
          <button
            className="nav-item"
            style={{ padding: '8px 16px' }}
            onClick={() => window.open('mailto:abneeshpatel9@gmail.com', '_blank')}
          >
            <MessageSquare size={16} />
            <span>Support</span>
          </button>
          <button
            className="nav-item"
            style={{ padding: '8px 16px' }}
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? <Moon size={16} style={{ color: 'var(--text-secondary)' }} /> : <Sun size={16} style={{ color: 'var(--accent)' }} />}
            <span>{theme === 'light' ? 'Night Mode' : 'Day Mode'}</span>
          </button>
        </div>
      </aside>

      <main className="main-content" style={{ flex: 1 }}>

        {activeTab !== 'help' && (
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '14px' }}>Analytics</span>
                <ChevronRight size={14} style={{ color: 'var(--text-secondary)' }} />
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  {selectedLink ? selectedLink.title || `/${selectedLink.shortCode}` : 'Overview'}
                </span>
              </div>
              {selectedLink ? (
                <div>
                  <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px', letterSpacing: '-0.02em' }}>
                    /{selectedLink.shortCode}
                    <button
                      className="btn-icon"
                      style={{ padding: '6px', borderRadius: '50%' }}
                      onClick={() => handleCopy(selectedLink.shortCode)}
                      title="Copy URL"
                    >
                      {copiedCode === selectedLink.shortCode ? (
                        <Check size={16} style={{ color: 'var(--success)' }} />
                      ) : (
                        <Copy size={16} style={{ color: 'var(--primary)' }} />
                      )}
                    </button>
                  </h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                    Redirects to: <span style={{ color: 'var(--secondary)', fontStyle: 'italic', fontWeight: 500 }}>{selectedLink.originalUrl}</span>
                  </p>
                </div>
              ) : (
                <div>
                  <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                    Analytics Hub
                  </h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                    Create links to populate click analysis logs.
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', backgroundColor: 'var(--map-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '4px' }}>
                <button
                  className="btn-outline"
                  style={{ padding: '6px 12px', fontSize: '12px', border: 'none', backgroundColor: timeRange === '7d' ? 'var(--hover-bg, #f1f5f9)' : 'transparent', fontWeight: timeRange === '7d' ? '700' : '500' }}
                  onClick={() => setTimeRange('7d')}
                >
                  7 Days
                </button>
                <button
                  className="btn-outline"
                  style={{ padding: '6px 12px', fontSize: '12px', border: 'none', backgroundColor: timeRange === '30d' ? 'var(--hover-bg, #f1f5f9)' : 'transparent', fontWeight: timeRange === '30d' ? '700' : '500' }}
                  onClick={() => setTimeRange('30d')}
                >
                  30 Days
                </button>
                <button
                  className="btn-outline"
                  style={{ padding: '6px 12px', fontSize: '12px', border: 'none', backgroundColor: timeRange === 'all' ? 'var(--hover-bg, #f1f5f9)' : 'transparent', fontWeight: timeRange === 'all' ? '700' : '500' }}
                  onClick={() => setTimeRange('all')}
                >
                  All Time
                </button>
              </div>
              <button className="btn-primary" onClick={handleExport} style={{ padding: '10px 20px', fontSize: '14px' }} disabled={!selectedLink}>
                <Download size={16} />
                Export Report
              </button>
            </div>
          </header>
        )}

        {activeTab !== 'help' && (analytics ? (
          <section className="kpi-grid">
            <div className="bento-card">
              <div className="kpi-card-header">
                <div className="kpi-icon-box blue">
                  <MousePointerClick size={20} />
                </div>
                <span className={`kpi-change-tag ${analytics.totalClicksChange >= 0 ? 'up' : 'down'}`} style={{ color: analytics.totalClicksChange >= 0 ? 'var(--success)' : 'var(--error)' }}>
                  {analytics.totalClicksChange >= 0 ? '+' : ''}{analytics.totalClicksChange.toFixed(1)}% 
                  {analytics.totalClicksChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                </span>
              </div>
              <p className="kpi-title">Total Clicks</p>
              <p className="kpi-value">{analytics.totalClicks}</p>
            </div>

            <div className="bento-card">
              <div className="kpi-card-header">
                <div className="kpi-icon-box purple">
                  <Globe size={20} />
                </div>
                <span className={`kpi-change-tag ${analytics.uniqueVisitorsChange >= 0 ? 'up' : 'down'}`} style={{ color: analytics.uniqueVisitorsChange >= 0 ? 'var(--success)' : 'var(--error)' }}>
                  {analytics.uniqueVisitorsChange >= 0 ? '+' : ''}{analytics.uniqueVisitorsChange.toFixed(1)}% 
                  {analytics.uniqueVisitorsChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                </span>
              </div>
              <p className="kpi-title">Unique Visitors</p>
              <p className="kpi-value">{analytics.uniqueVisitors}</p>
            </div>

            <div className="bento-card">
              <div className="kpi-card-header">
                <div className="kpi-icon-box green">
                  <Calendar size={20} />
                </div>
                <span className={`kpi-change-tag ${analytics.ctrChange >= 0 ? 'up' : 'down'}`} style={{ color: analytics.ctrChange >= 0 ? 'var(--success)' : 'var(--error)' }}>
                  {analytics.ctrChange >= 0 ? '+' : ''}{analytics.ctrChange.toFixed(1)}% 
                  {analytics.ctrChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                </span>
              </div>
              <p className="kpi-title">Analytics Index (CTR)</p>
              <p className="kpi-value">{analytics.ctr}%</p>
            </div>

            <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="status-indicator" style={{ marginBottom: '8px' }}>
                <span className={`status-dot ${isSelectedLinkExpired ? 'expired' : 'active'}`}></span>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>
                  Status: {isSelectedLinkExpired ? 'Expired' : 'Active'}
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Created: {new Date(selectedLink.createdAt).toLocaleDateString()}
              </p>
              <div style={{ display: 'flex', marginTop: '12px', marginLeft: '6px' }}>

                <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid white', backgroundColor: '#e2e8f0', overflow: 'hidden', zIndex: 3 }}>
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAprAPInoiFa_uZJpfLjK7BpX2cXgTmi7I6UHvTPgBZ4-RQs0IxYRaq0YaMjzgfDouQl3A7ZNvMFHGDDcmK19vBMiwO8TiMxH_7mowhPj8n28UO6kkyGTY1bqvSaPA_GMQGqYJEcVSMrDNMg3kFX8DVPmuaGYHaJ8Aftk5OVedWv9cl0lL7wX7YB8FxogUBIu-YTD0s5DrLRuD8-yJYEzNR0a3nJB5yQZUsvqN9XD0xpGnLPGKQqxHkB8s1AokFKByR_FRWJACCtoHv" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Avatar 1" />
                </div>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid white', backgroundColor: '#e2e8f0', overflow: 'hidden', marginLeft: '-8px', zIndex: 2 }}>
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkd_JHwmQb78U4y8Xesc_i8ZALIhODw4R4DQ6YE7XyEBVFnPnxH8mTTi-SnVGtXZ0UYkIbzUFHyE0g69nxijBNJBjuZpYcTTvCwReGH3lZPCva7AinmJ1XyT2Ztut88xWdgG4sHB5q1TIKYANtCv8hOiWsv2-I4sNY-m1AP6XPrdsb4ohqAMiy3h3f3AWaaE2VNTsIWsjBETzL5_yvjCjNPvjKD2X32BSLbW-SWRbWeN0iMSLNvbb6Uk7opSP-Xc5izq6cR90J_OBm" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Avatar 2" />
                </div>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid white', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', marginLeft: '-8px', zIndex: 1 }}>
                  +4
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="kpi-grid">

            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="bento-card" style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
                No link selected
              </div>
            ))}
          </section>
        ))}

        <div className="analytics-grid">

          {activeTab !== 'shorten' && activeTab !== 'help' && (
            <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', gridColumn: 'span 12', padding: '24px 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Clicks Over Time</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Real-time traffic logs segmented by channel</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

                  {analytics && (timeRange === '30d' || timeRange === 'all') && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn-outline"
                        style={{ padding: '6px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', fontWeight: 600, cursor: zoomLevel === 1 ? 'not-allowed' : 'pointer' }}
                        onClick={() => zoomLevel > 1 && setZoomLevel(zoomLevel - 1)}
                        disabled={zoomLevel === 1}
                      >
                        <Minus size={12} style={{ marginRight: '4px' }} /> Zoom Out
                      </button>
                      <button
                        type="button"
                        className="btn-outline"
                        style={{ padding: '6px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', fontWeight: 600, cursor: zoomLevel === 4 ? 'not-allowed' : 'pointer' }}
                        onClick={() => zoomLevel < 4 && setZoomLevel(zoomLevel + 1)}
                        disabled={zoomLevel === 4}
                      >
                        <Plus size={12} style={{ marginRight: '4px' }} /> Zoom In
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--primary)' }}></span>
                      Desktop
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '3px', border: '2px dashed var(--accent)' }}></span>
                      Mobile
                    </span>
                  </div>
                </div>
              </div>

              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '240px', color: 'var(--text-secondary)' }}>
                  Loading timeline metrics...
                </div>
              ) : (
                <div style={{ width: '0', minWidth: '100%', overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px 4px', backgroundColor: 'transparent' }}>
                  {svgChartPaths ? (
                    <svg
                      viewBox={`0 0 ${svgChartPaths.svgWidth} 300`}
                      width={zoomLevel === 1 ? '100%' : `${svgChartPaths.svgWidth}px`}
                      height={svgChartPaths.height}
                      style={{ display: 'block', overflow: 'visible' }}
                    >

                      {[0, 1, 2, 3, 4].map((gridIdx) => {
                        const y = 40 + gridIdx * 55;
                        return (
                          <line
                            key={gridIdx}
                            x1={svgChartPaths.paddingX}
                            y1={y}
                            x2={svgChartPaths.svgWidth - svgChartPaths.paddingX}
                            y2={y}
                            stroke="var(--border-color)"
                            strokeWidth="1"
                          />
                        );
                      })}

                      <path
                        d={svgChartPaths.desktopPath}
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />

                      <path
                        d={svgChartPaths.mobilePath}
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="3"
                        strokeDasharray="8 4"
                        strokeLinecap="round"
                      />

                      {svgChartPaths.desktopPoints.length > 1 && (
                        <circle
                          cx={svgChartPaths.desktopPoints[svgChartPaths.desktopPoints.length - 1].x}
                          cy={svgChartPaths.desktopPoints[svgChartPaths.desktopPoints.length - 1].y}
                          r="6"
                          fill="var(--primary)"
                          style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.2))' }}
                        />
                      )}

                      {svgChartPaths.desktopPoints.map((p, idx) => {
                        let anchor = "middle";
                        if (idx === 0) anchor = "start";
                        if (idx === svgChartPaths.desktopPoints.length - 1) anchor = "end";
                        return (
                          <text
                            key={idx}
                            x={p.x}
                            y={285}
                            textAnchor={anchor}
                            fill="var(--text-secondary)"
                            fontSize="10"
                            fontWeight="600"
                          >
                            {analytics.chartData[idx].day}
                          </text>
                        );
                      })}
                    </svg>
                  ) : null}
                </div>
              )}
            </div>
          )}

          {activeTab !== 'shorten' && (activeTab === 'links' || (activeTab === 'analytics' && !showDetailedBreakdown)) && (
            <div className="bento-card" style={{ gridColumn: 'span 12' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>Top Referrers</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                Traffic origin by user browser agent
              </p>

              {!analytics ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '180px', color: 'var(--text-secondary)' }}>
                  No referrer logs available
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {analytics.browsers.slice(0, 5).map((b, idx) => {
                    const colorClasses = ['primary', 'accent', 'secondary', 'gray'];
                    const colorClass = colorClasses[idx % colorClasses.length];
                    
                    return (
                      <div key={b.name} className="bar-row">
                        <div className="bar-row-label">
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Monitor size={14} style={{ color: 'var(--primary)' }} />
                            {b.name}
                          </span>
                          <span style={{ fontWeight: 600 }}>{b.count} ({b.percentage}%)</span>
                        </div>
                        <div className="bar-track">
                          <div className={`bar-fill ${colorClass}`} style={{ width: `${b.percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                className="btn-outline"
                style={{ width: '100%', marginTop: '32px' }}
                onClick={() => {
                  if (activeTab === 'links') {
                    setActiveTab('analytics');
                  }
                  setShowDetailedBreakdown(true);
                }}
                disabled={!analytics}
              >
                View Detailed Breakdown
              </button>
            </div>
          )}

          {activeTab === 'analytics' && showDetailedBreakdown && analytics && (
            <div className="bento-card" style={{ gridColumn: 'span 12' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Detailed Devices Breakdown</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Deep dive analysis of browsers and operating systems</p>
                </div>
                <button
                  type="button"
                  className="btn-outline"
                  style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600 }}
                  onClick={() => setShowDetailedBreakdown(false)}
                >
                  Back to Summary
                </button>
              </div>

              <div className="device-grid">

                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Monitor size={16} style={{ color: 'var(--primary)' }} />
                    Browsers Used
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {analytics.browsers.map((b, idx) => {
                      const colorClasses = ['primary', 'accent', 'secondary', 'gray'];
                      const colorClass = colorClasses[idx % colorClasses.length];
                      return (
                        <div key={b.name} className="bar-row">
                          <div className="bar-row-label">
                            <span style={{ fontSize: '13px', fontWeight: 500 }}>{b.name}</span>
                            <span style={{ fontWeight: 600 }}>{b.count} ({b.percentage}%)</span>
                          </div>
                          <div className="bar-track">
                            <div className={`bar-fill ${colorClass}`} style={{ width: `${b.percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Smartphone size={16} style={{ color: 'var(--accent)' }} />
                    Operating Systems
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {analytics.osList.map((o, idx) => {
                      const colorClasses = ['accent', 'primary', 'secondary', 'gray'];
                      const colorClass = colorClasses[idx % colorClasses.length];
                      return (
                        <div key={o.name} className="bar-row">
                          <div className="bar-row-label">
                            <span style={{ fontSize: '13px', fontWeight: 500 }}>{o.name}</span>
                            <span style={{ fontWeight: 600 }}>{o.count} ({o.percentage}%)</span>
                          </div>
                          <div className="bar-track">
                            <div className={`bar-fill ${colorClass}`} style={{ width: `${o.percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && analytics && (
            <div className="bento-card" style={{ gridColumn: 'span 12' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Geographic Distribution</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Heatmap of visitor hotspots based on geo IP resolution
                  </p>
                </div>
              </div>

              <div className="geo-map-container" style={{ position: 'relative', width: '100%', height: '360px', background: 'var(--map-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <div
                  className="geo-map-image"
                  style={{
                    backgroundImage: `url('/world-map.svg')`,
                    opacity: theme === 'light' ? 0.08 : 0.15,
                    filter: theme === 'light' ? 'invert(0)' : 'invert(1)',
                    position: 'absolute',
                    inset: 0,
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}
                />

                {activeMapHotspots.map((spot) => (
                  <div
                    key={spot.name}
                    className={`map-hotspot ${spot.colorClass || ''}`}
                    style={{ top: spot.top, left: spot.left }}
                    title={spot.name}
                  >
                    <span className="map-hotspot-ping"></span>
                    <span className="map-hotspot-dot"></span>
                  </div>
                ))}

                <div className="geo-map-overlay-stats">
                  <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
                    Active Now
                  </p>
                  <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', transition: 'all 0.3s ease' }}>
                    <span style={{ display: 'inline-block', minWidth: '30px' }}>{liveActiveUsers}</span> Users
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Live traffic from {Math.max(1, analytics.countries.length)} countries
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'help' && (
            <HelpCenter />
          )}

          {activeTab === 'links' && (
            <div className="bento-card table-panel" style={{ gridColumn: 'span 8' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Your Shortened Links</h2>

              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '180px', color: 'var(--text-secondary)' }}>
                  Loading links database...
                </div>
              ) : links.length === 0 ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '180px', color: 'var(--text-secondary)' }}>
                  No shortened links created yet. Create one above!
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="linktech-table">
                    <thead>
                      <tr>
                        <th>Campaign Title / Destination</th>
                        <th style={{ whiteSpace: 'nowrap' }}>Short Code</th>
                        <th>Clicks</th>
                        <th className="hide-on-mobile">Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {links.map((link) => {
                        const isExpired = link.expiration && new Date(link.expiration) <= new Date();
                        const isSelected = link.id === selectedLinkId;

                        return (
                          <tr
                            key={link.id}
                            onClick={() => setSelectedLinkId(link.id)}
                            style={{
                              cursor: 'pointer',
                              backgroundColor: isSelected ? 'var(--hover-bg, #f2f4f6)' : '',
                              borderLeft: isSelected ? '4px solid var(--primary)' : '',
                            }}
                          >
                            <td>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{link.title || 'Untitled Campaign'}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {link.originalUrl}
                              </div>
                            </td>
                            <td style={{ whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: 600 }}>
                                <span>/{link.shortCode}</span>
                                <a
                                  href={`${API_URL}/${link.shortCode}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  style={{ color: 'inherit', display: 'flex', alignItems: 'center' }}
                                >
                                  <ExternalLink size={12} />
                                </a>
                              </div>
                              <div className="show-on-mobile" style={{ marginTop: '8px' }}>
                                <span className={`badge ${isExpired ? 'badge-expired' : 'badge-active'}`}>
                                  {isExpired ? 'Expired' : 'Active'}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span style={{ fontWeight: 700 }}>{(link.clicks || []).length}</span>
                            </td>
                            <td className="hide-on-mobile">
                              <span className={`badge ${isExpired ? 'badge-expired' : 'badge-active'}`}>
                                {isExpired ? 'Expired' : 'Active'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button
                                  className="btn-icon"
                                  onClick={() => handleCopy(link.shortCode)}
                                  title="Copy URL"
                                >
                                  {copiedCode === link.shortCode ? (
                                    <Check size={14} style={{ color: 'var(--success)' }} />
                                  ) : (
                                    <Copy size={14} />
                                  )}
                                </button>
                                <button
                                  className="btn-icon"
                                  onClick={() => setActiveQrUrl(`${API_URL}/${link.shortCode}`)}
                                  title="Generate QR Code"
                                >
                                  <QrCode size={14} />
                                </button>
                                <button
                                  className="btn-danger-icon"
                                  onClick={() => setDeleteConfirmId(link.id)}
                                  title="Delete Link"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {(activeTab === 'links' || activeTab === 'shorten') && (
            <div className="bento-card shortener-panel" style={{ gridColumn: activeTab === 'shorten' ? 'span 12' : 'span 4' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={20} style={{ color: 'var(--primary)' }} />
                Shorten a URL
              </h2>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Destination URL *</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://brand.com/shop/collections/summer"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Campaign Title (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Summer Promo 2024"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Custom Alias</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="summer-promo"
                      value={customAlias}
                      onChange={(e) => setCustomAlias(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Expiration Timer</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={expiration}
                      onChange={(e) => setExpiration(e.target.value)}
                    />
                  </div>
                </div>

                {formError && (
                  <div style={{ color: 'var(--error)', fontSize: '13px', padding: '10px', background: 'rgba(186, 26, 26, 0.06)', borderRadius: '8px', border: '1px solid rgba(186, 26, 26, 0.2)' }}>
                    {formError}
                  </div>
                )}

                <button type="submit" className="btn-primary" disabled={submitting} style={{ marginTop: '8px', justifyContent: 'center' }}>
                  {submitting ? 'Shortening...' : 'Create Short Link'}
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          )}

        </div>

        <Footer />

      </main>

      <nav className="mobile-bottom-nav">
        <button
          className={`mobile-nav-item ${activeTab === 'links' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('links');
            setShowDetailedBreakdown(false);
          }}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <Link2 size={20} />
          <span>Links</span>
        </button>
        <button
          className={`mobile-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('analytics');
            setShowDetailedBreakdown(false);
          }}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <BarChart3 size={20} />
          <span>Stats</span>
        </button>

        <div className="mobile-action-btn-wrapper">
          <button
            className="btn-mobile-action"
            onClick={() => {
              setActiveTab('shorten');
              setShowDetailedBreakdown(false);
            }}
          >
            <Plus size={28} />
          </button>
        </div>

        <button
          className="mobile-nav-item"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
        </button>

        <div className="mobile-nav-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ transform: 'scale(0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '24px' }}>
            <UserButton afterSignOutUrl="/" />
          </div>
          <span style={{ fontSize: '10px', fontWeight: 700, marginTop: '4px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Profile</span>
        </div>
      </nav>

    </div>
  );
}
