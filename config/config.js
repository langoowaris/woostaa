require('dotenv').config();

const config = {
    PORT: process.env.PORT || 5001,
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/woostaa',
    JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_key_DO_NOT_USE_IN_PRODUCTION_12345',
    EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
    EMAIL_PORT: process.env.EMAIL_PORT || 587,
    EMAIL_USER: process.env.EMAIL_USER || 'woostabangalore@gmail.com',
    EMAIL_PASS: process.env.EMAIL_PASS, // No fallback for security, but we'll handle missing value gracefully
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    BASE_URL: process.env.BASE_URL || 'https://woostaa.com',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'woostabangalore@gmail.com'
};

module.exports = config;

// Check for critical missing secrets
// We allow EMAIL_PASS to be missing (email service won't work, but server shouldn't crash)
if (!process.env.JWT_SECRET) {
    console.warn('⚠️  WARNING: JWT_SECRET is missing. Using insecure fallback key. Please update your .env file.');
}

if (!process.env.EMAIL_PASS) {
    console.warn('⚠️  WARNING: EMAIL_PASS is missing. Email functionality will fail.');
}