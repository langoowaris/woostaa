const express = require('express');
const Service = require('../models/Service');
const { MaidService, CookService, DriverService, CarWashService, DeepCleaningService, PestControlService } = require('../models/WorkingServices');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all active services
router.get('/', async (req, res) => {
    try {
        const services = await Service.find({ isActive: true });
        res.json(services);
    } catch (error) {
        console.error('Services fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

// Get detailed service by type for booking
router.get('/detailed/:type', async (req, res) => {
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
            case 'car-wash':
                service = await CarWashService.findOne();
                break;
            case 'deepcleaning':
            case 'deep-cleaning':
                service = await DeepCleaningService.findOne();
                break;
            case 'pestcontrol':
            case 'pest-control':
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
        console.error('Detailed service fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch service details' });
    }
});

// Get service by ID with pricing details
router.get('/:id', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service || !service.isActive) {
            return res.status(404).json({ error: 'Service not found' });
        }
        res.json(service);
    } catch (error) {
        console.error('Service fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch service' });
    }
});

// Admin: Create new service
router.post('/', adminAuth, async (req, res) => {
    try {
        const service = new Service(req.body);
        await service.save();
        res.status(201).json(service);
    } catch (error) {
        console.error('Service creation error:', error);
        res.status(500).json({ error: 'Failed to create service' });
    }
});

// Admin: Update service
router.put('/:id', adminAuth, async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        res.json(service);
    } catch (error) {
        console.error('Service update error:', error);
        res.status(500).json({ error: 'Failed to update service' });
    }
});

// Admin: Delete service (soft delete)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Service deletion error:', error);
        res.status(500).json({ error: 'Failed to delete service' });
    }
});

module.exports = router;