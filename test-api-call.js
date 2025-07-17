#!/usr/bin/env node

// Test script to simulate API call to user-content-progress endpoint
const http = require('http');

// Test data for the API call
const testData = {
  userId: 'fed2a63e-196d-43ff-9ebc-674db34e72a7', // Development user ID from dummyUsers.ts
  contentId: 'test-content-id',
  action: 'quiz_completed',
  data: {}
};

function testApiCall() {
  const postData = JSON.stringify(testData);
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/user-content-progress',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  console.log('Testing API call to /api/user-content-progress');
  console.log('Request data:', testData);
  
  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    
    res.on('end', () => {
      console.log('Response body:', body);
      
      if (res.statusCode === 500) {
        console.log('\n❌ 500 Internal Server Error detected');
        console.log('Check the Next.js development server logs for more details');
      } else {
        console.log('\n✅ API call successful');
      }
    });
  });
  
  req.on('error', (e) => {
    console.error(`Request error: ${e.message}`);
    console.log('\n⚠️  Make sure the Next.js development server is running on port 3000');
    console.log('Run: npm run dev');
  });
  
  req.write(postData);
  req.end();
}

// Run the test
testApiCall();