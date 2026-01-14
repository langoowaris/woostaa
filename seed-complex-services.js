const mongoose = require('mongoose');
const config = require('./config/config');

// Import only working models
const MaidService = require('./models/MaidService');
const CookService = require('./models/CookService'); 
const DriverService = require('./models/DriverService');
const DeepCleaningService = require('./models/DeepCleaningService');

async function seedComplexServices() {
    try {
        await mongoose.connect(config.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear and create MaidService
        await MaidService.deleteMany({});
        const maidService = new MaidService({
            pricingMatrix: [
                {
                    maidType: 'normal_maid',
                    serviceType: 'hourly',
                    duration: 1,
                    bhkType: '1bhk',
                    price: 150,
                    description: '1 hour normal maid for 1BHK'
                },
                {
                    maidType: 'super_maid',
                    serviceType: 'hourly',
                    duration: 2,
                    bhkType: '2bhk',
                    price: 320,
                    description: '2 hours super maid for 2BHK'
                }
            ]
        });
        await maidService.save();
        console.log('✅ Maid Service created');

        // Clear and create CookService
        await CookService.deleteMany({});
        const cookService = new CookService({
            pricingMatrix: [
                {
                    mealType: 'lunch',
                    peopleCount: 2,
                    serviceType: 'hourly',
                    duration: 1.5,
                    price: 200,
                    description: '1.5 hours lunch cooking for 2 people'
                }
            ]
        });
        await cookService.save();
        console.log('✅ Cook Service created');

        // Clear and create DriverService
        await DriverService.deleteMany({});
        const driverService = new DriverService({
            pricingMatrix: [
                {
                    serviceType: 'hourly',
                    duration: 4,
                    vehicleType: 'sedan',
                    price: 800,
                    description: '4 hours driver service for sedan'
                }
            ]
        });
        await driverService.save();
        console.log('✅ Driver Service created');

        // Clear and create DeepCleaningService with simple structure
        await DeepCleaningService.deleteMany({});
        const deepCleaningService = new DeepCleaningService({});
        await deepCleaningService.save();
        console.log('✅ Deep Cleaning Service created');

        console.log('\n🎉 Complex services seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding services:', error);
        process.exit(1);
    }
}

seedComplexServices();