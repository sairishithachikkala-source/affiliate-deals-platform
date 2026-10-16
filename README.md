# DealNest India — Multilingual Indian Affiliate Deals Platform

**DealNest India** is a modern, responsive, and secure affiliate deals and discovery platform built specifically for Indian consumers. It aggregates verified offers and genuine discounts from popular Indian e-commerce retailers like **Amazon India**, **Flipkart**, **Myntra**, **Tata CLiQ**, and **Croma**, making smart shopping accessible across **8 Indian languages**.

---

## 🌟 Key Features

### 1. First-Class Multilingual Indian Language Support
- **Default Language**: Loads in English (`en`) on first visit.
- **Immediate Language Selector**: Positioned prominently in the top header (desktop and mobile) above the fold with native script names:
  1. **English** (Default)
  2. **తెలుగు** (Telugu)
  3. **हिन्दी** (Hindi)
  4. **தமிழ்** (Tamil)
  5. **മലയാളം** (Malayalam)
  6. **ಕನ್ನಡ** (Kannada)
  7. **मराठी** (Marathi)
  8. **বাংলা** (Bengali)
- **Instant Reactive Switching**: Zero page reload required. Switching languages instantly updates navigation, hero banners, category names, search placeholders, filter labels, deal discounts, wishlist buttons, authentication forms, and footers.
- **Language Persistence**: Saved in browser `localStorage` for visitors, and automatically synchronized to the user's database profile upon login.
- **Native Typography Fallbacks**: Seamless rendering of Indian scripts using Google Fonts (`Noto Sans Devanagari`, `Noto Sans Telugu`, `Noto Sans Tamil`, `Noto Sans Malayalam`, `Noto Sans Kannada`, `Noto Sans Bengali`, and `Inter`).

### 2. High-Converting Affiliate Marketing System
- **Outbound Click Tracker**: Every click on **View Deal** routes through `/api/deals/:id/redirect`, recording timestamp, retailer, user agent, and IP address before safely redirecting with `rel="nofollow sponsored noopener noreferrer"`.
- **Separate Affiliate & Product URLs**: Supports direct URLs as well as specific affiliate tracking tags (`tag=...` or `affid=...`).
- **Affiliate Transparency & Disclosures**: Embedded mini disclosures on deal cards, modals, footer, and a dedicated [Affiliate Disclosure Page](file:///c:/Users/sairi/OneDrive/Documents/Affiliate%20Marketing/src/pages/AffiliateDisclosurePage.tsx) compliant with ASCI guidelines and the Consumer Protection (E-Commerce) Rules, 2020.

### 3. Categories & Filtering
- **Main Categories**:
  - Electronics & Tech
  - Fashion & Accessories
  - Beauty & Personal Care
  - Home & Kitchen
  - Others (Home Decor, Books, Stationery, Sports & Fitness, Toys & Games, Travel Accessories, and more)
- **Filters**: Filter by category, subcategory, retailer, price range, and minimum discount (20%+, 40%+, 60%+).
- **Sorting**: Featured & Popular, Highest Discount %, Price: Low to High, Price: High to Low, Top Rating, Newest Deals.

### 4. Real User Accounts & Persistent Wishlist
- **Authentication**: JWT token-based authentication with bcrypt password hashing.
- **Persistent Wishlist**: Stored in SQLite database (`wishlist` table) per user with data isolation.
- **Guest Support**: Visitors can also bookmark deals locally; logging in syncs their items.

### 5. Private Protected Admin Portal (`/admin`)
- **Strict Role-Based Authorization**: Blocked to standard users (HTTP 403 Forbidden).
- **Dashboard Metrics**: Real-time counts of Total Deals, Active Deals, Total Outbound Clicks, and Wishlist Saves.
- **Product Management (CRUD)**: Add new deals, edit prices, calculate discounts, toggle active/featured/trending, manage affiliate tags, and add localized descriptions.
- **Analytics Log**: Live log of recent outbound affiliate clicks.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, React Router 7, Vite 8, Lucide React Icons |
| **Backend** | Node.js (v24), Express 5, CORS, JSONWebToken, BcryptJS |
| **Database** | Built-in `node:sqlite` (`DatabaseSync`) — Synchronous, ACID-compliant, zero native C++ build tool dependencies |
| **Styling** | Vanilla CSS Design System with CSS Variables, responsive mobile layouts, and Google Fonts |

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v22.x or v24.x recommended)
- Windows PowerShell / Bash

### 1. Install Dependencies
```bash
npm.cmd install
```

### 2. Start the Application
To run the production server (serves both API and frontend SPA at `http://localhost:5000`):
```bash
npm.cmd start
```

To run in concurrent development mode (Vite frontend on `http://localhost:5173` with proxy to Express backend on `http://localhost:5000`):
```bash
npm.cmd run dev
```

### 3. Build the Frontend
```bash
npm.cmd run build
```

---

## 🔐 Pre-Seeded Default Accounts

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@dealnest.in` | `Admin@DealNest2026` |
| **Demo User** | `priya@example.com` | `User@DealNest2026` |

> Both login forms include handy one-click **"Fill Admin Creds"** and **"Fill User Creds"** buttons for rapid verification.

---

## 🗄️ Database Architecture (`data/dealnest.db`)

The database is initialized automatically with WAL mode enabled.

- `users`: ID, name, email, hashed password, role (`admin` or `user`), preferred language, timestamps.
- `categories` & `subcategories`: Hierarchical categories with localized translation keys and ordering.
- `retailers`: Name, logo URL, website URL, default affiliate tag, brand badge color.
- `deals`: Title, slug, description, MRP, deal price, discount %, category ID, retailer ID, image URL, direct URL, affiliate tracking URL, rating, reviews count, click count, status flags.
- `deal_translations`: Localized titles and descriptions for Telugu (`te`), Hindi (`hi`), Tamil (`ta`), etc.
- `wishlist`: User-isolated deal bookmarks.
- `clicks`: Outbound click analytics with deal ID, retailer ID, timestamp, and user agent.

---

## 🧪 Automated Integration Tests

A comprehensive integration test suite verifies all features:
```bash
node test_all.js
```
Expected output: **16 Passed, 0 Failed**.
