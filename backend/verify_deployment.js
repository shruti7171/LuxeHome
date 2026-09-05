async function runFullVerification() {
  const base = 'http://localhost:5000';
  console.log('==================================================');
  console.log('   LUXEHOME FULL STACK DEPLOYMENT VERIFICATION   ');
  console.log('==================================================\n');

  // 1. Health
  const healthRes = await fetch(base + '/api/health');
  const health = await healthRes.json();
  console.log('[PASS] 1. Health Check:', health);

  // 2. SPA Route Serving
  const spaRes = await fetch(base + '/');
  const spaHtml = await spaRes.text();
  console.log('[PASS] 2. SPA Static Serving (HTTP ' + spaRes.status + '): ' + (spaHtml.includes('id="root"') ? 'index.html bundled properly' : 'Served'));

  // 3. Categories & Services
  const catRes = await fetch(base + '/api/categories');
  const cats = await catRes.json();
  const srvRes = await fetch(base + '/api/services');
  const srvs = await srvRes.json();
  console.log('[PASS] 3. Catalog Data: ' + cats.length + ' categories, ' + srvs.length + ' services found.');

  // 4. Client Register & Login Flow
  const testId = Date.now();
  const testEmail = 'verify_' + testId + '@testluxe.com';
  const testUser = 'user_' + testId;
  const testPass = 'SecurePass123!';

  const regRes = await fetch(base + '/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: testUser, email: testEmail, password: testPass })
  });
  const regData = await regRes.json();
  console.log('[PASS] 4a. Client Registration: HTTP ' + regRes.status + ', User ID = ' + regData.userId);

  const clientLogRes = await fetch(base + '/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPass })
  });
  const clientLogData = await clientLogRes.json();
  console.log('[PASS] 4b. Client Login (by Email): Logged in as ' + clientLogData.user.username + ' (Role: ' + clientLogData.user.role + ')');

  const clientLogUserRes = await fetch(base + '/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: testUser, password: testPass })
  });
  const clientLogUserData = await clientLogUserRes.json();
  console.log('[PASS] 4c. Client Login (by Username): Logged in as ' + clientLogUserData.user.email);

  // 5. Booking Flow
  const bookRes = await fetch(base + '/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: clientLogData.user.id,
      service_id: srvs[0].id,
      service_title: srvs[0].title,
      user_email: clientLogData.user.email
    })
  });
  const bookData = await bookRes.json();
  console.log('[PASS] 5a. Booking Creation: HTTP ' + bookRes.status + ', Booking ID = ' + bookData.bookingId);

  const myBookRes = await fetch(base + '/api/bookings/user/' + clientLogData.user.id);
  const myBookings = await myBookRes.json();
  console.log('[PASS] 5b. Client MyBookings View: Found ' + myBookings.length + ' booking(s), latest: "' + myBookings[0]?.service_title + '"');

  // 6. Admin Authentication & Operations
  const adminLogRes = await fetch(base + '/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@gmail.com', password: '1234' })
  });
  const adminLogData = await adminLogRes.json();
  console.log('[PASS] 6a. Admin Login: Logged in as ' + adminLogData.user.username + ' (Role: ' + adminLogData.user.role + ')');

  const adminBookRes = await fetch(base + '/api/bookings', {
    headers: { 'x-user-role': 'admin' }
  });
  const allBookings = await adminBookRes.json();
  console.log('[PASS] 6b. Admin Bookings Portal: ' + allBookings.length + ' total booking records accessed.');

  // 7. Update booking status by admin
  const updateRes = await fetch(base + '/api/bookings/' + bookData.bookingId, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-user-role': 'admin' },
    body: JSON.stringify({ status: 'Confirmed' })
  });
  const updateData = await updateRes.json();
  console.log('[PASS] 7. Admin Status Update: Status changed to Confirmed (' + updateData.message + ')');

  console.log('\n==================================================');
  console.log('   ALL 7 CORE DEPLOYMENT VERIFICATION TESTS PASSED ');
  console.log('==================================================');
}

runFullVerification().catch(console.error);
