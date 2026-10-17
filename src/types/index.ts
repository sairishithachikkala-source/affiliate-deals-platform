export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  preferred_language: string;
  created_at?: string;
}

export interface Category {
  id: number;
  slug: string;
  name_key: string;
  default_name: string;
  icon?: string;
  description?: string;
  image_url?: string;
  order_index: number;
  is_active?: number | boolean;
  deals_count?: number;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: number;
  category_id: number;
  slug: string;
  name_key: string;
  default_name: string;
  description?: string;
  image_url?: string;
  icon?: string;
  order_index: number;
  is_active?: number | boolean;
  deals_count?: number;
}

export interface Retailer {
  id: number;
  name: string;
  slug: string;
  logo_url?: string;
  website_url: string;
  affiliate_tag?: string;
  badge_color?: string;
  deals_count?: number;
}

export interface DealTranslation {
  language_code: string;
  title: string;
  description: string;
}

export interface Deal {
  id: number;
  title: string;
  display_title?: string;
  slug: string;
  description?: string;
  display_description?: string;
  original_price: number;
  current_price: number;
  discount_percentage: number;
  category_id: number;
  category_slug?: string;
  category_name_key?: string;
  category_default_name?: string;
  category_name?: string;
  subcategory_id?: number;
  subcategory_slug?: string;
  subcategory_name_key?: string;
  subcategory_default_name?: string;
  subcategory_name?: string;
  retailer_id: number;
  retailer_name: string;
  retailer_slug?: string;
  retailer_logo?: string;
  retailer_website?: string;
  retailer_badge_color?: string;
  image_url: string;
  product_url: string;
  affiliate_url?: string;
  rating: number;
  reviews_count: number;
  is_featured: number | boolean;
  is_trending: number | boolean;
  is_active: number | boolean;
  deal_badge?: string;
  click_count?: number;
  created_at?: string;
  updated_at?: string;
  available_translations?: DealTranslation[];
}

export interface WishlistItem extends Deal {
  wishlist_id: number;
  saved_at: string;
}

export interface AdminStats {
  totalDeals: number;
  activeDeals: number;
  featuredDeals: number;
  totalCategories: number;
  totalRetailers: number;
  totalUsers: number;
  totalWishlistSaves: number;
  totalClicks: number;
}

export interface ClickLog {
  id: number;
  created_at: string;
  deal_title: string;
  current_price: number;
  retailer_name: string;
  user_agent?: string;
}
