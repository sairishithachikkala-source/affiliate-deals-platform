import express from 'express';
import db from '../db.js';
import { requireAdmin } from '../auth.js';

const router = express.Router();

// All admin routes strictly require valid admin token
router.use(requireAdmin);

// Dashboard overview statistics
router.get('/stats', (req, res) => {
  try {
    const totalDeals = db.prepare('SELECT COUNT(*) as count FROM deals').get().count;
    const activeDeals = db.prepare('SELECT COUNT(*) as count FROM deals WHERE is_active = 1').get().count;
    const featuredDeals = db.prepare('SELECT COUNT(*) as count FROM deals WHERE is_featured = 1').get().count;
    const totalCategories = db.prepare('SELECT COUNT(*) as count FROM categories WHERE is_active = 1').get().count;
    const totalSubcategories = db.prepare('SELECT COUNT(*) as count FROM subcategories WHERE is_active = 1').get().count;
    const totalRetailers = db.prepare('SELECT COUNT(*) as count FROM retailers WHERE is_active = 1').get().count;
    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'user'").get().count;
    const totalWishlistSaves = db.prepare('SELECT COUNT(*) as count FROM wishlist').get().count;
    const totalClicks = db.prepare('SELECT COUNT(*) as count FROM clicks').get().count;

    // Recent 10 clicks
    const recentClicks = db.prepare(`
      SELECT 
        cl.id,
        cl.created_at,
        cl.user_agent,
        d.title as deal_title,
        d.current_price,
        r.name as retailer_name
      FROM clicks cl
      JOIN deals d ON cl.deal_id = d.id
      LEFT JOIN retailers r ON cl.retailer_id = r.id
      ORDER BY cl.created_at DESC
      LIMIT 10
    `).all();

    res.json({
      stats: {
        totalDeals,
        activeDeals,
        featuredDeals,
        totalCategories,
        totalSubcategories,
        totalRetailers,
        totalUsers,
        totalWishlistSaves,
        totalClicks,
      },
      recentClicks,
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Failed to retrieve admin dashboard stats' });
  }
});

// Get all deals for admin management (including inactive)
router.get('/deals', (req, res) => {
  try {
    const deals = db.prepare(`
      SELECT 
        d.*,
        c.default_name as category_name,
        c.slug as category_slug,
        sc.default_name as subcategory_name,
        sc.slug as subcategory_slug,
        r.name as retailer_name
      FROM deals d
      LEFT JOIN categories c ON d.category_id = c.id
      LEFT JOIN subcategories sc ON d.subcategory_id = sc.id
      LEFT JOIN retailers r ON d.retailer_id = r.id
      ORDER BY d.id DESC
    `).all();

    res.json({ deals });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve deals list' });
  }
});

// Create new deal
router.post('/deals', (req, res) => {
  try {
    const {
      title,
      description,
      original_price,
      current_price,
      discount_percentage,
      category_id,
      subcategory_id,
      retailer_id,
      image_url,
      product_url,
      affiliate_url,
      rating = 4.5,
      reviews_count = 0,
      is_featured = 0,
      is_trending = 0,
      is_active = 1,
      deal_badge = '',
      translations = {},
    } = req.body;

    if (!title || !original_price || !current_price || !category_id || !retailer_id || !image_url || !product_url) {
      return res.status(400).json({ error: 'Missing required deal fields.' });
    }

    const calculatedDiscount = discount_percentage !== undefined 
      ? Number(discount_percentage) 
      : Math.round(((Number(original_price) - Number(current_price)) / Number(original_price)) * 100);

    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
      .slice(0, 80);
    const slug = `${baseSlug}-${Date.now().toString().slice(-6)}`;

    const result = db.prepare(`
      INSERT INTO deals (
        title, slug, description, original_price, current_price, discount_percentage,
        category_id, subcategory_id, retailer_id, image_url, product_url, affiliate_url,
        rating, reviews_count, is_featured, is_trending, is_active, deal_badge
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title.trim(),
      slug,
      description ? description.trim() : '',
      Number(original_price),
      Number(current_price),
      calculatedDiscount,
      Number(category_id),
      subcategory_id ? Number(subcategory_id) : null,
      Number(retailer_id),
      image_url.trim(),
      product_url.trim(),
      affiliate_url ? affiliate_url.trim() : null,
      Number(rating) || 4.5,
      Number(reviews_count) || 0,
      is_featured ? 1 : 0,
      is_trending ? 1 : 0,
      is_active ? 1 : 0,
      deal_badge ? deal_badge.trim() : null
    );

    const dealId = Number(result.lastInsertRowid);

    // Insert translations if provided
    if (translations && typeof translations === 'object') {
      const insertTrans = db.prepare(`
        INSERT INTO deal_translations (deal_id, language_code, title, description)
        VALUES (?, ?, ?, ?)
      `);
      for (const [langCode, trans] of Object.entries(translations)) {
        if (trans && (trans.title || trans.description)) {
          insertTrans.run(dealId, langCode, trans.title || '', trans.description || '');
        }
      }
    }

    const createdDeal = db.prepare('SELECT * FROM deals WHERE id = ?').get(dealId);
    res.status(201).json({ deal: createdDeal, message: 'Deal created successfully!' });
  } catch (err) {
    console.error('Error creating deal:', err);
    res.status(500).json({ error: 'Failed to create deal' });
  }
});

// Update deal
router.put('/deals/:id', (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      original_price,
      current_price,
      discount_percentage,
      category_id,
      subcategory_id,
      retailer_id,
      image_url,
      product_url,
      affiliate_url,
      rating,
      reviews_count,
      is_featured,
      is_trending,
      is_active,
      deal_badge,
      translations,
    } = req.body;

    const existing = db.prepare('SELECT id FROM deals WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    const calculatedDiscount = discount_percentage !== undefined 
      ? Number(discount_percentage) 
      : Math.round(((Number(original_price) - Number(current_price)) / Number(original_price)) * 100);

    db.prepare(`
      UPDATE deals SET
        title = ?,
        description = ?,
        original_price = ?,
        current_price = ?,
        discount_percentage = ?,
        category_id = ?,
        subcategory_id = ?,
        retailer_id = ?,
        image_url = ?,
        product_url = ?,
        affiliate_url = ?,
        rating = ?,
        reviews_count = ?,
        is_featured = ?,
        is_trending = ?,
        is_active = ?,
        deal_badge = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title.trim(),
      description ? description.trim() : '',
      Number(original_price),
      Number(current_price),
      calculatedDiscount,
      Number(category_id),
      subcategory_id ? Number(subcategory_id) : null,
      Number(retailer_id),
      image_url.trim(),
      product_url.trim(),
      affiliate_url ? affiliate_url.trim() : null,
      Number(rating),
      Number(reviews_count),
      is_featured ? 1 : 0,
      is_trending ? 1 : 0,
      is_active ? 1 : 0,
      deal_badge ? deal_badge.trim() : null,
      id
    );

    // Upsert translations
    if (translations && typeof translations === 'object') {
      for (const [langCode, trans] of Object.entries(translations)) {
        if (trans && (trans.title || trans.description)) {
          db.prepare(`
            INSERT INTO deal_translations (deal_id, language_code, title, description)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(deal_id, language_code) DO UPDATE SET
              title = excluded.title,
              description = excluded.description
          `).run(id, langCode, trans.title || '', trans.description || '');
        }
      }
    }

    const updatedDeal = db.prepare('SELECT * FROM deals WHERE id = ?').get(id);
    res.json({ deal: updatedDeal, message: 'Deal updated successfully!' });
  } catch (err) {
    console.error('Error updating deal:', err);
    res.status(500).json({ error: 'Failed to update deal' });
  }
});

// Delete deal
router.delete('/deals/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM deals WHERE id = ?').run(id);
    res.json({ success: true, message: 'Deal deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete deal' });
  }
});

// Toggle deal status (active / featured / trending)
router.patch('/deals/:id/toggle', (req, res) => {
  try {
    const { id } = req.params;
    const { field } = req.body;

    if (!['is_active', 'is_featured', 'is_trending'].includes(field)) {
      return res.status(400).json({ error: 'Invalid field' });
    }

    db.prepare(`UPDATE deals SET ${field} = CASE WHEN ${field} = 1 THEN 0 ELSE 1 END WHERE id = ?`).run(id);
    const updated = db.prepare('SELECT id, is_active, is_featured, is_trending FROM deals WHERE id = ?').get(id);
    res.json({ deal: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle status' });
  }
});

// Category Management
router.post('/categories', (req, res) => {
  try {
    const { name, icon = 'Layers', description = '', image_url = '' } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const nameKey = `category_${slug.replace(/-/g, '_')}`;

    const maxOrder = db.prepare('SELECT MAX(order_index) as max_order FROM categories').get().max_order || 0;
    const resRow = db.prepare(`
      INSERT INTO categories (slug, name_key, default_name, icon, description, image_url, order_index, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `).run(slug, nameKey, name.trim(), icon, description.trim(), image_url.trim(), maxOrder + 1);

    res.status(201).json({ id: resRow.lastInsertRowid, message: 'Category added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.put('/categories/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { default_name, icon, description, image_url, is_active } = req.body;

    db.prepare(`
      UPDATE categories SET
        default_name = COALESCE(?, default_name),
        icon = COALESCE(?, icon),
        description = COALESCE(?, description),
        image_url = COALESCE(?, image_url),
        is_active = COALESCE(?, is_active)
      WHERE id = ?
    `).run(default_name, icon, description, image_url, is_active, id);

    res.json({ success: true, message: 'Category updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Subcategory Management (Requirement 6)
router.post('/subcategories', (req, res) => {
  try {
    const { category_id, name, slug, description = '', image_url = '', icon = 'Package' } = req.body;
    if (!category_id || !name) {
      return res.status(400).json({ error: 'Category ID and Subcategory Name are required' });
    }

    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const nameKey = `subcat_${finalSlug.replace(/-/g, '_')}`;

    const maxOrder = db.prepare('SELECT MAX(order_index) as max_order FROM subcategories WHERE category_id = ?').get(category_id).max_order || 0;

    const resRow = db.prepare(`
      INSERT INTO subcategories (category_id, slug, name_key, default_name, description, image_url, icon, order_index, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(Number(category_id), finalSlug, nameKey, name.trim(), description.trim(), image_url.trim(), icon, maxOrder + 1);

    res.status(201).json({ id: resRow.lastInsertRowid, message: 'Subcategory added successfully' });
  } catch (err) {
    console.error('Error creating subcategory:', err);
    res.status(500).json({ error: 'Failed to create subcategory' });
  }
});

router.put('/subcategories/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, default_name, slug, description, image_url, icon, is_active } = req.body;

    db.prepare(`
      UPDATE subcategories SET
        category_id = COALESCE(?, category_id),
        default_name = COALESCE(?, default_name),
        slug = COALESCE(?, slug),
        description = COALESCE(?, description),
        image_url = COALESCE(?, image_url),
        icon = COALESCE(?, icon),
        is_active = COALESCE(?, is_active)
      WHERE id = ?
    `).run(category_id ? Number(category_id) : null, default_name, slug, description, image_url, icon, is_active, id);

    res.json({ success: true, message: 'Subcategory updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update subcategory' });
  }
});

router.delete('/subcategories/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM subcategories WHERE id = ?').run(id);
    res.json({ success: true, message: 'Subcategory deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete subcategory' });
  }
});

// Retailer Management
router.post('/retailers', (req, res) => {
  try {
    const { name, website_url, affiliate_tag, badge_color = '#2563eb' } = req.body;
    if (!name || !website_url) return res.status(400).json({ error: 'Retailer name and website URL are required' });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const resRow = db.prepare(`
      INSERT INTO retailers (name, slug, website_url, affiliate_tag, badge_color)
      VALUES (?, ?, ?, ?, ?)
    `).run(name.trim(), slug, website_url.trim(), affiliate_tag ? affiliate_tag.trim() : null, badge_color);

    res.status(201).json({ id: resRow.lastInsertRowid, message: 'Retailer added' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create retailer' });
  }
});

export default router;
