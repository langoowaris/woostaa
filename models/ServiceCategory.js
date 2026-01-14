const mongoose = require('mongoose');

// Sub-service pricing schema
const subServicePricingSchema = new mongoose.Schema({
    pricingType: {
        type: String,
        enum: ['hourly', 'fixed', 'per_unit', 'custom'],
        default: 'hourly'
    },
    basePrice: {
        type: Number,
        required: true,
        default: 249
    },
    additionalRate: {
        type: Number,
        default: 200 // Per additional hour/unit
    },
    minHours: {
        type: Number,
        default: 1
    },
    maxHours: {
        type: Number,
        default: 8
    },
    priceAfterVisit: {
        type: Boolean,
        default: false
    },
    startingPrice: Number // When priceAfterVisit is true
});

// Sub-service timings schema
const subServiceTimingsSchema = new mongoose.Schema({
    startTime: {
        type: String,
        default: '06:00'
    },
    endTime: {
        type: String,
        default: '19:00'
    },
    availableDays: {
        type: [String],
        default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    slotDuration: {
        type: Number,
        default: 60 // minutes
    },
    // Specific time slots for services like Cook (e.g. "Breakfast: 7-9", "Lunch: 11-1")
    timeSlots: [{
        label: String, // e.g. "Breakfast"
        startTime: String, // "07:00"
        endTime: String // "09:00"
    }]
});

// Sub-service options (for BHK type, car type, people count variations)
const subServiceOptionSchema = new mongoose.Schema({
    optionType: {
        type: String,
        required: true // e.g., 'bhk_type', 'car_type', 'people_count'
    },
    group: {
        type: String, // For tree structures: e.g. "Sedan", "SUV", "Furnished"
        default: 'General'
    },
    optionLabel: {
        type: String,
        required: true // e.g., '1BHK', 'Sedan', '2-4 People'
    },
    optionValue: {
        type: String,
        required: true // e.g., '1bhk', 'sedan', '2_4_people'
    },
    price: {
        type: Number,
        required: true
    },
    additionalRate: {
        type: Number,
        default: 0
    },
    duration: {
        type: Number,
        default: 60 // minutes
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

// Sub-service schema (embedded in category)
const subServiceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    icon: {
        type: String,
        default: 'bi-star'
    },
    pricing: {
        type: subServicePricingSchema,
        default: () => ({})
    },
    timings: {
        type: subServiceTimingsSchema,
        default: () => ({})
    },
    rules: {
        includes: {
            type: [String],
            default: []
        },
        excludes: {
            type: [String],
            default: []
        },
        notes: {
            type: String,
            default: ''
        }
    },
    options: [subServiceOptionSchema],
    isActive: {
        type: Boolean,
        default: true
    },
    sortOrder: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Main Service Category schema
const serviceCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    slug: {
        type: String,
        unique: true
    },
    description: {
        type: String,
        default: ''
    },
    icon: {
        type: String,
        default: 'bi-gear-fill'
    },
    color: {
        type: String,
        default: '#007bff' // Primary color for the category
    },
    // View Type: Determines how the app renders this. 
    // 'hierarchical' = Show Sub-Services list (e.g. Cleaning -> Sofa, Kitchen...)
    // 'direct' = Treat as a single service (e.g. "Plumbing" -> directly show options)
    viewType: {
        type: String,
        enum: ['hierarchical', 'direct'],
        default: 'hierarchical'
    },
    subServices: [subServiceSchema],
    isActive: {
        type: Boolean,
        default: true
    },
    sortOrder: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Pre-save middleware to generate slug
serviceCategorySchema.pre('save', function (next) {
    if (this.isModified('name') || !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '_');
    }
    next();
});

// Virtual for sub-services count
serviceCategorySchema.virtual('subServicesCount').get(function () {
    return this.subServices ? this.subServices.length : 0;
});

// Virtual for active sub-services count
serviceCategorySchema.virtual('activeSubServicesCount').get(function () {
    return this.subServices ? this.subServices.filter(s => s.isActive).length : 0;
});

// Ensure virtuals are included in JSON output
serviceCategorySchema.set('toJSON', { virtuals: true });
serviceCategorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ServiceCategory', serviceCategorySchema);
