import express from 'express';
import db from '../db.js';
import { verifyToken } from '../auth.js';

const router = express.Router();

// All wishlist routes require authentication
router.use(verifyToken);

// Get all wishlist items for logged in user with deal details
router.get('/', (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const items = db.prepare(`
      SELECT 
        w.id as wishlist_id,
        w.created_at as saved_at,
        d.*,
        c.slug as category_slug,
        c.name_key as category_name_key,
        c.default_name as category_default_name,
        r.name as retailer_name,
        r.slug as retailer_slug,
        r.badge_color as retailer_badge_color,
        dt.title as translated_title,
        dt.description as translated_description
      FROM wishlist w
      JOIN deals d ON w.deal_id = d.id
      LEFT JOIN categories c ON d.category_id = c.id
      LEFT JOIN retailers r ON d.retailer_id = r.id
      LEFT JOIN deal_translations dt ON (d.id = dt.deal_id AND dt.language_code = ?)
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `).all(lang, req.user.id);

    const localized = items.map((item) => ({
      ...item,
      display_title: item.translated_title || item.title,
      display_description: item.translated_description || item.description,
    }));

    res.json({ wishlist: localized });
  } catch (err) {
    console.error('Error fetching wishlist:', err);
    res.status(500).json({ error: 'Failed to retrieve wishlist items' });
  }
});

// Get just deal IDs in user's wishlist (for fast button states)
router.get('/ids', (req, res) => {
  try {
    const rows = db.prepare('SELECT deal_id FROM wishlist WHERE user_id = ?').all(req.user.id);
    const ids = rows.map((r) => r.deal_id);
    res.json({ ids });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve wishlist IDs' });
  }
});

// Add deal to wishlist
router.post('/add', (req, res) => {
  try {
    const { deal_id } = req.body;
    if (!deal_id) {
      return res.status(400).json({ error: 'Deal ID is required' });
    }

    const deal = db.prepare('SELECT id FROM deals WHERE id = ?').get(deal_id);
    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    // Insert or ignore if already exists
    db.prepare(`
      INSERT OR IGNORE INTO wishlist (user_id, deal_id)
      VALUES (?, ?)
    `).run(req.user.id, deal_id);

    res.json({ success: true, message: 'Deal saved to wishlist' });
  } catch (err) {
    console.error('Wishlist add error:', err);
    res.status(500).json({ error: 'Failed to save deal to wishlist' });
  }
});

// Remove deal from wishlist
router.delete('/:dealId', (req, res) => {
  try {
    const { dealId } = req.params;
    db.prepare('DELETE FROM wishlist WHERE user_id = ? AND deal_id = ?').run(req.user.id, dealId);
    res.json({ success: true, message: 'Deal removed from wishlist' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove deal from wishlist' });
  }
});

export default router;
