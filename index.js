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

// Visitor Tracking Middleware
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const SiteStats = require('./models/SiteStats');
const Visitor = require('./models/Visitor');
const User = require('./models/User');

// Helper to hash IP for privacy
const hashIP = (ip) => {
    return crypto.createHash('sha256').update(ip || 'unknown').digest('hex').substring(0, 16);
};

// Helper to extract visitor ID from cookies
const getVisitorIdFromCookies = (cookieHeader) => {
    const cookies = cookieHeader || '';
    const match = cookies.match(/woostaa_visitor=([^;]+)/);
    return match ? match[1] : null;
};

// Helper to extract user ID from JWT token
const getUserFromToken = (cookieHeader) => {
    try {
        const cookies = cookieHeader || '';
        const match = cookies.match(/token=([^;]+)/);
        if (!match) return null;
        const decoded = jwt.verify(match[1], config.jwtSecret || process.env.JWT_SECRET);
        return { userId: decoded.userId || decoded.id, role: decoded.role };
    } catch {
        return null;
    }
};

app.use(async (req, res, next) => {
    try {
        const path = req.path;

        // 1. Skip strictly ignored paths (API, assets, admin routes)
        const skipPrefixes = ['/api', '/css', '/js', '/img', '/favicon', '/fonts', '/admin', '/dashboard'];
        if (skipPrefixes.some(p => path.startsWith(p))) {
            return next();
        }

        // 2. Skip sensitive/suspicious paths (Bot scanning commonly targets these)
        const suspiciousPatterns = ['/.env', '/config.', '/.git', '/server-status', '/_profiler', '/telescope', '/phpinfo', '/info.php'];
        if (suspiciousPatterns.some(p => path.includes(p))) {
            return next();
        }

        // 3. Skip static files based on extension (unless it's .html)
        // We only want to track actual page views
        const isStaticFile = /\.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|map|json|xml|txt)$/i.test(path);
        if (isStaticFile && !path.endsWith('.html')) {
            return next();
        }

        const cookies = req.headers.cookie || '';
        let visitorId = getVisitorIdFromCookies(cookies);
        const userInfo = getUserFromToken(cookies);
        const userId = userInfo?.userId;
        const isAdmin = userInfo?.role === 'admin';
        const isNewVisitor = !visitorId;

        // Skip tracking for admin users
        if (isAdmin) {
            return next();
        }

        // Generate new visitor ID if needed
        if (!visitorId) {
            visitorId = uuidv4();
            res.setHeader('Set-Cookie', `woostaa_visitor=${visitorId}; Path=/; Max-Age=31536000; HttpOnly`);

            // Increment unique visitor counter
            await SiteStats.findOneAndUpdate(
                {},
                { $inc: { totalUniqueVisitors: 1 } },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            console.log('👀 New Unique Visitor Counted!');
        }

        // Create visit record
        const visitData = {
            timestamp: new Date(),
            page: req.path,
            userAgent: req.headers['user-agent'],
            ipHash: hashIP(req.ip || req.connection.remoteAddress)
        };

        // Update or create visitor record
        await Visitor.findOneAndUpdate(
            { visitorId },
            {
                $set: {
                    lastVisit: new Date(),
                    isLoggedIn: !!userId,
                    user: userId || undefined
                },
                $inc: { totalVisits: 1 },
                $push: {
                    visits: {
                        $each: [visitData],
                        $slice: -100 // Keep only last 100 visits
                    }
                },
                $setOnInsert: {
                    firstVisit: new Date()
                }
            },
            { upsert: true, new: true }
        );

        // If logged in, also update user's visit stats
        if (userId) {
            await User.findByIdAndUpdate(
                userId,
                {
                    $set: { 'visitStats.lastVisit': new Date() },
                    $inc: { 'visitStats.totalVisits': 1 },
                    $push: {
                        'visitStats.visitHistory': {
                            $each: [{ timestamp: new Date(), page: req.path }],
                            $slice: -50 // Keep last 50 visits per user
                        }
                    }
                }
            );
        }

        if (isNewVisitor) {
            console.log(`📊 New visitor: ${visitorId.substring(0, 8)}...`);
        }
    } catch (error) {
        console.error('Visitor tracking error:', error);
        // Don't block request on analytics error
    }
    next();
});

// Security - Helmet (Enabled with CSP)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://checkout.razorpay.com", "https://apis.google.com"],
            scriptSrcAttr: ["'unsafe-inline'"], // Allow inline event handlers
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "data:", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "https://*"],
            connectSrc: ["'self'", "https://api.razorpay.com"],
            frameSrc: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
}));

// CORS Configuration
app.use(cors({
    origin: true, // In production, replace with specific domain
    credentials: true
}));

// Data Sanitization
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Rate limiting - Global
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 500 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
});
app.use('/api/', globalLimiter);

// Rate limiting - Auth Routes (Strict)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 login/register attempts
    message: 'Too many login attempts, please try again after 15 minutes'
});
app.use('/api/auth/', authLimiter);

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


