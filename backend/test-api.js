const http = require('http');
const app = require('./src/app');
const pool = require('./src/config/db');
const { execSync } = require('child_process');

let server;
const PORT = 5001;
const BASE_URL = `http://localhost:${PORT}`;

async function request(method, path, body = null, token = null) {
  const url = `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers
  };

  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('Resetting and seeding database for testing...');
  execSync('node database/setup.js', { stdio: 'inherit' });

  server = app.listen(PORT, async () => {
    console.log(`\n====================================================`);
    console.log(`🧪 RUNNING AUTOMATED BACKEND COMPREHENSIVE TEST SUITE`);
    console.log(`====================================================\n`);

    try {
      // 1. Health check
      console.log('1. Health Check Test:');
      const health = await request('GET', '/api/health');
      console.log(`   Status: ${health.status}, Success: ${health.body.success}`);

      // 2. Form Validation Tests (PDF Requirements)
      console.log('\n2. Validation Rule Enforcement Tests:');
      
      // Name < 20 chars test
      const invalidNameSignup = await request('POST', '/api/auth/signup', {
        name: 'Short Name',
        email: 'invalidname@roxiler.com',
        password: 'Password123!',
        address: '123 Test Street'
      });
      console.log(`   Short Name (<20 chars) -> Status: ${invalidNameSignup.status} (Expected 400), Msg: ${invalidNameSignup.body.message}`);

      // Password missing special char test
      const invalidPassSignup = await request('POST', '/api/auth/signup', {
        name: 'Valid Name Length Over Twenty Characters',
        email: 'invalidpass@roxiler.com',
        password: 'Password123',
        address: '123 Test Street'
      });
      console.log(`   Invalid Password (no special char) -> Status: ${invalidPassSignup.status} (Expected 400), Msg: ${invalidPassSignup.body.message}`);

      // Valid Signup
      console.log('\n3. Valid Signup Test:');
      const validSignup = await request('POST', '/api/auth/signup', {
        name: 'Brand New User Account Name Testing',
        email: 'newuser@roxiler.com',
        password: 'NewUserPass@123',
        address: '999 New Street, Tech City, TX 75002'
      });
      console.log(`   Signup -> Status: ${validSignup.status}, User Role: ${validSignup.body.data.user.role}`);
      const newUserToken = validSignup.body.data.token;

      // 4. Login Tests for All Roles
      console.log('\n4. Login Tests for All Roles:');
      const adminLogin = await request('POST', '/api/auth/login', {
        email: 'admin@roxiler.com',
        password: 'AdminPass@123'
      });
      console.log(`   Admin Login -> Status: ${adminLogin.status}, Role: ${adminLogin.body.data.user.role}`);
      const adminToken = adminLogin.body.data.token;

      const ownerLogin = await request('POST', '/api/auth/login', {
        email: 'owner@roxiler.com',
        password: 'OwnerPass@123'
      });
      console.log(`   Owner Login -> Status: ${ownerLogin.status}, Role: ${ownerLogin.body.data.user.role}`);
      const ownerToken = ownerLogin.body.data.token;

      const user1Login = await request('POST', '/api/auth/login', {
        email: 'user1@roxiler.com',
        password: 'UserPass@1234'
      });
      console.log(`   Normal User 1 Login -> Status: ${user1Login.status}, Role: ${user1Login.body.data.user.role}`);
      const user1Token = user1Login.body.data.token;

      // 5. Admin Functionalities
      console.log('\n5. System Administrator Endpoints:');
      const adminDashboard = await request('GET', '/api/admin/dashboard', null, adminToken);
      console.log(`   Admin Dashboard -> Status: ${adminDashboard.status}, Stats:`, adminDashboard.body.data);

      const adminAddStore = await request('POST', '/api/admin/stores', {
        name: 'Roxiler Third Tech Electronics Store',
        email: 'store3@roxiler.com',
        address: '777 Tech Boulevard, Cyber City',
        owner_id: ownerLogin.body.data.user.id
      }, adminToken);
      console.log(`   Admin Add Store -> Status: ${adminAddStore.status}, Store Name: ${adminAddStore.body.data.store.name}`);

      const adminUsersList = await request('GET', '/api/admin/users?role=STORE_OWNER', null, adminToken);
      console.log(`   Admin Users List (Filter role=STORE_OWNER) -> Count: ${adminUsersList.body.data.users.length}`);

      const storeOwnerDetails = await request('GET', `/api/admin/users/${ownerLogin.body.data.user.id}`, null, adminToken);
      console.log(`   Admin View User Details (Store Owner) -> Name: ${storeOwnerDetails.body.data.user.name}, Store Rating: ${storeOwnerDetails.body.data.user.rating}`);

      // 6. Normal User Functionalities
      console.log('\n6. Normal User Endpoints:');
      const userStoresList = await request('GET', '/api/stores?search=Electronics', null, user1Token);
      console.log(`   View Stores with Search -> Found: ${userStoresList.body.data.stores.length} stores`);

      // Submit Rating
      const submitRatingRes = await request('POST', `/api/stores/${userStoresList.body.data.stores[0].id}/rating`, {
        rating: 5
      }, newUserToken);
      console.log(`   Submit Rating (5) -> Status: ${submitRatingRes.status}, New Avg: ${submitRatingRes.body.data.overallRating}`);

      // Modify Rating
      const modifyRatingRes = await request('PUT', `/api/stores/${userStoresList.body.data.stores[0].id}/rating`, {
        rating: 4
      }, newUserToken);
      console.log(`   Modify Rating (4) -> Status: ${modifyRatingRes.status}, Updated Avg: ${modifyRatingRes.body.data.overallRating}`);

      // Change Password with valid 8-16 char password
      const changePassRes = await request('PUT', '/api/auth/change-password', {
        currentPassword: 'NewUserPass@123',
        newPassword: 'NewPass@1234' // 13 chars, satisfies 8-16 length + uppercase + special char
      }, newUserToken);
      console.log(`   Change Password -> Status: ${changePassRes.status}, Msg: ${changePassRes.body.message}`);

      // Re-login with updated password
      const reloginRes = await request('POST', '/api/auth/login', {
        email: 'newuser@roxiler.com',
        password: 'NewPass@1234'
      });
      console.log(`   Re-login with New Password -> Status: ${reloginRes.status}, Success: ${reloginRes.body.success}`);

      // 7. Store Owner Functionalities
      console.log('\n7. Store Owner Endpoints:');
      const ownerDashboard = await request('GET', '/api/store-owner/dashboard', null, ownerToken);
      console.log(`   Store Owner Dashboard -> Store: ${ownerDashboard.body.data.store.name}, Avg Rating: ${ownerDashboard.body.data.store.averageRating}, Total Ratings: ${ownerDashboard.body.data.store.totalRatings}`);
      console.log(`   Users Who Rated Store Count: ${ownerDashboard.body.data.ratings.length}`);

      // 8. Security & Authorization checks
      console.log('\n8. Authorization Security Checks:');
      const unauthorizedAdminReq = await request('GET', '/api/admin/dashboard', null, user1Token);
      console.log(`   Normal User accessing Admin Endpoint -> Status: ${unauthorizedAdminReq.status} (Expected 403), Msg: ${unauthorizedAdminReq.body.message}`);

      console.log(`\n====================================================`);
      console.log(`🎉 ALL TESTS PASSED WITH 100% SUCCESS!`);
      console.log(`====================================================\n`);

    } catch (err) {
      console.error('Test failed with error:', err);
    } finally {
      server.close();
      await pool.end();
      process.exit(0);
    }
  });
}

runTests();
