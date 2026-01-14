require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 5001,
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/woostaa',
    JWT_SECRET: process.env.JWT_SECRET || 'woostaa_jwt_secret_key_2025',
    EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
    EMAIL_PORT: process.env.EMAIL_PORT || 587,
    EMAIL_USER: process.env.EMAIL_USER || 'woostabangalore@gmail.com',
    EMAIL_PASS: process.env.EMAIL_PASS || 'gpjb vuxo idyd ypue',
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
    BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'woostabangalore@gmail.com'
};