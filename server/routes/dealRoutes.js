import express from 'express';
import db from '../db.js';
import { optionalToken } from '../auth.js';

const router = express.Router();

// Get deals with search, filter, sorting, and localization
router.get('/', optionalToken, (req, res) => {
  try {
    const {
      search,
      category,
      subcategory,
      retailer,
      min_price,
      max_price,
      min_discount,
      featured,
      trending,
      sort = 'featured',
      lang = 'en',
      limit = 50,
      offset = 0,
    } = req.query;

    let query = `
      SELECT 
        d.*,
        c.slug as category_slug,
        c.name_key as category_name_key,
        c.default_name as category_default_name,
        sc.slug as subcategory_slug,
        sc.name_key as subcategory_name_key,
        sc.default_name as subcategory_default_name,
        r.name as retailer_name,
        r.slug as retailer_slug,
        r.logo_url as retailer_logo,
        r.badge_color as retailer_badge_color,
        dt.title as translated_title,
        dt.description as translated_description
      FROM deals d
      LEFT JOIN categories c ON d.category_id = c.id
      LEFT JOIN subcategories sc ON d.subcategory_id = sc.id
      LEFT JOIN retailers r ON d.retailer_id = r.id
      LEFT JOIN deal_translations dt ON (d.id = dt.deal_id AND dt.language_code = ?)
      WHERE d.is_active = 1
    `;

    const params = [lang];

    if (category) {
      query += ` AND (c.slug = ? OR c.id = ?)`;
      params.push(category, category);
    }

    if (subcategory) {
      query += ` AND (sc.slug = ? OR sc.id = ?)`;
      params.push(subcategory, subcategory);
    }

    if (retailer) {
      query += ` AND (r.slug = ? OR r.id = ?)`;
      params.push(retailer, retailer);
    }

    if (min_price) {
      query += ` AND d.current_price >= ?`;
      params.push(Number(min_price));
    }

    if (max_price) {
      query += ` AND d.current_price <= ?`;
      params.push(Number(max_price));
    }

    if (min_discount) {
      query += ` AND d.discount_percentage >= ?`;
      params.push(Number(min_discount));
    }

    if (featured === 'true' || featured === '1') {
      query += ` AND d.is_featured = 1`;
    }

    if (trending === 'true' || trending === '1') {
      query += ` AND d.is_trending = 1`;
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query += ` AND (
        d.title LIKE ? 
        OR d.description LIKE ? 
        OR dt.title LIKE ? 
        OR dt.description LIKE ? 
        OR r.name LIKE ? 
        OR c.default_name LIKE ?
      )`;
      params.push(term, term, term, term, term, term);
    }

    // Sorting
    switch (sort) {
      case 'price_low':
        query += ` ORDER BY d.current_price ASC`;
        break;
      case 'price_high':
        query += ` ORDER BY d.current_price DESC`;
        break;
      case 'discount':
        query += ` ORDER BY d.discount_percentage DESC`;
        break;
      case 'newest':
        query += ` ORDER BY d.created_at DESC`;
        break;
      case 'rating':
        query += ` ORDER BY d.rating DESC, d.reviews_count DESC`;
        break;
      case 'featured':
      default:
        query += ` ORDER BY d.is_featured DESC, d.is_trending DESC, d.created_at DESC`;
        break;
    }

    query += ` LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const rows = db.prepare(query).all(...params);

    // Map localized titles and descriptions fallback
    const deals = rows.map((deal) => {
      return {
        ...deal,
        display_title: deal.translated_title || deal.title,
        display_description: deal.translated_description || deal.description,
      };
    });

    res.json({ deals, total: deals.length });
  } catch (err) {
    console.error('Error fetching deals:', err);
    res.status(500).json({ error: 'Failed to retrieve deals' });
  }
});

// Get featured / hero banner deals
router.get('/featured', (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const deals = db.prepare(`
      SELECT 
        d.*,
        c.slug as category_slug,
        c.name_key as category_name_key,
        c.default_name as category_default_name,
        r.name as retailer_name,
        r.slug as retailer_slug,
        r.badge_color as retailer_badge_color,
        dt.title as translated_title,
        dt.description as translated_description
      FROM deals d
      LEFT JOIN categories c ON d.category_id = c.id
      LEFT JOIN retailers r ON d.retailer_id = r.id
      LEFT JOIN deal_translations dt ON (d.id = dt.deal_id AND dt.language_code = ?)
      WHERE d.is_active = 1 AND d.is_featured = 1
      ORDER BY d.discount_percentage DESC, d.rating DESC
      LIMIT 6
    `).all(lang);

    const localized = deals.map((d) => ({
      ...d,
      display_title: d.translated_title || d.title,
      display_description: d.translated_description || d.description,
    }));

    res.json({ deals: localized });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch featured deals' });
  }
});

// Get single deal by slug or id
router.get('/:idOrSlug', (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const lang = req.query.lang || 'en';

    const isNum = /^\d+$/.test(idOrSlug);
    const whereClause = isNum ? 'd.id = ?' : 'd.slug = ?';

    const deal = db.prepare(`
      SELECT 
        d.*,
        c.slug as category_slug,
        c.name_key as category_name_key,
        c.default_name as category_default_name,
        sc.slug as subcategory_slug,
        sc.name_key as subcategory_name_key,
        sc.default_name as subcategory_default_name,
        r.name as retailer_name,
        r.slug as retailer_slug,
        r.logo_url as retailer_logo,
        r.website_url as retailer_website,
        r.badge_color as retailer_badge_color,
        dt.title as translated_title,
        dt.description as translated_description
      FROM deals d
      LEFT JOIN categories c ON d.category_id = c.id
      LEFT JOIN subcategories sc ON d.subcategory_id = sc.id
      LEFT JOIN retailers r ON d.retailer_id = r.id
      LEFT JOIN deal_translations dt ON (d.id = dt.deal_id AND dt.language_code = ?)
      WHERE ${whereClause} AND d.is_active = 1
    `).get(lang, idOrSlug);

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found or currently inactive.' });
    }

    // Get all available translation codes for this deal
    const translations = db.prepare('SELECT language_code, title, description FROM deal_translations WHERE deal_id = ?').all(deal.id);

    res.json({
      deal: {
        ...deal,
        display_title: deal.translated_title || deal.title,
        display_description: deal.translated_description || deal.description,
        available_translations: translations,
      },
    });
  } catch (err) {
    console.error('Error fetching deal:', err);
    res.status(500).json({ error: 'Failed to retrieve deal details' });
  }
});

// Outbound Affiliate Redirect & Click Tracker
router.get('/:id/redirect', optionalToken, (req, res) => {
  try {
    const { id } = req.params;
    const deal = db.prepare('SELECT id, retailer_id, product_url, affiliate_url FROM deals WHERE id = ?').get(id);

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    // Update click count
    db.prepare('UPDATE deals SET click_count = click_count + 1 WHERE id = ?').run(deal.id);

    // Record click log
    const userId = req.user ? req.user.id : null;
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

    db.prepare(`
      INSERT INTO clicks (deal_id, retailer_id, user_id, user_agent, ip_address)
      VALUES (?, ?, ?, ?, ?)
    `).run(deal.id, deal.retailer_id, userId, userAgent, ipAddress);

    // Target URL: affiliate_url if available, else fallback to product_url
    const targetUrl = deal.affiliate_url && deal.affiliate_url.trim() ? deal.affiliate_url : deal.product_url;

    // Return targetUrl as JSON or redirect based on query or Accept header
    if (req.query.mode === 'json') {
      return res.json({ target_url: targetUrl });
    }

    res.redirect(302, targetUrl);
  } catch (err) {
    console.error('Redirect error:', err);
    res.status(500).json({ error: 'Failed to process deal redirect' });
  }
});

export default router;
