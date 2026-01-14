const mongoose = require('mongoose');

const carWashPricingSchema = new mongoose.Schema({
    // Flexible display fields (used by frontend/seed scripts)
    serviceVariant: String,
    displayName: String,
    description: String,

    // Pricing fields (flexible naming)
    baseRate: Number,
    additionalRate: {
        type: Number,
        default: 0
    },
    price: Number,
    basePrice: Number, // Alternative naming
    minHours: {
        type: Number,
        default: 1
    },

    // Original service configuration (optional)
    serviceType: {
        type: String,
        enum: ['interior', 'exterior', 'complete', 'detailing']
    },
    carType: {
        type: String,
        enum: ['hatchback', 'sedan', 'suv', 'luxury']
    },
    packageType: {
        type: String,
        enum: ['basic', 'premium', 'deluxe']
    },

    // Apartment-specific pricing
    apartmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Apartment',
        required: false
    },
    apartmentIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Apartment'
    }],
    apartmentNames: [String],
    apartmentCategory: {
        type: String,
        enum: ['budget', 'standard', 'premium', 'luxury'],
        default: 'standard'
    },

    priceAfterVisit: {
        type: Boolean,
        default: false
    },
    startingPrice: Number,
    estimatedTime: Number,
    duration: Number,

    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const carWashServiceSchema = new mongoose.Schema({
    name: {
        type: String,
        default: 'Car Wash Services'
    },
    description: {
        type: String,
        default: 'Professional car cleaning and detailing services at your doorstep'
    },
    category: {
        type: String,
        default: 'automotive'
    },
    icon: {
        type: String,
        default: 'bi-car-front'
    },
    isActive: {
        type: Boolean,
        default: true
    },

    // Service type definitions with what's included
    serviceTypes: {
        type: mongoose.Schema.Types.Mixed,
        default: {
            interior: {
                name: 'Interior Cleaning',
                description: 'Complete interior cleaning and sanitization',
                includes: [
                    'Dashboard cleaning and polishing',
                    'Seat cleaning (fabric/leather)',
                    'Floor mat cleaning',
                    'Interior glass cleaning',
                    'Vacuum cleaning',
                    'Air freshener application',
                    'Door panel cleaning'
                ],
                excludes: [
                    'Engine cleaning',
                    'Exterior washing',
                    'Tire cleaning',
                    'Waxing'
                ],
                estimated_time: 45
            },
            exterior: {
                name: 'Exterior Cleaning',
                description: 'Complete exterior washing and drying',
                includes: [
                    'Body washing with soap',
                    'Tire and rim cleaning',
                    'Glass cleaning (exterior)',
                    'Drying with microfiber cloth',
                    'Basic polishing',
                    'Headlight cleaning'
                ],
                excludes: [
                    'Interior cleaning',
                    'Engine bay cleaning',
                    'Waxing/coating',
                    'Detailing'
                ],
                estimated_time: 30
            },
            complete: {
                name: 'Complete Wash',
                description: 'Both interior and exterior cleaning',
                includes: [
                    'All interior cleaning services',
                    'All exterior cleaning services',
                    'Basic wax application',
                    'Tire shine application'
                ],
                excludes: [
                    'Deep detailing',
                    'Paint correction',
                    'Ceramic coating',
                    'Engine detailing'
                ],
                estimated_time: 75
            },
            detailing: {
                name: 'Full Detailing',
                description: 'Premium detailing with advanced care',
                includes: [
                    'All complete wash services',
                    'Paint polishing',
                    'Wax coating',
                    'Tire dressing',
                    'Chrome polishing',
                    'Door jamb cleaning',
                    'Engine bay basic cleaning'
                ],
                excludes: [
                    'Paint correction',
                    'Ceramic coating',
                    'Interior steam cleaning',
                    'Scratch removal'
                ],
                estimated_time: 120
            }
        }
    },

    // Car type definitions
    carTypes: {
        type: mongoose.Schema.Types.Mixed,
        default: {
            hatchback: {
                name: 'Hatchback',
                description: 'Small cars (Swift, i10, Polo, etc.)',
                examples: ['Swift', 'i10', 'Polo', 'Baleno']
            },
            sedan: {
                name: 'Sedan',
                description: 'Medium cars (City, Verna, Dzire, etc.)',
                examples: ['City', 'Verna', 'Dzire', 'Ciaz']
            },
            suv: {
                name: 'SUV',
                description: 'Large cars (Innova, XUV, Fortuner, etc.)',
                examples: ['Innova', 'XUV500', 'Fortuner', 'Scorpio']
            },
            luxury: {
                name: 'Luxury',
                description: 'Premium cars (BMW, Audi, Mercedes, etc.)',
                examples: ['BMW', 'Audi', 'Mercedes', 'Jaguar']
            }
        }
    },

    // Package type definitions
    packageTypes: {
        type: mongoose.Schema.Types.Mixed,
        default: {
            basic: {
                name: 'Basic Package',
                description: 'Standard cleaning with basic products',
                features: ['Standard cleaning products', 'Basic techniques', 'Good value']
            },
            premium: {
                name: 'Premium Package',
                description: 'Enhanced cleaning with quality products',
                features: ['Premium cleaning products', 'Advanced techniques', 'Better finish']
            },
            deluxe: {
                name: 'Deluxe Package',
                description: 'Top-tier cleaning with luxury products',
                features: ['Luxury cleaning products', 'Expert techniques', 'Showroom finish']
            }
        }
    },

    // What car wash service WON'T do
    serviceExcludes: [{
        type: String,
        default: [
            'Mechanical repairs',
            'Paint scratch removal',
            'Dent removal',
            'Interior damage repair',
            'AC servicing',
            'Oil change',
            'Tire replacement',
            'Electrical work',
            'Insurance claims',
            'Parts replacement'
        ]
    }],

    // Admin-configurable pricing matrix
    pricingMatrix: [carWashPricingSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('CarWashService', carWashServiceSchema);