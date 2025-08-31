#!/usr/bin/env node

// Simple test script to verify the evaluation system is working
import fetch from 'node-fetch';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

async function testEvaluationAPI() {
    console.log('🧪 Testing Evaluation API endpoints...\n');

    try {
        // Test stats endpoint
        console.log('1. Testing /evaluations/stats...');
        const statsResponse = await fetch(`${BACKEND_URL}/evaluations/stats?hours=24`);
        if (statsResponse.ok) {
            const stats = await statsResponse.json();
            console.log('✅ Stats endpoint working');
            console.log(`   Total predictions: ${stats.totalPredictions}`);
            console.log(`   Accuracy: ${stats.accuracy}%\n`);
        } else {
            console.log('❌ Stats endpoint failed:', statsResponse.status);
        }

        // Test recent evaluations endpoint
        console.log('2. Testing /evaluations/recent...');
        const recentResponse = await fetch(`${BACKEND_URL}/evaluations/recent?limit=5`);
        if (recentResponse.ok) {
            const recent = await recentResponse.json();
            console.log('✅ Recent evaluations endpoint working');
            console.log(`   Found ${recent.evaluations.length} recent evaluations\n`);
        } else {
            console.log('❌ Recent evaluations endpoint failed:', recentResponse.status);
        }

        // Test trend endpoint
        console.log('3. Testing /evaluations/trend...');
        const trendResponse = await fetch(`${BACKEND_URL}/evaluations/trend?hours=24`);
        if (trendResponse.ok) {
            const trend = await trendResponse.json();
            console.log('✅ Trend endpoint working');
            console.log(`   Found ${trend.length} trend data points\n`);
        } else {
            console.log('❌ Trend endpoint failed:', trendResponse.status);
        }

        // Test confidence-accuracy endpoint
        console.log('4. Testing /evaluations/confidence-accuracy...');
        const confAccResponse = await fetch(`${BACKEND_URL}/evaluations/confidence-accuracy?hours=24`);
        if (confAccResponse.ok) {
            const confAcc = await confAccResponse.json();
            console.log('✅ Confidence-accuracy endpoint working');
            console.log(`   Found ${confAcc.length} confidence buckets\n`);
        } else {
            console.log('❌ Confidence-accuracy endpoint failed:', confAccResponse.status);
        }

        console.log('🎉 All evaluation API tests completed!');

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        console.log('\n💡 Make sure the backend server is running on', BACKEND_URL);
    }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    testEvaluationAPI();
}

export default testEvaluationAPI;
