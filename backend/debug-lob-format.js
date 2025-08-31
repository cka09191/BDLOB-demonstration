#!/usr/bin/env node

// Debug script to check LOB data format and prediction system
import { connectDB } from './src/api-gateway/config/db.js';
import { getLatest4500 } from './src/api-gateway/controllers/LOBControllers.js';
import LOB from './src/api-gateway/models/LOB.js';

async function debugLOBFormat() {
    console.log('🔍 Debugging LOB data format...\n');

    try {
        // Connect to database
        await connectDB();
        console.log('✅ Connected to database\n');

        // Check total LOB count
        const totalLOBCount = await LOB.countDocuments();
        console.log(`📊 Total LOB documents in database: ${totalLOBCount}`);

        if (totalLOBCount === 0) {
            console.log('❌ No LOB data found. Make sure the LOB collector service is running.');
            return;
        }

        // Get a sample LOB document
        const sampleLOB = await LOB.findOne({}).lean();
        console.log('\n📝 Sample LOB document structure:');
        console.log('- Timestamp:', new Date(sampleLOB.timestamp).toISOString());
        console.log('- Book type:', typeof sampleLOB.book);
        console.log('- Book length (levels):', sampleLOB.book.length);
        if (sampleLOB.book.length > 0) {
            console.log('- First level structure:', sampleLOB.book[0]);
            console.log('- First level length:', sampleLOB.book[0].length);
        }

        // Test getLatest4500 function
        console.log('\n🧪 Testing getLatest4500 function...');
        const lobData = await getLatest4500();
        
        if (!lobData) {
            console.log('❌ getLatest4500 returned null');
            return;
        }

        console.log('✅ getLatest4500 results:');
        console.log('- Book array type:', typeof lobData.book);
        console.log('- Book array length:', lobData.book.length);
        console.log('- Count:', lobData.count);
        console.log('- Time range:', {
            first: new Date(lobData.timestamp_first).toISOString(),
            last: new Date(lobData.timestamp_last).toISOString()
        });

        if (lobData.book.length > 0) {
            const firstTimestep = lobData.book[0];
            console.log('- First timestep type:', typeof firstTimestep);
            console.log('- First timestep length (levels):', firstTimestep.length);
            
            if (firstTimestep.length > 0) {
                console.log('- First level of first timestep:', firstTimestep[0]);
                console.log('- First level length:', firstTimestep[0].length);
            }
        }

        // Analyze data dimensions
        if (lobData.book.length > 0 && lobData.book[0].length > 0) {
            const timesteps = lobData.book.length;
            const levels = lobData.book[0].length;
            const featuresPerLevel = lobData.book[0][0].length;
            
            console.log('\n📐 Data dimensions:');
            console.log(`- Timesteps: ${timesteps}`);
            console.log(`- Levels per timestep: ${levels}`);
            console.log(`- Features per level: ${featuresPerLevel}`);
            console.log(`- Expected shape for model: (1, 1, ${timesteps}, ${levels * featuresPerLevel})`);
            
            if (levels === 20 && featuresPerLevel === 4) {
                console.log('✅ Data format looks correct for BDLOB model');
            } else {
                console.log('⚠️  Data format may not match BDLOB model expectations');
            }
        }

        console.log('\n🎯 Debugging complete!');
        
    } catch (error) {
        console.error('❌ Error during debugging:', error);
    } finally {
        process.exit(0);
    }
}

// Run the debug function
if (import.meta.url === `file://${process.argv[1]}`) {
    debugLOBFormat();
}
