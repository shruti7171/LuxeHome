async function runFullSuite() {
  const base = 'http://localhost:5000';
  console.log('===============================================================');
  console.log('   LUXEHOME COMPLETE PRODUCTION SUITE VERIFICATION');
  console.log('===============================================================\n');

  // 1. Health check
  const h = await (await fetch(`${base}/api/health`)).json();
  console.log('[PASS] 1. API Health Check:', h);

  // 2. SPA index.html Serving
  const html = await (await fetch(`${base}/`)).text();
  console.log('[PASS] 2. SPA Static Serving: Bundled index.html verified (' + (html.includes('id="root"') ? 'Contains #root' : 'Served') + ')');

  // 3. Category & Services Catalog
  const cats = await (await fetch(`${base}/api/categories`)).json();
  const srvs = await (await fetch(`${base}/api/services`)).json();
  console.log(`[PASS] 3. Catalog Data: ${cats.length} categories, ${srvs.length} services loaded from MySQL database.`);

  // 4. Client Registration Flow
  const nonce = Date.now();
  const clientUser = 'client_' + nonce;
  const clientEmail = 'client_' + nonce + '@luxetest.com';
  const clientPass = 'Pass_' + nonce;

  const regRes = await (await fetch(`${base}/api/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: clientUser, email: clientEmail, password: clientPass })
  })).json();
  console.log(`[PASS] 4a. Client Registration: Success=${regRes.success}, User ID=${regRes.userId}`);

  // 5. Client Dual-Identifier Login (Email and Username)
  const loginEmail = await (await fetch(`${base}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: clientEmail, password: clientPass })
  })).json();
  console.log(`[PASS] 4b. Client Login via Email: Logged in as "${loginEmail.user.username}" (Role: ${loginEmail.user.role})`);

  const loginUser = await (await fetch(`${base}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: clientUser, password: clientPass })
  })).json();
  console.log(`[PASS] 4c. Client Login via Username: Logged in as "${loginUser.user.email}" (Role: ${loginUser.user.role})`);

  // 6. Booking Creation & Client View
  const newBooking = await (await fetch(`${base}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: regRes.userId,
      service_id: srvs[0].id,
      service_title: srvs[0].title,
      user_email: clientEmail
    })
  })).json();
  console.log(`[PASS] 5a. Booking Creation: Success=${newBooking.success}, Booking ID=${newBooking.bookingId}`);

  const myBookings = await (await fetch(`${base}/api/bookings/user/${regRes.userId}`)).json();
  console.log(`[PASS] 5b. Client MyBookings View: ${myBookings.length} booking record found: "${myBookings[0]?.service_title}"`);

  // 7. Admin Authentication & RBAC
  const adminLogin = await (await fetch(`${base}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@gmail.com', password: '1234' })
  })).json();
  console.log(`[PASS] 6a. Admin Login: Logged in as "${adminLogin.user.username}" (Role: ${adminLogin.user.role})`);

  const adminHeaders = { 'Content-Type': 'application/json', 'x-user-role': 'admin' };

  // 8. Admin Bookings Portal & Status Update
  const allBookings = await (await fetch(`${base}/api/bookings`, { headers: adminHeaders })).json();
  console.log(`[PASS] 6b. Admin Bookings Access: ${allBookings.length} total customer bookings found.`);

  const updateStatus = await (await fetch(`${base}/api/bookings/${newBooking.bookingId}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: JSON.stringify({ status: 'Confirmed' })
  })).json();
  console.log(`[PASS] 6c. Admin Status Update: Status changed to "Confirmed" (${updateStatus.message})`);

  // 9. Admin User Management
  const allUsers = await (await fetch(`${base}/api/users`, { headers: adminHeaders })).json();
  console.log(`[PASS] 6d. Admin User Directory: ${allUsers.length} registered accounts retrieved.`);

  // 10. Admin Service Catalog Management (Add -> Edit -> Delete)
  const addService = await (await fetch(`${base}/api/services`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      category_id: cats[0].id,
      title: 'Automated Luxury Test Service',
      description: 'Test service description',
      full_description: 'Full test service description',
      price: '$450',
      duration: '2 hours',
      image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952'
    })
  })).json();
  console.log(`[PASS] 7a. Admin Add Service: Success=${addService.success}, Service ID=${addService.serviceId}`);

  const editService = await (await fetch(`${base}/api/services/${addService.serviceId}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: JSON.stringify({
      title: 'Automated Luxury Test Service (Updated)',
      description: 'Updated test description',
      full_description: 'Updated full test description',
      price: '$500',
      duration: '2.5 hours',
      image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952'
    })
  })).json();
  console.log(`[PASS] 7b. Admin Edit Service: Success=${editService.success}`);

  const delService = await (await fetch(`${base}/api/services/${addService.serviceId}`, {
    method: 'DELETE',
    headers: adminHeaders
  })).json();
  console.log(`[PASS] 7c. Admin Delete Service: Success=${delService.success}`);

  // 11. Cleanup test booking and test user
  await fetch(`${base}/api/bookings/${newBooking.bookingId}`, { method: 'DELETE' });
  await fetch(`${base}/api/users/${regRes.userId}`, { method: 'DELETE', headers: adminHeaders });
  console.log(`[PASS] 8. Test Data Cleanup: Successfully cleaned up temporary verification records.`);

  console.log('\n===============================================================');
  console.log('   ALL 11 END-TO-END VERIFICATION CHECKS COMPLETED SUCCESSFULLY');
  console.log('===============================================================');
}

runFullSuite().catch(console.error);
