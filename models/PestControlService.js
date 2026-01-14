const mongoose = require('mongoose');

const pestControlPricingSchema = new mongoose.Schema({
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
    basePrice: Number,
    minHours: {
        type: Number,
        default: 1
    },

    // Original service configuration (optional)
    bhkType: {
        type: String,
        enum: ['1bhk', '2bhk', '3bhk', '4bhk', '5bhk_plus']
    },
    treatmentType: {
        type: String,
        enum: ['general_pest', 'cockroach', 'termite', 'rodent', 'comprehensive']
    },
    serviceLevel: {
        type: String,
        enum: ['basic', 'advanced', 'premium']
    },
    duration: Number,

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
        default: true
    },
    startingPrice: Number,
    warrantyPeriod: Number,
    followUpVisits: Number,
    estimatedTime: Number,

    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const pestControlServiceSchema = new mongoose.Schema({
    name: {
        type: String,
        default: 'Pest Control Services'
    },
    description: {
        type: String,
        default: 'Professional pest control and fumigation services for homes and offices'
    },
    category: {
        type: String,
        default: 'maintenance'
    },
    icon: {
        type: String,
        default: 'bi-bug-fill'
    },
    isActive: {
        type: Boolean,
        default: true
    },

    // What pest control WILL include
    serviceIncludes: [{
        type: String,
        default: [
            'Thorough inspection and assessment',
            'Targeted pest treatment application',
            'Safe and approved chemical usage',
            'Treatment of entry points and breeding areas',
            'Post-treatment cleanup',
            'Warranty period coverage',
            'Follow-up visits (as per package)',
            'Safety instructions and precautions',
            'Treatment report and recommendations',
            'Emergency callback service'
        ]
    }],

    // What pest control WON'T do
    serviceExcludes: [{
        type: String,
        default: [
            'Structural repairs or modifications',
            'Removal of furniture or belongings',
            'Cleaning of severe infestations without extra charge',
            'Treatment of outdoor areas (garden/terrace)',
            'Guarantee against new infestations from outside',
            'Treatment during active food preparation',
            'Immediate re-entry without proper ventilation',
            'Disposal of dead pests (basic cleanup only)',
            'Treatment of pets or animals',
            'Damage repair caused by pests'
        ]
    }],

    // Treatment type definitions
    treatmentTypes: {
        type: mongoose.Schema.Types.Mixed,
        default: {
            general_pest: {
                name: 'General Pest Control',
                description: 'Treatment for common household pests',
                targets: ['Ants', 'Spiders', 'Silverfish', 'Common insects'],
                warranty_months: 3
            },
            cockroach: {
                name: 'Cockroach Treatment',
                description: 'Specialized cockroach elimination and prevention',
                targets: ['All cockroach species', 'Breeding areas', 'Entry points'],
                warranty_months: 6
            },
            termite: {
                name: 'Termite Treatment',
                description: 'Complete termite protection and elimination',
                targets: ['Subterranean termites', 'Drywood termites', 'Wood protection'],
                warranty_months: 12
            },
            rodent: {
                name: 'Rodent Control',
                description: 'Rat and mice elimination and prevention',
                targets: ['Rats', 'Mice', 'Entry sealing', 'Nest removal'],
                warranty_months: 6
            },
            comprehensive: {
                name: 'Comprehensive Treatment',
                description: 'Complete pest management for all common pests',
                targets: ['All household pests', 'Prevention', 'Long-term protection'],
                warranty_months: 12
            }
        }
    },

    // Service level definitions
    serviceLevels: {
        type: mongoose.Schema.Types.Mixed,
        default: {
            basic: {
                name: 'Basic Treatment',
                description: 'Essential pest control with standard products',
                includes: [
                    'Basic inspection',
                    'Standard treatment',
                    'Basic warranty',
                    '1 follow-up visit'
                ]
            },
            advanced: {
                name: 'Advanced Treatment',
                description: 'Enhanced pest control with quality products',
                includes: [
                    'Detailed inspection',
                    'Advanced treatment methods',
                    'Extended warranty',
                    '2 follow-up visits',
                    'Prevention advice'
                ]
            },
            premium: {
                name: 'Premium Treatment',
                description: 'Comprehensive pest control with premium products',
                includes: [
                    'Comprehensive inspection',
                    'Premium treatment products',
                    'Maximum warranty',
                    '3 follow-up visits',
                    'Detailed prevention plan',
                    'Emergency callback'
                ]
            }
        }
    },

    // BHK type definitions for pest control
    bhkTypes: {
        type: mongoose.Schema.Types.Mixed,
        default: {
            '1bhk': {
                name: '1BHK',
                description: '1 bedroom, 1 hall, 1 kitchen + 1 bathroom',
                typical_area: '400-600 sq ft',
                estimated_time: 2
            },
            '2bhk': {
                name: '2BHK',
                description: '2 bedrooms, 1 hall, 1 kitchen + 2 bathrooms',
                typical_area: '600-900 sq ft',
                estimated_time: 3
            },
            '3bhk': {
                name: '3BHK',
                description: '3 bedrooms, 1 hall, 1 kitchen + 2-3 bathrooms',
                typical_area: '900-1200 sq ft',
                estimated_time: 4
            },
            '4bhk': {
                name: '4BHK',
                description: '4 bedrooms, 1 hall, 1 kitchen + 3-4 bathrooms',
                typical_area: '1200-1600 sq ft',
                estimated_time: 5
            },
            '5bhk_plus': {
                name: '5BHK+',
                description: '5+ bedrooms, multiple halls, kitchen + multiple bathrooms',
                typical_area: '1600+ sq ft',
                estimated_time: 6
            }
        }
    },

    // Safety and precautions
    safetyGuidelines: [{
        type: String,
        default: [
            'Evacuate treated areas for specified time',
            'Keep children and pets away during treatment',
            'Ventilate areas properly after treatment',
            'Do not clean treated surfaces immediately',
            'Follow technician instructions carefully',
            'Store food items safely before treatment'
        ]
    }],

    // Admin-configurable pricing matrix
    pricingMatrix: [pestControlPricingSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('PestControlService', pestControlServiceSchema);