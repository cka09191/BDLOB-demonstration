#!/usr/bin/env node

// Script to clear test data and reset the system for real predictions
import { connectDB } from './src/api-gateway/config/db.js';
import Prediction from './src/api-gateway/models/Prediction.js';
import Evaluation from './src/api-gateway/models/Evaluation.js';

async function clearTestData() {
    console.log('🧹 Clearing test data and resetting system...\n');

    try {
        // Connect to database
        await connectDB();
        console.log('✅ Connected to database');

        // Clear all predictions and evaluations
        const predictionResult = await Prediction.deleteMany({});
        const evaluationResult = await Evaluation.deleteMany({});

        console.log(`🗑️  Cleared ${predictionResult.deletedCount} predictions`);
        console.log(`🗑️  Cleared ${evaluationResult.deletedCount} evaluations`);

        console.log('\n✅ System reset complete! Ready for real predictions.');
        console.log('\n📋 Next steps:');
        console.log('1. Start your backend server');
        console.log('2. Check prediction status: curl http://localhost:3000/predictions/status');
        console.log('3. Watch server logs for real model predictions');
        
    } catch (error) {
        console.error('❌ Error clearing test data:', error);
    } finally {
        process.exit(0);
    }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    clearTestData();
}
