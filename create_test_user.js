const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createTestUser = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/woostaa';
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const email = 'testuser_e2e@example.com';
        const password = 'Password123!';

        // Delete if exists
        await User.deleteOne({ email });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            fullName: 'E2E Test User',
            email,
            password: hashedPassword,
            phone: '9876543210',
            role: 'user',
            isVerified: true, // Bypass email verification
            profile: {
                apartmentName: 'Test Apartment',
                flatNumber: '101',
                area: 'Test Area',
                pincode: '560001',
                isProfileComplete: true
            }
        });

        await user.save();
        console.log('✅ Test User Created:', email);
        console.log('🔑 Password:', password);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createTestUser();
