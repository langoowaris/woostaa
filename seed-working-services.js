const mongoose = require('mongoose');
const config = require('./config/config');
const { MaidService, CookService, DriverService, CarWashService, DeepCleaningService, PestControlService } = require('./models/WorkingServices');

async function seedWorkingServices() {
    try {
        await mongoose.connect(config.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing services
        await Promise.all([
            MaidService.deleteMany({}),
            CookService.deleteMany({}),
            DriverService.deleteMany({}),
            CarWashService.deleteMany({}),
            DeepCleaningService.deleteMany({}),
            PestControlService.deleteMany({})
        ]);

        // Seed Maid Service
        const maidService = new MaidService({
            pricingMatrix: [
                { serviceVariant: 'normal_maid_1bhk_1h', displayName: 'Normal Maid - 1BHK - 1 Hour', price: 150, duration: 60, description: 'Basic cleaning for 1BHK apartment' },
                { serviceVariant: 'normal_maid_2bhk_1h', displayName: 'Normal Maid - 2BHK - 1 Hour', price: 200, duration: 60, description: 'Basic cleaning for 2BHK apartment' },
                { serviceVariant: 'super_maid_1bhk_1h', displayName: 'Super Maid - 1BHK - 1 Hour', price: 200, duration: 60, description: 'Premium cleaning for 1BHK apartment' },
                { serviceVariant: 'super_maid_2bhk_2h', displayName: 'Super Maid - 2BHK - 2 Hours', price: 400, duration: 120, description: 'Premium cleaning for 2BHK apartment' }
            ],
            serviceIncludes: ['General house cleaning', 'Dusting', 'Mopping', 'Bathroom cleaning'],
            serviceExcludes: ['Cooking', 'Laundry', 'Deep cleaning', 'Window cleaning (exterior)']
        });

        // Seed Cook Service
        const cookService = new CookService({
            pricingMatrix: [
                { serviceVariant: 'lunch_2people_1.5h', displayName: 'Lunch for 2 People - 1.5 Hours', price: 200, duration: 90, description: 'Fresh lunch preparation' },
                { serviceVariant: 'dinner_4people_2h', displayName: 'Dinner for 4 People - 2 Hours', price: 350, duration: 120, description: 'Complete dinner preparation' },
                { serviceVariant: 'all_meals_3people_4h', displayName: 'All Meals for 3 People - 4 Hours', price: 600, duration: 240, description: 'Complete meal service for the day' }
            ],
            serviceIncludes: ['Meal preparation', 'Fresh cooking', 'Basic kitchen cleanup', 'Food storage'],
            serviceExcludes: ['Grocery shopping', 'Full kitchen cleaning', 'Serving', 'Dish washing']
        });

        // Seed Driver Service
        const driverService = new DriverService({
            pricingMatrix: [
                { serviceVariant: 'hourly_sedan_4h', displayName: 'Sedan Driver - 4 Hours', price: 800, duration: 240, description: 'Professional driver for sedan' },
                { serviceVariant: 'trip_any_vehicle', displayName: 'Single Trip - Any Vehicle', price: 200, duration: 60, description: 'One-way trip service' },
                { serviceVariant: 'monthly_suv', displayName: 'Monthly Driver - SUV', price: 15000, duration: 0, description: 'Full month driver service' }
            ],
            serviceIncludes: ['Safe driving', 'Vehicle maintenance checks', 'Route planning', 'Punctual service'],
            serviceExcludes: ['Fuel costs', 'Tolls', 'Parking charges', 'Vehicle repairs']
        });

        // Seed Car Wash Service
        const carWashService = new CarWashService({
            pricingMatrix: [
                { serviceVariant: 'exterior_hatchback_basic', displayName: 'Exterior Wash - Hatchback - Basic', price: 200, duration: 30, description: 'External cleaning for small cars' },
                { serviceVariant: 'complete_sedan_premium', displayName: 'Complete Wash - Sedan - Premium', price: 500, duration: 75, description: 'Full service wash for medium cars' },
                { serviceVariant: 'detailing_luxury_deluxe', displayName: 'Full Detailing - Luxury Car - Deluxe', price: 1200, duration: 120, description: 'Premium detailing service' }
            ],
            serviceIncludes: ['Vehicle washing', 'Tire cleaning', 'Interior cleaning', 'Basic wax'],
            serviceExcludes: ['Mechanical repairs', 'Paint correction', 'Engine repairs', 'Parts replacement']
        });

        // Seed Deep Cleaning Service
        const deepCleaningService = new DeepCleaningService({
            pricingMatrix: [
                { serviceVariant: 'full_home_1bhk_furnished', displayName: 'Full Home - 1BHK Furnished', price: 3199, duration: 300, description: 'Complete deep cleaning for furnished 1BHK' },
                { serviceVariant: 'full_home_2bhk_furnished', displayName: 'Full Home - 2BHK Furnished', price: 3499, duration: 300, description: 'Complete deep cleaning for furnished 2BHK' },
                { serviceVariant: 'bathroom_classic_2bath', displayName: 'Bathroom Cleaning - 2 Bathrooms', price: 831, duration: 120, description: 'Deep bathroom cleaning with scrub machine' },
                { serviceVariant: 'kitchen_complete', displayName: 'Complete Kitchen Cleaning', price: 899, duration: 150, description: 'Comprehensive kitchen deep cleaning' }
            ],
            serviceIncludes: ['Complete floor cleaning', 'Wall cleaning', 'Appliance cleaning', 'Sanitization'],
            serviceExcludes: ['Painting', 'Electrical work', 'Plumbing', 'Furniture moving']
        });

        // Seed Pest Control Service
        const pestControlService = new PestControlService({
            pricingMatrix: [
                { serviceVariant: 'general_pest_1bhk_basic', displayName: 'General Pest Control - 1BHK - Basic', price: 800, duration: 120, description: 'Basic pest treatment for 1BHK' },
                { serviceVariant: 'cockroach_2bhk_advanced', displayName: 'Cockroach Treatment - 2BHK - Advanced', price: 1200, duration: 180, description: 'Specialized cockroach elimination' },
                { serviceVariant: 'comprehensive_3bhk_premium', displayName: 'Comprehensive Treatment - 3BHK - Premium', price: 2500, duration: 240, description: 'Complete pest management solution' }
            ],
            serviceIncludes: ['Inspection', 'Treatment application', 'Follow-up visits', 'Warranty coverage'],
            serviceExcludes: ['Structural repairs', 'Furniture moving', 'Outdoor treatment', 'Pet treatment']
        });

        // Save all services
        await Promise.all([
            maidService.save(),
            cookService.save(),
            driverService.save(),
            carWashService.save(),
            deepCleaningService.save(),
            pestControlService.save()
        ]);

        console.log('✅ All working services created successfully!');
        console.log(`
📋 Services Created:
1. Maid Service - ${maidService.pricing.length} pricing options
2. Cook Service - ${cookService.pricing.length} pricing options  
3. Driver Service - ${driverService.pricing.length} pricing options
4. Car Wash Service - ${carWashService.pricing.length} pricing options
5. Deep Cleaning Service - ${deepCleaningService.pricing.length} pricing options
6. Pest Control Service - ${pestControlService.pricing.length} pricing options
        `);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding services:', error);
        process.exit(1);
    }
}

seedWorkingServices();