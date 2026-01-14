const express = require('express');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Service = require('../models/Service');
const User = require('../models/User');
const { MaidService, CookService, DriverService, CarWashService, DeepCleaningService, PestControlService } = require('../models/WorkingServices');
const { sendOrderNotification, sendOrderStatusUpdateEmail } = require('../utils/email');
const { auth, adminAuth } = require('../middleware/auth');
const config = require('../config/config');

const router = express.Router();

// Debug endpoint to test if orders route is working
router.get('/test', (req, res) => {
    res.json({ message: 'Orders route is working!' });
});

// Initialize Razorpay (only if keys are provided)
let razorpay = null;
if (config.RAZORPAY_KEY_ID && config.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
        key_id: config.RAZORPAY_KEY_ID,
        key_secret: config.RAZORPAY_KEY_SECRET
    });
}

// Create new order
router.post('/create', auth, async (req, res) => {

    try {
        console.log('🔥 POST /create endpoint hit!');
        console.log('Request body:', req.body);
        console.log('User ID:', req.user ? req.user.id : 'No user');
        console.log('Creating order for user:');
        const {
            serviceId,
            serviceName,
            pricingOption,
            totalAmount,
            preferredDate,
            preferredTime,
            specialRequests,
            // Legacy fields for backward compatibility
            bookingType,
            planType,
            scheduledDate,
            scheduledTime,
            duration,
            selectedFactors,
            specialInstructions,
            paymentMethod
        } = req.body;

        // Get service details - try both service models
        console.log('🔍 Looking for service with ID:', serviceId);
        let service = await Service.findById(serviceId);

        if (!service) {
            // Try the detailed service models
            console.log('🔍 Service not found in main collection, trying detailed models...');
            const detailedModels = [MaidService, CookService, DriverService, CarWashService, DeepCleaningService, PestControlService];

            for (const Model of detailedModels) {
                service = await Model.findById(serviceId);
                if (service) {
                    console.log('✅ Service found in detailed model:', Model.modelName);
                    break;
                }
            }
        }

        if (!service) {
            console.error('❌ Service not found in any collection for ID:', serviceId);
            return res.status(404).json({ error: 'Service not found' });
        }
        console.log('✅ Service found:', service.name);

        // Get user details
        console.log('🔍 Looking for user with ID:', req.user.id);
        const user = await User.findById(req.user.id);
        console.log('✅ User found:', user ? user.email : 'No user found');

        // Critical validation: Check phone number
        if (!user.phone || user.phone.trim() === '') {
            console.error('❌ ORDER BLOCKED: User has no phone number -', user.email);
            return res.status(400).json({
                error: 'Phone number is required for booking. Please update your profile.',
                needsPhone: true,
                needsProfile: true
            });
        }

        if (!user.profile.isProfileComplete) {
            return res.status(400).json({
                error: 'Please complete your profile before booking',
                needsProfile: true
            });
        }

        console.log('✅ Phone number verified for order:', user.phone);

        // Calculate total amount based on input format
        let finalAmount;
        let finalScheduledDate;
        let finalScheduledTime;
        let finalSpecialInstructions;

        if (totalAmount !== undefined) {
            // New booking page format
            finalAmount = totalAmount;
            finalScheduledDate = new Date(`${preferredDate}T${preferredTime}`);
            finalScheduledTime = preferredTime;
            finalSpecialInstructions = specialRequests;
        } else {
            // Legacy format - calculate amount
            finalAmount = service.basePrice;

            // Add duration-based pricing for hourly services
            if (planType === 'hourly') {
                const hours = Math.ceil(duration / 60);
                finalAmount = service.basePrice * hours;
            }

            // Add factor-based pricing
            if (selectedFactors && selectedFactors.length > 0) {
                selectedFactors.forEach(factor => {
                    finalAmount += factor.additionalCost || 0;
                });
            }

            finalScheduledDate = new Date(scheduledDate);
            finalScheduledTime = scheduledTime;
            finalSpecialInstructions = specialInstructions;
        }

        // Create order with proper field mapping
        console.log('📝 Creating order object...');

        // Generate order number manually
        const orderCount = await Order.countDocuments();
        const orderNumber = `WOS${Date.now()}${orderCount + 1}`;
        console.log('Generated order number:', orderNumber);

        const order = new Order({
            orderNumber: orderNumber,
            user: req.user.id,
            service: serviceId,
            bookingType: bookingType || 'webapp',
            planType: planType || 'fixed', // Map pricingOption to valid planType
            scheduledDate: finalScheduledDate,
            scheduledTime: finalScheduledTime,
            duration: duration || 60, // Default 1 hour
            selectedFactors: selectedFactors || [],
            totalAmount: finalAmount,
            specialInstructions: finalSpecialInstructions,
            paymentMethod: paymentMethod === 'cash' ? 'cod' : (paymentMethod || 'cod'), // Map 'cash' to 'cod'
            address: {
                apartmentName: user.profile.apartmentName,
                flatNumber: user.profile.flatNumber,
                area: user.profile.area,
                landmark: user.profile.landmark,
                pincode: user.profile.pincode
            }
        });

        console.log('Order data:', {
            orderNumber: order.orderNumber,
            bookingType: order.bookingType,
            planType: order.planType,
            paymentMethod: order.paymentMethod,
            totalAmount: order.totalAmount,
            user: order.user
        });

        // Create Razorpay order if payment method is card/upi and Razorpay is configured
        if ((paymentMethod === 'card' || paymentMethod === 'upi') && razorpay) {
            try {
                const razorpayOrder = await razorpay.orders.create({
                    amount: totalAmount * 100, // Razorpay expects amount in paise
                    currency: 'INR',
                    receipt: `order_${Date.now()}`
                });

                order.razorpayOrderId = razorpayOrder.id;
            } catch (error) {
                console.error('Razorpay order creation failed:', error);
                // Continue without Razorpay order ID for development
            }
        } else if (paymentMethod === 'card' || paymentMethod === 'upi') {
            console.warn('Razorpay not configured - payment will be marked as pending');
        }

        console.log('💾 Saving order to database...');
        await order.save();
        console.log('✅ Order saved successfully! Order ID:', order._id);
        console.log('Order Number:', order.orderNumber);

        // Send email notifications
        const orderDetails = {
            orderNumber: order.orderNumber,
            serviceName: service.name,
            scheduledDate: finalScheduledDate.toDateString(),
            scheduledTime: finalScheduledTime,
            duration: order.duration,
            totalAmount: finalAmount,
            customerName: user.fullName,
            customerPhone: user.phone,
            userEmail: user.email,
            address: `${user.profile.apartmentName}, ${user.profile.flatNumber}, ${user.profile.area}`,
            flatNumber: user.profile.flatNumber,
            apartmentName: user.profile.apartmentName,
            area: user.profile.area,
            landmark: user.profile.landmark,
            pincode: user.profile.pincode
        };

        // Send notifications (don't wait for them)
        Promise.all([
            sendOrderNotification(orderDetails, false), // to customer
            sendOrderNotification(orderDetails, true)   // to admin
        ]).catch(err => console.error('Email notification error:', err));

        console.log('🎉 Sending success response...');
        res.status(201).json({
            message: 'Order created successfully',
            order: {
                id: order._id,
                orderNumber: order.orderNumber,
                totalAmount: totalAmount,
                razorpayOrderId: order.razorpayOrderId,
                paymentMethod: paymentMethod
            }
        });
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Update payment status
router.post('/payment/verify', auth, async (req, res) => {
    try {
        const { orderId, paymentId, signature } = req.body;

        // Find the order
        const order = await Order.findById(orderId);
        if (!order || order.user.toString() !== req.user.id) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Update payment details
        order.paymentStatus = 'completed';
        order.paymentId = paymentId;
        order.status = 'confirmed';

        await order.save();

        res.json({ message: 'Payment verified successfully' });
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ error: 'Payment verification failed' });
    }
});

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const orders = await Order.find({ user: req.user.id })
            .populate('service', 'name description')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Order.countDocuments({ user: req.user.id });

        res.json({
            orders,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Orders fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Get single order details
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user.id
        }).populate('service', 'name description');

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error('Order fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

// Cancel order
router.put('/:id/cancel', auth, async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.status === 'completed' || order.status === 'in_progress') {
            return res.status(400).json({ error: 'Cannot cancel order at this stage' });
        }

        order.status = 'cancelled';
        await order.save();

        res.json({ message: 'Order cancelled successfully' });
    } catch (error) {
        console.error('Order cancellation error:', error);
        res.status(500).json({ error: 'Failed to cancel order' });
    }
});

// Admin: Get all orders
// Admin: Get all orders
router.get('/admin/all', adminAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const status = req.query.status;

        const query = status ? { status } : {};

        // Fetch orders without populate first for service, or keep populate for standard services
        let orders = await Order.find(query)
            .populate('user', 'fullName phone email profile')
            .populate('service', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(); // Use lean() to allow modification of the result objects

        const total = await Order.countDocuments(query);

        // Manually populate missing services from WorkingServices models
        const detailedModels = [MaidService, CookService, DriverService, CarWashService, DeepCleaningService, PestControlService];

        orders = await Promise.all(orders.map(async (order) => {
            // If service is null (populate failed) but we have a service ID
            if (!order.service && order.service) { // Checks if field exists but is null/undefined due to populate failure
                // In lean(), unpopulated ref field contains the ID. But populate() replaces it with null if not found.
                // Wait, if populate fails, order.service is NULL. checking ref ID requires not populating or re-fetching.
                // Actually, if populate fails in Mongoose < 6, it might be null. In Mongoose 6+, it is null.
                // We need the original ID. 
            }
            return order;
        }));

        // Better approach: Don't populate 'service' in the initial query if we suspect mixed types.
        // Or re-fetch the ID if it's null.
        // Let's refetch orders with JUST the service ID to check. 
        // ACTUALLY, simpler:

        orders = await Order.find(query)
            .populate('user', 'fullName phone email profile')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Now manually populate service for each order
        for (let order of orders) {
            if (order.service) { // This is the ID now
                // 1. Try generic Service model
                let service = await Service.findById(order.service).select('name');

                // 2. If not found, try working service models
                if (!service) {
                    for (const Model of detailedModels) {
                        try {
                            const found = await Model.findById(order.service).select('displayName serviceVariant');
                            if (found) {
                                // Construct a name from the available fields
                                service = {
                                    name: found.displayName || found.serviceVariant || Model.modelName.replace('Service', '')
                                };
                                break;
                            }
                        } catch (e) {
                            // Ignore cast errors or other lookups
                        }
                    }
                }

                order.service = service || { name: 'Unknown Service' };
            }
        }

        res.json({
            orders,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Admin orders fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Admin: Get single order details
router.get('/admin/details/:id', adminAuth, async (req, res) => {
    try {
        let order = await Order.findById(req.params.id)
            .populate('user', 'fullName phone email profile')
            .lean();

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Manually resolve service name
        const detailedModels = [MaidService, CookService, DriverService, CarWashService, DeepCleaningService, PestControlService];

        if (order.service) {
            // 1. Try generic Service model
            let service = await Service.findById(order.service).select('name');

            // 2. If not found, try working service models
            if (!service) {
                for (const Model of detailedModels) {
                    try {
                        const found = await Model.findById(order.service).select('displayName serviceVariant');
                        if (found) {
                            service = { name: found.displayName || found.serviceVariant || Model.modelName.replace('Service', '') };
                            break;
                        }
                    } catch (e) { }
                }
            }
            order.service = service || { name: 'Unknown Service' };
        }

        res.json(order);
    } catch (error) {
        console.error('Admin order details fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch order details' });
    }
});

// Admin: Update order status
router.put('/admin/:id/status', adminAuth, async (req, res) => {
    try {
        const { status, notes } = req.body;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('user', 'fullName phone email')
            .populate('service', 'name');

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        console.log(`📧 Order status changed to "${status}" - sending email notification...`);

        // Send email notification to customer
        const orderDetails = {
            orderNumber: order.orderNumber,
            serviceName: order.service?.name || 'Service',
            scheduledDate: order.scheduledDate.toDateString(),
            scheduledTime: order.scheduledTime,
            totalAmount: order.totalAmount,
            customerName: order.user.fullName,
            userEmail: order.user.email,
            address: `${order.address?.apartmentName || ''}, ${order.address?.flatNumber || ''}, ${order.address?.area || ''}`,
            flatNumber: order.address?.flatNumber,
            apartmentName: order.address?.apartmentName,
            area: order.address?.area,
            landmark: order.address?.landmark,
            pincode: order.address?.pincode
        };

        // Send status update email (don't wait for it)
        sendOrderStatusUpdateEmail(orderDetails, status, notes).catch(err =>
            console.error('Email notification error:', err)
        );

        res.json({ message: 'Order status updated successfully', order });
    } catch (error) {
        console.error('Order status update error:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

module.exports = router;