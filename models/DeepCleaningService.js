const mongoose = require('mongoose');

const deepCleaningPricingSchema = new mongoose.Schema({
    // Flexible display fields (used by frontend/seed scripts)
    serviceVariant: String,
    displayName: String,
    description: String,
    serviceName: String, // Alternative name field
    details: String,

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
    category: {
        type: String,
        enum: ['bathroom', 'kitchen', 'full-home', 'sofa-carpet']
    },
    duration: String,

    // Apartment-specific pricing
    apartmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Apartment'
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

    isActive: {
        type: Boolean,
        default: true
    }
});

const deepCleaningServiceSchema = new mongoose.Schema({
    name: {
        type: String,
        default: 'Deep Cleaning'
    },
    description: {
        type: String,
        default: 'Professional deep cleaning services for homes and offices'
    },
    category: {
        type: String,
        default: 'cleaning'
    },
    icon: {
        type: String,
        default: 'bi-stars'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    pricingMatrix: [deepCleaningPricingSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('DeepCleaningService', deepCleaningServiceSchema);