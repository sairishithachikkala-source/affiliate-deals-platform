import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Heart, 
  User as UserIcon, 
  Menu, 
  X, 
  ShieldCheck, 
  LogOut, 
  Flame, 
  Sparkles,
  ChevronDown,
  Globe,
  Check,
  Smartphone,
  Shirt,
  Home,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
  const { t, currentLanguage, setLanguage } = useLanguage();
  const { user, isAdmin, logout } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
        setMobileSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent body scrolling when navigation drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  // Close drawer on page route change
  useEffect(() => {
    setDrawerOpen(false);
    setMobileSearchOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (onSearch) {
      onSearch(searchQuery);
    }
    navigate(`/deals?search=${encodeURIComponent(searchQuery.trim())}`);
    setDrawerOpen(false);
    setMobileSearchOpen(false);
  };

  const handleLanguageSelect = (langCode: string) => {
    setLanguage(langCode, true);
  };

  return (
    <header className="header-nav" style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'rgba(255, 255, 255, 0.96)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid #e2e8f0' }}>
      {/* Top Banner Notice */}
      <div
        style={{
          backgroundColor: '#fef3c7',
          borderBottom: '1px solid #fde68a',
          padding: '0.3rem 0.75rem',
          fontSize: '0.74rem',
          textAlign: 'center',
          color: '#92400e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.45rem',
          flexWrap: 'wrap',
          lineHeight: 1.35,
        }}
      >
        <span style={{ fontWeight: 700, backgroundColor: '#f59e0b', color: '#fff', padding: '0.08rem 0.4rem', borderRadius: '4px', fontSize: '0.68rem', flexShrink: 0 }}>
          {t('demo_badge')}
        </span>
        <span style={{ wordBreak: 'break-word' }}>{t('demo_notice')}</span>
      </div>

      {/* Main Navbar Header Row */}
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '66px',
          position: 'relative',
        }}
      >
        {/* ========================================================
            TOP LEFT: Main Navigation Trigger & Desktop Quick Links
            ======================================================== */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 2 }}>
          {/* Main Menu Button (Always visible on Left, triggers full navigation drawer) */}
          <button
            type="button"
            id="main-nav-menu-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label={t('nav_menu')}
            aria-expanded={drawerOpen}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.75rem',
              borderRadius: '10px',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#1e293b',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              minHeight: '40px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#eff6ff';
              e.currentTarget.style.borderColor = '#93c5fd';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
          >
            <Menu size={19} style={{ color: '#2563eb' }} />
            <span className="desktop-menu-text" style={{ fontSize: '0.86rem' }}>{t('nav_menu')}</span>
          </button>

          {/* Desktop Left Quick Navigation Links */}
          <nav className="desktop-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Link
              to="/deals"
              id="desktop-quick-deals"
              style={{
                fontSize: '0.86rem',
                fontWeight: location.pathname === '/deals' ? 700 : 600,
                color: location.pathname === '/deals' ? '#2563eb' : '#475569',
                padding: '0.4rem 0.7rem',
                borderRadius: '8px',
                backgroundColor: location.pathname === '/deals' ? '#eff6ff' : 'transparent',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Sparkles size={15} style={{ color: '#f59e0b' }} />
              <span>{t('nav_all_deals')}</span>
            </Link>

            <Link
              to={isAdmin ? "/admin" : "/admin/login"}
              id="desktop-quick-admin"
              style={{
                fontSize: '0.84rem',
                fontWeight: 700,
                color: '#b45309',
                backgroundColor: '#fef3c7',
                border: '1px solid #fde68a',
                padding: '0.35rem 0.65rem',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <ShieldCheck size={15} style={{ color: '#b45309' }} />
              <span>{t('nav_admin_portal')}</span>
            </Link>
          </nav>
        </div>

        {/* ========================================================
            CENTER: "DealNest.in" Brand Logo (Horizontally Centered
            independently of navigation width on desktop & mobile)
            Tagline completely removed!
            ======================================================== */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1,
            pointerEvents: 'auto',
            textAlign: 'center',
          }}
        >
          <Link
            to="/"
            id="brand-logo-link"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #e11d48 0%, #f59e0b 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 10px rgba(225, 29, 72, 0.25)',
                flexShrink: 0,
              }}
            >
              <Flame size={20} />
            </div>
            <span
              style={{
                fontSize: 'clamp(1.15rem, 3.5vw, 1.38rem)',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}
            >
              DealNest<span style={{ color: '#e11d48' }}>.in</span>
            </span>
          </Link>
        </div>

        {/* ========================================================
            TOP RIGHT: Search & Wishlist Only (Separate login, 
            register, and language buttons removed from header bar)
            ======================================================== */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', zIndex: 2 }}>
          {/* Desktop Search Input */}
          <form
            onSubmit={handleSearchSubmit}
            className="navbar-search-desktop"
            style={{ position: 'relative' }}
          >
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              id="navbar-search-desktop-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_placeholder')}
              style={{
                width: '240px',
                padding: '0.5rem 0.85rem 0.5rem 2.4rem',
                borderRadius: '9999px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                fontSize: '0.82rem',
                outline: 'none',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => {
                e.target.style.width = '300px';
                e.target.style.borderColor = '#3b82f6';
                e.target.style.backgroundColor = '#ffffff';
              }}
              onBlur={(e) => {
                e.target.style.width = '240px';
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.backgroundColor = '#f8fafc';
              }}
            />
          </form>

          {/* Mobile Search Toggle Icon */}
          <button
            type="button"
            className="navbar-search-mobile-toggle"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            aria-label="Toggle Search"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: mobileSearchOpen ? '#eff6ff' : '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: mobileSearchOpen ? '#2563eb' : '#475569',
              cursor: 'pointer',
            }}
          >
            <Search size={18} />
          </button>

          {/* Wishlist Icon with Counter Badge */}
          <Link
            to="/wishlist"
            id="nav-wishlist-link"
            aria-label={t('nav_wishlist')}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              border: '1px solid #e2e8f0',
              color: '#334155',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
            title={t('nav_wishlist')}
          >
            <Heart
              size={19}
              style={{
                color: wishlistCount > 0 ? '#e11d48' : '#64748b',
                fill: wishlistCount > 0 ? '#e11d48' : 'none',
              }}
            />
            {wishlistCount > 0 && (
              <span
                id="wishlist-badge-count"
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  backgroundColor: '#e11d48',
                  color: '#ffffff',
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 5px rgba(225, 29, 72, 0.4)',
                }}
              >
                {wishlistCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Collapsible Search Input Row */}
      {mobileSearchOpen && (
        <div
          className="container animate-fade-in"
          style={{
            paddingBottom: '0.75rem',
            paddingTop: '0.25rem',
          }}
        >
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '100%' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              id="mobile-header-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_placeholder')}
              autoFocus
              style={{
                width: '100%',
                padding: '0.65rem 4.5rem 0.65rem 2.6rem',
                borderRadius: '12px',
                border: '1px solid #3b82f6',
                backgroundColor: '#ffffff',
                fontSize: '0.88rem',
                outline: 'none',
                boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.15)',
              }}
            />
            <button
              type="submit"
              className="btn-primary"
              style={{
                position: 'absolute',
                right: '4px',
                top: '4px',
                bottom: '4px',
                padding: '0 0.85rem',
                fontSize: '0.78rem',
                borderRadius: '8px',
              }}
            >
              {t('search_button')}
            </button>
          </form>
        </div>
      )}

      {/* ========================================================
          DESKTOP SECONDARY CATEGORY STRIP (Clean & Wrapped)
          ======================================================== */}
      <nav
        className="desktop-secondary-category-bar"
        style={{
          borderTop: '1px solid #f1f5f9',
          backgroundColor: '#ffffff',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            paddingTop: '0.45rem',
            paddingBottom: '0.45rem',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
          }}
        >
          <Link
            to="/category/fashion-accessories"
            style={{
              fontSize: '0.84rem',
              fontWeight: location.pathname.includes('fashion-accessories') ? 700 : 500,
              color: location.pathname.includes('fashion-accessories') ? '#2563eb' : '#475569',
              textDecoration: 'none',
              padding: '0.2rem 0.5rem',
              borderRadius: '6px',
            }}
          >
            {t('category_fashion')}
          </Link>
          <Link
            to="/category/electronics-tech"
            style={{
              fontSize: '0.84rem',
              fontWeight: location.pathname.includes('electronics-tech') ? 700 : 500,
              color: location.pathname.includes('electronics-tech') ? '#2563eb' : '#475569',
              textDecoration: 'none',
              padding: '0.2rem 0.5rem',
              borderRadius: '6px',
            }}
          >
            {t('category_electronics')}
          </Link>
          <Link
            to="/category/beauty-personal-care"
            style={{
              fontSize: '0.84rem',
              fontWeight: location.pathname.includes('beauty-personal-care') ? 700 : 500,
              color: location.pathname.includes('beauty-personal-care') ? '#2563eb' : '#475569',
              textDecoration: 'none',
              padding: '0.2rem 0.5rem',
              borderRadius: '6px',
            }}
          >
            {t('category_beauty')}
          </Link>
          <Link
            to="/category/home-kitchen"
            style={{
              fontSize: '0.84rem',
              fontWeight: location.pathname.includes('home-kitchen') ? 700 : 500,
              color: location.pathname.includes('home-kitchen') ? '#2563eb' : '#475569',
              textDecoration: 'none',
              padding: '0.2rem 0.5rem',
              borderRadius: '6px',
            }}
          >
            {t('category_home_kitchen')}
          </Link>
          <Link
            to="/category/others"
            style={{
              fontSize: '0.84rem',
              fontWeight: location.pathname.includes('others') ? 700 : 500,
              color: location.pathname.includes('others') ? '#2563eb' : '#475569',
              textDecoration: 'none',
              padding: '0.2rem 0.5rem',
              borderRadius: '6px',
            }}
          >
            {t('category_others')}
          </Link>
        </div>
      </nav>

      {/* ========================================================
          NAVIGATION DRAWER / MENU
          Contains: Deals, Categories, Wishlist, Admin Portal,
          User Login/Register/Account, and Language Selector.
          ======================================================== */}
      {drawerOpen && (
        <div
          id="nav-drawer-backdrop"
          onClick={() => setDrawerOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
          }}
          className="animate-fade-in"
        >
          <div
            id="nav-drawer-panel"
            ref={drawerRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(360px, 88vw)',
              height: '100%',
              backgroundColor: '#ffffff',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              position: 'relative',
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1.25rem 1rem',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #e11d48 0%, #f59e0b 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                  }}
                >
                  <Flame size={18} />
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  DealNest<span style={{ color: '#e11d48' }}>.in</span>
                </span>
              </div>

              <button
                type="button"
                id="close-nav-drawer-btn"
                onClick={() => setDrawerOpen(false)}
                aria-label={t('close_menu')}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#f1f5f9',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Search Input */}
            <div style={{ padding: '1rem 1.25rem 0.5rem' }}>
              <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
                <Search
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                  }}
                />
                <input
                  type="text"
                  id="drawer-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search_placeholder')}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem 0.6rem 2.4rem',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </form>
            </div>

            {/* Drawer Content Sections */}
            <div style={{ padding: '0.75rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* SECTION 1: USER AUTHENTICATION */}
              <div
                style={{
                  backgroundColor: user ? '#f8fafc' : '#eff6ff',
                  border: user ? '1px solid #e2e8f0' : '1px solid #bfdbfe',
                  borderRadius: '14px',
                  padding: '1rem',
                }}
              >
                <p style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: '0.6rem' }}>
                  {t('account_title')}
                </p>

                {user ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: '#2563eb',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                        }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user.name}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link
                        to="/profile"
                        id="drawer-profile-link"
                        onClick={() => setDrawerOpen(false)}
                        className="btn-secondary"
                        style={{
                          flex: 1,
                          padding: '0.45rem',
                          fontSize: '0.8rem',
                          borderRadius: '8px',
                          textDecoration: 'none',
                        }}
                      >
                        <UserIcon size={14} />
                        <span>{t('nav_profile')}</span>
                      </Link>

                      <button
                        type="button"
                        id="drawer-logout-btn"
                        onClick={() => {
                          logout();
                          setDrawerOpen(false);
                          navigate('/');
                        }}
                        style={{
                          flex: 1,
                          padding: '0.45rem',
                          fontSize: '0.8rem',
                          borderRadius: '8px',
                          backgroundColor: '#fee2e2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                          cursor: 'pointer',
                        }}
                      >
                        <LogOut size={14} />
                        <span>{t('nav_logout')}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Link
                      to="/login"
                      id="drawer-login-btn"
                      onClick={() => setDrawerOpen(false)}
                      className="btn-primary"
                      style={{
                        padding: '0.65rem 1rem',
                        fontSize: '0.88rem',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        textAlign: 'center',
                        fontWeight: 700,
                      }}
                    >
                      {t('nav_login')}
                    </Link>

                    <Link
                      to="/register"
                      id="drawer-register-btn"
                      onClick={() => setDrawerOpen(false)}
                      className="btn-secondary"
                      style={{
                        padding: '0.65rem 1rem',
                        fontSize: '0.88rem',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        textAlign: 'center',
                        fontWeight: 700,
                      }}
                    >
                      {t('nav_register')}
                    </Link>
                  </div>
                )}
              </div>

              {/* SECTION 2: ADMIN PORTAL ENTRY */}
              <div>
                <Link
                  to={isAdmin ? "/admin" : "/admin/login"}
                  id="drawer-admin-portal-link"
                  onClick={() => setDrawerOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: '12px',
                    color: '#92400e',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={18} style={{ color: '#d97706' }} />
                    <span>{t('nav_admin_portal')}</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', backgroundColor: '#fef3c7', color: '#b45309', padding: '0.15rem 0.5rem', borderRadius: '9999px', border: '1px solid #fde68a' }}>
                    {isAdmin ? 'Dashboard' : 'Sign In'}
                  </span>
                </Link>
              </div>

              {/* SECTION 3: NAVIGATION & CATEGORIES */}
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: '0.6rem' }}>
                  {t('categories_title')}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <Link
                    to="/deals"
                    id="drawer-nav-deals"
                    onClick={() => setDrawerOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      color: '#1e293b',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      backgroundColor: location.pathname === '/deals' ? '#eff6ff' : 'transparent',
                    }}
                  >
                    <Sparkles size={17} style={{ color: '#f59e0b' }} />
                    <span>{t('nav_all_deals')}</span>
                  </Link>

                  <Link
                    to="/category/fashion-accessories"
                    id="drawer-nav-fashion"
                    onClick={() => setDrawerOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      color: '#1e293b',
                      fontSize: '0.88rem',
                      fontWeight: 500,
                      textDecoration: 'none',
                    }}
                  >
                    <Shirt size={17} style={{ color: '#e11d48' }} />
                    <span>{t('category_fashion')}</span>
                  </Link>

                  <Link
                    to="/category/electronics-tech"
                    id="drawer-nav-electronics"
                    onClick={() => setDrawerOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      color: '#1e293b',
                      fontSize: '0.88rem',
                      fontWeight: 500,
                      textDecoration: 'none',
                    }}
                  >
                    <Smartphone size={17} style={{ color: '#2563eb' }} />
                    <span>{t('category_electronics')}</span>
                  </Link>

                  <Link
                    to="/category/beauty-personal-care"
                    id="drawer-nav-beauty"
                    onClick={() => setDrawerOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      color: '#1e293b',
                      fontSize: '0.88rem',
                      fontWeight: 500,
                      textDecoration: 'none',
                    }}
                  >
                    <Sparkles size={17} style={{ color: '#9333ea' }} />
                    <span>{t('category_beauty')}</span>
                  </Link>

                  <Link
                    to="/category/home-kitchen"
                    id="drawer-nav-home-kitchen"
                    onClick={() => setDrawerOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      color: '#1e293b',
                      fontSize: '0.88rem',
                      fontWeight: 500,
                      textDecoration: 'none',
                    }}
                  >
                    <Home size={17} style={{ color: '#059669' }} />
                    <span>{t('category_home_kitchen')}</span>
                  </Link>

                  <Link
                    to="/category/others"
                    id="drawer-nav-others"
                    onClick={() => setDrawerOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      color: '#1e293b',
                      fontSize: '0.88rem',
                      fontWeight: 500,
                      textDecoration: 'none',
                    }}
                  >
                    <Layers size={17} style={{ color: '#d97706' }} />
                    <span>{t('category_others')}</span>
                  </Link>

                  <Link
                    to="/wishlist"
                    id="drawer-nav-wishlist"
                    onClick={() => setDrawerOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      color: '#1e293b',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <Heart size={17} style={{ color: wishlistCount > 0 ? '#e11d48' : '#64748b', fill: wishlistCount > 0 ? '#e11d48' : 'none' }} />
                      <span>{t('nav_wishlist')}</span>
                    </div>
                    {wishlistCount > 0 && (
                      <span style={{ fontSize: '0.72rem', backgroundColor: '#ffe4e6', color: '#e11d48', fontWeight: 700, padding: '0.1rem 0.5rem', borderRadius: '9999px' }}>
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                </div>
              </div>

              {/* SECTION 4: LANGUAGE SELECTOR INSIDE NAVIGATION MENU */}
              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.65rem' }}>
                  <Globe size={16} style={{ color: '#2563eb' }} />
                  <p style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {t('language_title')}
                  </p>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.4rem',
                  }}
                >
                  {SUPPORTED_LANGUAGES.map((lang) => {
                    const isSelected = lang.code === currentLanguage;
                    return (
                      <button
                        key={lang.code}
                        id={`drawer-lang-${lang.code}`}
                        type="button"
                        onClick={() => handleLanguageSelect(lang.code)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.45rem 0.6rem',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          textAlign: 'left',
                          backgroundColor: isSelected ? '#eff6ff' : '#f8fafc',
                          color: isSelected ? '#1d4ed8' : '#334155',
                          border: isSelected ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {lang.nativeName}
                        </span>
                        {isSelected && <Check size={14} style={{ color: '#2563eb', flexShrink: 0 }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Responsive Styles to guarantee clean layouts & no horizontal overflow */}
      <style>{`
        @media (min-width: 900px) {
          .desktop-menu-text { display: inline !important; }
          .desktop-nav-links { display: flex !important; }
          .navbar-search-desktop { display: block !important; }
          .navbar-search-mobile-toggle { display: none !important; }
        }
        @media (max-width: 899px) {
          .desktop-menu-text { display: none !important; }
          .desktop-nav-links { display: none !important; }
          .navbar-search-desktop { display: none !important; }
          .navbar-search-mobile-toggle { display: flex !important; }
          .desktop-secondary-category-bar { display: none !important; }
        }
        @media (max-width: 480px) {
          #brand-logo-link span {
            font-size: 1.15rem !important;
          }
        }
      `}</style>
    </header>
  );
};
export default Navbar;
