/**
 * Clear all visitor statistics data
 * Run with: node clear-visitor-stats.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./database/database');

async function clearVisitorStats() {
    try {
        await connectDB();

        // Clear Visitor collection
        const Visitor = require('./models/Visitor');
        const visitorResult = await Visitor.deleteMany({});
        console.log(`✅ Deleted ${visitorResult.deletedCount} visitor records`);

        // Reset SiteStats
        const SiteStats = require('./models/SiteStats');
        await SiteStats.updateOne({}, { $set: { totalUniqueVisitors: 0 } }, { upsert: true });
        console.log('✅ Reset totalUniqueVisitors to 0');

        // Clear visitStats from all users (but keep user accounts)
        const User = require('./models/User');
        const userResult = await User.updateMany(
            {},
            { $set: { 'visitStats.totalVisits': 0, 'visitStats.visitHistory': [], 'visitStats.lastVisit': null } }
        );
        console.log(`✅ Reset visitStats for ${userResult.modifiedCount} users`);

        console.log('\n🎉 All visitor statistics cleared! Fresh start.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

clearVisitorStats();
