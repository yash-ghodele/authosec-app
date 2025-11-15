/**
 * Test script to verify backend connection
 * Run with: node test-connection.js
 */

const API_URL = 'http://10.74.185.189:3001';

async function testConnection() {
  console.log('🔍 Testing connection to backend...\n');
  console.log(`API URL: ${API_URL}\n`);

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing /api/health endpoint...');
    const healthResponse = await fetch(`${API_URL}/api/health`);
    const healthData = await healthResponse.json();
    
    if (healthResponse.ok) {
      console.log('✅ Health check successful!');
      console.log(`   Status: ${healthData.data.status}`);
      console.log(`   Database: ${healthData.data.database}`);
    } else {
      console.log('❌ Health check failed!');
      console.log(`   Status: ${healthResponse.status}`);
    }

    console.log('\n2️⃣ Testing CORS headers...');
    const corsTest = await fetch(`${API_URL}/api/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'exp://10.74.185.189:8081',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    });

    const corsHeaders = {
      'Access-Control-Allow-Origin': corsTest.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': corsTest.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': corsTest.headers.get('Access-Control-Allow-Headers'),
    };

    console.log('✅ CORS headers received:');
    Object.entries(corsHeaders).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });

    console.log('\n3️⃣ Testing /api/users/profile endpoint (with auth)...');
    try {
      const profileResponse = await fetch(`${API_URL}/api/users/profile`);
      console.log(`   Status: ${profileResponse.status}`);
      
      if (profileResponse.status === 401) {
        console.log('✅ Endpoint working (401 Unauthorized as expected without token)');
      } else {
        const profileData = await profileResponse.json();
        console.log('   Response:', JSON.stringify(profileData, null, 2));
      }
    } catch (error) {
      console.log(`❌ Profile endpoint error: ${error.message}`);
    }

    console.log('\n✅ All connection tests completed!\n');
    console.log('📱 Your Expo app should be able to connect to the backend.');
    console.log(`   Make sure your mobile device/emulator is on the same network.`);
    console.log(`   API URL in app: ${API_URL}\n`);

  } catch (error) {
    console.log('\n❌ Connection test failed!');
    console.log(`   Error: ${error.message}`);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('   1. Check if backend is running: npm run dev');
    console.log('   2. Verify backend is listening on port 3001');
    console.log('   3. Check firewall settings');
    console.log('   4. Ensure device is on same network (WiFi)');
    console.log(`   5. Try accessing ${API_URL}/api/health in browser\n`);
  }
}

testConnection();
