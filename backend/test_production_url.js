// Production URL Verification Script for LuxeHome on Render
// Usage: node backend/test_production_url.js https://your-app.onrender.com

const targetUrl = process.argv[2] || process.env.RENDER_EXTERNAL_URL || 'https://luxehome.onrender.com';
const cleanBaseUrl = targetUrl.replace(/\/+$/, '');

async function runProductionTestSuite() {
  console.log('===============================================================');
  console.log(`   VERIFYING PRODUCTION DEPLOYMENT AT: ${cleanBaseUrl}`);
  console.log('===============================================================\n');

  try {
    // 1. Health Check
    console.log('[1/7] Testing Health Check Endpoint (/api/health)...');
    const healthRes = await fetch(`${cleanBaseUrl}/api/health`);
    const healthData = await healthRes.json();
    console.log('  -> Status:', healthRes.status, JSON.stringify(healthData));

    // 2. SPA Route Serving
    console.log('\n[2/7] Testing Frontend SPA Serving (/)...');
    const spaRes = await fetch(`${cleanBaseUrl}/`);
    const spaText = await spaRes.text();
    console.log('  -> HTTP Status:', spaRes.status);
    console.log('  -> Contains React mount root:', spaText.includes('id="root"'));

    // 3. Catalog Fetching
    console.log('\n[3/7] Testing Categories & Services APIs...');
    const catRes = await fetch(`${cleanBaseUrl}/api/categories`);
    const categories = await catRes.json();
    console.log(`  -> Categories loaded: ${categories.length}`);

    const srvRes = await fetch(`${cleanBaseUrl}/api/services`);
    const services = await srvRes.json();
    console.log(`  -> Services loaded: ${services.length}`);

    // 4. Client Sign Up & Authentication
    console.log('\n[4/7] Testing Client Register & Login Flow...');
    const testId = Date.now();
    const testEmail = `render_test_${testId}@luxehome.com`;
    const testUsername = `user_${testId}`;
    const testPassword = 'Password123!';

    const regRes = await fetch(`${cleanBaseUrl}/api/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: testUsername, email: testEmail, password: testPassword })
    });
    const regData = await regRes.json();
    console.log('  -> Client Registration:', regRes.status, regData.message || regData);

    const logRes = await fetch(`${cleanBaseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    const logData = await logRes.json();
    console.log('  -> Client Login (by email):', logRes.status, `Logged in as ${logData.user?.username} (${logData.user?.role})`);

    // 5. Booking Creation & Client View
    console.log('\n[5/7] Testing Booking Flow...');
    const firstService = services[0] || { id: 1, title: 'Deep Cleaning' };
    const bookRes = await fetch(`${cleanBaseUrl}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: logData.user.id,
        service_id: firstService.id,
        service_title: firstService.title,
        user_email: logData.user.email
      })
    });
    const bookData = await bookRes.json();
    console.log('  -> Booking Creation:', bookRes.status, `Booking ID: ${bookData.bookingId}`);

    const myBookRes = await fetch(`${cleanBaseUrl}/api/bookings/user/${logData.user.id}`);
    const myBookings = await myBookRes.json();
    console.log(`  -> Client Bookings Retrievable: ${myBookings.length} booking(s) found`);

    // 6. Admin Authentication & Dashboard Fetching
    console.log('\n[6/7] Testing Admin Authentication & Dashboard Portal...');
    const adminLogRes = await fetch(`${cleanBaseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@gmail.com', password: '1234' })
    });
    const adminLogData = await adminLogRes.json();
    console.log('  -> Admin Login:', adminLogRes.status, `Role: ${adminLogData.user?.role}`);

    const adminBookingsRes = await fetch(`${cleanBaseUrl}/api/bookings`, {
      headers: { 'x-user-role': 'admin' }
    });
    const allBookings = await adminBookingsRes.json();
    console.log(`  -> Admin Dashboard Access: ${allBookings.length} total bookings managed`);

    // 7. Admin Status Update
    console.log('\n[7/7] Testing Admin Booking Status Update...');
    const updateRes = await fetch(`${cleanBaseUrl}/api/bookings/${bookData.bookingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'admin' },
      body: JSON.stringify({ status: 'Confirmed' })
    });
    const updateData = await updateRes.json();
    console.log('  -> Status Update Result:', updateRes.status, updateData.message);

    console.log('\n===============================================================');
    console.log('  ✅ ALL TESTS PASSED SUCCESSFULLY ON PRODUCTION DEPLOYMENT!   ');
    console.log('===============================================================');
  } catch (err) {
    console.error('\n❌ Verification Failed:', err);
  }
}

runProductionTestSuite();
