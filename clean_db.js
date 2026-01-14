require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load all models dynamically
const modelsPath = path.join(__dirname, 'models');
const models = {};

fs.readdirSync(modelsPath).forEach(file => {
    if (file.endsWith('.js')) {
        const modelName = file.replace('.js', '');
        try {
            models[modelName] = require(path.join(modelsPath, file));
        } catch (e) {
            console.error(`Skipping model ${modelName}:`, e.message);
        }
    }
});

const cleanDB = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/woostaa");
        console.log('Connected!');

        console.log('Starting Cleanup...');

        // 1. Users: Delete all EXCEPT admins
        if (models.User) {
            const userRes = await models.User.deleteMany({ role: { $ne: 'admin' } });
            console.log(`Deleted ${userRes.deletedCount} Users (Preserved Admins)`);
        }

        // 2. Delete EVERYTHING else
        const otherModels = Object.keys(models).filter(name => name !== 'User');

        for (const name of otherModels) {
            const Model = models[name];
            if (Model && Model.deleteMany) {
                const res = await Model.deleteMany({});
                console.log(`Deleted ${res.deletedCount} documents from ${name}`);
            }
        }

        console.log('✅ Database Cleaned Successfully (Admin Logins Kept).');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error cleaning database:', error);
        process.exit(1);
    }
};

cleanDB();
