require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 5001,
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/woostaa',
    JWT_SECRET: process.env.JWT_SECRET,
    EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
    EMAIL_PORT: process.env.EMAIL_PORT || 587,
    EMAIL_USER: process.env.EMAIL_USER || 'woostabangalore@gmail.com',
    EMAIL_PASS: process.env.EMAIL_PASS,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    BASE_URL: process.env.BASE_URL || 'https://woostaa.com',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'woostabangalore@gmail.com'
};

// Check for required secrets
const requiredSecrets = ['JWT_SECRET', 'EMAIL_PASS'];
const missingSecrets = requiredSecrets.filter(key => !process.env[key]);
if (missingSecrets.length > 0) {
    console.error('❌ CRITICAL ERROR: Missing required environment variables:', missingSecrets.join(', '));
    console.error('Please update your .env file immediately.');
    // In production, you might want to process.exit(1) here
}