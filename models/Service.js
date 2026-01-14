const mongoose = require('mongoose');

const servicePricingSchema = new mongoose.Schema({
    planType: {
        type: String,
        enum: ['hourly', 'weekly', 'monthly', 'fixed', 'perService'],
        required: true
    },
    subType: String, // For variants like 'normal_maid', 'super_maid', 'interior_wash', etc.
    duration: Number, // in minutes for hourly, days for weekly/monthly
    basePrice: {
        type: Number,
        required: true
    },
    priceAfterVisit: {
        type: Boolean,
        default: false
    },
    startingPrice: Number, // Starting price when priceAfterVisit is true
    description: String,
    isActive: {
        type: Boolean,
        default: true
    },
    timeRestrictions: {
        startTime: String, // e.g., "06:00"
        endTime: String,   // e.g., "19:00"
    },
    factors: [{
        name: String, // e.g., 'bhk_type', 'people_count', 'car_type'
        type: {
            type: String,
            enum: ['select', 'number', 'checkbox'],
            default: 'select'
        },
        required: {
            type: Boolean,
            default: false
        },
        options: [{
            label: String,    // e.g., '1BHK', '2-3 People'
            value: String,    // e.g., '1bhk', '2_3_people'
            basePrice: Number, // Price for this specific option
            priceMultiplier: {
                type: Number,
                default: 1
            },
            additionalCost: {
                type: Number,
                default: 0
            }
        }]
    }]
});

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['cleaning', 'cooking', 'transport', 'automotive', 'maintenance'],
        required: true
    },
    icon: String,
    isActive: {
        type: Boolean,
        default: true
    },
    pricingOptions: [servicePricingSchema],
    basePrice: {
        type: Number,
        required: true
    },
    pricingType: {
        type: String,
        enum: ['hourly', 'fixed', 'custom'],
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);