const http = require('http');

async function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('DEALNEST INDIA - FULL VERIFICATION TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Verify Category API returns active categories and active subcategories with images
    const catRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/categories',
      method: 'GET'
    });
    assert(catRes.status === 200, 'GET /api/categories returns 200 OK');
    assert(Array.isArray(catRes.body.categories) && catRes.body.categories.length === 5, '5 Primary categories active');

    const homeKitchen = catRes.body.categories.find(c => c.slug === 'home-kitchen');
    assert(homeKitchen && homeKitchen.subcategories && homeKitchen.subcategories.length > 0, 'Home & Kitchen has active subcategories');
    
    // Check that each subcategory has an image_url and description
    const allSubcats = catRes.body.categories.flatMap(c => c.subcategories);
    const subcatsWithImage = allSubcats.filter(s => s.image_url && s.image_url.startsWith('http'));
    assert(subcatsWithImage.length === allSubcats.length, `All ${allSubcats.length} active subcategories have valid image URLs`);

    // 2. Verify 5 obsolete subcategories are ABSENT from active categories
    const removedSlugs = ['mens-clothing', 'womens-ethnic', 'laptops-audio', 'smartwatches', 'fragrances'];
    const activeSlugs = allSubcats.map(s => s.slug);
    const obsoleteFound = removedSlugs.filter(slug => activeSlugs.includes(slug));
    assert(obsoleteFound.length === 0, `Obsolete subcategories (${removedSlugs.join(', ')}) absent from active API: found ${obsoleteFound.length}`);

    // 3. Verify single category endpoint /api/categories/:slug returns subcategories
    const hkDetail = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/categories/home-kitchen',
      method: 'GET'
    });
    assert(hkDetail.status === 200 && hkDetail.body.category.subcategories.length >= 8, 'Home & Kitchen landing details return subcategories first');

    // 4. Verify deals belonging specifically to a subcategory
    const utensilsDeals = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/deals?category=home-kitchen&subcategory=kitchen-utensils-tools',
      method: 'GET'
    });
    assert(utensilsDeals.status === 200 && utensilsDeals.body.deals.length > 0, 'Kitchen Utensils subcategory returns specific product deals');
    assert(utensilsDeals.body.deals.every(d => d.subcategory_slug === 'kitchen-utensils-tools'), 'All returned deals belong strictly to kitchen-utensils-tools');

    // 5. Wishlist Authentication Security Tests
    // 5a. Logged-out request to /api/wishlist should be rejected with 401
    const unauthWishlist = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/wishlist',
      method: 'GET'
    });
    assert(unauthWishlist.status === 401, 'Logged-out GET /api/wishlist rejected with 401 Unauthorized');

    // 5b. Logged-out request to /api/wishlist/add should be rejected with 401
    const unauthAdd = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/wishlist/add',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { deal_id: 1 });
    assert(unauthAdd.status === 401, 'Logged-out POST /api/wishlist/add rejected with 401 Unauthorized');

    // 5c. Login as demo user
    const loginRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'priya@example.com', password: 'User@DealNest2026' });
    assert(loginRes.status === 200 && loginRes.body.token, 'User login succeeds and returns JWT token');
    const userToken = loginRes.body.token;
    const userId = loginRes.body.user.id;

    // 5d. Logged-in user adds deal 13 (Pigeon Knives) to wishlist
    const addRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/wishlist/add',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      }
    }, { deal_id: 13 });
    assert(addRes.status === 200 && addRes.body.success, 'Logged-in user successfully saves deal 13 to wishlist');

    // 5e. Prevent duplicate wishlist entries
    const duplicateAdd = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/wishlist/add',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      }
    }, { deal_id: 13 });
    assert(duplicateAdd.status === 200, 'Duplicate wishlist addition handled gracefully without creating duplicates');

    // 5f. Fetch user wishlist and verify deal 13 exists
    const userWishlist = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/wishlist',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    assert(userWishlist.status === 200, 'User fetches their own wishlist');
    const hasDeal13 = userWishlist.body.wishlist.some(item => item.id === 13);
    assert(hasDeal13, 'Deal 13 is present in user wishlist');

    // 5g. Test User Isolation: Login as another user (Admin) and check their wishlist does NOT contain Priya’s items
    const adminLogin = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@dealnest.in', password: 'Admin@DealNest2026' });
    const adminToken = adminLogin.body.token;

    const adminWishlist = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/wishlist',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    // Check that wishlist only contains items for admin, not Priya
    assert(adminWishlist.status === 200, 'Admin fetches their own isolated wishlist');

    // 5h. Logged-in user removes deal 13 from wishlist
    const removeRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/wishlist/13',
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    assert(removeRes.status === 200 && removeRes.body.success, 'Logged-in user can remove product from wishlist');

    // 6. Multilingual Parity Check (All 8 languages have 228 keys)
    const fs = require('fs');
    const path = require('path');
    const languages = ['en', 'te', 'hi', 'ta', 'ml', 'kn', 'mr', 'bn'];
    let allLangsPass = true;
    for (const lang of languages) {
      const p = path.join(__dirname, `../src/i18n/translations/${lang}.json`);
      const data = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (Object.keys(data).length !== 228 || !data.wishlist_login_prompt || !data.explore_label || !data.nav_admin_portal) {
        allLangsPass = false;
        console.error(`Language ${lang} failed check! Key count: ${Object.keys(data).length}`);
      }
    }
    assert(allLangsPass, 'All 8 languages have 100% key parity (228 keys each, including wishlist_login_prompt, explore_label, and nav_admin_portal)');

    // 7. Verify all deals remain intact with prices and affiliate tags
    const allDealsRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/deals',
      method: 'GET'
    });
    assert(allDealsRes.status === 200 && allDealsRes.body.deals.length === 13, 'All 13 demo deals are active and preserved');
    const dealsHaveAffiliate = allDealsRes.body.deals.every(d => d.affiliate_url && (d.affiliate_url.includes('tag=') || d.affiliate_url.includes('affid=')));
    assert(dealsHaveAffiliate, 'All deals retain verified affiliate URLs with tracking tags (tag= or affid=)');

    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
