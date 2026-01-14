const mongoose = require('mongoose');
const User = require('./models/User');
const config = require('./config/config');

async function fixAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(config.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Delete existing admin
        await User.deleteOne({ email: 'admin@woostaa.com' });
        console.log('Deleted existing admin user');

        // Create new admin user with plain text password
        // The pre-save hook will handle the hashing
        const admin = new User({
            fullName: 'Admin User',
            email: 'woostabangalore@gmail.com',
            phone: '9999999999',
            password: 'admin123', // Plain text - pre-save hook will hash it
            role: 'admin',
            isVerified: true,
            profile: {
                isComplete: true,
                apartmentName: 'Admin Office',
                flatNumber: 'A1',
                area: 'Bangalore',
                pincode: '560001'
            }
        });

        await admin.save(); // This will trigger the pre-save hook
        console.log('Admin user created successfully with proper password hashing!');
        console.log('Email: admin@woostaa.com');
        console.log('Password: admin');
        
        process.exit(0);
    } catch (error) {
        console.error('Error fixing admin:', error);
        process.exit(1);
    }
}

fixAdmin();