const mongoose = require('mongoose');
const config = require('./config/config');

// Import all service models
const MaidService = require('./models/MaidService');
const CookService = require('./models/CookService');
const DriverService = require('./models/DriverService');
const CarWashService = require('./models/CarWashService');
const DeepCleaningService = require('./models/DeepCleaningService');
const PestControlService = require('./models/PestControlService');
const Apartment = require('./models/Apartment');

async function seedAllServices() {
    try {
        // Connect to MongoDB
        await mongoose.connect(config.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get sample apartments for reference
        const apartments = await Apartment.find().limit(3);
        if (apartments.length === 0) {
            console.log('⚠️  No apartments found. Please run apartment seeding first.');
            process.exit(1);
        }

        console.log(`Found ${apartments.length} apartments for reference`);

        // Clear existing services
        await Promise.all([
            MaidService.deleteMany({}),
            CookService.deleteMany({}),
            DriverService.deleteMany({}),
            CarWashService.deleteMany({}),
            DeepCleaningService.deleteMany({}),
            PestControlService.deleteMany({})
        ]);
        console.log('Cleared existing services');

        // 1. MAID SERVICE
        const maidService = new MaidService({
            pricingMatrix: [
                {
                    maidType: 'normal_maid',
                    serviceType: 'hourly',
                    duration: 1,
                    bhkType: '1bhk',
                    apartmentId: apartments[0]._id,
                    price: 150,
                    description: '1 hour normal maid for 1BHK'
                },
                {
                    maidType: 'super_maid',
                    serviceType: 'hourly',
                    duration: 2,
                    bhkType: '2bhk',
                    apartmentId: apartments[0]._id,
                    price: 320,
                    description: '2 hours super maid for 2BHK'
                },
                {
                    maidType: 'normal_maid',
                    serviceType: 'weekly',
                    duration: 1,
                    bhkType: '3bhk',
                    apartmentId: apartments[1]._id,
                    price: 800,
                    description: 'Weekly normal maid service for 3BHK'
                },
                {
                    maidType: 'super_maid',
                    serviceType: 'monthly',
                    duration: 1,
                    bhkType: '2bhk',
                    apartmentId: apartments[2]._id,
                    price: 2500,
                    description: 'Monthly super maid service for 2BHK'
                }
            ]
        });

        // 2. COOK SERVICE
        const cookService = new CookService({
            pricingMatrix: [
                {
                    mealType: 'lunch',
                    peopleCount: 2,
                    serviceType: 'hourly',
                    duration: 1.5,
                    apartmentId: apartments[0]._id,
                    price: 200,
                    description: '1.5 hours lunch cooking for 2 people'
                },
                {
                    mealType: 'dinner',
                    peopleCount: 4,
                    serviceType: 'hourly',
                    duration: 2,
                    apartmentId: apartments[1]._id,
                    price: 300,
                    description: '2 hours dinner cooking for 4 people'
                },
                {
                    mealType: 'all_meals',
                    peopleCount: 3,
                    serviceType: 'weekly',
                    duration: 4,
                    apartmentId: apartments[2]._id,
                    price: 1800,
                    description: 'Weekly all meals cooking for 3 people'
                }
            ]
        });

        // 3. DRIVER SERVICE
        const driverService = new DriverService({
            pricingMatrix: [
                {
                    serviceType: 'hourly',
                    duration: 4,
                    vehicleType: 'sedan',
                    apartmentId: apartments[0]._id,
                    price: 800,
                    description: '4 hours driver service for sedan'
                },
                {
                    serviceType: 'trip_based',
                    duration: 1,
                    vehicleType: 'any',
                    apartmentId: apartments[1]._id,
                    price: 200,
                    description: 'Single trip driver service'
                },
                {
                    serviceType: 'monthly',
                    duration: 1,
                    vehicleType: 'suv',
                    apartmentId: apartments[2]._id,
                    price: 15000,
                    description: 'Monthly driver service for SUV'
                }
            ]
        });

        // 4. CAR WASH SERVICE
        const carWashService = new CarWashService({
            pricingMatrix: [
                {
                    serviceType: 'exterior',
                    carType: 'hatchback',
                    packageType: 'basic',
                    apartmentId: apartments[0]._id,
                    price: 200,
                    description: 'Basic exterior wash for hatchback'
                },
                {
                    serviceType: 'complete',
                    carType: 'sedan',
                    packageType: 'premium',
                    apartmentId: apartments[1]._id,
                    price: 500,
                    description: 'Premium complete wash for sedan'
                },
                {
                    serviceType: 'detailing',
                    carType: 'luxury',
                    packageType: 'deluxe',
                    apartmentId: apartments[2]._id,
                    price: 1200,
                    description: 'Deluxe detailing for luxury car'
                }
            ]
        });

        // 5. DEEP CLEANING SERVICE
        const deepCleaningService = new DeepCleaningService({
            // Default structured data as per your example
            bathroomCleaning: {
                miniBathroomServices: [
                    {
                        itemName: 'exhaustFanCleaning',
                        displayName: 'Exhaust Fan Cleaning',
                        price: 89,
                        duration: '15 min',
                        durationMinutes: 15
                    },
                    {
                        itemName: 'ceilingFanCleaning',
                        displayName: 'Ceiling Fan Cleaning',
                        price: 49,
                        duration: '10 min',
                        durationMinutes: 10
                    },
                    {
                        itemName: 'mirrorCleaning',
                        displayName: 'Mirror Cleaning',
                        price: 59,
                        duration: '10 min',
                        durationMinutes: 10,
                        unit: 'per mirror'
                    }
                ]
            },
            kitchenCleaning: {
                applianceCleaning: [
                    {
                        itemName: 'fridgeCleaning',
                        displayName: 'Fridge Cleaning',
                        price: 399,
                        startsAt: true,
                        description: 'Deep cleaning of refrigerator'
                    },
                    {
                        itemName: 'microwaveCleaning',
                        displayName: 'Microwave Cleaning',
                        price: 199,
                        duration: '15 min',
                        durationMinutes: 15
                    }
                ],
                miniServices: [
                    {
                        itemName: 'sinkCleaning',
                        displayName: 'Sink Cleaning',
                        price: 99,
                        duration: '20 mins',
                        durationMinutes: 20
                    }
                ]
            },
            fullHomeCleaning: {
                miniServices: [
                    {
                        itemName: 'cabinetCleaning',
                        displayName: 'Cabinet Cleaning',
                        price: 299,
                        duration: '30 mins',
                        durationMinutes: 30,
                        description: 'Interior & exterior cleaning for up to 2 cabinets'
                    }
                ]
            }
        });

        // 6. PEST CONTROL SERVICE
        const pestControlService = new PestControlService({
            pricingMatrix: [
                {
                    bhkType: '1bhk',
                    treatmentType: 'general_pest',
                    serviceLevel: 'basic',
                    apartmentId: apartments[0]._id,
                    price: 800,
                    priceAfterVisit: true,
                    startingPrice: 600,
                    description: 'Basic general pest control for 1BHK',
                    warrantyPeriod: 3,
                    followUpVisits: 1
                },
                {
                    bhkType: '2bhk',
                    treatmentType: 'cockroach',
                    serviceLevel: 'advanced',
                    apartmentId: apartments[1]._id,
                    price: 1200,
                    priceAfterVisit: true,
                    startingPrice: 1000,
                    description: 'Advanced cockroach treatment for 2BHK',
                    warrantyPeriod: 6,
                    followUpVisits: 2
                },
                {
                    bhkType: '3bhk',
                    treatmentType: 'comprehensive',
                    serviceLevel: 'premium',
                    apartmentId: apartments[2]._id,
                    price: 2500,
                    priceAfterVisit: true,
                    startingPrice: 2000,
                    description: 'Premium comprehensive pest control for 3BHK',
                    warrantyPeriod: 12,
                    followUpVisits: 3
                }
            ]
        });

        // Save all services
        const [maid, cook, driver, carWash, deepCleaning, pestControl] = await Promise.all([
            maidService.save(),
            cookService.save(),
            driverService.save(),
            carWashService.save(),
            deepCleaningService.save(),
            pestControlService.save()
        ]);

        console.log('\n✅ Successfully created all 6 services:');
        console.log(`1. 📋 Maid Service - ${maid.pricingMatrix.length} pricing options`);
        console.log(`2. 👨‍🍳 Cook Service - ${cook.pricingMatrix.length} pricing options`);
        console.log(`3. 🚗 Driver Service - ${driver.pricingMatrix.length} pricing options`);
        console.log(`4. 🚙 Car Wash Service - ${carWash.pricingMatrix.length} pricing options`);
        console.log(`5. 🧽 Deep Cleaning Service - Comprehensive structure with mini services`);
        console.log(`6. 🐛 Pest Control Service - ${pestControl.pricingMatrix.length} pricing options`);

        console.log('\n🎉 All services have been created successfully!');
        console.log('You can now:');
        console.log('1. View services in the admin panel');
        console.log('2. Assign services to workers');
        console.log('3. Configure pricing through admin interface');
        console.log('4. Book services from the website');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating services:', error);
        process.exit(1);
    }
}

seedAllServices();