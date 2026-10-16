import React, { useState } from 'react';
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
  ChevronDown 
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { LanguageSelector } from './LanguageSelector';

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
  const { t, currentLangInfo } = useLanguage();
  const { user, isAdmin, logout } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
    navigate(`/deals?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="header-nav">
      {/* Top Banner Notice */}
      <div
        style={{
          backgroundColor: '#fef3c7',
          borderBottom: '1px solid #fde68a',
          padding: '0.35rem 1rem',
          fontSize: '0.78rem',
          textAlign: 'center',
          color: '#92400e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
        }}
      >
        <span style={{ fontWeight: 700, backgroundColor: '#f59e0b', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem' }}>
          {t('demo_badge')}
        </span>
        <span>{t('demo_notice')}</span>
      </div>

      {/* Main Navbar */}
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px', gap: '1rem' }}>
        {/* Brand Logo */}
        <Link 
          to="/" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
          id="brand-logo-link"
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #e11d48 0%, #f59e0b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 10px rgba(225, 29, 72, 0.3)',
            }}
          >
            <Flame size={24} />
          </div>
          <div>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', display: 'block', lineHeight: 1.1 }}>
              DealNest<span style={{ color: '#e11d48' }}>.in</span>
            </span>
            <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 500, display: 'block' }}>
              {t('brand_tagline')}
            </span>
          </div>
        </Link>

        {/* Search Bar - Desktop */}
        <form 
          onSubmit={handleSearchSubmit} 
          style={{ 
            flex: '1', 
            maxWidth: '520px', 
            position: 'relative',
            display: 'none',
          }}
          className="desktop-search-form"
        >
          <div style={{ position: 'relative', width: '100%' }}>
            <Search 
              size={18} 
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} 
            />
            <input
              type="text"
              id="navbar-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_placeholder')}
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.75rem',
                borderRadius: '9999px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                fontSize: '0.88rem',
                outline: 'none',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.backgroundColor = '#f8fafc';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              type="submit"
              style={{
                position: 'absolute',
                right: '4px',
                top: '4px',
                bottom: '4px',
                backgroundColor: '#2563eb',
                color: '#fff',
                padding: '0 1rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              {t('search_button')}
            </button>
          </div>
        </form>

        {/* Right Action Icons: Language Selector, Wishlist, Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* CRITICAL: Visible Language Selector Immediately on first screen */}
          <div id="desktop-language-selector">
            <LanguageSelector />
          </div>

          {/* Wishlist Link */}
          <Link
            to="/wishlist"
            id="nav-wishlist-link"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '9999px',
              backgroundColor: '#f1f5f9',
              color: '#334155',
              transition: 'all 0.2s ease',
            }}
            title={t('nav_wishlist')}
          >
            <Heart size={20} style={{ color: wishlistCount > 0 ? '#e11d48' : '#64748b', fill: wishlistCount > 0 ? '#e11d48' : 'none' }} />
            {wishlistCount > 0 && (
              <span
                id="wishlist-badge-count"
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  backgroundColor: '#e11d48',
                  color: '#ffffff',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* User Auth Menu */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                id="user-menu-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '9999px',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1d4ed8',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                <UserIcon size={16} />
                <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown size={14} />
              </button>

              {userDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    marginTop: '0.5rem',
                    width: '200px',
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e2e8f0',
                    zIndex: 100,
                    padding: '0.5rem 0',
                  }}
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>{user.name}</p>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{user.email}</p>
                  </div>

                  <Link
                    to="/profile"
                    id="user-profile-menu-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 1rem',
                      fontSize: '0.85rem',
                      color: '#1e293b',
                    }}
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <UserIcon size={16} />
                    {t('nav_profile')}
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      id="user-admin-menu-item"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.6rem 1rem',
                        fontSize: '0.85rem',
                        color: '#b45309',
                        backgroundColor: '#fef3c7',
                        fontWeight: 600,
                      }}
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <ShieldCheck size={16} />
                      {t('nav_admin')}
                    </Link>
                  )}

                  <button
                    type="button"
                    id="user-logout-btn"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                      navigate('/');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      padding: '0.6rem 1rem',
                      fontSize: '0.85rem',
                      color: '#dc2626',
                      textAlign: 'left',
                    }}
                  >
                    <LogOut size={16} />
                    {t('nav_logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link
                to="/login"
                id="nav-login-btn"
                className="btn-secondary"
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
              >
                {t('nav_login')}
              </Link>
              <Link
                to="/register"
                id="nav-register-btn"
                className="btn-primary"
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
              >
                {t('nav_register')}
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#334155',
            }}
            className="mobile-toggle-btn"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Secondary Category & Quick Navigation Bar */}
      <nav
        style={{
          borderTop: '1px solid #f1f5f9',
          backgroundColor: '#ffffff',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            paddingTop: '0.5rem',
            paddingBottom: '0.5rem',
          }}
        >
          {/* 1. All Deals */}
          <Link
            to="/deals"
            id="nav-link-all-deals"
            style={{
              fontSize: '0.88rem',
              fontWeight: location.pathname === '/deals' ? 700 : 500,
              color: location.pathname === '/deals' ? '#2563eb' : '#334155',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              textDecoration: 'none',
              padding: '0.3rem 0.6rem',
              borderRadius: '6px',
              backgroundColor: location.pathname === '/deals' ? '#eff6ff' : 'transparent',
            }}
          >
            <Sparkles size={15} style={{ color: '#f59e0b' }} />
            <span>{t('nav_all_deals')}</span>
          </Link>

          {/* 2. Fashion & Accessories */}
          <Link
            to="/category/fashion-accessories"
            id="nav-link-fashion"
            style={{
              fontSize: '0.88rem',
              fontWeight: location.pathname.includes('/category/fashion-accessories') ? 700 : 500,
              color: location.pathname.includes('/category/fashion-accessories') ? '#2563eb' : '#334155',
              textDecoration: 'none',
              padding: '0.3rem 0.6rem',
              borderRadius: '6px',
              backgroundColor: location.pathname.includes('/category/fashion-accessories') ? '#eff6ff' : 'transparent',
            }}
          >
            {t('nav_fashion')}
          </Link>

          {/* 3. Electronics & Tech */}
          <Link
            to="/category/electronics-tech"
            id="nav-link-electronics"
            style={{
              fontSize: '0.88rem',
              fontWeight: location.pathname.includes('/category/electronics-tech') ? 700 : 500,
              color: location.pathname.includes('/category/electronics-tech') ? '#2563eb' : '#334155',
              textDecoration: 'none',
              padding: '0.3rem 0.6rem',
              borderRadius: '6px',
              backgroundColor: location.pathname.includes('/category/electronics-tech') ? '#eff6ff' : 'transparent',
            }}
          >
            {t('nav_electronics')}
          </Link>

          {/* 4. Beauty & Personal Care */}
          <Link
            to="/category/beauty-personal-care"
            id="nav-link-beauty"
            style={{
              fontSize: '0.88rem',
              fontWeight: location.pathname.includes('/category/beauty-personal-care') ? 700 : 500,
              color: location.pathname.includes('/category/beauty-personal-care') ? '#2563eb' : '#334155',
              textDecoration: 'none',
              padding: '0.3rem 0.6rem',
              borderRadius: '6px',
              backgroundColor: location.pathname.includes('/category/beauty-personal-care') ? '#eff6ff' : 'transparent',
            }}
          >
            {t('nav_beauty')}
          </Link>

          {/* 5. Home & Kitchen */}
          <Link
            to="/category/home-kitchen"
            id="nav-link-home-kitchen"
            style={{
              fontSize: '0.88rem',
              fontWeight: location.pathname.includes('/category/home-kitchen') ? 700 : 500,
              color: location.pathname.includes('/category/home-kitchen') ? '#2563eb' : '#334155',
              textDecoration: 'none',
              padding: '0.3rem 0.6rem',
              borderRadius: '6px',
              backgroundColor: location.pathname.includes('/category/home-kitchen') ? '#eff6ff' : 'transparent',
            }}
          >
            {t('nav_home_kitchen')}
          </Link>

          {/* 6. Others & Lifestyle */}
          <Link
            to="/category/others"
            id="nav-link-others"
            style={{
              fontSize: '0.88rem',
              fontWeight: location.pathname.includes('/category/others') ? 700 : 500,
              color: location.pathname.includes('/category/others') ? '#2563eb' : '#334155',
              textDecoration: 'none',
              padding: '0.3rem 0.6rem',
              borderRadius: '6px',
              backgroundColor: location.pathname.includes('/category/others') ? '#eff6ff' : 'transparent',
            }}
          >
            {t('nav_others_lifestyle')}
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#b45309',
                backgroundColor: '#fef3c7',
                padding: '0.2rem 0.6rem',
                borderRadius: '6px',
                marginLeft: 'auto',
              }}
            >
              ⚙️ {t('nav_admin')}
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderBottom: '2px solid #e2e8f0',
            padding: '1rem',
          }}
          className="animate-fade-in"
        >
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} style={{ marginBottom: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={18}
                style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
              <input
                type="text"
                id="mobile-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_placeholder')}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem 0.6rem 2.5rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                }}
              />
            </div>
          </form>

          {/* Mobile Language Selector */}
          <div style={{ marginBottom: '1rem', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>
              {t('select_language')}
            </p>
            <LanguageSelector isMobile={true} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/deals" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600 }}>
              {t('nav_all_deals')}
            </Link>
            <Link to="/category/fashion-accessories" onClick={() => setMobileMenuOpen(false)}>
              {t('nav_fashion')}
            </Link>
            <Link to="/category/electronics-tech" onClick={() => setMobileMenuOpen(false)}>
              {t('nav_electronics')}
            </Link>
            <Link to="/category/beauty-personal-care" onClick={() => setMobileMenuOpen(false)}>
              {t('nav_beauty')}
            </Link>
            <Link to="/category/home-kitchen" onClick={() => setMobileMenuOpen(false)}>
              {t('nav_home_kitchen')}
            </Link>
            <Link to="/category/others" onClick={() => setMobileMenuOpen(false)}>
              {t('nav_others_lifestyle')}
            </Link>
            <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Heart size={16} /> {t('nav_wishlist')} ({wishlistCount})
            </Link>
            {isAdmin && (
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} style={{ color: '#b45309', fontWeight: 700 }}>
                ⚙️ {t('nav_admin')}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Responsive CSS */}
      <style>{`
        @media (min-width: 769px) {
          .desktop-search-form { display: block !important; }
          .mobile-toggle-btn { display: none !important; }
        }
        @media (max-width: 768px) {
          #desktop-language-selector { display: block; }
        }
      `}</style>
    </header>
  );
};
