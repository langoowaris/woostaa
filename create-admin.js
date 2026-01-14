const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const config = require('./config/config');

async function createAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@woostaa.com' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash('admin123', 12);

        // Create admin user
        const admin = new User({
            fullName: 'Admin User',
            email: 'abdulwarislangoo1@gmail.com',
            phone: '9999999999',
            password: hashedPassword,
            role: 'admin',
            isVerified: true,
            profile: {
                isComplete: true,
                apartmentßName: 'Admin Office',
                flatNumber: 'A1',
                area: 'Bangalore',
                pincode: '560001'
            }
        });

        await admin.save();
        console.log('Admin user created successfully!');
        console.log('Email: admin@woostaa.com');
        console.log('Password: admin');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
}

createAdmin();