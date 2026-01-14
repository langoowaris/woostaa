const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const config = require('./config/config');

async function resetAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(config.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Delete existing admin
        await User.deleteOne({ email: 'admin@woostaa.com' });
        console.log('Deleted existing admin user');

        // Hash the password 'admin'
        const hashedPassword = await bcrypt.hash('admin123', 12);

        // Create new admin user
        const admin = new User({
            fullName: 'Admin User',
            email: 'admin@woostaa.com',
            phone: '9999999999',
            password: hashedPassword,
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

        await admin.save();
        console.log('Admin user recreated successfully!');
        console.log('Email: admin@woostaa.com');
        console.log('Password: admin');
        
        process.exit(0);
    } catch (error) {
        console.error('Error resetting admin:', error);
        process.exit(1);
    }
}

resetAdmin();