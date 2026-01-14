const mongoose = require('mongoose');

const maidPricingSchema = new mongoose.Schema({
    // Flexible display fields (used by frontend/seed scripts)
    serviceVariant: String, // e.g., 'normal_maid_all', 'maid_premium'
    displayName: String, // e.g., 'Normal Maid - All Buildings'
    description: String, // e.g., '2 hours normal maid for 2BHK'

    // Pricing fields (flexible naming)
    baseRate: Number, // Base price for the service
    additionalRate: {
        type: Number,
        default: 0
    }, // Additional per hour rate
    price: Number, // Alternative pricing field (for backwards compatibility)
    minHours: {
        type: Number,
        default: 1
    },

    // Original service configuration (optional for backwards compatibility)
    maidType: {
        type: String,
        enum: ['normal_maid', 'super_maid']
    },
    serviceType: {
        type: String,
        enum: ['hourly', 'weekly', 'monthly']
    },
    duration: Number, // hours for hourly, 1 for weekly, 1 for monthly
    bhkType: {
        type: String,
        enum: ['1bhk', '2bhk', '3bhk', '4bhk', '5bhk_plus']
    },

    // Apartment-specific pricing
    apartmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Apartment',
        required: false // null means applies to all apartments
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

    // Price after visit option
    priceAfterVisit: {
        type: Boolean,
        default: false
    },
    startingPrice: Number, // When priceAfterVisit is true

    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});


const maidServiceSchema = new mongoose.Schema({
    name: {
        type: String,
        default: 'Maid Services'
    },
    description: {
        type: String,
        default: 'Professional home cleaning and housekeeping services for your daily needs'
    },
    category: {
        type: String,
        default: 'cleaning'
    },
    icon: {
        type: String,
        default: 'bi-house-fill'
    },
    isActive: {
        type: Boolean,
        default: true
    },

    // Time restrictions for all maid services
    timeRestrictions: {
        startTime: {
            type: String,
            default: '06:00'
        },
        endTime: {
            type: String,
            default: '19:00'
        }
    },

    // What maids WILL do
    serviceIncludes: [{
        type: String,
        default: [
            'General house cleaning',
            'Dusting furniture and surfaces',
            'Floor sweeping and mopping',
            'Bathroom cleaning and sanitizing',
            'Kitchen cleaning (counter tops, sink)',
            'Trash removal',
            'Bed making',
            'Light organizing'
        ]
    }],

    // What maids WON'T do
    serviceExcludes: [{
        type: String,
        default: [
            'Cooking meals',
            'Laundry and ironing',
            'Deep cleaning (separate service)',
            'Window cleaning (exterior)',
            'Heavy lifting or moving furniture',
            'Personal care assistance',
            'Child care or babysitting',
            'Pet care',
            'Electrical or plumbing work',
            'Cleaning valuable or fragile items'
        ]
    }],

    // Maid type definitions (static data)
    maidTypes: {
        type: mongoose.Schema.Types.Mixed,
        default: {
            normal_maid: {
                name: 'Normal Maid',
                description: 'Basic cleaning services with standard efficiency',
                skills: ['Basic cleaning', 'Dusting', 'Mopping', 'Bathroom cleaning']
            },
            super_maid: {
                name: 'Super Maid',
                description: 'Experienced maids with advanced cleaning skills and faster service',
                skills: ['Advanced cleaning techniques', 'Deep sanitization', 'Efficient time management', 'Attention to detail']
            }
        }
    },

    // Admin-configurable pricing matrix
    pricingMatrix: [maidPricingSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('MaidService', maidServiceSchema);