const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        lowercase: true
    },
    services: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    }],
    specializations: [{
        serviceType: {
            type: String,
            enum: ['maid', 'cook', 'driver', 'carwash', 'deepcleaning', 'pestcontrol']
        },
        subTypes: [String] // e.g., ['normal_maid', 'super_maid']
    }],
    areas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Apartment'
    }], // apartment buildings they can serve
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalRatings: {
        type: Number,
        default: 0
    },
    completedJobs: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    aadharNumber: String,
    experience: {
        type: Number,
        default: 0
    },
    notes: String,
    documents: {
        aadharCard: String,
        panCard: String,
        policeVerification: String,
        photo: String
    },
    bankDetails: {
        accountNumber: String,
        ifscCode: String,
        accountHolderName: String
    },
    availability: [{
        day: {
            type: String,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        },
        startTime: String,
        endTime: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Worker', workerSchema);