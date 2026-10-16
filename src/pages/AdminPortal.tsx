import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  MousePointerClick, 
  Heart, 
  Package, 
  Layers, 
  Check, 
  X, 
  ExternalLink,
  Sparkles,
  TrendingUp,
  Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage, SUPPORTED_LANGUAGES } from '../i18n/LanguageContext';
import { Deal, Category, Retailer, AdminStats, ClickLog } from '../types';

export const AdminPortal: React.FC = () => {
  const { user, token, isAdmin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentClicks, setRecentClicks] = useState<ClickLog[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs
  const [activeTab, setActiveTab] = useState<'deals' | 'analytics' | 'categories'>('deals');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [dealFormData, setDealFormData] = useState({
    title: '',
    description: '',
    original_price: '',
    current_price: '',
    discount_percentage: '',
    category_id: '',
    subcategory_id: '',
    retailer_id: '',
    image_url: '',
    product_url: '',
    affiliate_url: '',
    deal_badge: '',
    rating: '4.5',
    reviews_count: '150',
    is_featured: false,
    is_trending: false,
    is_active: true,
    translations: {
      te: { title: '', description: '' },
      hi: { title: '', description: '' },
    },
  });

  const [submitting, setSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  // Category & Subcategory form states
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Layers');

  const [newSubcatCatId, setNewSubcatCatId] = useState('');
  const [newSubcatName, setNewSubcatName] = useState('');
  const [newSubcatDesc, setNewSubcatDesc] = useState('');
  const [newSubcatIcon, setNewSubcatIcon] = useState('Package');

  // Protection check
  useEffect(() => {
    if (!token || !isAdmin) {
      navigate('/login', { state: { from: { pathname: '/admin' } } });
    }
  }, [token, isAdmin, navigate]);

  const fetchAdminData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [statsRes, dealsRes, catRes, retRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/deals', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/categories'),
        fetch('/api/categories/retailers'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
        setRecentClicks(statsData.recentClicks || []);
      }

      if (dealsRes.ok) {
        const dealsData = await dealsRes.json();
        setDeals(dealsData.deals || []);
      }

      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.categories || []);
      }

      if (retRes.ok) {
        const retData = await retRes.json();
        setRetailers(retData.retailers || []);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const showNotification = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(''), 3000);
  };

  const handleToggleDeal = async (dealId: number, field: string) => {
    try {
      const res = await fetch(`/api/admin/deals/${dealId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ field }),
      });
      if (res.ok) {
        setDeals((prev) =>
          prev.map((d) => (d.id === dealId ? { ...d, [field]: !d[field as keyof Deal] } : d))
        );
        showNotification(`Updated deal status.`);
      }
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const handleDeleteDeal = async (dealId: number) => {
    if (!window.confirm('Are you sure you want to permanently delete this deal?')) return;
    try {
      const res = await fetch(`/api/admin/deals/${dealId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setDeals((prev) => prev.filter((d) => d.id !== dealId));
        showNotification('Deal deleted successfully.');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const openAddModal = () => {
    setDealFormData({
      title: '',
      description: '',
      original_price: '',
      current_price: '',
      discount_percentage: '',
      category_id: categories[0]?.id?.toString() || '1',
      subcategory_id: '',
      retailer_id: retailers[0]?.id?.toString() || '1',
      image_url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
      product_url: 'https://www.amazon.in',
      affiliate_url: 'https://www.amazon.in?tag=dealnest08-21',
      deal_badge: 'Special Deal',
      rating: '4.5',
      reviews_count: '250',
      is_featured: false,
      is_trending: false,
      is_active: true,
      translations: {
        te: { title: '', description: '' },
        hi: { title: '', description: '' },
      },
    });
    setEditingDeal(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (deal: Deal) => {
    setEditingDeal(deal);
    setDealFormData({
      title: deal.title,
      description: deal.description || '',
      original_price: deal.original_price.toString(),
      current_price: deal.current_price.toString(),
      discount_percentage: deal.discount_percentage.toString(),
      category_id: deal.category_id.toString(),
      subcategory_id: deal.subcategory_id ? deal.subcategory_id.toString() : '',
      retailer_id: deal.retailer_id.toString(),
      image_url: deal.image_url,
      product_url: deal.product_url,
      affiliate_url: deal.affiliate_url || '',
      deal_badge: deal.deal_badge || '',
      rating: deal.rating.toString(),
      reviews_count: deal.reviews_count.toString(),
      is_featured: Boolean(deal.is_featured),
      is_trending: Boolean(deal.is_trending),
      is_active: Boolean(deal.is_active),
      translations: {
        te: { title: '', description: '' },
        hi: { title: '', description: '' },
      },
    });
    setIsAddModalOpen(true);
  };

  const handleSaveDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      ...dealFormData,
      original_price: Number(dealFormData.original_price),
      current_price: Number(dealFormData.current_price),
      discount_percentage: dealFormData.discount_percentage
        ? Number(dealFormData.discount_percentage)
        : Math.round(((Number(dealFormData.original_price) - Number(dealFormData.current_price)) / Number(dealFormData.original_price)) * 100),
      category_id: Number(dealFormData.category_id),
      subcategory_id: dealFormData.subcategory_id ? Number(dealFormData.subcategory_id) : null,
      retailer_id: Number(dealFormData.retailer_id),
      rating: Number(dealFormData.rating),
      reviews_count: Number(dealFormData.reviews_count),
    };

    try {
      const url = editingDeal ? `/api/admin/deals/${editingDeal.id}` : '/api/admin/deals';
      const method = editingDeal ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        showNotification(editingDeal ? 'Deal updated successfully!' : 'Deal added successfully!');
        fetchAdminData();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to save deal');
      }
    } catch (err) {
      console.error('Save deal error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newCatName.trim(), description: newCatDesc.trim(), icon: newCatIcon }),
      });
      if (res.ok) {
        setNewCatName('');
        setNewCatDesc('');
        showNotification('Category added successfully!');
        fetchAdminData();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to add category');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubcatCatId || !newSubcatName.trim()) return;
    try {
      const res = await fetch('/api/admin/subcategories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category_id: Number(newSubcatCatId),
          name: newSubcatName.trim(),
          description: newSubcatDesc.trim(),
          icon: newSubcatIcon,
        }),
      });
      if (res.ok) {
        setNewSubcatName('');
        setNewSubcatDesc('');
        showNotification('Subcategory added successfully!');
        fetchAdminData();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to add subcategory');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleCategoryActive = async (cat: Category) => {
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: cat.is_active ? 0 : 1 }),
      });
      if (res.ok) {
        showNotification(`Category ${cat.is_active ? 'deactivated' : 'activated'}!`);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSubcategoryActive = async (sub: any) => {
    try {
      const res = await fetch(`/api/admin/subcategories/${sub.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: sub.is_active ? 0 : 1 }),
      });
      if (res.ok) {
        showNotification(`Subcategory ${sub.is_active ? 'deactivated' : 'activated'}!`);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSubcategory = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this subcategory?')) return;
    try {
      const res = await fetch(`/api/admin/subcategories/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        showNotification('Subcategory deleted successfully!');
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="container" style={{ padding: '2rem 1rem 5rem' }}>
      {/* Admin Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#b45309',
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
              {t('admin_title')}
            </h1>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '0.25rem' }}>
            {t('admin_subtitle')}
          </p>
        </div>

        <button
          type="button"
          id="admin-add-deal-btn"
          onClick={openAddModal}
          className="btn-primary"
          style={{ padding: '0.65rem 1.25rem', backgroundColor: '#059669' }}
        >
          <Plus size={18} />
          <span>{t('admin_add_deal')}</span>
        </button>
      </div>

      {actionMessage && (
        <div
          style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
          className="animate-fade-in"
        >
          <Check size={18} />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Stats Cards Grid */}
      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem',
          }}
        >
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>
              <span>{t('admin_stats_total_deals')}</span>
              <Package size={18} style={{ color: '#2563eb' }} />
            </div>
            <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '0.4rem' }}>
              {stats.totalDeals}
            </p>
            <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
              {stats.activeDeals} Active on Site
            </span>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>
              <span>{t('admin_stats_clicks')}</span>
              <MousePointerClick size={18} style={{ color: '#f59e0b' }} />
            </div>
            <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '0.4rem' }}>
              {stats.totalClicks}
            </p>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Affiliate Outbound Referrals
            </span>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>
              <span>{t('admin_stats_wishlist_saves')}</span>
              <Heart size={18} style={{ color: '#e11d48' }} />
            </div>
            <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '0.4rem' }}>
              {stats.totalWishlistSaves}
            </p>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Saved by Shoppers
            </span>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>
              <span>Categories & Stores</span>
              <Layers size={18} style={{ color: '#8b5cf6' }} />
            </div>
            <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '0.4rem' }}>
              {stats.totalCategories} / {stats.totalRetailers}
            </p>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Indian Retail Partners
            </span>
          </div>
        </div>
      )}

      {/* Tabs Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('deals')}
          style={{
            padding: '0.65rem 1.25rem',
            fontSize: '0.9rem',
            fontWeight: 700,
            color: activeTab === 'deals' ? '#2563eb' : '#64748b',
            borderBottom: activeTab === 'deals' ? '2px solid #2563eb' : 'none',
          }}
        >
          All Product Deals ({deals.length})
        </button>
        <button
          type="button"
          id="tab-categories-btn"
          onClick={() => setActiveTab('categories')}
          style={{
            padding: '0.65rem 1.25rem',
            fontSize: '0.9rem',
            fontWeight: 700,
            color: activeTab === 'categories' ? '#2563eb' : '#64748b',
            borderBottom: activeTab === 'categories' ? '2px solid #2563eb' : 'none',
          }}
        >
          Categories & Subcategories ({categories.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          style={{
            padding: '0.65rem 1.25rem',
            fontSize: '0.9rem',
            fontWeight: 700,
            color: activeTab === 'analytics' ? '#2563eb' : '#64748b',
            borderBottom: activeTab === 'analytics' ? '2px solid #2563eb' : 'none',
          }}
        >
          Affiliate Click Analytics
        </button>
      </div>

      {/* Tab: Deals Management Table */}
      {activeTab === 'deals' && (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>{t('admin_table_title')}</th>
                  <th style={{ padding: '0.75rem 1rem' }}>{t('admin_table_retailer')}</th>
                  <th style={{ padding: '0.75rem 1rem' }}>{t('admin_table_category')}</th>
                  <th style={{ padding: '0.75rem 1rem' }}>{t('admin_table_price')}</th>
                  <th style={{ padding: '0.75rem 1rem' }}>{t('admin_table_discount')}</th>
                  <th style={{ padding: '0.75rem 1rem' }}>{t('admin_table_clicks')}</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Flags</th>
                  <th style={{ padding: '0.75rem 1rem' }}>{t('admin_table_status')}</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>{t('admin_table_actions')}</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => (
                  <tr key={deal.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1rem', maxWidth: '240px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <img
                          src={deal.image_url}
                          alt=""
                          style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                        <span style={{ fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={deal.title}>
                          {deal.title}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className="badge-retailer" style={{ fontSize: '0.72rem' }}>
                        {deal.retailer_name}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>
                      {deal.category_name || 'Category'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                      ₹{deal.current_price.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className="badge-discount" style={{ fontSize: '0.7rem' }}>
                        {deal.discount_percentage}% OFF
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#2563eb', fontWeight: 700 }}>
                      {deal.click_count || 0}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleDeal(deal.id, 'is_featured')}
                          style={{
                            padding: '0.2rem 0.4rem',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            backgroundColor: deal.is_featured ? '#fef3c7' : '#f1f5f9',
                            color: deal.is_featured ? '#b45309' : '#94a3b8',
                          }}
                          title="Toggle Featured"
                        >
                          ★ Feat
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleDeal(deal.id, 'is_trending')}
                          style={{
                            padding: '0.2rem 0.4rem',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            backgroundColor: deal.is_trending ? '#fee2e2' : '#f1f5f9',
                            color: deal.is_trending ? '#dc2626' : '#94a3b8',
                          }}
                          title="Toggle Trending"
                        >
                          🔥 Trend
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleDeal(deal.id, 'is_active')}
                        style={{
                          padding: '0.25rem 0.6rem',
                          borderRadius: '9999px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: deal.is_active ? '#dcfce7' : '#f1f5f9',
                          color: deal.is_active ? '#15803d' : '#64748b',
                        }}
                      >
                        {deal.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          onClick={() => openEditModal(deal)}
                          style={{
                            padding: '0.35rem',
                            borderRadius: '6px',
                            backgroundColor: '#eff6ff',
                            color: '#2563eb',
                          }}
                          title="Edit Deal"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDeal(deal.id)}
                          style={{
                            padding: '0.35rem',
                            borderRadius: '6px',
                            backgroundColor: '#fef2f2',
                            color: '#dc2626',
                          }}
                          title="Delete Deal"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Click Analytics */}
      {activeTab === 'analytics' && (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '1.5rem',
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
            Recent Outbound Affiliate Clicks
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Time</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Deal Title</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Store</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Price</th>
              </tr>
            </thead>
            <tbody>
              {recentClicks.map((click) => (
                <tr key={click.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem', color: '#64748b' }}>
                    {new Date(click.created_at).toLocaleString()}
                  </td>
                  <td style={{ padding: '0.75rem', fontWeight: 600, color: '#0f172a' }}>
                    {click.deal_title}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className="badge-retailer">{click.retailer_name}</span>
                  </td>
                  <td style={{ padding: '0.75rem', fontWeight: 700 }}>
                    ₹{click.current_price.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Categories & Subcategories Management */}
      {activeTab === 'categories' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Create Category & Subcategory Forms Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Create Category Form */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Layers size={18} style={{ color: '#2563eb' }} />
                <span>Add Primary Category</span>
              </h3>
              <form onSubmit={handleAddCategory}>
                <div style={{ marginBottom: '0.85rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g. Sports & Outdoors"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    placeholder="e.g. Fitness equipment and sports gear..."
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}>
                  <Plus size={16} /> Save Category
                </button>
              </form>
            </div>

            {/* Create Subcategory Form */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Package size={18} style={{ color: '#059669' }} />
                <span>Add Subcategory</span>
              </h3>
              <form onSubmit={handleAddSubcategory}>
                <div style={{ marginBottom: '0.85rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                    Primary Category *
                  </label>
                  <select
                    required
                    value={newSubcatCatId}
                    onChange={(e) => setNewSubcatCatId(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="">Select Primary Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.default_name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: '0.85rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                    Subcategory Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSubcatName}
                    onChange={(e) => setNewSubcatName(e.target.value)}
                    placeholder="e.g. Fitness Trackers"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={newSubcatDesc}
                    onChange={(e) => setNewSubcatDesc(e.target.value)}
                    placeholder="e.g. Step trackers, bands and accessories..."
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}>
                  <Plus size={16} /> Save Subcategory
                </button>
              </form>
            </div>
          </div>

          {/* List of Categories & Subcategories */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>
              Category Hierarchy & Active Subcategories
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    backgroundColor: cat.is_active ? '#ffffff' : '#f8fafc',
                    opacity: cat.is_active ? 1 : 0.7,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>
                        {cat.default_name}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                        slug: /{cat.slug}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>
                        ({cat.deals_count || 0} deals)
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleCategoryActive(cat)}
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.3rem 0.65rem',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          backgroundColor: cat.is_active ? '#ecfdf5' : '#fef2f2',
                          color: cat.is_active ? '#065f46' : '#991b1b',
                        }}
                      >
                        {cat.is_active ? 'Active (Click to Deactivate)' : 'Inactive (Click to Activate)'}
                      </button>
                    </div>
                  </div>

                  {cat.description && (
                    <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>
                      {cat.description}
                    </p>
                  )}

                  {/* Subcategories under this category */}
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed #e2e8f0' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>
                      Subcategories ({cat.subcategories?.length || 0}):
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {cat.subcategories?.map((sub) => (
                        <div
                          key={sub.id}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.35rem 0.65rem',
                            borderRadius: '8px',
                            backgroundColor: sub.is_active ? '#f8fafc' : '#f1f5f9',
                            border: '1px solid #e2e8f0',
                            fontSize: '0.78rem',
                          }}
                        >
                          <span style={{ fontWeight: 600, color: sub.is_active ? '#0f172a' : '#94a3b8' }}>
                            {sub.default_name}
                          </span>
                          <span style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.72rem' }}>
                            ({sub.deals_count || 0})
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleSubcategoryActive(sub)}
                            title={sub.is_active ? 'Deactivate subcategory' : 'Activate subcategory'}
                            style={{
                              border: 'none',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              color: sub.is_active ? '#059669' : '#dc2626',
                              fontWeight: 700,
                              fontSize: '0.7rem',
                            }}
                          >
                            {sub.is_active ? '● Active' : '○ Inactive'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSubcategory(sub.id)}
                            title="Delete subcategory"
                            style={{
                              border: 'none',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              color: '#dc2626',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                      {(!cat.subcategories || cat.subcategories.length === 0) && (
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>No subcategories created yet.</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Deal Modal */}
      {isAddModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '720px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative',
            }}
          >
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                color: '#64748b',
              }}
            >
              <X size={22} />
            </button>

            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
              {editingDeal ? t('admin_edit_deal') : t('admin_add_deal')}
            </h2>

            <form onSubmit={handleSaveDeal}>
              {/* Product Title (English) */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  {t('admin_field_title')} *
                </label>
                <input
                  type="text"
                  required
                  value={dealFormData.title}
                  onChange={(e) => setDealFormData({ ...dealFormData, title: e.target.value })}
                  placeholder="e.g. OnePlus Nord CE4 5G (8GB RAM, 128GB Storage)"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  {t('admin_field_description')}
                </label>
                <textarea
                  rows={2}
                  value={dealFormData.description}
                  onChange={(e) => setDealFormData({ ...dealFormData, description: e.target.value })}
                  placeholder="Highlights, specs, and warranty details..."
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              {/* Prices: MRP, Deal Price, Discount */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    {t('admin_field_mrp')} *
                  </label>
                  <input
                    type="number"
                    required
                    value={dealFormData.original_price}
                    onChange={(e) => setDealFormData({ ...dealFormData, original_price: e.target.value })}
                    placeholder="24999"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    {t('admin_field_price')} *
                  </label>
                  <input
                    type="number"
                    required
                    value={dealFormData.current_price}
                    onChange={(e) => setDealFormData({ ...dealFormData, current_price: e.target.value })}
                    placeholder="19999"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Discount % (Auto-calc if blank)
                  </label>
                  <input
                    type="number"
                    value={dealFormData.discount_percentage}
                    onChange={(e) => setDealFormData({ ...dealFormData, discount_percentage: e.target.value })}
                    placeholder="e.g. 20"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              {/* Category, Subcategory & Retailer */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    {t('admin_field_category')} *
                  </label>
                  <select
                    value={dealFormData.category_id}
                    onChange={(e) => {
                      setDealFormData({ ...dealFormData, category_id: e.target.value, subcategory_id: '' });
                    }}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.default_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    {t('admin_field_subcategory')}
                  </label>
                  <select
                    value={dealFormData.subcategory_id}
                    onChange={(e) => setDealFormData({ ...dealFormData, subcategory_id: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="">None / Primary Only</option>
                    {categories
                      .find((c) => String(c.id) === String(dealFormData.category_id))
                      ?.subcategories?.map((sc) => (
                        <option key={sc.id} value={sc.id}>{sc.default_name}</option>
                      ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    {t('admin_field_retailer')} *
                  </label>
                  <select
                    value={dealFormData.retailer_id}
                    onChange={(e) => setDealFormData({ ...dealFormData, retailer_id: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    {retailers.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    {t('admin_field_badge')}
                  </label>
                  <input
                    type="text"
                    value={dealFormData.deal_badge}
                    onChange={(e) => setDealFormData({ ...dealFormData, deal_badge: e.target.value })}
                    placeholder="e.g. 50% OFF, Bestseller"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              {/* URLs: Image, Product, Affiliate */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  {t('admin_field_image_url')} *
                </label>
                <input
                  type="url"
                  required
                  value={dealFormData.image_url}
                  onChange={(e) => setDealFormData({ ...dealFormData, image_url: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    {t('admin_field_product_url')} *
                  </label>
                  <input
                    type="url"
                    required
                    value={dealFormData.product_url}
                    onChange={(e) => setDealFormData({ ...dealFormData, product_url: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    {t('admin_field_affiliate_url')}
                  </label>
                  <input
                    type="url"
                    value={dealFormData.affiliate_url}
                    onChange={(e) => setDealFormData({ ...dealFormData, affiliate_url: e.target.value })}
                    placeholder="Leave empty or provide tracking affiliate link"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              {/* Localized Translations (Telugu & Hindi fast overrides) */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                  <Globe size={16} style={{ color: '#2563eb' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b' }}>
                    Localized Descriptions (Optional Telugu & Hindi)
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>
                      Telugu (తెలుగు) Title
                    </label>
                    <input
                      type="text"
                      value={dealFormData.translations.te.title}
                      onChange={(e) =>
                        setDealFormData({
                          ...dealFormData,
                          translations: {
                            ...dealFormData.translations,
                            te: { ...dealFormData.translations.te, title: e.target.value },
                          },
                        })
                      }
                      placeholder="వన్‌ప్లస్ నార్డ్ ఆఫర్"
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>
                      Hindi (हिन्दी) Title
                    </label>
                    <input
                      type="text"
                      value={dealFormData.translations.hi.title}
                      onChange={(e) =>
                        setDealFormData({
                          ...dealFormData,
                          translations: {
                            ...dealFormData.translations,
                            hi: { ...dealFormData.translations.hi, title: e.target.value },
                          },
                        })
                      }
                      placeholder="वनप्लस नॉर्ड स्पेशल ऑफर"
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Flags: Active, Featured, Trending */}
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={dealFormData.is_active}
                    onChange={(e) => setDealFormData({ ...dealFormData, is_active: e.target.checked })}
                  />
                  <span>{t('admin_active_toggle')}</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={dealFormData.is_featured}
                    onChange={(e) => setDealFormData({ ...dealFormData, is_featured: e.target.checked })}
                  />
                  <span>{t('admin_featured_toggle')}</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={dealFormData.is_trending}
                    onChange={(e) => setDealFormData({ ...dealFormData, is_trending: e.target.checked })}
                  />
                  <span>{t('admin_trending_toggle')}</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-secondary"
                >
                  {t('admin_cancel_btn')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? 'Saving...' : t('admin_save_deal_btn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
