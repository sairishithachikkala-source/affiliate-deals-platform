import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WishlistItem } from '../types';
import { useAuth } from './AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { WishlistAuthModal } from '../components/WishlistAuthModal';
import { CheckCircle2 } from 'lucide-react';

interface WishlistContextType {
  wishlistIds: number[];
  items: WishlistItem[];
  loading: boolean;
  isSaved: (dealId: number) => boolean;
  toggleWishlist: (dealId: number) => Promise<boolean>;
  refreshWishlist: () => void;
  count: number;
  openWishlistAuthModal: () => void;
  closeWishlistAuthModal: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const { t, currentLanguage } = useLanguage();
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Sync wishlist from server when user is authenticated
  const fetchWishlist = async () => {
    if (!token || !user) {
      setWishlistIds([]);
      setItems([]);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/wishlist?lang=${currentLanguage}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const list: WishlistItem[] = data.wishlist || [];
        setItems(list);
        setWishlistIds(list.map((item) => item.id));
      }
    } catch (err) {
      console.error('Failed to fetch user wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [token, user, currentLanguage]);

  // Requirement 3: After successful login, auto-save pending deal requested while logged out
  useEffect(() => {
    if (token && user) {
      const pendingDealIdStr = sessionStorage.getItem('dealnest_pending_wishlist');
      if (pendingDealIdStr) {
        const pendingDealId = parseInt(pendingDealIdStr, 10);
        if (!isNaN(pendingDealId)) {
          fetch('/api/wishlist/add', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ deal_id: pendingDealId }),
          })
            .then((res) => {
              if (res.ok) {
                sessionStorage.removeItem('dealnest_pending_wishlist');
                fetchWishlist();
                showToast(t('wishlist_save_success'));
              }
            })
            .catch((err) => {
              console.error('Failed to auto-save pending wishlist deal:', err);
            });
        }
      }
    }
  }, [token, user]);

  const isSaved = (dealId: number): boolean => {
    return wishlistIds.includes(dealId);
  };

  const toggleWishlist = async (dealId: number): Promise<boolean> => {
    // Requirement 3: If not logged in, DO NOT save. Prompt user to sign in or create account.
    if (!token || !user) {
      // Remember pending product deal ID
      sessionStorage.setItem('dealnest_pending_wishlist', String(dealId));
      // Display friendly authentication prompt modal
      setAuthModalOpen(true);
      return false;
    }

    const currentlySaved = wishlistIds.includes(dealId);

    if (currentlySaved) {
      // Remove from wishlist
      const newIds = wishlistIds.filter((id) => id !== dealId);
      setWishlistIds(newIds);
      setItems((prev) => prev.filter((item) => item.id !== dealId));

      try {
        await fetch(`/api/wishlist/${dealId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchWishlist();
      } catch (err) {
        console.error('Error removing from wishlist:', err);
      }
      return false;
    } else {
      // Add to wishlist
      const newIds = [...wishlistIds, dealId];
      setWishlistIds(newIds);

      try {
        const res = await fetch('/api/wishlist/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ deal_id: dealId }),
        });

        if (res.ok) {
          fetchWishlist();
          showToast(t('wishlist_save_success'));
        }
      } catch (err) {
        console.error('Error adding to wishlist:', err);
      }
      return true;
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        items,
        loading,
        isSaved,
        toggleWishlist,
        refreshWishlist: fetchWishlist,
        count: wishlistIds.length,
        openWishlistAuthModal: () => setAuthModalOpen(true),
        closeWishlistAuthModal: () => setAuthModalOpen(false),
      }}
    >
      {children}

      {/* Requirement 3: Friendly Login/Register Popup for Logged-out visitors */}
      <WishlistAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Requirement 3: Success Toast Notification when a product is saved */}
      {toastMessage && (
        <div
          id="wishlist-success-toast"
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '0.85rem 1.35rem',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.88rem',
            fontWeight: 600,
            zIndex: 1100,
            animation: 'fadeInSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <CheckCircle2 size={18} style={{ color: '#10b981' }} />
          <span>{toastMessage}</span>
        </div>
      )}
    </WishlistContext.Provider>
  );
};

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
