const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('=== DealNest India Full-Stack Integration Test Suite ===\n');
  let passed = 0;
  let failed = 0;

  async function assert(desc, condition) {
    if (condition) {
      console.log(`✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${desc}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const health = await healthRes.json();
    await assert('Health check status is ok', health.status === 'ok');

    // 2. Fetch categories and subcategories
    const catRes = await fetch(`${BASE_URL}/api/categories`);
    const catData = await catRes.json();
    await assert('Categories exist and have subcategories', catData.categories.length >= 5 && catData.categories[0].subcategories.length > 0);

    // 3. Retailers
    const retRes = await fetch(`${BASE_URL}/api/categories/retailers`);
    const retData = await retRes.json();
    await assert('Retailers list contains Amazon and Flipkart', retData.retailers.some(r => r.slug === 'amazon') && retData.retailers.some(r => r.slug === 'flipkart'));

    // 4. Deals list in English
    const dealsRes = await fetch(`${BASE_URL}/api/deals?lang=en`);
    const dealsData = await dealsRes.json();
    await assert('Deals endpoint returns seeded deals in English', dealsData.deals.length >= 12);

    // 5. Deals list with Telugu localization
    const teDealsRes = await fetch(`${BASE_URL}/api/deals?lang=te`);
    const teDealsData = await teDealsRes.json();
    const teFirst = teDealsData.deals.find(d => d.slug.includes('oneplus'));
    await assert('Telugu deals endpoint returns localized Telugu title', teFirst && teFirst.display_title.includes('వన్‌ప్లస్'));

    // 6. Deals list with Hindi localization
    const hiDealsRes = await fetch(`${BASE_URL}/api/deals?lang=hi`);
    const hiDealsData = await hiDealsRes.json();
    const hiFirst = hiDealsData.deals.find(d => d.slug.includes('oneplus'));
    await assert('Hindi deals endpoint returns localized Hindi title', hiFirst && hiFirst.display_title.includes('वनप्लस'));

    // 7. Search filter test
    const searchRes = await fetch(`${BASE_URL}/api/deals?search=OnePlus`);
    const searchData = await searchRes.json();
    await assert('Search for "OnePlus" returns matching deals', searchData.deals.length > 0 && searchData.deals[0].title.toLowerCase().includes('oneplus'));

    // 8. Category filter test
    const catFilterRes = await fetch(`${BASE_URL}/api/deals?category=electronics-tech`);
    const catFilterData = await catFilterRes.json();
    await assert('Category filter for electronics-tech works', catFilterData.deals.every(d => d.category_slug === 'electronics-tech'));

    // 9. User Authentication - Login as Demo Admin
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@dealnest.in', password: 'Admin@DealNest2026' })
    });
    const adminAuth = await adminLoginRes.json();
    await assert('Admin login returns JWT token and admin role', adminLoginRes.ok && adminAuth.user.role === 'admin' && Boolean(adminAuth.token));

    const adminToken = adminAuth.token;

    // 10. Admin Stats endpoint
    const statsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const statsData = await statsRes.json();
    await assert('Admin stats returns product counts and click metrics', statsRes.ok && statsData.stats.totalDeals >= 12);

    // 11. Wishlist Operations for User
    const userLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'priya@example.com', password: 'User@DealNest2026' })
    });
    const userAuth = await userLoginRes.json();
    const userToken = userAuth.token;

    const firstDealId = dealsData.deals[0].id;

    // Add to wishlist
    const addWishRes = await fetch(`${BASE_URL}/api/wishlist/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ deal_id: firstDealId })
    });
    await assert('Add deal to user wishlist succeeds', addWishRes.ok);

    // Get wishlist
    const getWishRes = await fetch(`${BASE_URL}/api/wishlist`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const wishData = await getWishRes.json();
    await assert('Wishlist contains saved deal', wishData.wishlist.some(w => w.id === firstDealId));

    // 12. Outbound Affiliate Click tracking
    const redirectRes = await fetch(`${BASE_URL}/api/deals/${firstDealId}/redirect?mode=json`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const redirectData = await redirectRes.json();
    await assert('Deal outbound redirect returns affiliate destination URL', redirectRes.ok && Boolean(redirectData.target_url));

    // Check click recorded in admin stats
    const statsAfterClickRes = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const statsAfter = await statsAfterClickRes.json();
    await assert('Outbound click incremented in admin analytics', statsAfter.stats.totalClicks > 0);

    // 13. Admin Deal Status Toggle
    const toggleRes = await fetch(`${BASE_URL}/api/admin/deals/${firstDealId}/toggle`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ field: 'is_featured' })
    });
    await assert('Admin status toggle succeeds', toggleRes.ok);

    // 14. Non-admin blocked from admin endpoints
    const forbiddenRes = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    await assert('Non-admin user forbidden from admin endpoints (HTTP 403)', forbiddenRes.status === 403);

    // 15. Admin login with identifier "Sai Krishna Chikkala"
    const saiAdminRes = await fetch(`${BASE_URL}/api/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'Sai Krishna Chikkala', password: 'Admin@DealNest2026' })
    });
    const saiAuth = await saiAdminRes.json();
    await assert('Admin login with identifier "Sai Krishna Chikkala" succeeds with admin role', saiAdminRes.ok && saiAuth.user.role === 'admin' && Boolean(saiAuth.token));

    // 16. Admin login with invalid credentials fails
    const invalidAdminRes = await fetch(`${BASE_URL}/api/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'Sai Krishna Chikkala', password: 'WrongPassword' })
    });
    await assert('Admin login with wrong password fails with HTTP 401', invalidAdminRes.status === 401);

    // 17. Ordinary user prevented from registering with admin name/email
    const hijackRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Sai Krishna Chikkala', email: 'admin@dealnest.in', password: 'SecretPassword123' })
    });
    await assert('Ordinary registration with admin credentials is forbidden (HTTP 403)', hijackRes.status === 403);

    // 18. User registration with website-specific password
    const testEmail = `shopper_${Date.now()}@example.com`;
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Rohit Verma', email: testEmail, password: 'RohitWebsitePassword2026', preferred_language: 'te' })
    });
    const regData = await regRes.json();
    await assert('User registration with website password succeeds with user role', regRes.status === 201 && regData.user.role === 'user' && Boolean(regData.token));

    // 19. Wishlist Privacy: New user has isolated private wishlist
    const newWishRes = await fetch(`${BASE_URL}/api/wishlist`, {
      headers: { Authorization: `Bearer ${regData.token}` }
    });
    const newWishData = await newWishRes.json();
    await assert('New user wishlist is completely private (0 items from other users)', newWishRes.ok && newWishData.wishlist.length === 0);

    // 20. Forgot Password & Reset Password Flow
    const forgotRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    const forgotData = await forgotRes.json();
    await assert('Forgot password generates secure reset token', forgotRes.ok && Boolean(forgotData.resetToken));

    const resetRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, token: forgotData.resetToken, newPassword: 'BrandNewPassword2026' })
    });
    await assert('Reset password updates user password successfully', resetRes.ok);

    // Login with new password
    const newLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'BrandNewPassword2026' })
    });
    await assert('Login with new reset password succeeds', newLoginRes.ok);

    console.log(`\n================================`);
    console.log(`Results: ${passed} Passed, ${failed} Failed`);
    console.log(`================================`);
  } catch (err) {
    console.error('Test suite error:', err);
  }
}

runTests();
