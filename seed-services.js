const mongoose = require('mongoose');
const { CarWashService, CookService, DriverService, MaidService, PestControlService, DeepCleaningService, SimpleService } = require('./models/WorkingServices');
require('dotenv').config();

async function seedServices() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Car Wash
        let carWash = await CarWashService.findOne();
        if (!carWash) {
            carWash = new CarWashService();
            await carWash.save();
            console.log('Car Wash Service initialized');
        } else {
            console.log('Car Wash Service already exists');
        }

        // Cook
        let cook = await CookService.findOne();
        if (!cook) {
            cook = new CookService();
            await cook.save();
            console.log('Cook Service initialized');
        } else {
            console.log('Cook Service already exists');
        }

        // Driver
        let driver = await DriverService.findOne();
        if (!driver) {
            driver = new DriverService();
            await driver.save();
            console.log('Driver Service initialized');
        } else {
            console.log('Driver Service already exists');
        }

        // Maid
        let maid = await MaidService.findOne();
        if (!maid) {
            maid = new MaidService();
            await maid.save();
            console.log('Maid Service initialized');
        } else {
            console.log('Maid Service already exists');
        }

        // Pest Control
        let pest = await PestControlService.findOne();
        if (!pest) {
            pest = new PestControlService();
            await pest.save();
            console.log('Pest Control Service initialized');
        } else {
            console.log('Pest Control Service already exists');
        }

        // Deep Cleaning
        let deep = await DeepCleaningService.findOne();
        if (!deep) {
            deep = new DeepCleaningService();
            await deep.save();
            console.log('Deep Cleaning Service initialized');
        } else {
            console.log('Deep Cleaning Service already exists');
        }

        // Seed SimpleServices for Worker association
        const serviceTypes = [
            { name: 'Maid', type: 'maid', category: 'cleaning', description: 'Regular house cleaning' },
            { name: 'Cook', type: 'cook', category: 'cooking', description: 'Home cooking services' },
            { name: 'Driver', type: 'driver', category: 'transport', description: 'Professional driving services' },
            { name: 'Car Wash', type: 'carwash', category: 'automotive', description: 'Vehicle cleaning services' },
            { name: 'Deep Cleaning', type: 'deepcleaning', category: 'cleaning', description: 'Professional deep cleaning' },
            { name: 'Pest Control', type: 'pestcontrol', category: 'maintenance', description: 'Pest management services' }
        ];

        for (const s of serviceTypes) {
            let simple = await SimpleService.findOne({ type: s.type });
            if (!simple) {
                simple = new SimpleService(s);
                await simple.save();
                console.log(`SimpleService ${s.name} initialized`);
            } else {
                console.log(`SimpleService ${s.name} already exists`);
            }
        }

        console.log('Seeding complete');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
}

seedServices();