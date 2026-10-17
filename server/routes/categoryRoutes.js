import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get all categories with subcategories
router.get('/', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT 
        c.*,
        (SELECT COUNT(*) FROM deals d WHERE d.category_id = c.id AND d.is_active = 1) as deals_count
      FROM categories c
      WHERE c.is_active = 1
      ORDER BY c.order_index ASC
    `).all();

    const subcategories = db.prepare(`
      SELECT 
        sc.*,
        (SELECT COUNT(*) FROM deals d WHERE d.subcategory_id = sc.id AND d.is_active = 1) as deals_count
      FROM subcategories sc
      WHERE sc.is_active = 1
      ORDER BY sc.order_index ASC
    `).all();

    const result = categories.map((cat) => ({
      ...cat,
      subcategories: subcategories.filter((s) => s.category_id === cat.id),
    }));

    res.json({ categories: result });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get all retailers (must be defined before /:slug)
router.get('/retailers/list', (req, res) => {
  try {
    const retailers = db.prepare(`
      SELECT 
        r.*,
        (SELECT COUNT(*) FROM deals d WHERE d.retailer_id = r.id AND d.is_active = 1) as deals_count
      FROM retailers r
      WHERE r.is_active = 1
      ORDER BY deals_count DESC, r.name ASC
    `).all();

    res.json({ retailers });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch retailers' });
  }
});

router.get('/retailers', (req, res) => {
  try {
    const retailers = db.prepare(`
      SELECT 
        r.*,
        (SELECT COUNT(*) FROM deals d WHERE d.retailer_id = r.id AND d.is_active = 1) as deals_count
      FROM retailers r
      WHERE r.is_active = 1
      ORDER BY deals_count DESC, r.name ASC
    `).all();

    res.json({ retailers });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch retailers' });
  }
});

// Get single category by slug with its subcategories and deals count
router.get('/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const category = db.prepare(`
      SELECT 
        c.*,
        (SELECT COUNT(*) FROM deals d WHERE d.category_id = c.id AND d.is_active = 1) as deals_count
      FROM categories c
      WHERE c.slug = ? AND c.is_active = 1
    `).get(slug);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const subcategories = db.prepare(`
      SELECT 
        sc.*,
        (SELECT COUNT(*) FROM deals d WHERE d.subcategory_id = sc.id AND d.is_active = 1) as deals_count
      FROM subcategories sc
      WHERE sc.category_id = ? AND sc.is_active = 1
      ORDER BY sc.order_index ASC
    `).all(category.id);

    res.json({
      category: {
        ...category,
        subcategories,
      },
    });
  } catch (err) {
    console.error('Error fetching category by slug:', err);
    res.status(500).json({ error: 'Failed to fetch category details' });
  }
});

// Get subcategory details by categorySlug and subcategorySlug
router.get('/:categorySlug/:subcategorySlug', (req, res) => {
  try {
    const { categorySlug, subcategorySlug } = req.params;

    const category = db.prepare(`
      SELECT id, slug, name_key, default_name, icon, description, image_url
      FROM categories
      WHERE slug = ? AND is_active = 1
    `).get(categorySlug);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const subcategory = db.prepare(`
      SELECT 
        sc.*,
        (SELECT COUNT(*) FROM deals d WHERE d.subcategory_id = sc.id AND d.is_active = 1) as deals_count
      FROM subcategories sc
      WHERE sc.category_id = ? AND sc.slug = ? AND sc.is_active = 1
    `).get(category.id, subcategorySlug);

    if (!subcategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    res.json({
      category,
      subcategory,
    });
  } catch (err) {
    console.error('Error fetching subcategory:', err);
    res.status(500).json({ error: 'Failed to fetch subcategory details' });
  }
});

export default router;
