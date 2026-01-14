const express = require('express');
const Apartment = require('../models/Apartment');

const router = express.Router();

// Get all active apartments (public route)
router.get('/available', async (req, res) => {
    try {
        const { area, pincode } = req.query;
        
        // Build query for active apartments
        const query = { isActive: true };
        
        // Add filters if provided
        if (area) {
            query.area = { $regex: area, $options: 'i' };
        }
        if (pincode) {
            query.pincode = pincode;
        }
        
        const apartments = await Apartment.find(query)
            .select('name area pincode landmark totalUnits amenities serviceCharges')
            .sort({ area: 1, name: 1 });
        
        res.json(apartments);
    } catch (error) {
        console.error('Error fetching apartments:', error);
        res.status(500).json({ error: 'Failed to fetch apartments' });
    }
});

// Get apartment by ID (public route)
router.get('/:id', async (req, res) => {
    try {
        const apartment = await Apartment.findById(req.params.id)
            .select('name area pincode landmark totalUnits amenities serviceCharges');
        
        if (!apartment) {
            return res.status(404).json({ error: 'Apartment not found' });
        }
        
        res.json(apartment);
    } catch (error) {
        console.error('Error fetching apartment:', error);
        res.status(500).json({ error: 'Failed to fetch apartment' });
    }
});

// Get unique areas (for filtering)
router.get('/areas/list', async (req, res) => {
    try {
        const areas = await Apartment.distinct('area', { isActive: true });
        res.json(areas.sort());
    } catch (error) {
        console.error('Error fetching areas:', error);
        res.status(500).json({ error: 'Failed to fetch areas' });
    }
});

// Get unique pincodes by area (for filtering)
router.get('/pincodes/:area', async (req, res) => {
    try {
        const { area } = req.params;
        const pincodes = await Apartment.distinct('pincode', { 
            area: { $regex: area, $options: 'i' },
            isActive: true 
        });
        res.json(pincodes.sort());
    } catch (error) {
        console.error('Error fetching pincodes:', error);
        res.status(500).json({ error: 'Failed to fetch pincodes' });
    }
});

module.exports = router;