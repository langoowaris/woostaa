const mongoose = require('mongoose');
const Service = require('../models/Service');
const connectDB = require('../database/database');

// Connect to database
connectDB();

const servicesData = [
    {
        name: "Maid Services",
        description: "Professional home cleaning and housekeeping services",
        category: "cleaning",
        icon: "bi bi-house-fill",
        basePrice: 200,
        pricingType: "hourly",
        pricingOptions: [
            {
                planType: "hourly",
                duration: 60,
                price: 200,
                description: "1 hour cleaning service"
            },
            {
                planType: "hourly",
                duration: 120,
                price: 380,
                description: "2 hours cleaning service"
            },
            {
                planType: "weekly",
                duration: 7,
                price: 1200,
                description: "Weekly cleaning (3 visits)",
                factors: [
                    {
                        name: "Apartment Type",
                        options: [
                            { label: "1BHK", priceMultiplier: 1, additionalCost: 0 },
                            { label: "2BHK", priceMultiplier: 1.2, additionalCost: 0 },
                            { label: "3BHK", priceMultiplier: 1.5, additionalCost: 0 },
                            { label: "4BHK+", priceMultiplier: 2, additionalCost: 0 }
                        ]
                    }
                ]
            },
            {
                planType: "monthly",
                duration: 30,
                price: 4500,
                description: "Monthly cleaning (12 visits)",
                factors: [
                    {
                        name: "Apartment Type",
                        options: [
                            { label: "1BHK", priceMultiplier: 1, additionalCost: 0 },
                            { label: "2BHK", priceMultiplier: 1.2, additionalCost: 0 },
                            { label: "3BHK", priceMultiplier: 1.5, additionalCost: 0 },
                            { label: "4BHK+", priceMultiplier: 2, additionalCost: 0 }
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: "Cook Services",
        description: "Expert chefs for daily cooking and meal preparation",
        category: "cooking",
        icon: "bi bi-cup-hot-fill",
        basePrice: 300,
        pricingType: "hourly",
        pricingOptions: [
            {
                planType: "hourly",
                duration: 60,
                price: 300,
                description: "1 hour cooking service"
            },
            {
                planType: "weekly",
                duration: 7,
                price: 1800,
                description: "Weekly cooking (7 days)",
                factors: [
                    {
                        name: "Meal Type",
                        options: [
                            { label: "Breakfast Only", priceMultiplier: 0.6, additionalCost: 0 },
                            { label: "Lunch Only", priceMultiplier: 1, additionalCost: 0 },
                            { label: "Dinner Only", priceMultiplier: 1, additionalCost: 0 },
                            { label: "Lunch + Dinner", priceMultiplier: 1.7, additionalCost: 0 }
                        ]
                    },
                    {
                        name: "Family Size",
                        options: [
                            { label: "1-2 people", priceMultiplier: 1, additionalCost: 0 },
                            { label: "3-4 people", priceMultiplier: 1.3, additionalCost: 0 },
                            { label: "5+ people", priceMultiplier: 1.6, additionalCost: 0 }
                        ]
                    }
                ]
            },
            {
                planType: "monthly",
                duration: 30,
                price: 6800,
                description: "Monthly cooking (30 days)",
                factors: [
                    {
                        name: "Meal Type",
                        options: [
                            { label: "Breakfast Only", priceMultiplier: 0.6, additionalCost: 0 },
                            { label: "Lunch Only", priceMultiplier: 1, additionalCost: 0 },
                            { label: "Dinner Only", priceMultiplier: 1, additionalCost: 0 },
                            { label: "Lunch + Dinner", priceMultiplier: 1.7, additionalCost: 0 }
                        ]
                    },
                    {
                        name: "Family Size",
                        options: [
                            { label: "1-2 people", priceMultiplier: 1, additionalCost: 0 },
                            { label: "3-4 people", priceMultiplier: 1.3, additionalCost: 0 },
                            { label: "5+ people", priceMultiplier: 1.6, additionalCost: 0 }
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: "Driver Services",
        description: "Professional drivers for your transportation needs",
        category: "transport",
        icon: "bi bi-car-front-fill",
        basePrice: 400,
        pricingType: "fixed",
        pricingOptions: [
            {
                planType: "fixed",
                duration: 0,
                price: 400,
                description: "Per trip within city",
                factors: [
                    {
                        name: "Trip Type",
                        options: [
                            { label: "Local (Within 10km)", priceMultiplier: 1, additionalCost: 0 },
                            { label: "Airport Drop/Pickup", priceMultiplier: 1.5, additionalCost: 0 },
                            { label: "Outstation (Per day)", priceMultiplier: 3, additionalCost: 0 }
                        ]
                    },
                    {
                        name: "Vehicle Type",
                        options: [
                            { label: "Hatchback", priceMultiplier: 1, additionalCost: 0 },
                            { label: "Sedan", priceMultiplier: 1.3, additionalCost: 0 },
                            { label: "SUV", priceMultiplier: 1.6, additionalCost: 0 }
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: "Car Washing",
        description: "Professional car cleaning and detailing services",
        category: "automotive",
        icon: "car-wash",
        basePrice: 250,
        pricingType: "custom",
        pricingOptions: [
            {
                planType: "fixed",
                duration: 45,
                price: 250,
                description: "Basic car wash (30-45 min)",
                factors: [
                    {
                        name: "Car Size",
                        options: [
                            { label: "Small Car (Hatchback)", priceMultiplier: 1, additionalCost: 0 },
                            { label: "Medium Car (Sedan)", priceMultiplier: 1.2, additionalCost: 0 },
                            { label: "Large Car (SUV)", priceMultiplier: 1.5, additionalCost: 0 }
                        ]
                    },
                    {
                        name: "Service Type",
                        options: [
                            { label: "Exterior Only", priceMultiplier: 1, additionalCost: 0 },
                            { label: "Interior Only", priceMultiplier: 0.8, additionalCost: 0 },
                            { label: "Full Service (Interior + Exterior)", priceMultiplier: 1.6, additionalCost: 0 },
                            { label: "Premium Detailing", priceMultiplier: 2.5, additionalCost: 0 }
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: "Deep Cleaning",
        description: "Complete house deep cleaning and sanitization",
        category: "cleaning",
        icon: "bi bi-droplet-fill",
        basePrice: 800,
        pricingType: "custom",
        pricingOptions: [
            {
                planType: "fixed",
                duration: 240,
                price: 800,
                description: "Deep cleaning service (3-4 hours)",
                factors: [
                    {
                        name: "Apartment Type",
                        options: [
                            { label: "1BHK", priceMultiplier: 1, additionalCost: 0 },
                            { label: "2BHK", priceMultiplier: 1.4, additionalCost: 0 },
                            { label: "3BHK", priceMultiplier: 1.8, additionalCost: 0 },
                            { label: "4BHK+", priceMultiplier: 2.5, additionalCost: 0 }
                        ]
                    },
                    {
                        name: "Furnishing",
                        options: [
                            { label: "Unfurnished", priceMultiplier: 1, additionalCost: 0 },
                            { label: "Semi-furnished", priceMultiplier: 1.2, additionalCost: 0 },
                            { label: "Fully furnished", priceMultiplier: 1.5, additionalCost: 0 }
                        ]
                    },
                    {
                        name: "Add-ons",
                        options: [
                            { label: "Kitchen Deep Clean", priceMultiplier: 1, additionalCost: 300 },
                            { label: "Bathroom Deep Clean", priceMultiplier: 1, additionalCost: 200 },
                            { label: "Balcony Cleaning", priceMultiplier: 1, additionalCost: 150 },
                            { label: "Appliance Cleaning", priceMultiplier: 1, additionalCost: 400 }
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: "Pest Control",
        description: "Professional pest elimination and prevention services",
        category: "maintenance",
        icon: "bi bi-bug-fill",
        basePrice: 1200,
        pricingType: "fixed",
        pricingOptions: [
            {
                planType: "fixed",
                duration: 120,
                price: 1200,
                description: "Complete pest control treatment",
                factors: [
                    {
                        name: "Apartment Type",
                        options: [
                            { label: "1BHK", priceMultiplier: 1, additionalCost: 0 },
                            { label: "2BHK", priceMultiplier: 1.3, additionalCost: 0 },
                            { label: "3BHK", priceMultiplier: 1.6, additionalCost: 0 },
                            { label: "4BHK+", priceMultiplier: 2, additionalCost: 0 }
                        ]
                    },
                    {
                        name: "Pest Type",
                        options: [
                            { label: "General (Cockroaches, Ants)", priceMultiplier: 1, additionalCost: 0 },
                            { label: "Termites", priceMultiplier: 1.5, additionalCost: 0 },
                            { label: "Bedbugs", priceMultiplier: 1.8, additionalCost: 0 },
                            { label: "Comprehensive (All pests)", priceMultiplier: 2.2, additionalCost: 0 }
                        ]
                    }
                ]
            }
        ]
    }
];

async function seedServices() {
    try {
        console.log('Starting to seed services...');
        
        // Clear existing services
        await Service.deleteMany({});
        console.log('Cleared existing services');
        
        // Insert new services
        const services = await Service.insertMany(servicesData);
        console.log(`Successfully seeded ${services.length} services:`);
        
        services.forEach(service => {
            console.log(`- ${service.name} (${service.category})`);
        });
        
        console.log('✅ Services seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding services:', error);
        process.exit(1);
    }
}

// Run the seed function
seedServices();