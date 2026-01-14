# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Woostaa is a dynamic professional home services platform based in Bangalore. The platform connects customers with verified professionals for services like deep cleaning, pest control, maid services, cooking, driver services, and car washing. Now features both WhatsApp and web app booking options with user authentication, profile management, and payment integration.

## Project Structure
### Backend (API-based with MongoDB)
- `index.js` - Main Express.js server with API routes and middleware
- `database/database.js` - MongoDB connection using Mongoose
- `models/` - Mongoose schemas for User, Service, Order, Worker
- `routes/` - API endpoints (auth, services, orders)
- `middleware/auth.js` - JWT authentication middleware
- `utils/email.js` - Email service for notifications and verification
- `config/config.js` - Environment configuration
- `scripts/seed-services.js` - Database seeding script

### Frontend (Modular HTML/CSS/JS)
- `index.html` - Main landing page with booking flow integration
- `public/` - Static assets and pages
  - `login.html` - User authentication page
  - `register.html` - User registration with email verification
  - `booking.html` - Service booking with pricing options (to be created)
  - `profile.html` - User profile completion (to be created)
  - `dashboard.html` - User order history and tracking (to be created)
  - `admin.html` - Admin panel for order/pricing management (to be created)
  - `css/styles.css` - Complete styling with booking modals
  - `js/scripts.js` - Enhanced with booking flow and authentication
  - `img/` - SVG images and logos

## Development Commands
- `npm start` - Start development server with auto-restart (port 5001)
- `npm install` - Install all dependencies
- `node scripts/seed-services.js` - Seed database with default services
- `node index.js` - Start production server

## API Architecture
### Authentication Routes (`/api/auth`)
- `POST /register` - User registration with email verification
- `POST /login` - User login with JWT token
- `GET /verify-email` - Email verification endpoint
- `GET /profile` - Get user profile (authenticated)
- `PUT /profile` - Update user profile (authenticated)
- `POST /resend-verification` - Resend verification email

### Services Routes (`/api/services`)
- `GET /` - Get all active services with pricing
- `GET /:id` - Get specific service details
- `POST /` - Create service (admin only)
- `PUT /:id` - Update service (admin only)
- `DELETE /:id` - Soft delete service (admin only)

### Orders Routes (`/api/orders`)
- `POST /create` - Create new order with payment integration
- `POST /payment/verify` - Verify Razorpay payment
- `GET /my-orders` - Get user's order history
- `GET /:id` - Get specific order details
- `PUT /:id/cancel` - Cancel order
- `GET /admin/all` - Get all orders (admin)
- `PUT /admin/:id/status` - Update order status (admin)

## Key Features
### Booking Flow
1. **Dual Booking Options**: WhatsApp or Web App booking modal
2. **Authentication Required**: Login/registration for web app booking
3. **Profile Completion**: User must complete profile before first booking
4. **Service-Specific Pricing**: Different pricing models (hourly, fixed, custom)
5. **Payment Integration**: Razorpay for card/UPI payments

### User Management
- JWT-based authentication with 7-day expiry
- Email verification system with nodemailer
- Profile completion tracking
- Order history and tracking

### Service Configuration
- Dynamic pricing based on factors (apartment size, service type, etc.)
- Plan types: hourly, weekly, monthly, fixed
- Urban Company-inspired pricing structure
- Admin-configurable pricing and services

### Email Notifications
- User registration verification
- Order confirmation to customer and admin
- Uses Gmail SMTP with app passwords

## Database Schema (MongoDB)
### Users Collection
- Authentication data, profile information, verification status
- Embedded profile object for address and preferences

### Services Collection
- Service details with dynamic pricing options
- Factor-based pricing (apartment size, service duration, etc.)
- Support for hourly, weekly, monthly, and fixed pricing

### Orders Collection
- Complete order lifecycle tracking
- Payment integration with Razorpay
- Customer and admin notifications
- Order status management

### Workers Collection
- Worker information and service assignments
- Rating and availability tracking
- Document verification status

## Environment Configuration
- MongoDB connection string
- JWT secret key
- Email service configuration (Gmail SMTP)
- Razorpay payment gateway keys
- Admin email for notifications

## Security Features
- Helmet.js for security headers
- Rate limiting on API endpoints
- CORS configuration
- JWT token expiration
- Password hashing with bcryptjs
- Input validation and sanitization

## Development Notes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based with middleware protection
- **Email**: Nodemailer with Gmail SMTP
- **Payments**: Razorpay integration for card/UPI
- **Frontend**: Vanilla HTML/CSS/JS (no frameworks)
- **Architecture**: RESTful API with modular structure
- **Error Handling**: Comprehensive error responses
- **Logging**: Console logging for development

## Deployment Considerations
- Environment variables for all sensitive data
- MongoDB Atlas for production database
- Email service configuration for production
- Razorpay production keys
- HTTPS configuration available in server
- Static file serving optimized

## Next Steps to Complete
1. Create booking page with service-specific forms
2. Implement profile completion page
3. Build user dashboard with order tracking
4. Create admin panel for order management
5. Add worker management system
6. Implement rating and feedback system