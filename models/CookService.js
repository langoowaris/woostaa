const mongoose = require('mongoose');

const cookPricingSchema = new mongoose.Schema({
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
    mealType: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'breakfast_lunch', 'lunch_dinner', 'all_meals']
    },
    peopleCount: {
        type: Number,
        min: 1,
        max: 20
    },
    serviceType: {
        type: String,
        enum: ['hourly', 'weekly', 'monthly']
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
        default: false
    },
    startingPrice: Number,

    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const cookServiceSchema = new mongoose.Schema({
    name: {
        type: String,
        default: 'Cook Services'
    },
    description: {
        type: String,
        default: 'Expert chefs and cooks for hourly meal preparation and cooking needs'
    },
    category: {
        type: String,
        default: 'cooking'
    },
    icon: {
        type: String,
        default: 'bi-cup-hot-fill'
    },
    isActive: {
        type: Boolean,
        default: true
    },

    // What cooks WILL do
    serviceIncludes: [{
        type: String,
        default: [
            'Hourly meal preparation',
            'Fresh ingredient cooking',
            'Basic kitchen cleaning after cooking',
            'Food storage and packaging',
            'Traditional and regional cuisine',
            'Dietary preference accommodation',
            'Recipe customization based on people count',
            'Efficient cooking within time limit'
        ]
    }],

    // What cooks WON'T do
    serviceExcludes: [{
        type: String,
        default: [
            'Grocery shopping',
            'Complete dish washing',
            'Serving food at table',
            'Deep kitchen cleaning',
            'Baking cakes or pastries',
            'Specialized diet meals (medical)',
            'Catering for large parties (20+ people)',
            'Teaching cooking classes',
            'Kitchen appliance repair',
            'Cleaning other parts of house'
        ]
    }],

    // Meal type definitions (static data)
    mealTypes: {
        type: mongoose.Schema.Types.Mixed,
        default: {
            breakfast: {
                name: 'Breakfast',
                description: 'Morning meal preparation',
                typical_time: '6:00 AM - 10:00 AM',
                estimated_hours: 1
            },
            lunch: {
                name: 'Lunch',
                description: 'Afternoon meal preparation',
                typical_time: '10:00 AM - 3:00 PM',
                estimated_hours: 1.5
            },
            dinner: {
                name: 'Dinner',
                description: 'Evening meal preparation',
                typical_time: '5:00 PM - 9:00 PM',
                estimated_hours: 1.5
            },
            all_meals: {
                name: 'All Meals',
                description: 'Complete meal preparation for the day',
                typical_time: '6:00 AM - 9:00 PM',
                estimated_hours: 4
            }
        }
    },

    // People count guide for pricing (static data)
    peopleCountGuide: {
        type: mongoose.Schema.Types.Mixed,
        default: {
            description: 'Pricing varies based on number of people to cook for',
            min_people: 1,
            max_people: 20,
            note: 'Each apartment may have different pricing for the same people count'
        }
    },

    // Admin-configurable pricing matrix
    pricingMatrix: [cookPricingSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('CookService', cookServiceSchema);