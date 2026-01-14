const mongoose = require('mongoose');
const config = require('./config/config');
const { MaidService, CookService, DriverService, CarWashService, DeepCleaningService, PestControlService } = require('./models/WorkingServices');
const Apartment = require('./models/Apartment');

async function seedEnhancedServices() {
    try {
        await mongoose.connect(config.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get sample apartments for pricing variations
        const apartments = await Apartment.find().limit(3);
        if (apartments.length === 0) {
            console.log('⚠️  No apartments found. Please seed apartments first.');
            process.exit(1);
        }

        // Clear existing services
        await Promise.all([
            MaidService.deleteMany({}),
            CookService.deleteMany({}),
            DriverService.deleteMany({}),
            CarWashService.deleteMany({}),
            DeepCleaningService.deleteMany({}),
            PestControlService.deleteMany({})
        ]);

        // Default service settings
        const defaultSettings = {
            operatingHours: {
                startTime: '06:00',
                endTime: '19:00'
            },
            defaultBasePrices: {
                maid: 150,
                cook: 200,
                driver: 200
            },
            defaultHourlyRates: {
                maid: 200,
                cook: 250,
                driver: 200
            }
        };

        // Seed Maid Service with hourly rates
        const maidService = new MaidService({
            pricingMatrix: [
                {
                    serviceVariant: 'normal_maid_1bhk_hourly',
                    displayName: 'Normal Maid - 1BHK - Hourly',
                    basePrice: 150,
                    hourlyRate: 200,
                    minHours: 1,
                    apartmentCategory: 'standard',
                    description: 'Basic cleaning service with hourly rate ₹200/hour'
                },
                {
                    serviceVariant: 'super_maid_1bhk_hourly',
                    displayName: 'Super Maid - 1BHK - Hourly',
                    basePrice: 200,
                    hourlyRate: 300,
                    minHours: 1,
                    apartmentCategory: 'standard',
                    description: 'Premium cleaning service with hourly rate ₹300/hour'
                },
                // Apartment-specific pricing
                {
                    serviceVariant: 'normal_maid_2bhk_luxury',
                    displayName: 'Normal Maid - 2BHK - Luxury Apartment',
                    basePrice: 250,
                    hourlyRate: 300,
                    minHours: 2,
                    apartmentId: apartments[0]._id,
                    apartmentCategory: 'luxury',
                    priceMultiplier: 1.5,
                    description: 'Luxury apartment cleaning with premium rates'
                }
            ],
            serviceIncludes: ['General house cleaning', 'Dusting', 'Mopping', 'Bathroom cleaning'],
            serviceExcludes: ['Cooking', 'Laundry', 'Deep cleaning', 'Window cleaning (exterior)'],
            settings: defaultSettings
        });

        // Seed Cook Service with hourly rates
        const cookService = new CookService({
            pricingMatrix: [
                {
                    serviceVariant: 'cook_lunch_hourly',
                    displayName: 'Cook - Lunch Preparation - Hourly',
                    basePrice: 200,
                    hourlyRate: 250,
                    minHours: 1,
                    apartmentCategory: 'standard',
                    description: 'Lunch cooking service with hourly rate ₹250/hour'
                },
                {
                    serviceVariant: 'cook_dinner_hourly',
                    displayName: 'Cook - Dinner Preparation - Hourly',
                    basePrice: 250,
                    hourlyRate: 300,
                    minHours: 1.5,
                    apartmentCategory: 'standard',
                    description: 'Dinner cooking service with hourly rate ₹300/hour'
                },
                // Apartment-specific pricing
                {
                    serviceVariant: 'cook_premium_apartment',
                    displayName: 'Cook - Premium Apartment - All Meals',
                    basePrice: 400,
                    hourlyRate: 350,
                    minHours: 3,
                    apartmentId: apartments[1]._id,
                    apartmentCategory: 'premium',
                    priceMultiplier: 1.2,
                    description: 'Premium apartment cooking service'
                }
            ],
            serviceIncludes: ['Meal preparation', 'Fresh cooking', 'Basic kitchen cleanup', 'Food storage'],
            serviceExcludes: ['Grocery shopping', 'Full kitchen cleaning', 'Serving', 'Dish washing'],
            settings: defaultSettings
        });

        // Seed Driver Service
        const driverService = new DriverService({
            pricingMatrix: [
                {
                    serviceVariant: 'driver_hourly_sedan',
                    displayName: 'Driver - Hourly - Sedan',
                    basePrice: 200,
                    hourlyRate: 200,
                    minHours: 2,
                    apartmentCategory: 'standard',
                    description: 'Professional driver service ₹200/hour'
                },
                {
                    serviceVariant: 'driver_trip_based',
                    displayName: 'Driver - Single Trip',
                    basePrice: 300,
                    duration: 60,
                    apartmentCategory: 'standard',
                    description: 'One-way trip service'
                }
            ],
            serviceIncludes: ['Safe driving', 'Vehicle maintenance checks', 'Route planning', 'Punctual service'],
            serviceExcludes: ['Fuel costs', 'Tolls', 'Parking charges', 'Vehicle repairs'],
            settings: defaultSettings
        });

        // Seed other services with time restrictions
        const carWashService = new CarWashService({
            pricingMatrix: [
                { serviceVariant: 'exterior_hatchback_basic', displayName: 'Exterior Wash - Hatchback', basePrice: 200, duration: 30, apartmentCategory: 'standard' },
                { serviceVariant: 'complete_sedan_premium', displayName: 'Complete Wash - Sedan', basePrice: 500, duration: 75, apartmentCategory: 'standard' }
            ],
            serviceIncludes: ['Vehicle washing', 'Tire cleaning', 'Interior cleaning', 'Basic wax'],
            serviceExcludes: ['Mechanical repairs', 'Paint correction', 'Engine repairs'],
            settings: defaultSettings
        });

        const deepCleaningService = new DeepCleaningService({
            pricingMatrix: [
                { serviceVariant: 'full_home_1bhk', displayName: 'Full Home - 1BHK', basePrice: 3199, duration: 300, apartmentCategory: 'standard' },
                { serviceVariant: 'bathroom_cleaning', displayName: 'Bathroom Deep Clean', basePrice: 831, duration: 120, apartmentCategory: 'standard' }
            ],
            serviceIncludes: ['Complete floor cleaning', 'Wall cleaning', 'Appliance cleaning'],
            serviceExcludes: ['Painting', 'Electrical work', 'Plumbing'],
            settings: defaultSettings
        });

        const pestControlService = new PestControlService({
            pricingMatrix: [
                { serviceVariant: 'general_pest_1bhk', displayName: 'General Pest Control - 1BHK', basePrice: 800, duration: 120, apartmentCategory: 'standard' },
                { serviceVariant: 'comprehensive_3bhk', displayName: 'Comprehensive Treatment - 3BHK', basePrice: 2500, duration: 240, apartmentCategory: 'standard' }
            ],
            serviceIncludes: ['Inspection', 'Treatment application', 'Follow-up visits'],
            serviceExcludes: ['Structural repairs', 'Furniture moving', 'Outdoor treatment'],
            settings: defaultSettings
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

        console.log('✅ Enhanced services created successfully!');
        console.log(`
📋 Services Created with New Features:
1. Maid Service - ${maidService.pricing.length} pricing options (with hourly rates)
2. Cook Service - ${cookService.pricing.length} pricing options (with hourly rates)  
3. Driver Service - ${driverService.pricing.length} pricing options
4. Car Wash Service - ${carWashService.pricing.length} pricing options
5. Deep Cleaning Service - ${deepCleaningService.pricing.length} pricing options
6. Pest Control Service - ${pestControlService.pricing.length} pricing options

🕐 Operating Hours: 6:00 AM - 7:00 PM (all services)
💰 Hourly Rates: Maid ₹200/hr, Cook ₹250/hr, Driver ₹200/hr
🏢 Apartment Categories: Budget (20% off), Standard (base), Premium (20% up), Luxury (50% up)
        `);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding enhanced services:', error);
        process.exit(1);
    }
}

seedEnhancedServices();