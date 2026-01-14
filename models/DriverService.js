const mongoose = require('mongoose');

const driverPricingSchema = new mongoose.Schema({
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
    price: Number, // Alternative/backwards compatibility
    minHours: {
        type: Number,
        default: 1
    },

    // Original service configuration (optional)
    serviceType: {
        type: String,
        enum: ['hourly', 'weekly', 'monthly', 'trip_based']
    },
    duration: Number,
    vehicleType: {
        type: String,
        enum: ['hatchback', 'sedan', 'suv', 'any'],
        default: 'any'
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

    // Additional costs
    fuelIncluded: {
        type: Boolean,
        default: false
    },
    tollsIncluded: {
        type: Boolean,
        default: false
    },
    parkingIncluded: {
        type: Boolean,
        default: false
    },

    maxDistance: Number,
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const driverServiceSchema = new mongoose.Schema({
    name: {
        type: String,
        default: 'Driver Services'
    },
    description: {
        type: String,
        default: 'Professional drivers for personal transportation and vehicle assistance'
    },
    category: {
        type: String,
        default: 'transport'
    },
    icon: {
        type: String,
        default: 'bi-car-front-fill'
    },
    isActive: {
        type: Boolean,
        default: true
    },

    // What drivers WILL do
    serviceIncludes: [{
        type: String,
        default: [
            'Safe and professional driving',
            'Vehicle maintenance checks',
            'Route planning and navigation',
            'Punctual service',
            'Local area knowledge',
            'Basic vehicle cleaning',
            'Emergency assistance',
            'Flexible scheduling within booked hours'
        ]
    }],

    // What drivers WON'T do
    serviceExcludes: [{
        type: String,
        default: [
            'Vehicle fuel costs (unless specified)',
            'Toll and parking charges (unless specified)',
            'Vehicle repairs or major maintenance',
            'Personal errands unrelated to driving',
            'Carrying heavy luggage without assistance',
            'Driving without valid license',
            'Long distance travel (over specified limit)',
            'Night driving (after 10 PM without prior agreement)',
            'Driving in extreme weather conditions',
            'Vehicle insurance coverage'
        ]
    }],

    // Service type definitions (static data)
    serviceTypes: {
        type: mongoose.Schema.Types.Mixed,
        default: {
            hourly: {
                name: 'Hourly Service',
                description: 'Driver available for specified hours',
                min_hours: 2,
                max_hours: 12
            },
            trip_based: {
                name: 'Trip Based',
                description: 'Single trip or return journey',
                typical_duration: '1-4 hours'
            },
            weekly: {
                name: 'Weekly Service',
                description: 'Driver available for weekly commitments',
                typical_hours_per_day: 4
            },
            monthly: {
                name: 'Monthly Service',
                description: 'Full month driver service',
                typical_hours_per_day: 6
            }
        }
    },

    // Vehicle type guide (static data)
    vehicleTypes: {
        type: mongoose.Schema.Types.Mixed,
        default: {
            hatchback: {
                name: 'Hatchback',
                description: 'Small cars (Swift, i10, etc.)',
                capacity: '4 people'
            },
            sedan: {
                name: 'Sedan',
                description: 'Medium cars (City, Verna, etc.)',
                capacity: '4-5 people'
            },
            suv: {
                name: 'SUV',
                description: 'Large cars (Innova, XUV, etc.)',
                capacity: '6-7 people'
            },
            any: {
                name: 'Any Vehicle',
                description: 'Driver can handle any vehicle type',
                capacity: 'Depends on vehicle'
            }
        }
    },

    // Admin-configurable pricing matrix
    pricingMatrix: [driverPricingSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('DriverService', driverServiceSchema);