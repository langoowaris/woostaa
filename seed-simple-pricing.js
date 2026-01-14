const mongoose = require('mongoose');
const config = require('./config/config');
const { MaidService, CookService, DriverService, CarWashService, DeepCleaningService, PestControlService } = require('./models/WorkingServices');
const Apartment = require('./models/Apartment');

async function seedSimplePricing() {
    try {
        await mongoose.connect(config.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get sample apartments
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

        // Seed Maid Service with apartment-specific pricing examples
        const maidService = new MaidService({
            pricingMatrix: [
                {
                    serviceVariant: 'normal_maid_all',
                    displayName: 'Normal Maid - All Buildings',
                    baseRate: 249,
                    additionalRate: 200,
                    minHours: 1,
                    apartmentIds: [],       // Available for all apartments
                    apartmentNames: [],
                    description: 'Standard maid service - 1hr: ₹249, 2hrs: ₹449, 3hrs: ₹649',
                    isActive: true
                },
                {
                    serviceVariant: 'maid_ramky',
                    displayName: 'Normal Maid - Ramky Apartments',
                    baseRate: 245,          // Different rate for Ramky
                    additionalRate: 180,    // Different additional rate  
                    minHours: 1,
                    apartmentIds: apartments.length > 0 ? [apartments[0]._id] : [],
                    apartmentNames: apartments.length > 0 ? [`${apartments[0].name} - Ramky Rate`] : [],
                    description: 'Special Ramky rates - 1hr: ₹245, 2hrs: ₹425, 3hrs: ₹605',
                    isActive: true
                },
                {
                    serviceVariant: 'maid_prestige',
                    displayName: 'Premium Maid - Prestige Apartments',
                    baseRate: 300,          // Premium rate for Prestige
                    additionalRate: 220,
                    minHours: 1,
                    apartmentIds: apartments.length > 1 ? [apartments[1]._id] : [],
                    apartmentNames: apartments.length > 1 ? [`${apartments[1].name} - Prestige Rate`] : [],
                    description: 'Premium Prestige rates - 1hr: ₹300, 2hrs: ₹520, 3hrs: ₹740',
                    isActive: true
                }
            ],
            serviceIncludes: ['General cleaning', 'Dusting', 'Mopping', 'Bathroom cleaning'],
            serviceExcludes: ['Cooking', 'Laundry', 'Deep cleaning'],
            settings: {
                defaultBaseRate: 249,
                defaultAdditionalRate: 200,
                operatingHours: { startTime: '06:00', endTime: '19:00' },
                isActive: true
            }
        });

        // Seed Cook Service with apartment variations
        const cookService = new CookService({
            pricingMatrix: [
                {
                    serviceVariant: 'cook_all_buildings',
                    displayName: 'Normal Cook - All Buildings',
                    baseRate: 299,
                    additionalRate: 250,
                    minHours: 1,
                    apartmentIds: [],
                    apartmentNames: [],
                    description: 'Standard cook service - 1hr: ₹299, 2hrs: ₹549, 3hrs: ₹799',
                    isActive: true
                },
                {
                    serviceVariant: 'cook_budget_apartments',
                    displayName: 'Cook - Budget Apartments',
                    baseRate: 250,
                    additionalRate: 200,
                    minHours: 1,
                    apartmentIds: apartments.length > 0 ? [apartments[0]._id] : [],
                    apartmentNames: apartments.length > 0 ? [`${apartments[0].name} - Budget Rate`] : [],
                    description: 'Budget rates - 1hr: ₹250, 2hrs: ₹450, 3hrs: ₹650',
                    isActive: true
                },
                {
                    serviceVariant: 'cook_premium_apartments',
                    displayName: 'Expert Cook - Premium Apartments',
                    baseRate: 399,
                    additionalRate: 350,
                    minHours: 1,
                    apartmentIds: apartments.length > 1 ? [apartments[1]._id] : [],
                    apartmentNames: apartments.length > 1 ? [`${apartments[1].name} - Premium Rate`] : [],
                    description: 'Premium cook - 1hr: ₹399, 2hrs: ₹749, 3hrs: ₹1099',
                    isActive: true
                }
            ],
            serviceIncludes: ['Meal preparation', 'Fresh cooking', 'Basic cleanup'],
            serviceExcludes: ['Grocery shopping', 'Full kitchen cleaning', 'Serving'],
            settings: {
                defaultBaseRate: 299,
                defaultAdditionalRate: 250,
                operatingHours: { startTime: '06:00', endTime: '19:00' },
                isActive: true
            }
        });

        // Seed Driver Service
        const driverService = new DriverService({
            pricingMatrix: [
                {
                    serviceVariant: 'normal_driver',
                    displayName: 'Normal Driver Service',
                    baseRate: 249,
                    additionalRate: 200,
                    minHours: 2,
                    apartmentIds: [],
                    description: '2 hours: ₹449, 3 hours: ₹649, 4 hours: ₹849',
                    isActive: true
                }
            ],
            serviceIncludes: ['Safe driving', 'Route planning', 'Punctual service'],
            serviceExcludes: ['Fuel costs', 'Tolls', 'Parking charges'],
            settings: {
                defaultBaseRate: 249,
                defaultAdditionalRate: 200,
                operatingHours: { startTime: '06:00', endTime: '19:00' },
                isActive: true
            }
        });

        // Other services (fixed pricing)
        const carWashService = new CarWashService({
            pricingMatrix: [
                { serviceVariant: 'basic_wash', displayName: 'Basic Car Wash', baseRate: 200, additionalRate: 0, apartmentIds: [], isActive: true },
                { serviceVariant: 'premium_wash', displayName: 'Premium Car Wash', baseRate: 500, additionalRate: 0, apartmentIds: [], isActive: true }
            ],
            settings: { defaultBaseRate: 200, defaultAdditionalRate: 0, isActive: true }
        });

        const deepCleaningService = new DeepCleaningService({
            pricingMatrix: [
                { serviceVariant: 'full_home_1bhk', displayName: 'Full Home - 1BHK', baseRate: 3199, additionalRate: 0, apartmentIds: [], isActive: true },
                { serviceVariant: 'bathroom_deep', displayName: 'Bathroom Deep Clean', baseRate: 831, additionalRate: 0, apartmentIds: [], isActive: true }
            ],
            settings: { defaultBaseRate: 3199, defaultAdditionalRate: 0, isActive: true }
        });

        const pestControlService = new PestControlService({
            pricingMatrix: [
                { serviceVariant: 'general_pest_1bhk', displayName: 'General Pest Control - 1BHK', baseRate: 800, additionalRate: 0, apartmentIds: [], isActive: true },
                { serviceVariant: 'comprehensive_3bhk', displayName: 'Comprehensive Treatment - 3BHK', baseRate: 2500, additionalRate: 0, apartmentIds: [], isActive: true }
            ],
            settings: { defaultBaseRate: 800, defaultAdditionalRate: 0, isActive: true }
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

        console.log('✅ Apartment-specific pricing services created successfully!');
        console.log(`
📋 Example Pricing Structure Created:

🏠 MAID SERVICES:
• All Buildings: Base ₹249 + ₹200/hr  
• Ramky Apartments: Base ₹245 + ₹180/hr (Special Rate)
• Prestige Apartments: Base ₹300 + ₹220/hr (Premium Rate)

👨‍🍳 COOK SERVICES:  
• All Buildings: Base ₹299 + ₹250/hr
• Budget Apartments: Base ₹250 + ₹200/hr
• Premium Apartments: Base ₹399 + ₹350/hr

🚗 DRIVER SERVICES:
• Standard rate: Base ₹249 + ₹200/hr (min 2 hours)

💡 Pricing Examples:
• Ramky Maid (3 hours): ₹245 + (2 × ₹180) = ₹605
• Prestige Maid (3 hours): ₹300 + (2 × ₹220) = ₹740
• Standard Maid (3 hours): ₹249 + (2 × ₹200) = ₹649

🎛️ Admin can now:
• Create different rates for different apartments
• Control which apartments see which services
• Set apartment-specific base + additional rates
• Operating hours: 6:00 AM - 7:00 PM
        `);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding simple pricing:', error);
        process.exit(1);
    }
}

seedSimplePricing();