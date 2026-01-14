const fs = require('fs');
const https = require('https');
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./database/database');
const config = require('./config/config');

const app = express();

// Connect to MongoDB
connectDB();

// Disable all security headers for development
app.use((req, res, next) => {
    // Prevent HTTPS upgrade attempts
    res.setHeader('Strict-Transport-Security', 'max-age=0');
    res.removeHeader('Upgrade-Insecure-Requests');
    next();
});

// Security middleware - Completely disabled for development
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
    originAgentCluster: false,
    hsts: false, // Disable HTTPS Strict Transport Security
    noSniff: false,
    frameguard: false,
    xssFilter: false
}));

app.use(cors({
    origin: true,
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
console.log('Loading API routes...');
try {
    app.use('/api/auth', require('./routes/auth'));
    console.log('✅ Auth routes loaded');

    app.use('/api/services', require('./routes/services'));
    console.log('✅ Services routes loaded');

    app.use('/api/orders', require('./routes/orders'));
    console.log('✅ Orders routes loaded');

    app.use('/api/apartments', require('./routes/apartments'));
    console.log('✅ Apartments routes loaded');

    app.use('/api/admin', require('./routes/admin'));
    console.log('✅ Admin routes loaded');
} catch (error) {
    console.error('❌ Error loading API routes:', error);
    process.exit(1);
}

// Serve main website
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve booking page
app.get('/booking', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'booking.html'));
});

// Serve login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve register page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Serve profile page
app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

// Serve dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Serve admin panel
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Serve forgot password page
app.get('/forgot-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'forgot-password.html'));
});

// Serve reset password page
app.get('/reset-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
});

// Handle 404
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error(error.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// SSL Configuration & Server Start
const sslKeyPath = '/etc/letsencrypt/live/woostaa.com/privkey.pem';
const sslCertPath = '/etc/letsencrypt/live/woostaa.com/cert.pem';
const sslChainPath = '/etc/letsencrypt/live/woostaa.com/chain.pem';

if (fs.existsSync(sslKeyPath)) {
    // Production Mode (HTTPS)
    const options = {
        key: fs.readFileSync(sslKeyPath),
        cert: fs.readFileSync(sslCertPath),
        ca: fs.readFileSync(sslChainPath)
    };

    // Redirect HTTP to HTTPS
    http.createServer((req, res) => {
        res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
        res.end();
    }).listen(80, () => {
        console.log('HTTP redirect server running on port 80');
    });

    // Start HTTPS Server
    https.createServer(options, app).listen(443, () => {
        console.log('HTTPS server running on port 443');
    });
} else {
    // Development Mode (HTTP)
    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`Development server running on port ${PORT}`);
        console.log(`Visit: http://localhost:${PORT}`);
    });
}


