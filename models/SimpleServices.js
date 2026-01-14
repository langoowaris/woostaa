const mongoose = require('mongoose');

// Simple service schema that works with existing Worker model
const simpleServiceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['maid', 'cook', 'driver', 'carwash', 'deepcleaning', 'pestcontrol']
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        default: 'bi-gear'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SimpleService', simpleServiceSchema);