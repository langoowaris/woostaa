const mongoose = require('mongoose');

const apartmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    area: {
        type: String,
        required: true,
        trim: true
    },
    pincode: {
        type: String,
        required: true,
        match: /^[0-9]{6}$/
    },
    landmark: {
        type: String,
        trim: true
    },
    totalUnits: {
        type: Number,
        default: 0
    },
    managementContact: {
        name: String,
        phone: String,
        email: String
    },
    amenities: [String],
    serviceCharges: {
        maid: {
            hourly: { type: Number, default: 0 },
            weekly: { type: Number, default: 0 },
            monthly: { type: Number, default: 0 }
        },
        cook: {
            hourly: { type: Number, default: 0 },
            weekly: { type: Number, default: 0 },
            monthly: { type: Number, default: 0 }
        },
        driver: {
            perTrip: { type: Number, default: 0 }
        },
        carWash: {
            basic: { type: Number, default: 0 },
            premium: { type: Number, default: 0 }
        },
        deepCleaning: {
            bhk1: { type: Number, default: 0 },
            bhk2: { type: Number, default: 0 },
            bhk3: { type: Number, default: 0 },
            bhk4plus: { type: Number, default: 0 }
        },
        pestControl: {
            bhk1: { type: Number, default: 0 },
            bhk2: { type: Number, default: 0 },
            bhk3: { type: Number, default: 0 },
            bhk4plus: { type: Number, default: 0 }
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Apartment', apartmentSchema);