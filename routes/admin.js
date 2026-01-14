const express = require('express');
const User = require('../models/User');
const Worker = require('../models/Worker');
const Service = require('../models/Service');
const Order = require('../models/Order');
const Apartment = require('../models/Apartment');
const SiteStats = require('../models/SiteStats');

// Import simple service model for worker assignments
const SimpleService = require('../models/SimpleServices');

// Import working service models for pricing management
const {
    MaidService,
    CookService,
    DriverService,
    CarWashService,
    DeepCleaningService,
    PestControlService
} = require('../models/WorkingServices');

const ServiceCategory = require('../models/ServiceCategory');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// All routes require admin authentication
router.use(adminAuth);

// Dashboard stats
router.get('/dashboard/stats', async (req, res) => {
    try {
        const [
            totalUsers,
            totalWorkers,
            totalOrders,
            totalApartments,
            recentOrders,
            pendingOrders,
            siteStats
        ] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            Worker.countDocuments(),
            Order.countDocuments(),
            Apartment.countDocuments(),
            Order.find().sort({ createdAt: -1 }).limit(5).populate('user').populate({
                path: 'service',
                select: 'name',
                options: { retainNullValues: false }
            }),
            Order.countDocuments({ status: 'pending' }),
            SiteStats.findOne()
        ]);

        res.json({
            stats: {
                totalUsers,
                totalWorkers,
                totalOrders,
                totalApartments,
                pendingOrders,
                totalUniqueVisitors: siteStats ? siteStats.totalUniqueVisitors : 0
            },
            recentOrders
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

// === USER MANAGEMENT ===
router.get('/users', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;

        const query = { role: 'user' };
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments(query)
        ]);

        res.json({
            users,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            }
        });
    } catch (error) {
        console.error('Users fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get user's orders
        const orders = await Order.find({ user: req.params.id })
            .populate('service')
            .sort({ createdAt: -1 });

        res.json({ user, orders });
    } catch (error) {
        console.error('User fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

router.put('/users/:id', async (req, res) => {
    try {
        const updates = req.body;
        delete updates.password; // Don't allow password updates through this route
        delete updates.role; // Don't allow role changes

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('User update error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if user has active orders
        const activeOrders = await Order.countDocuments({
            user: req.params.id,
            status: { $in: ['pending', 'confirmed', 'in_progress'] }
        });

        if (activeOrders > 0) {
            return res.status(400).json({ error: 'Cannot delete user with active orders' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('User delete error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// === WORKER MANAGEMENT ===
router.get('/workers', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;

        const query = {};
        if (search) {
            // Find apartments that match the search term
            const matchingApartments = await Apartment.find({
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { area: { $regex: search, $options: 'i' } }
                ]
            }).select('_id');
            const apartmentIds = matchingApartments.map(apt => apt._id);

            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { areas: { $in: apartmentIds } }
            ];
        }

        const [workers, total] = await Promise.all([
            Worker.find(query)
                .populate('services', 'name')
                .populate('areas', 'name area pincode')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Worker.countDocuments(query)
        ]);

        res.json({
            workers,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            }
        });
    } catch (error) {
        console.error('Workers fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch workers' });
    }
});

router.get('/workers/:id', async (req, res) => {
    try {
        const worker = await Worker.findById(req.params.id)
            .populate('services', 'name')
            .populate('areas', 'name area pincode');
        if (!worker) {
            return res.status(404).json({ error: 'Worker not found' });
        }
        res.json(worker);
    } catch (error) {
        console.error('Worker fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch worker' });
    }
});

router.post('/workers', async (req, res) => {
    try {
        const worker = new Worker(req.body);
        await worker.save();
        await worker.populate('services', 'name');
        res.status(201).json(worker);
    } catch (error) {
        console.error('Worker creation error:', error);
        res.status(500).json({ error: 'Failed to create worker' });
    }
});

router.put('/workers/:id', async (req, res) => {
    try {
        const worker = await Worker.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('services', 'name');

        if (!worker) {
            return res.status(404).json({ error: 'Worker not found' });
        }

        res.json(worker);
    } catch (error) {
        console.error('Worker update error:', error);
        res.status(500).json({ error: 'Failed to update worker' });
    }
});

router.delete('/workers/:id', async (req, res) => {
    try {
        const worker = await Worker.findByIdAndDelete(req.params.id);
        if (!worker) {
            return res.status(404).json({ error: 'Worker not found' });
        }
        res.json({ message: 'Worker deleted successfully' });
    } catch (error) {
        console.error('Worker delete error:', error);
        res.status(500).json({ error: 'Failed to delete worker' });
    }
});

// === APARTMENT MANAGEMENT ===
router.get('/apartments', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;

        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { area: { $regex: search, $options: 'i' } },
                { pincode: { $regex: search, $options: 'i' } }
            ];
        }

        const [apartments, total] = await Promise.all([
            Apartment.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Apartment.countDocuments(query)
        ]);

        res.json({
            apartments,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            }
        });
    } catch (error) {
        console.error('Apartments fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch apartments' });
    }
});

router.get('/apartments/:id', async (req, res) => {
    try {
        const apartment = await Apartment.findById(req.params.id);
        if (!apartment) {
            return res.status(404).json({ error: 'Apartment not found' });
        }
        res.json(apartment);
    } catch (error) {
        console.error('Apartment fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch apartment' });
    }
});

router.post('/apartments', async (req, res) => {
    try {
        const apartment = new Apartment(req.body);
        await apartment.save();
        res.status(201).json(apartment);
    } catch (error) {
        console.error('Apartment creation error:', error);
        res.status(500).json({ error: 'Failed to create apartment' });
    }
});

router.put('/apartments/:id', async (req, res) => {
    try {
        const apartment = await Apartment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!apartment) {
            return res.status(404).json({ error: 'Apartment not found' });
        }

        res.json(apartment);
    } catch (error) {
        console.error('Apartment update error:', error);
        res.status(500).json({ error: 'Failed to update apartment' });
    }
});

router.delete('/apartments/:id', async (req, res) => {
    try {
        const apartment = await Apartment.findByIdAndDelete(req.params.id);
        if (!apartment) {
            return res.status(404).json({ error: 'Apartment not found' });
        }
        res.json({ message: 'Apartment deleted successfully' });
    } catch (error) {
        console.error('Apartment delete error:', error);
        res.status(500).json({ error: 'Failed to delete apartment' });
    }
});

// === SERVICE MANAGEMENT ===
router.get('/services', async (req, res) => {
    try {
        const services = await SimpleService.find().sort({ createdAt: -1 });
        res.json(services);
    } catch (error) {
        console.error('Services fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

// Get detailed services for management
router.get('/services/detailed', async (req, res) => {
    try {
        const [maidService, cookService, driverService, carWashService, deepCleaningService, pestControlService] = await Promise.all([
            MaidService.findOne(),
            CookService.findOne(),
            DriverService.findOne(),
            CarWashService.findOne(),
            DeepCleaningService.findOne(),
            PestControlService.findOne()
        ]);

        const detailedServices = {
            maid: maidService,
            cook: cookService,
            driver: driverService,
            carwash: carWashService,
            deepcleaning: deepCleaningService,
            pestcontrol: pestControlService
        };

        res.json(detailedServices);
    } catch (error) {
        console.error('Detailed services fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch detailed services' });
    }
});

// Get specific service details
router.get('/services/:type', async (req, res) => {
    try {
        const { type } = req.params;
        let service;

        switch (type) {
            case 'maid':
                service = await MaidService.findOne();
                break;
            case 'cook':
                service = await CookService.findOne();
                break;
            case 'driver':
                service = await DriverService.findOne();
                break;
            case 'carwash':
                service = await CarWashService.findOne();
                break;
            case 'deepcleaning':
                service = await DeepCleaningService.findOne();
                break;
            case 'pestcontrol':
                service = await PestControlService.findOne();
                break;
            default:
                return res.status(400).json({ error: 'Invalid service type' });
        }

        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        res.json(service);
    } catch (error) {
        console.error('Service detail fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch service details' });
    }
});

// === SPECIFIC SERVICE PRICING MANAGEMENT ===

// Helper to get service model by type
const getServiceModel = (type) => {
    switch (type) {
        case 'car-wash': return CarWashService;
        case 'cook': return CookService;
        case 'driver': return DriverService;
        case 'maid': return MaidService;
        case 'deep-cleaning': return DeepCleaningService;
        case 'pest-control': return PestControlService;
        default: return null;
    }
};

// Get pricing matrix for a service
router.get('/services/:type/pricing', async (req, res) => {
    try {
        const Model = getServiceModel(req.params.type);
        if (!Model) return res.status(400).json({ error: 'Invalid service type' });

        const service = await Model.findOne();
        if (!service) {
            // Auto-create if missing (fallback)
            const newService = new Model();
            await newService.save();
            return res.json([]);
        }

        res.json(service.pricingMatrix || []);
    } catch (error) {
        console.error('Get pricing error:', error);
        res.status(500).json({ error: 'Failed to fetch pricing' });
    }
});

// Add pricing rule
router.post('/services/:type/pricing/add', async (req, res) => {
    try {
        const Model = getServiceModel(req.params.type);
        if (!Model) return res.status(400).json({ error: 'Invalid service type' });

        const service = await Model.findOne();
        if (!service) return res.status(404).json({ error: 'Service not found' });

        // Add new pricing rule
        service.pricingMatrix.push(req.body);
        await service.save();

        res.json({ message: 'Pricing rule added successfully', pricing: service.pricingMatrix });
    } catch (error) {
        console.error('Pricing add error:', error);
        res.status(500).json({ error: 'Failed to add pricing rule' });
    }
});

// Update pricing rule
router.put('/services/:serviceType/pricing/:id', async (req, res) => {
    try {
        const { serviceType, id } = req.params;
        const updates = req.body;

        let Model;
        switch (serviceType) {
            case 'maid': Model = MaidService; break;
            case 'cook': Model = CookService; break;
            case 'driver': Model = DriverService; break;
            case 'carwash':
            case 'car-wash': Model = CarWashService; break;
            case 'deepcleaning':
            case 'deep-cleaning': Model = DeepCleaningService; break;
            case 'pestcontrol':
            case 'pest-control': Model = PestControlService; break;
            default: return res.status(400).json({ error: 'Invalid service type' });
        }

        const service = await Model.findOne();
        if (!service) return res.status(404).json({ error: 'Service not found' });

        const ruleIndex = service.pricingMatrix.findIndex(p => p._id.toString() === id);
        if (ruleIndex === -1) return res.status(404).json({ error: 'Pricing rule not found' });

        // Update fields
        const rule = service.pricingMatrix[ruleIndex];
        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined) {
                rule[key] = updates[key];
            }
        });

        // Ensure numbers
        if (rule.price) rule.price = Number(rule.price);
        if (rule.baseRate) rule.baseRate = Number(rule.baseRate);
        if (rule.additionalRate) rule.additionalRate = Number(rule.additionalRate);
        if (rule.minHours) rule.minHours = Number(rule.minHours);

        await service.save();
        res.json({ message: 'Pricing rule updated', rule });
    } catch (error) {
        console.error('Pricing update error:', error);
        res.status(500).json({ error: 'Failed to update pricing rule' });
    }
});

// Delete pricing rule
router.delete('/services/:type/pricing/:id', async (req, res) => {
    try {
        const Model = getServiceModel(req.params.type);
        if (!Model) return res.status(400).json({ error: 'Invalid service type' });

        const service = await Model.findOne();
        if (!service) return res.status(404).json({ error: 'Service not found' });

        // Remove pricing rule
        service.pricingMatrix = service.pricingMatrix.filter(item => item._id.toString() !== req.params.id);
        await service.save();

        res.json(service.pricingMatrix);
    } catch (error) {
        console.error('Delete pricing error:', error);
        res.status(500).json({ error: 'Failed to delete pricing rule' });
    }
});

module.exports = router;