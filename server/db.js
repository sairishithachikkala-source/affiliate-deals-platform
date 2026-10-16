import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'dealnest.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode & foreign keys for performance and integrity
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
`);

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      preferred_language TEXT DEFAULT 'en',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name_key TEXT NOT NULL,
      default_name TEXT NOT NULL,
      icon TEXT,
      description TEXT,
      image_url TEXT,
      order_index INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS subcategories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      slug TEXT NOT NULL,
      name_key TEXT NOT NULL,
      default_name TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      icon TEXT,
      order_index INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS retailers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      logo_url TEXT,
      website_url TEXT,
      affiliate_tag TEXT,
      badge_color TEXT DEFAULT '#2563eb',
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS deals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      original_price REAL NOT NULL,
      current_price REAL NOT NULL,
      discount_percentage INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      subcategory_id INTEGER,
      retailer_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      product_url TEXT NOT NULL,
      affiliate_url TEXT,
      rating REAL DEFAULT 4.5,
      reviews_count INTEGER DEFAULT 0,
      is_featured INTEGER DEFAULT 0,
      is_trending INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      deal_badge TEXT,
      click_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (subcategory_id) REFERENCES subcategories(id),
      FOREIGN KEY (retailer_id) REFERENCES retailers(id)
    );

    CREATE TABLE IF NOT EXISTS deal_translations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      deal_id INTEGER NOT NULL,
      language_code TEXT NOT NULL,
      title TEXT,
      description TEXT,
      UNIQUE(deal_id, language_code),
      FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS wishlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      deal_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, deal_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS clicks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      deal_id INTEGER NOT NULL,
      retailer_id INTEGER,
      user_id INTEGER,
      user_agent TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_deals_category ON deals(category_id);
    CREATE INDEX IF NOT EXISTS idx_deals_retailer ON deals(retailer_id);
    CREATE INDEX IF NOT EXISTS idx_deals_active ON deals(is_active);
    CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);
    CREATE INDEX IF NOT EXISTS idx_clicks_deal ON clicks(deal_id);
  `);

  migrateColumns();
  seedInitialData();
}

function migrateColumns() {
  const tryAddCol = (table, colDef) => {
    try {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${colDef}`);
    } catch (e) {
      // Column already exists, safe to ignore
    }
  };

  tryAddCol('categories', 'description TEXT');
  tryAddCol('categories', 'image_url TEXT');
  tryAddCol('categories', 'is_active INTEGER DEFAULT 1');

  tryAddCol('subcategories', 'description TEXT');
  tryAddCol('subcategories', 'image_url TEXT');
  tryAddCol('subcategories', 'icon TEXT');
  tryAddCol('subcategories', 'is_active INTEGER DEFAULT 1');
}

function seedInitialData() {
  // Sync the 5 primary categories
  const primaryCategories = [
    {
      slug: 'fashion-accessories',
      name_key: 'category_fashion',
      default_name: 'Fashion & Accessories',
      icon: 'Shirt',
      description: 'Explore trendy clothing, traditional ethnic wear, footwear, bags and premium fashion accessories.',
      image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80',
      order_index: 1,
    },
    {
      slug: 'electronics-tech',
      name_key: 'category_electronics',
      default_name: 'Electronics & Tech',
      icon: 'Smartphone',
      description: 'Discover the latest 5G smartphones, performance laptops, noise-cancelling headphones and smart gadgets.',
      image_url: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop&q=80',
      order_index: 2,
    },
    {
      slug: 'beauty-personal-care',
      name_key: 'category_beauty',
      default_name: 'Beauty & Personal Care',
      icon: 'Sparkles',
      description: 'Shop top dermatologist-tested skincare, salon-quality haircare, fragrances and grooming appliances.',
      image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
      order_index: 3,
    },
    {
      slug: 'home-kitchen',
      name_key: 'category_home_kitchen',
      default_name: 'Home & Kitchen',
      icon: 'Home',
      description: 'Transform your living space with kitchen utensils, cookware, storage solutions, home decor and furnishings.',
      image_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80',
      order_index: 4,
    },
    {
      slug: 'others',
      name_key: 'category_others',
      default_name: 'Others & Lifestyle',
      icon: 'Layers',
      description: 'Curated deals on bestselling books, fitness equipment, toys, travel gear and everyday lifestyle essentials.',
      image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80',
      order_index: 5,
    },
  ];

  for (const cat of primaryCategories) {
    const existing = db.prepare('SELECT id FROM categories WHERE slug = ?').get(cat.slug);
    if (!existing) {
      db.prepare(`
        INSERT INTO categories (slug, name_key, default_name, icon, description, image_url, order_index, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
      `).run(cat.slug, cat.name_key, cat.default_name, cat.icon, cat.description, cat.image_url, cat.order_index);
    } else {
      db.prepare(`
        UPDATE categories SET
          name_key = ?, default_name = ?, icon = ?, description = ?, image_url = ?, order_index = ?
        WHERE id = ?
      `).run(cat.name_key, cat.default_name, cat.icon, cat.description, cat.image_url, cat.order_index, existing.id);
    }
  }

  // Get Category Map
  const allCats = db.prepare('SELECT id, slug FROM categories').all();
  const catMap = Object.fromEntries(allCats.map((c) => [c.slug, c.id]));

  // Hierarchical Subcategories Definition (Requirement 4)
  const subcategoriesData = [
    // 1. Fashion & Accessories
    {
      category_slug: 'fashion-accessories',
      slug: 'mens-fashion',
      name_key: 'subcat_mens_fashion',
      default_name: "Men's Fashion",
      description: 'Shirts, casual t-shirts, jeans, trousers, and ethnic kurtas for men.',
      image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
      icon: 'Shirt',
      order_index: 1,
    },
    {
      category_slug: 'fashion-accessories',
      slug: 'womens-fashion',
      name_key: 'subcat_womens_fashion',
      default_name: "Women's Fashion",
      description: 'Anarkalis, festive sarees, western dresses, tops, and ethnic wear.',
      image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
      icon: 'Sparkles',
      order_index: 2,
    },
    {
      category_slug: 'fashion-accessories',
      slug: 'footwear',
      name_key: 'subcat_footwear',
      default_name: 'Footwear',
      description: 'Sneakers, formal leather shoes, sports running footwear, and ethnic sandals.',
      image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
      icon: 'Footprints',
      order_index: 3,
    },
    {
      category_slug: 'fashion-accessories',
      slug: 'bags-wallets',
      name_key: 'subcat_bags_wallets',
      default_name: 'Bags & Wallets',
      description: 'Handbags, stylish backpacks, leather wallets, and daily tote bags.',
      image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80',
      icon: 'ShoppingBag',
      order_index: 4,
    },
    {
      category_slug: 'fashion-accessories',
      slug: 'watches-accessories',
      name_key: 'subcat_watches_accessories',
      default_name: 'Watches & Accessories',
      description: 'Analog and chronograph watches, polarized sunglasses, belts, and caps.',
      image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      icon: 'Watch',
      order_index: 5,
    },

    // 2. Electronics & Tech
    {
      category_slug: 'electronics-tech',
      slug: 'smartphones',
      name_key: 'subcat_smartphones',
      default_name: 'Smartphones',
      description: 'Latest 5G Android & iOS smartphones with rapid charging and high-res cameras.',
      image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80',
      icon: 'Smartphone',
      order_index: 1,
    },
    {
      category_slug: 'electronics-tech',
      slug: 'laptops-computers',
      name_key: 'subcat_laptops_computers',
      default_name: 'Laptops & Computers',
      description: 'Powerful work laptops, gaming laptops, lightweight ultrabooks, and tablets.',
      image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80',
      icon: 'Laptop',
      order_index: 2,
    },
    {
      category_slug: 'electronics-tech',
      slug: 'audio-headphones',
      name_key: 'subcat_audio_headphones',
      default_name: 'Audio & Headphones',
      description: 'Active noise cancelling headphones, wireless earbuds, and Bluetooth party speakers.',
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      icon: 'Headphones',
      order_index: 3,
    },
    {
      category_slug: 'electronics-tech',
      slug: 'smartwatches-wearables',
      name_key: 'subcat_smartwatches_wearables',
      default_name: 'Smartwatches & Wearables',
      description: 'Fitness trackers, AMOLED calling smartwatches, and heart rate monitors.',
      image_url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
      icon: 'Watch',
      order_index: 4,
    },
    {
      category_slug: 'electronics-tech',
      slug: 'home-electronics',
      name_key: 'subcat_home_electronics',
      default_name: 'Home Electronics',
      description: '4K Ultra HD Smart TVs, streaming devices, soundbars, and smart home gadgets.',
      image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80',
      icon: 'Tv',
      order_index: 5,
    },
    {
      category_slug: 'electronics-tech',
      slug: 'computer-accessories',
      name_key: 'subcat_computer_accessories',
      default_name: 'Computer Accessories',
      description: 'Mechanical keyboards, wireless mice, external hard drives, and USB hubs.',
      image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80',
      icon: 'Mouse',
      order_index: 6,
    },

    // 3. Beauty & Personal Care
    {
      category_slug: 'beauty-personal-care',
      slug: 'skincare',
      name_key: 'subcat_skincare',
      default_name: 'Skincare',
      description: 'Dermatologist-tested face serums, sunscreens, hydrating moisturizers, and face washes.',
      image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
      icon: 'Sparkles',
      order_index: 1,
    },
    {
      category_slug: 'beauty-personal-care',
      slug: 'haircare',
      name_key: 'subcat_haircare',
      default_name: 'Haircare',
      description: 'Nourishing shampoos, hair masks, anti-dandruff treatments, and pure hair oils.',
      image_url: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600&auto=format&fit=crop&q=80',
      icon: 'Scissors',
      order_index: 2,
    },
    {
      category_slug: 'beauty-personal-care',
      slug: 'makeup',
      name_key: 'subcat_makeup',
      default_name: 'Makeup',
      description: 'Long-lasting lipsticks, waterproof kajals, foundations, and eyeshadow palettes.',
      image_url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&auto=format&fit=crop&q=80',
      icon: 'Palette',
      order_index: 3,
    },
    {
      category_slug: 'beauty-personal-care',
      slug: 'personal-care-appliances',
      name_key: 'subcat_personal_care_appliances',
      default_name: 'Personal Care Appliances',
      description: 'Hair straighteners, professional hair dryers, facial massagers, and trimmers.',
      image_url: 'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=600&auto=format&fit=crop&q=80',
      icon: 'Zap',
      order_index: 4,
    },
    {
      category_slug: 'beauty-personal-care',
      slug: 'grooming',
      name_key: 'subcat_grooming',
      default_name: 'Grooming',
      description: 'Men’s grooming kits, beard oils, body sprays, and luxury perfumes.',
      image_url: 'https://images.unsplash.com/photo-1503236823255-94609f598e71?w=600&auto=format&fit=crop&q=80',
      icon: 'Smile',
      order_index: 5,
    },

    // 4. Home & Kitchen (Section 4 Critical Requirement)
    {
      category_slug: 'home-kitchen',
      slug: 'kitchen-utensils-tools',
      name_key: 'subcat_kitchen_utensils_tools',
      default_name: 'Kitchen Utensils & Tools',
      description: 'Knife sets, chopping boards, silicone spatulas, whisks, and vegetable choppers.',
      image_url: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=600&auto=format&fit=crop&q=80',
      icon: 'Utensils',
      order_index: 1,
    },
    {
      category_slug: 'home-kitchen',
      slug: 'cookware-bakeware',
      name_key: 'subcat_cookware_bakeware',
      default_name: 'Cookware & Bakeware',
      description: 'Pressure cookers, non-stick frying pans, triply kadhais, and baking moulds.',
      image_url: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop&q=80',
      icon: 'Coffee',
      order_index: 2,
    },
    {
      category_slug: 'home-kitchen',
      slug: 'kitchen-storage-organization',
      name_key: 'subcat_kitchen_storage_organization',
      default_name: 'Kitchen Storage & Organization',
      description: 'Airtight grocery containers, spice carousel racks, water bottles, and glass jars.',
      image_url: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=600&auto=format&fit=crop&q=80',
      icon: 'Package',
      order_index: 3,
    },
    {
      category_slug: 'home-kitchen',
      slug: 'home-decor',
      name_key: 'subcat_home_decor',
      default_name: 'Home Decor',
      description: 'Silent sweep wall clocks, framed canvas art, ceramic flower vases, and tabletop accents.',
      image_url: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600&auto=format&fit=crop&q=80',
      icon: 'Sparkles',
      order_index: 4,
    },
    {
      category_slug: 'home-kitchen',
      slug: 'home-furnishings',
      name_key: 'subcat_home_furnishings',
      default_name: 'Home Furnishings',
      description: 'Pure cotton double bedsheets, blackout curtains, plush floor rugs, and cushion covers.',
      image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&auto=format&fit=crop&q=80',
      icon: 'Layers',
      order_index: 5,
    },
    {
      category_slug: 'home-kitchen',
      slug: 'cleaning-household',
      name_key: 'subcat_cleaning_household',
      default_name: 'Cleaning & Household Essentials',
      description: 'Spin mops, robot vacuum cleaners, liquid laundry detergents, and microfiber cloths.',
      image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80',
      icon: 'ShieldCheck',
      order_index: 6,
    },
    {
      category_slug: 'home-kitchen',
      slug: 'lighting-lamps',
      name_key: 'subcat_lighting_lamps',
      default_name: 'Lighting & Lamps',
      description: 'Ambient table lamps, energy-efficient smart LED bulbs, and decorative string lights.',
      image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80',
      icon: 'Sun',
      order_index: 7,
    },
    {
      category_slug: 'home-kitchen',
      slug: 'furniture-accessories',
      name_key: 'subcat_furniture_accessories',
      default_name: 'Furniture & Home Accessories',
      description: 'Ergonomic study chairs, solid wood coffee tables, wall shelves, and shoe racks.',
      image_url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&auto=format&fit=crop&q=80',
      icon: 'Home',
      order_index: 8,
    },

    // 5. Others & Lifestyle
    {
      category_slug: 'others',
      slug: 'books-stationery',
      name_key: 'subcat_books_stationery',
      default_name: 'Books & Stationery',
      description: 'Global bestsellers, self-help guides, high-quality journals, and fine writing pens.',
      image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80',
      icon: 'BookOpen',
      order_index: 1,
    },
    {
      category_slug: 'others',
      slug: 'sports-fitness',
      name_key: 'subcat_sports_fitness',
      default_name: 'Sports & Fitness',
      description: 'High-density yoga mats, adjustable dumbbells, resistance bands, and gym accessories.',
      image_url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&auto=format&fit=crop&q=80',
      icon: 'Activity',
      order_index: 2,
    },
    {
      category_slug: 'others',
      slug: 'toys-games',
      name_key: 'subcat_toys_games',
      default_name: 'Toys & Games',
      description: 'STEM educational toys, family board games, jigsaw puzzles, and remote control toys.',
      image_url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&auto=format&fit=crop&q=80',
      icon: 'Smile',
      order_index: 3,
    },
    {
      category_slug: 'others',
      slug: 'travel-accessories',
      name_key: 'subcat_travel_accessories',
      default_name: 'Travel Accessories',
      description: 'Hard-body cabin luggage trolley bags, travel pillows, and passport organizers.',
      image_url: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=600&auto=format&fit=crop&q=80',
      icon: 'Luggage',
      order_index: 4,
    },
    {
      category_slug: 'others',
      slug: 'lifestyle-accessories',
      name_key: 'subcat_lifestyle_accessories',
      default_name: 'Lifestyle Accessories',
      description: 'Insulated stainless steel bottles, windproof umbrellas, and daily EDC utility items.',
      image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
      icon: 'Compass',
      order_index: 5,
    },
    {
      category_slug: 'others',
      slug: 'other-useful-products',
      name_key: 'subcat_other_useful_products',
      default_name: 'Other Useful Products',
      description: 'Car phone mounts, emergency flashlights, multi-tools, and practical household gadgets.',
      image_url: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=600&auto=format&fit=crop&q=80',
      icon: 'Layers',
      order_index: 6,
    },
  ];

  for (const sub of subcategoriesData) {
    const parentCatId = catMap[sub.category_slug];
    if (!parentCatId) continue;

    const existingSub = db.prepare('SELECT id FROM subcategories WHERE category_id = ? AND slug = ?').get(parentCatId, sub.slug);
    if (!existingSub) {
      db.prepare(`
        INSERT INTO subcategories (category_id, slug, name_key, default_name, description, image_url, icon, order_index, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      `).run(parentCatId, sub.slug, sub.name_key, sub.default_name, sub.description, sub.image_url, sub.icon, sub.order_index);
    } else {
      db.prepare(`
        UPDATE subcategories SET
          name_key = ?, default_name = ?, description = ?, image_url = ?, icon = ?, order_index = ?, is_active = 1
        WHERE id = ?
      `).run(sub.name_key, sub.default_name, sub.description, sub.image_url, sub.icon, sub.order_index, existingSub.id);
    }
  }

  // Requirement 2: Safe removal and reassignment of specified obsolete subcategories
  // - Fashion: subcat_men_wear, subcat_women_wear
  // - Electronics: subcat_laptop_audio, subcat_smartwatches
  // - Beauty: subcat_fragrances
  const slugTargetMapping = {
    'mens-clothing': 'mens-fashion',
    'womens-ethnic': 'womens-fashion',
    'laptops-audio': 'audio-headphones',
    'smartwatches': 'smartwatches-wearables',
    'fragrances': 'grooming',
    'appliances': 'kitchen-storage-organization',
    'cookware': 'cookware-bakeware',
    'water-purifiers': 'kitchen-utensils-tools',
    'books': 'books-stationery',
    'stationery': 'books-stationery',
    'other-useful': 'other-useful-products',
  };

  for (const [oldSlug, newSlug] of Object.entries(slugTargetMapping)) {
    const oldSub = db.prepare('SELECT id FROM subcategories WHERE slug = ?').get(oldSlug);
    const newSub = db.prepare('SELECT id FROM subcategories WHERE slug = ?').get(newSlug);
    if (oldSub && newSub) {
      db.prepare('UPDATE deals SET subcategory_id = ? WHERE subcategory_id = ?').run(newSub.id, oldSub.id);
    }
  }

  const removeSlugs = [
    'mens-clothing',
    'womens-ethnic',
    'laptops-audio',
    'smartwatches',
    'fragrances',
    'appliances',
    'cookware',
    'water-purifiers',
    'books',
    'stationery',
    'other-useful',
  ];

  for (const slug of removeSlugs) {
    db.prepare('UPDATE subcategories SET is_active = 0 WHERE slug = ?').run(slug);
    try {
      db.prepare('DELETE FROM subcategories WHERE slug = ?').run(slug);
    } catch (e) {
      // Ignored if foreign key references prevent deletion
    }
  }

  // Clean up any old mismatched duplicate subcategories (e.g. old home-decor under category_id = 5)
  try {
    db.prepare("DELETE FROM subcategories WHERE category_id = 5 AND slug = 'home-decor'").run();
  } catch (e) {}

  // Seed Retailers
  const retCount = db.prepare('SELECT COUNT(*) as count FROM retailers').get().count;
  if (retCount === 0) {
    console.log('Seeding retailers...');
    const insertRet = db.prepare('INSERT INTO retailers (name, slug, logo_url, website_url, affiliate_tag, badge_color) VALUES (?, ?, ?, ?, ?, ?)');
    insertRet.run('Amazon India', 'amazon', 'https://images.unsplash.com/photo-1523474253243-231dfab83857?w=100&auto=format&fit=crop&q=80', 'https://www.amazon.in', 'dealnest08-21', '#FF9900');
    insertRet.run('Flipkart', 'flipkart', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=100&auto=format&fit=crop&q=80', 'https://www.flipkart.com', 'affdealnest', '#2874F0');
    insertRet.run('Myntra', 'myntra', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&auto=format&fit=crop&q=80', 'https://www.myntra.com', 'myntradealnest', '#FF3F6C');
    insertRet.run('Tata CLiQ', 'tatacliq', 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=100&auto=format&fit=crop&q=80', 'https://www.tatacliq.com', 'tatadealnest', '#000000');
    insertRet.run('Croma', 'croma', 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=100&auto=format&fit=crop&q=80', 'https://www.croma.com', 'cromadealnest', '#00E88F');
  }

  // Seed Admin and Demo User
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    console.log('Seeding initial admin and demo user...');
    const hash = bcrypt.hashSync('Admin@DealNest2026', 10);
    const demoHash = bcrypt.hashSync('User@DealNest2026', 10);
    const insertUser = db.prepare('INSERT INTO users (name, email, password_hash, role, preferred_language) VALUES (?, ?, ?, ?, ?)');
    insertUser.run('DealNest Administrator', 'admin@dealnest.in', hash, 'admin', 'en');
    insertUser.run('Priya Sharma', 'priya@example.com', demoHash, 'user', 'hi');
  }

  // Seed / Map Deals with All 8 Languages
  seedComprehensiveDeals();
}

function seedComprehensiveDeals() {
  const categories = db.prepare('SELECT id, slug FROM categories').all();
  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

  const subcats = db.prepare('SELECT id, slug FROM subcategories').all();
  const subMap = Object.fromEntries(subcats.map((s) => [s.slug, s.id]));

  const retailers = db.prepare('SELECT id, slug FROM retailers').all();
  const retMap = Object.fromEntries(retailers.map((r) => [r.slug, r.id]));

  const insertDeal = db.prepare(`
    INSERT INTO deals (
      title, slug, description, original_price, current_price, discount_percentage,
      category_id, subcategory_id, retailer_id, image_url, product_url, affiliate_url,
      rating, reviews_count, is_featured, is_trending, is_active, deal_badge
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertTranslation = db.prepare(`
    INSERT INTO deal_translations (deal_id, language_code, title, description)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(deal_id, language_code) DO UPDATE SET
      title = excluded.title,
      description = excluded.description
  `);

  const dealsData = [
    {
      title: "OnePlus Nord CE4 5G (Dark Chrome, 8GB RAM, 128GB Storage)",
      slug: "oneplus-nord-ce4-5g-dark-chrome",
      description: "Qualcomm Snapdragon 7 Gen 3 processor, 100W SUPERVOOC charging with 5500 mAh battery, 50MP Sony LYT-600 Camera with OIS.",
      original_price: 24999,
      current_price: 19999,
      discount_percentage: 20,
      category_slug: "electronics-tech",
      subcategory_slug: "smartphones",
      retailer_slug: "amazon",
      image_url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80",
      product_url: "https://www.amazon.in/dp/B0CX21C2B5",
      affiliate_url: "https://www.amazon.in/dp/B0CX21C2B5?tag=dealnest08-21",
      rating: 4.6,
      reviews_count: 8420,
      is_featured: 1,
      is_trending: 1,
      deal_badge: "Lightning Deal",
      translations: {
        te: {
          title: "వన్‌ప్లస్ నార్డ్ CE4 5G (8GB RAM, 128GB స్టోరేజ్)",
          description: "స్నాప్‌డ్రాగన్ 7 Gen 3 ప్రాసెసర్, 100W సూపర్‌వూక్ ఛార్జింగ్ మరియు 5500 mAh బ్యాటరీ."
        },
        hi: {
          title: "वनप्लस नॉर्ड CE4 5G (8GB रैम, 128GB स्टोरेज)",
          description: "क्वालकॉम स्नैपड्रैगन 7 जेन 3 प्रोसेसर, 100W फास्ट चार्जिंग और 5500 mAh बैटरी।"
        },
        ta: {
          title: "ஒன்பிளஸ் நார்ட் CE4 5G (8GB RAM, 128GB சேமிப்பு)",
          description: "குவால்காம் ஸ்னாப்டிராகன் 7 Gen 3 செயலி, 100W வேகமான சார்ஜிங் மற்றும் 5500 mAh பேட்டரி."
        },
        ml: {
          title: "വൺപ്ലസ് നോർഡ് CE4 5G (8GB റാം, 128GB സ്റ്റോറേജ്)",
          description: "ക്വാൽകോം സ്നാപ്ഡ്രാഗൺ 7 ജെൻ 3 പ്രോസസർ, 100W ഫാസ്റ്റ് ചാർജിംഗ്, 5500 mAh ബാറ്ററി."
        },
        kn: {
          title: "ಒನ್‌ಪ್ಲಸ್ ನಾರ್ಡ್ CE4 5G (8GB RAM, 128GB ಸಂಗ್ರಹಣೆ)",
          description: "ಕ್ವಾಲ್ಕಾಮ್ ಸ್ನಾಪ್ಡ್ರಾಗನ್ 7 Gen 3 ಪ್ರೊಸೆಸರ್, 100W ಸೂಪರ್ವೂಕ್ ಚಾರ್ಜಿಂಗ್ ಮತ್ತು 5500 mAh ಬ್ಯಾಟರಿ."
        },
        mr: {
          title: "वनप्लस नॉर्ड CE4 5G (8GB रॅम, 128GB स्टोरेज)",
          description: "क्वालकॉम स्नॅपड्रॅगन 7 जेन 3 प्रोसेसर, 100W सुपरवूक चार्जिंग आणि 5500 mAh बॅटरी."
        },
        bn: {
          title: "ওয়ানপ্লাস নর্ড CE4 5G (8GB RAM, 128GB স্টোরেজ)",
          description: "কোয়ালকম স্ন্যাপড্রাগন 7 জেন 3 প্রসেসর, 100W সুপারভুক চার্জিং এবং 5500 mAh ব্যাটারি।"
        }
      }
    },
    {
      title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones (Silver)",
      slug: "sony-wh-1000xm5-wireless-noise-cancelling",
      description: "Industry leading noise cancellation with two processors and 8 microphones. Up to 30 hours battery life with quick charge.",
      original_price: 34990,
      current_price: 24990,
      discount_percentage: 29,
      category_slug: "electronics-tech",
      subcategory_slug: "audio-headphones",
      retailer_slug: "amazon",
      image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
      product_url: "https://www.amazon.in/dp/B09XS7JWHH",
      affiliate_url: "https://www.amazon.in/dp/B09XS7JWHH?tag=dealnest08-21",
      rating: 4.8,
      reviews_count: 5120,
      is_featured: 1,
      is_trending: 0,
      deal_badge: "Festival Price",
      translations: {
        te: {
          title: "సోనీ WH-1000XM5 వైర్‌లెస్ నాయిస్ క్యాన్సిలింగ్ హెడ్‌ఫోన్స్",
          description: "అత్యుత్తమ నాయిస్ క్యాన్సిలేషన్, 30 గంటల బ్యాటరీ లైఫ్, సుఖవంతమైన తేలికపాటి డిజైన్."
        },
        hi: {
          title: "सोनी WH-1000XM5 वायरलेस नॉइज़ कैंसिलिंग हेडफ़ोन",
          description: "इंडस्ट्री-लीडिंग एक्टिव नॉइज़ कैंसलेशन, 30 घंटे तक की बैटरी लाइफ और प्रीमियम साउंड क्वालिटी।"
        },
        ta: {
          title: "சோனி WH-1000XM5 வயர்லெஸ் சத்தம் ரத்துசெய்யும் ஹெட்ஃபோன்கள்",
          description: "முன்னணி இரைச்சல் நீக்கம், 30 மணிநேர பேட்டரி ஆயுள் மற்றும் பிரீமியம் ஒலி தரம்."
        },
        ml: {
          title: "സോണി WH-1000XM5 വയർലെസ്സ് നോയ്സ് ക്യാൻസലിംഗ് ഹെഡ്ഫോണുകൾ",
          description: "വ്യവസായത്തിലെ മികച്ച ശബ്ദ നിയന്ത്രണം, 30 മണിക്കൂർ ബാറ്ററി ലൈഫ്."
        },
        kn: {
          title: "ಸೋನಿ WH-1000XM5 ವೈರ್‌ಲೆಸ್ ನಾಯ್ಸ್ ಕ್ಯಾನ್ಸಲಿಂಗ್ ಹೆಡ್‌ಫೋನ್",
          description: "ಉತ್ತಮ ನಾಯ್ಸ್ ಕ್ಯಾನ್ಸಲೇಶನ್, 30 ಗಂಟೆಗಳ ಬ್ಯಾಟರಿ ಬಾಳಿಕೆ ಮತ್ತು ಅದ್ಭುತ ಧ್ವನಿ."
        },
        mr: {
          title: "सोनी WH-1000XM5 वायरलेस नॉईज कॅन्सलिंग हेडफोन",
          description: "उत्कृष्ट नॉईज कॅन्सलेशन, ३० तासांची बॅटरी लाइफ आणि स्पष्ट आवाज."
        },
        bn: {
          title: "সনি WH-1000XM5 ওয়্যারলেস নয়েজ ক্যানসেলিং হেডফোন",
          description: "শীর্ষস্থানীয় নয়েজ ক্যান্সেলেশন, ৩০ ঘণ্টার ব্যাটারি লাইফ এবং প্রিমিয়াম সাউন্ড।"
        }
      }
    },
    {
      title: "Apple Watch SE (2nd Gen) [GPS 40mm] Smartwatch with Starlight Aluminium Case",
      slug: "apple-watch-se-2nd-gen-gps-40mm",
      description: "Heart rate monitoring, crash detection, workout app with advanced metrics, swimproof 50m water resistance.",
      original_price: 29900,
      current_price: 21999,
      discount_percentage: 26,
      category_slug: "electronics-tech",
      subcategory_slug: "smartwatches-wearables",
      retailer_slug: "flipkart",
      image_url: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80",
      product_url: "https://www.flipkart.com/apple-watch-se-gps",
      affiliate_url: "https://www.flipkart.com/apple-watch-se-gps?affid=affdealnest",
      rating: 4.7,
      reviews_count: 3200,
      is_featured: 1,
      is_trending: 1,
      deal_badge: "Super Saver",
      translations: {
        te: {
          title: "ఆపిల్ వాచ్ SE (2nd Gen) GPS 40mm స్మార్ట్‌వాచ్",
          description: "గుండె వేగం పర్యవేక్షణ, క్రాష్ డిటెక్షన్ మరియు 50 మీటర్ల వాటర్‌ప్రూఫ్ సదుపాయం."
        },
        hi: {
          title: "एप्पल वॉच एसई (2nd Gen) जीपीएस 40mm स्मार्टवॉच",
          description: "हार्ट रेट मॉनिटरिंग, क्रैश डिटेक्शन, 50 मीटर वॉटरप्रूफ रेटिंग और फिटनेस ट्रैकिंग।"
        },
        ta: {
          title: "ஆப்பிள் வாட்ச் SE (2வது தலைமுறை) ஜிபிஎஸ் 40 மிமீ ஸ்மார்ட்வாட்ச்",
          description: "இதய துடிப்பு கண்காணிப்பு, விபத்து கண்டறிதல் மற்றும் 50மீ நீர்ப்புகா வசதி."
        },
        ml: {
          title: "ആപ്പിൾ വാച്ച് SE (2nd Gen) ജിപിഎസ് 40mm സ്മാർട്ട് വാച്ച്",
          description: "ഹൃദയമിടിപ്പ് നിരീക്ഷണം, ക്രാഷ് കണ്ടെത്തൽ, 50 മീറ്റർ വാട്ടർപ്രൂഫ് റേറ്റിംഗ്."
        },
        kn: {
          title: "ಆಪಲ್ ವಾಚ್ ಎಸ್ಇ (2nd Gen) ಜಿಪಿಎಸ್ 40mm ಸ್ಮಾರ್ಟ್ ವಾಚ್",
          description: "ಹೃದಯ ಬಡಿತ ಟ್ರ್ಯಾಕಿಂಗ್, ಅಪಘಾತ ಪತ್ತೆ ಮತ್ತು 50 ಮೀಟರ್ ಜಲನಿರೋಧಕ ವೈಶಿಷ್ಟ್ಯ."
        },
        mr: {
          title: "अ‍ॅपल वॉच एसई (2nd Gen) जीपीएस 40mm स्मार्टवॉच",
          description: "हार्ट रेट मॉनिटरिंग, अपघात शोधणे आणि ५० मीटर वॉटरप्रूफ रेटिंग."
        },
        bn: {
          title: "অ্যাপল ওয়াচ এসই (২য় প্রজন্ম) জিপিএস ৪০মিমি স্মার্টওয়াচ",
          description: "হার্ট রেট পর্যবেক্ষণ, ক্র্যাশ ডিটেকশন এবং ৫০ মিটার ওয়াটারপ্রুফ সুবিধা।"
        }
      }
    },
    {
      title: "Libas Women Floral Printed Pure Cotton Anarkali Kurta with Pant & Dupatta",
      slug: "libas-women-floral-printed-cotton-anarkali-kurta-set",
      description: "Pure breathable cotton festive 3-piece set with handcrafted gotta patti work. Includes Anarkali kurta, trousers and floral dupatta.",
      original_price: 3999,
      current_price: 1399,
      discount_percentage: 65,
      category_slug: "fashion-accessories",
      subcategory_slug: "womens-fashion",
      retailer_slug: "myntra",
      image_url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80",
      product_url: "https://www.myntra.com/kurta-sets/libas",
      affiliate_url: "https://www.myntra.com/kurta-sets/libas?affid=myntradealnest",
      rating: 4.4,
      reviews_count: 2450,
      is_featured: 1,
      is_trending: 1,
      deal_badge: "65% OFF Festive",
      translations: {
        te: {
          title: "లిబాస్ మహిళల ప్యూర్ కాటన్ అనార్కలి కుర్తా సెట్ (దుపట్టాతో)",
          description: "పండుగలకు అనువైన స్వచ్ఛమైన కాటన్ అనార్కలి కుర్తా, ప్యాంటు మరియు ప్రింటెడ్ దుపట్టా సెట్."
        },
        hi: {
          title: "लिबास महिला फ्लोरल प्रिंटेड प्योर कॉटन अनारकली कुर्ता सेट",
          description: "प्योर कॉटन फैब्रिक, गोटा पत्ती वर्क और मैचिंग ट्राउजर व दुपट्टे के साथ परफेक्ट फेस्टिव वियर।"
        },
        ta: {
          title: "லிபாஸ் பெண்கள் தூய பருத்தி அனார்கலி குர்தா செட் (துப்பட்டாவுடன்)",
          description: "பண்டிகைக்கு ஏற்ற தூய பருத்தி அனார்கலி குர்தா, பேண்ட் மற்றும் துப்பட்டா செட்."
        },
        ml: {
          title: "ലിബാസ് വനിതാ കോട്ടൺ അനാർക്കലി കുർത്ത സെറ്റ് (ദുപ്പട്ട സഹിതം)",
          description: "ഉത്സവങ്ങൾക്ക് അനുയോജ്യമായ പ്യുവർ കോട്ടൺ അനാർക്കലി കുർത്തയും ദുപ്പട്ടയും."
        },
        kn: {
          title: "ಲಿಬಾಸ್ ಮಹಿಳೆಯರ ಪ್ಯೂರ್ ಕಾಟನ್ ಅನಾರ್ಕಲಿ ಕುರ್ತಾ ಸೆಟ್ (ದುಪಟ್ಟಾದೊಂದಿಗೆ)",
          description: "ಹಬ್ಬದ ದಿನಗಳಿಗೆ ಸೂಕ್ತವಾದ ಶುದ್ಧ ಹತ್ತಿಯ ಸುಂದರ ಅನಾರ್ಕಲಿ ಕುರ್ತಾ ಸೆಟ್."
        },
        mr: {
          title: "लिबास महिला फ्लोरल कॉटन अनारकली कुर्ता सेट (दुपट्ट्यासह)",
          description: "सणासुदीसाठी परिपूर्ण सुती कापडाचा सुंदर अनारकली कुर्ता आणि दुपट्टा सेट."
        },
        bn: {
          title: "লিবাস মহিলাদের পিওর কটন আনারকলি কুর্তা সেট (দোপাট্টাসহ)",
          description: "উৎসবের জন্য আরামদায়ক সুতি আনারকলি কুর্তা, প্যান্ট ও সুন্দর দোপাট্টা সেট।"
        }
      }
    },
    {
      title: "Allen Solly Men's Slim Fit Casual Shirt (100% Breathable Cotton)",
      slug: "allen-solly-mens-slim-fit-casual-cotton-shirt",
      description: "Classic semi-formal & casual button-down shirt. Soft pre-washed cotton with modern cutaway collar and iconic embroidered logo.",
      original_price: 1999,
      current_price: 899,
      discount_percentage: 55,
      category_slug: "fashion-accessories",
      subcategory_slug: "mens-fashion",
      retailer_slug: "flipkart",
      image_url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80",
      product_url: "https://www.flipkart.com/allen-solly-shirt",
      affiliate_url: "https://www.flipkart.com/allen-solly-shirt?affid=affdealnest",
      rating: 4.3,
      reviews_count: 1890,
      is_featured: 0,
      is_trending: 1,
      deal_badge: "Top Seller",
      translations: {
        te: {
          title: "అలెన్ సోలీ పురుషుల కాటన్ క్యాజువల్ షర్ట్",
          description: "100% స్వచ్ఛమైన కాటన్, ఆఫీస్ మరియు క్యాజువల్ వినియోగానికి అనుకూలం."
        },
        hi: {
          title: "एलन सॉली पुरुषों की स्लिम फिट कॉटन कैजुअल शर्ट",
          description: "100% सॉफ्ट कॉटन शर्ट, रोजमर्रा के ऑफिस और पार्टी वियर के लिए आरामदायक।"
        },
        ta: {
          title: "ஆலன் சோலி ஆண்கள் ஸ்லிம் ஃபிட் கேசுவல் ஷர்ட்",
          description: "100% தூய பருத்தி, அலுவலகம் மற்றும் தினசரி பயன்பாட்டிற்கு வசதியானது."
        },
        ml: {
          title: "അലൻ സോളി പുരുഷന്മാരുടെ സ്ലിം ഫിറ്റ് കോട്ടൺ ഷർട്ട്",
          description: "100% പ്യുവർ കോട്ടൺ ഷർട്ട്, ദൈനംദിന ഉപയോഗത്തിന് അനുയോജ്യം."
        },
        kn: {
          title: "ಅಲೆನ್ ಸಾಲಿ ಪುರುಷರ ಸ್ಲಿಮ್ ಫಿಟ್ ಕಾಟನ್ ಕ್ಯಾಶುಯಲ್ ಶರ್ಟ್",
          description: "100% ಹತ್ತಿ ಬಟ್ಟೆಯ ಶರ್ಟ್, ಆಫೀಸ್ ಮತ್ತು ಕ್ಯಾಶುಯಲ್ ಬಳಕೆಗೆ ಸೂಕ್ತ."
        },
        mr: {
          title: "अ‍ॅलन सॉली पुरुषांचे कॉटन कॅज्युअल शर्ट",
          description: "१००% मऊ कॉटन शर्ट, दैनंदिन ऑफिस आणि पार्टीसाठी आरामदायक."
        },
        bn: {
          title: "অ্যালেন সলি পুরুষদের স্লিম ফিট কটন ক্যাজুয়াল শার্ট",
          description: "১০০% নরম সুতি শার্ট, অফিস এবং ক্যাজুয়াল ব্যবহারের জন্য অত্যন্ত আরামদায়ক।"
        }
      }
    },
    {
      title: "Minimalist 10% Vitamin C Face Serum for Glowing Skin (30ml)",
      slug: "minimalist-10-percent-vitamin-c-face-serum-30ml",
      description: "Formulated with stable Ethyl Ascorbic Acid (10%) and Centella Asiatica Water. Effectively fades dark spots and boosts radiance.",
      original_price: 699,
      current_price: 499,
      discount_percentage: 29,
      category_slug: "beauty-personal-care",
      subcategory_slug: "skincare",
      retailer_slug: "amazon",
      image_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80",
      product_url: "https://www.amazon.in/dp/B08F91VND5",
      affiliate_url: "https://www.amazon.in/dp/B08F91VND5?tag=dealnest08-21",
      rating: 4.5,
      reviews_count: 15420,
      is_featured: 1,
      is_trending: 1,
      deal_badge: "Dermat Tested",
      translations: {
        te: {
          title: "మినిమలిస్ట్ 10% విటమిన్ సి ఫేస్ సీరం (30ml)",
          description: "మచ్చలను తగ్గించి ముఖానికి సహజ కాంతిని ఇచ్చే సురక్షితమైన విటమిన్ సి ఫేస్ సీరం."
        },
        hi: {
          title: "मिनिमलिस्ट 10% विटामिन सी फेस सीरम (30ml)",
          description: "दाग-धब्बों को हल्का करने और त्वचा में चमक लाने वाला खुशबू-रहित और सुरक्षित सीरम।"
        },
        ta: {
          title: "மினிமலிஸ்ட் 10% வைட்டமின் சி ஃபேஸ் சீரம் (30 மி.லி)",
          description: "கரும்புள்ளிகளை நீக்கி சருமத்திற்கு பொலிவைத் தரும் பாதுகாப்பான ஃபேஸ் சீரம்."
        },
        ml: {
          title: "മിനിമലിസ്റ്റ് 10% വിറ്റാമിൻ സി ഫേസ് സെറം (30 മില്ലി)",
          description: "കറുത്ത പാടുകൾ അകറ്റി മുഖത്തിന് സ്വാഭാവിക തിളക്കം നൽകുന്ന സുരക്ഷിത സെറം."
        },
        kn: {
          title: "ಮಿನಿಮಲಿಸ್ಟ್ 10% ವಿಟಮಿನ್ ಸಿ ಫೇಸ್ ಸೀರಮ್ (30ml)",
          description: "ಮುಖದ ಕಲೆಗಳನ್ನು ಕಡಿಮೆ ಮಾಡಿ ನೈಸರ್ಗಿಕ ಹೊಳಪನ್ನು ನೀಡುವ ಸುರಕ್ಷಿತ ಸೀರಮ್."
        },
        mr: {
          title: "मिनिमलिस्ट 10% व्हिटॅमिन सी फेस सीरम (30ml)",
          description: "डाग कमी करून त्वचेला नैसर्गिक चमक देणारा सुरक्षित फेस सीरम."
        },
        bn: {
          title: "মিনিমালিস্ট ১০% ভিটামিন সি ফেস সিরাম (৩০ মিলি)",
          description: "দাগ-ছোপ দূর করে ত্বকে উজ্জ্বলতা এনে দেওয়ার জন্য পরীক্ষিত ও নিরাপদ সিরাম।"
        }
      }
    },
    {
      title: "Philips HL7756/00 750-Watt Mixer Grinder with 3 Stainless Steel Jars",
      slug: "philips-750-watt-mixer-grinder-3-stainless-steel-jars",
      description: "Heavy-duty Turbo motor for continuous grinding of tough Indian spices and idli/dosa batter. Advanced air ventilation system.",
      original_price: 5295,
      current_price: 3299,
      discount_percentage: 38,
      category_slug: "home-kitchen",
      subcategory_slug: "kitchen-storage-organization",
      retailer_slug: "amazon",
      image_url: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=600&auto=format&fit=crop&q=80",
      product_url: "https://www.amazon.in/dp/B07DYP67NW",
      affiliate_url: "https://www.amazon.in/dp/B07DYP67NW?tag=dealnest08-21",
      rating: 4.3,
      reviews_count: 32400,
      is_featured: 1,
      is_trending: 0,
      deal_badge: "Kitchen Bestseller",
      translations: {
        te: {
          title: "ఫిలిప్స్ 750W మిక్సర్ గ్రైండర్ (3 స్టెయిన్‌లెస్ స్టీల్ జార్లు)",
          description: "ఇడ్లీ, దోశ పిండి మరియు భారతీయ మసాలాలను వేగంగా రుబ్బే శక్తివంతమైన టర్బో మోటార్ మిక్సర్."
        },
        hi: {
          title: "फिलिप्स 750W मिक्सर ग्राइंडर (3 स्टेनलेस स्टील जार)",
          description: "भारतीय मसालों और दाल-चावल को आसानी से पीसने के लिए 750 वॉट की शक्तिशाली मोटर।"
        },
        ta: {
          title: "பிலிப்ஸ் 750W மிக்சர் கிரைண்டர் (3 எஃகு ஜாடிகளுடன்)",
          description: "கடினமான இந்திய மசாலா மற்றும் இட்லி மாவை அரைக்க சக்திவாய்ந்த டர்போ மோட்டார்."
        },
        ml: {
          title: "ഫിലിപ്സ് 750W മിക്സർ ഗ്രൈൻഡർ (3 സ്റ്റെയിൻലെസ്സ് സ്റ്റീൽ ജാറുകൾ)",
          description: "ദോശമാവും മസാലകളും എളുപ്പത്തിൽ അരയ്ക്കാൻ ശക്തമായ ടർബോ മോട്ടോർ മിക്സർ."
        },
        kn: {
          title: "ಫಿಲಿಪ್ಸ್ 750W ಮಿಕ್ಸರ್ ಗ್ರೈಂಡರ್ (3 ಸ್ಟೇನ್‌ಲೆಸ್ ಸ್ಟೀಲ್ ಜಾರ್‌ಗಳು)",
          description: "ದೋಸೆ ಹಿಟ್ಟು ಮತ್ತು ಮಸಾಲೆಗಳನ್ನು ಸುಲಭವಾಗಿ ರುಬ್ಬುವ ಶಕ್ತಿಶಾಲಿ ಟರ್ಬೊ ಮೋಟಾರ್."
        },
        mr: {
          title: "फिलिप्स 750W मिक्सर ग्राइंडर (३ स्टेनलेस स्टील जार)",
          description: "भारतीय मसाले आणि डाळ-तांदूळ सहज वाटण्यासाठी ७५० वॉटची मजबूत मोटर."
        },
        bn: {
          title: "ফিলিপস ৭৫০ ওয়াট মিক্সার গ্রাইন্ডার (৩টি স্টেইনলেস স্টিল জার)",
          description: "মশলা ও ব্যাটার সহজে ব্লেন্ড করার জন্য ৭৫০ ওয়াটের শক্তিশালী টার্বো মোটর।"
        }
      }
    },
    {
      title: "Prestige Deluxe Alpha Stainless Steel Pressure Cooker, 3 Litre",
      slug: "prestige-deluxe-alpha-stainless-steel-pressure-cooker-3-litre",
      description: "Alpha base induction and gas compatible pressure cooker with unique pressure indicator and durable silicone gasket.",
      original_price: 2750,
      current_price: 1849,
      discount_percentage: 33,
      category_slug: "home-kitchen",
      subcategory_slug: "cookware-bakeware",
      retailer_slug: "amazon",
      image_url: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop&q=80",
      product_url: "https://www.amazon.in/dp/B002P3L6VO",
      affiliate_url: "https://www.amazon.in/dp/B002P3L6VO?tag=dealnest08-21",
      rating: 4.4,
      reviews_count: 14100,
      is_featured: 1,
      is_trending: 1,
      deal_badge: "Verified Quality",
      translations: {
        te: {
          title: "ప్రెస్టీజ్ డీలక్స్ ఆల్ఫా ప్రెజర్ కుక్కర్ (3 లీటర్లు)",
          description: "గ్యాస్ మరియు ఇండక్షన్ రెండింటికీ అనువైన దృఢమైన స్టెయిన్‌లెస్ స్టీల్ కుక్కర్."
        },
        hi: {
          title: "प्रेस्टीज डीलक्स अल्फा स्टेनलेस स्टील प्रेशर कुकर (3 लीटर)",
          description: "गैस और इंडक्शन दोनों पर चलने वाला मजबूत और टिकाऊ 3 लीटर प्रेशर कुकर।"
        },
        ta: {
          title: "பிரெஸ்டீஜ் டீலக்ஸ் ஆல்பா பிரஷர் குக்கர் (3 லிட்டர்)",
          description: "எரிவாயு மற்றும் தூண்டல் இரண்டிற்கும் ஏற்ற வலுவான எஃகு குக்கர்."
        },
        ml: {
          title: "പ്രസ്റ്റീജ് ഡീലക്സ് ആൽഫ പ്രഷർ കുക്കർ (3 ലിറ്റർ)",
          description: "ഗ്യാസിലും ഇൻഡക്ഷനിലും ഉപയോഗിക്കാവുന്ന സ്റ്റെയിൻലെസ്സ് സ്റ്റീൽ കുക്കർ."
        },
        kn: {
          title: "ಪ್ರೆಸ್ಟೀಜ್ ಡೀಲಕ್ಸ್ ಆಲ್ಫಾ ಪ್ರೆಶರ್ ಕುಕ್ಕರ್ (3 ಲೀಟರ್)",
          description: "ಗ್ಯಾಸ್ ಮತ್ತು ಇಂಡಕ್ಷನ್ ಎರಡರಲ್ಲೂ ಬಳಸಬಹುದಾದ ಬಾಳಿಕೆ ಬರುವ ಕುಕ್ಕರ್."
        },
        mr: {
          title: "प्रेस्टीज डीलक्स अल्फा स्टेनलेस स्टील प्रेशर कुकर (३ लिटर)",
          description: "गॅस आणि इंडक्शन दोन्हीसाठी उपयुक्त असा मजबूत व टिकाऊ प्रेशर कुकर."
        },
        bn: {
          title: "প্রেস্টিজ ডিলাক্স আলফা স্টেইনলেস স্টিল প্রেসার কুকার (৩ লিটার)",
          description: "গ্যাস ও ইন্ডাকশন উভয়ের জন্য উপযুক্ত টেকসই ৩ লিটার প্রেসার কুকার।"
        }
      }
    },
    {
      title: "Solimo Handcrafted Wooden Wall Clock with Silent Movement (12 Inch)",
      slug: "solimo-wooden-wall-clock-12-inch-silent",
      description: "Elegant contemporary aesthetic wall clock with sweep quartz silent non-ticking mechanism for bedrooms and living rooms.",
      original_price: 1299,
      current_price: 599,
      discount_percentage: 54,
      category_slug: "home-kitchen",
      subcategory_slug: "home-decor",
      retailer_slug: "amazon",
      image_url: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600&auto=format&fit=crop&q=80",
      product_url: "https://www.amazon.in/dp/B07WGN283P",
      affiliate_url: "https://www.amazon.in/dp/B07WGN283P?tag=dealnest08-21",
      rating: 4.2,
      reviews_count: 4890,
      is_featured: 0,
      is_trending: 0,
      deal_badge: "54% OFF",
      translations: {
        te: {
          title: "సోలిమో చెక్క గోడ గడియారం (12 అంగుళాలు, సైలెంట్)",
          description: "శబ్దం లేని నిశ్శబ్ద క్వార్ట్జ్ మెకానిజం కలిగిన అందమైన ఆధునిక గోడ గడియారం."
        },
        hi: {
          title: "सोलिमो वुडन वॉल क्लॉक (12 इंच साइलेंट मूवमेंट)",
          description: "लिविंग रूम और बेडरूम के लिए सुंदर और बिना टिक-टिक आवाज करने वाली क्लासिक घड़ी।"
        },
        ta: {
          title: "சோலிமோ மரத்தாலான சுவர் கடிகாரம் (12 அங்குலம்)",
          description: "சத்தம் இல்லாத அமைதியான இயக்கத்துடன் கூடிய அழகான நவீன சுவர் கடிகாரம்."
        },
        ml: {
          title: "സോളിമോ വുഡൻ വാൾ ക്ലോക്ക് (12 ഇഞ്ച് സൈലന്റ്)",
          description: "ശബ്ദമില്ലാതെ പ്രവർത്തിക്കുന്ന മനോഹരമായ വീട്ടുപകരണ ക്ലോക്ക്."
        },
        kn: {
          title: "ಸೋಲಿಮೊ ಮರದ ವಾಲ್ ಕ್ಲಾಕ್ (12 ಇಂಚು ಸೈಲೆಂಟ್)",
          description: "ಟಿಕ್-ಟಿಕ್ ಸದ್ದು ಇಲ್ಲದ ಆಧುನಿಕ ವಿನ್ಯಾಸದ ಸುಂದರ ಗೋಡೆ ಗಡಿಯಾರ."
        },
        mr: {
          title: "सोलिमो लाकडी वॉल क्लॉक (१२ इंच सायलेंट मुव्हमेंट)",
          description: "शांत व आवाज न करता चालणारे लिव्हिंग रूमसाठी सुंदर घड्याळ."
        },
        bn: {
          title: "সোলিমো উডেন ওয়াল ক্লক (১২ ইঞ্চি সাইলেন্ট মুভমেন্ট)",
          description: "শব্দহীন নিরব সুইপ কুয়ার্টজ মেকানিজমের ক্লাসিক আধুনিক দেয়াল ঘড়ি।"
        }
      }
    },
    {
      title: "Pigeon Stainless Steel Kitchen Knives & Cutting Tools Set (Set of 6)",
      slug: "pigeon-stainless-steel-kitchen-knives-tools-set",
      description: "Razor sharp chef knives with ergonomic contoured handles and wooden storage block for precision cooking.",
      original_price: 1195,
      current_price: 549,
      discount_percentage: 54,
      category_slug: "home-kitchen",
      subcategory_slug: "kitchen-utensils-tools",
      retailer_slug: "amazon",
      image_url: "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=600&auto=format&fit=crop&q=80",
      product_url: "https://www.amazon.in/dp/B00K5H9U54",
      affiliate_url: "https://www.amazon.in/dp/B00K5H9U54?tag=dealnest08-21",
      rating: 4.3,
      reviews_count: 8900,
      is_featured: 1,
      is_trending: 1,
      deal_badge: "Kitchen Deal",
      translations: {
        te: {
          title: "పిజియన్ స్టెయిన్‌లెస్ స్టీల్ కిచెన్ కత్తుల సెట్ (6 ముక్కలు)",
          description: "కూరగాయలు మరియు పండ్లను సులభంగా కోయడానికి పదునైన చెఫ్ కత్తుల సెట్."
        },
        hi: {
          title: "पिजन स्टेनलेस स्टील किचन नाइफ और कटर सेट (6 का पैक)",
          description: "सब्जियां और फल काटने के लिए मजबूत हैंडल और लकड़ी के स्टैंड वाला चाकू सेट।"
        },
        ta: {
          title: "பீஜியன் எஃகு சமையலறை கத்திகள் செட் (6 எண்ணிக்கை)",
          description: "காய்கறிகளை எளிதாக நறுக்க கூர்மையான துருப்பிடிக்காத எஃகு கத்தி தொகுப்பு."
        },
        ml: {
          title: "പീജിയൻ സ്റ്റെയിൻലെസ്സ് സ്റ്റീൽ കത്തി സെറ്റ് (6 എണ്ണം)",
          description: "പച്ചക്കറികളും പഴങ്ങളും അരിയാൻ മൂർച്ചയുള്ള അടുക്കള കത്തി സെറ്റ്."
        },
        kn: {
          title: "ಪಿಜಿಯನ್ ಸ್ಟೇನ್‌ಲೆಸ್ ಸ್ಟೀಲ್ ಕಿಚನ್ ಚಾಕುಗಳ ಸೆಟ್ (6 ರ ಪ್ಯಾಕ್)",
          description: "ತರಕಾರಿ ಮತ್ತು ಹಣ್ಣುಗಳನ್ನು ಕತ್ತರಿಸಲು ಹರಿತವಾದ ಚಾಕುಗಳ ಗುಚ್ಛ."
        },
        mr: {
          title: "पिजन स्टेनलेस स्टील किचन सुरी सेट (६ चे पॅक)",
          description: "भाज्या आणि फळे कापण्यासाठी धारदार व मजबूत शेफ सुरी सेट."
        },
        bn: {
          title: "পিজিয়ন স্টেইনলেস স্টিল কিচেন ছুরি সেট (৬টি প্যাক)",
          description: "শাকসবজি কাটার জন্য অত্যন্ত ধারালো ও আরামদায়ক হ্যান্ডেলযুক্ত ছুরির সেট।"
        }
      }
    },
    {
      title: "Atomic Habits: An Easy & Proven Way to Build Good Habits (Paperback)",
      slug: "atomic-habits-james-clear-paperback",
      description: "Worldwide #1 multi-million copy bestseller by James Clear. Practical strategies for building good habits and remarkable results.",
      original_price: 799,
      current_price: 399,
      discount_percentage: 50,
      category_slug: "others",
      subcategory_slug: "books-stationery",
      retailer_slug: "amazon",
      image_url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80",
      product_url: "https://www.amazon.in/dp/1847941834",
      affiliate_url: "https://www.amazon.in/dp/1847941834?tag=dealnest08-21",
      rating: 4.8,
      reviews_count: 89000,
      is_featured: 1,
      is_trending: 1,
      deal_badge: "All-Time Bestseller",
      translations: {
        te: {
          title: "అటామిక్ హ్యాబిట్స్ (జేమ్స్ క్లియర్ - పుస్తకం)",
          description: "మంచి అలవాట్లను పెంపొందించుకోవడానికి మరియు జీవితంలో గొప్ప విజయాలు సాధించడానికి ఉత్తమ పుస్తకం."
        },
        hi: {
          title: "एटॉमिक हैबिट्स (जेम्स क्लियर - बेस्टसेलर किताब)",
          description: "अच्छी आदतें बनाने और बुरी आदतें छोड़ने के लिए विश्वप्रसिद्ध प्रेरणादायक पुस्तक।"
        },
        ta: {
          title: "அட்டாமிக் ஹாபிட்ஸ் (ஜேம்ஸ் க்ளியர் - புத்தகம்)",
          description: "நல்ல பழக்கங்களை உருவாக்கவும் வெற்றியை அடையவும் உலகப் புகழ்பெற்ற புத்தகம்."
        },
        ml: {
          title: "അറ്റോമിക് ഹാബിറ്റ്സ് (ജെയിംസ് ക്ലിയർ - പുസ്തകം)",
          description: "നല്ല ശീലങ്ങൾ വളർത്താനും ജീവിതവിജയം നേടാനും സഹായിക്കുന്ന പുസ്തകം."
        },
        kn: {
          title: "ಅಟಾಮಿಕ್ ಹ್ಯಾಬಿಟ್ಸ್ (ಜೇಮ್ಸ್ ಕ್ಲಿಯರ್ - ಪುಸ್ತಕ)",
          description: "ಉತ್ತಮ ಅಭ್ಯಾಸಗಳನ್ನು ಬೆಳೆಸಿಕೊಳ್ಳಲು ಜಗತ್ಪ್ರಸಿದ್ಧ ಮಾರ್ಗದರ್ಶಿ ಪುಸ್ತಕ."
        },
        mr: {
          title: "अ‍ॅटोमिक हॅबिट्स (जेम्स क्लिअर - बेस्टसेलर पुस्तक)",
          description: "चांगल्या सवयी लावण्यासाठी आणि ध्येय गाठण्यासाठी जागतिक प्रसिद्ध पुस्तक."
        },
        bn: {
          title: "অ্যাটমিক হ্যাবিটস (জেমস ক্লিয়ার - বই)",
          description: "ভালো অভ্যাস গড়ে তুলতে এবং জীবনে সাফল্য অর্জনের জন্য বিশ্বসেরা বই।"
        }
      }
    },
    {
      title: "Boldfit High Density EVA Foam Yoga Mat with Carrying Strap (6mm)",
      slug: "boldfit-high-density-foam-yoga-mat-6mm",
      description: "Non-slip anti-tear exercise and yoga mat with dual-sided grip texture. Lightweight and easy to clean.",
      original_price: 1499,
      current_price: 699,
      discount_percentage: 53,
      category_slug: "others",
      subcategory_slug: "sports-fitness",
      retailer_slug: "amazon",
      image_url: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&auto=format&fit=crop&q=80",
      product_url: "https://www.amazon.in/dp/B08GY19S6V",
      affiliate_url: "https://www.amazon.in/dp/B08GY19S6V?tag=dealnest08-21",
      rating: 4.4,
      reviews_count: 12300,
      is_featured: 0,
      is_trending: 1,
      deal_badge: "Fitness Choice",
      translations: {
        te: {
          title: "బోల్డ్‌ఫిట్ యోగా మ్యాట్ (6mm స్ట్రాప్‌తో)",
          description: "వ్యాయామం మరియు యోగా కోసం జారిపోని మన్నికైన వాటర్‌ప్రూఫ్ మ్యాట్."
        },
        hi: {
          title: "बोल्डफिट हाई डेंसिटी योगा मैट (6mm कैरी स्ट्रैप के साथ)",
          description: "घर और जिम में कसरत के लिए नॉन-स्लिप, टिकाऊ और आरामदायक वाटरप्रूफ योगा मैट।"
        },
        ta: {
          title: "போல்ட்ஃபிட் யோகா மேட் (6மிமீ ஸ்ட்ராப்புடன்)",
          description: "உடற்பயிற்சி மற்றும் யோகா செய்ய வழுக்காத நீடித்த யோகா மேட்."
        },
        ml: {
          title: "ബോൾഡ്ഫിറ്റ് യോഗ മാറ്റ് (6mm സ്ട്രാപ്പ് സഹിതം)",
          description: "വ്യായാമത്തിനും യോഗയ്ക്കും അനുയോജ്യമായ നോൺ-സ്ലിപ്പ് വാട്ടർപ്രൂഫ് മാറ്റ്."
        },
        kn: {
          title: "ಬೋಲ್ಡ್‌ಫಿಟ್ ಯೋಗ ಮ್ಯಾಟ್ (6mm ಸ್ಟ್ರಾಪ್‌ನೊಂದಿಗೆ)",
          description: "ದೈನಂದಿನ ಕಸರತ್ತು ಮತ್ತು ಯೋಗಕ್ಕಾಗಿ ಜಾರದ ಬಾಳಿಕೆ ಬರುವ ಮ್ಯಾಟ್."
        },
        mr: {
          title: "बोल्डफिट योगा मॅट (६mm कॅरी स्ट्रॅपसह)",
          description: "घर आणि जिममध्ये व्यायामासाठी नॉन-स्लिप व आरामदायक वॉटरप्रूफ मॅट."
        },
        bn: {
          title: "বোল্ডফিট হাই ডেনসিটি ইয়োগা ম্যাট (৬মিমি স্ট্র্যাপসহ)",
          description: "ব্যায়াম ও যোগাসনের জন্য নন-স্লিপ, টেকসই ও আরামদায়ক ওয়াটারপ্রুফ ম্যাট।"
        }
      }
    },
    {
      title: "Safari Thorium Neo 55cm Cabin Luggage Trolley Bag (Hard Body)",
      slug: "safari-thorium-neo-55cm-cabin-trolley-bag",
      description: "Scratch-resistant lightweight polycarbonate cabin suitcase with 360-degree silent spinner wheels and fixed number lock.",
      original_price: 7499,
      current_price: 2199,
      discount_percentage: 71,
      category_slug: "others",
      subcategory_slug: "travel-accessories",
      retailer_slug: "flipkart",
      image_url: "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=600&auto=format&fit=crop&q=80",
      product_url: "https://www.flipkart.com/safari-trolley-55cm",
      affiliate_url: "https://www.flipkart.com/safari-trolley-55cm?affid=affdealnest",
      rating: 4.5,
      reviews_count: 9800,
      is_featured: 1,
      is_trending: 1,
      deal_badge: "Mega Travel Offer 71% OFF",
      translations: {
        te: {
          title: "సఫారి థోరియం నియో 55cm క్యాబిన్ ట్రాలీ బ్యాగ్",
          description: "తేలికైన, గట్టి పాలికార్బోనేట్ కేబిన్ సూట్‌కేస్. 360 డిగ్రీల వీల్స్ మరియు నంబర్ లాక్‌తో."
        },
        hi: {
          title: "सफारी थोरियम नियो 55cm केबिन ट्रॉली बैग (हार्ड बॉडी)",
          description: "हवाई यात्रा के लिए मजबूत पॉलीकार्बोनेट केबिन सूटकेस, 360 डिग्री पहिये और नंबर लॉक।"
        },
        ta: {
          title: "சஃபாரி தோரியம் நியோ 55 செ.மீ கேபின் ட்ரோலி பேக்",
          description: "விமான பயணத்திற்கான இலகுரக பாலிகார்பனேட் சூட்கேஸ், 360 டிகிரி சுழலும் சக்கரங்களுடன்."
        },
        ml: {
          title: "സഫാരി തോറിയം നിയോ 55cm ട്രോളി ബാഗ്",
          description: "യാത്രകൾക്കായി കനംകുറഞ്ഞ പോളികാർബണേറ്റ് ഹാർഡ് ബോഡി സ്യൂട്ട്കേസ്."
        },
        kn: {
          title: "ಸಫಾರಿ ಥೋರಿಯಮ್ ನಿಯೋ 55cm ಕ್ಯಾಬಿನ್ ಟ್ರಾಲಿ ಬ್ಯಾಗ್",
          description: "ಪ್ರಯಾಣಕ್ಕಾಗಿ ಹಗುರವಾದ ಮತ್ತು ಗಟ್ಟಿಮುಟ್ಟಾದ 360 ಡಿಗ್ರಿ ಚಕ್ರಗಳ ಸೂಟ್‌ಕೇಸ್."
        },
        mr: {
          title: "सफारी थोरियम निओ ५५ सेमी केबिन ट्रॉली बॅग",
          description: "प्रवासासाठी मजबूत पॉलीकार्बोनेट केबिन सूटकेस, ३६० डिग्री फिरणारी चाके."
        },
        bn: {
          title: "সাফারি থোরিয়াম নিও ৫৫ সেমি কেবিন ট্রলি ব্যাগ",
          description: "ভ্রমণের জন্য হালকা ও টেকসই পলিকার্বোনেট কেবিন স্যুটকেস, ৩৬০ ডিগ্রি চাকাযুক্ত।"
        }
      }
    }
  ];

  for (const deal of dealsData) {
    const catId = catMap[deal.category_slug];
    const subId = deal.subcategory_slug ? subMap[deal.subcategory_slug] : null;
    const retId = retMap[deal.retailer_slug];

    const existingDeal = db.prepare('SELECT id FROM deals WHERE slug = ?').get(deal.slug);
    let dealId;

    if (!existingDeal) {
      const result = insertDeal.run(
        deal.title,
        deal.slug,
        deal.description,
        deal.original_price,
        deal.current_price,
        deal.discount_percentage,
        catId,
        subId,
        retId,
        deal.image_url,
        deal.product_url,
        deal.affiliate_url,
        deal.rating,
        deal.reviews_count,
        deal.is_featured,
        deal.is_trending,
        1,
        deal.deal_badge
      );
      dealId = Number(result.lastInsertRowid);
    } else {
      dealId = existingDeal.id;
      db.prepare(`
        UPDATE deals SET
          category_id = ?,
          subcategory_id = ?,
          original_price = ?,
          current_price = ?,
          discount_percentage = ?,
          deal_badge = ?,
          is_featured = ?,
          is_trending = ?,
          is_active = 1
        WHERE id = ?
      `).run(
        catId,
        subId,
        deal.original_price,
        deal.current_price,
        deal.discount_percentage,
        deal.deal_badge,
        deal.is_featured,
        deal.is_trending,
        dealId
      );
    }

    if (deal.translations) {
      for (const [lang, trans] of Object.entries(deal.translations)) {
        insertTranslation.run(dealId, lang, trans.title, trans.description);
      }
    }
  }

  console.log(`Seeded/Updated hierarchical deals with 8-language translations.`);
}

export default db;
