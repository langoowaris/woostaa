const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        default: Date.now
    },
    page: {
        type: String,
        default: '/'
    },
    userAgent: String,
    ipHash: String // Hashed IP for privacy
});

const visitorSchema = new mongoose.Schema({
    visitorId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    visits: [visitSchema],
    totalVisits: {
        type: Number,
        default: 0
    },
    firstVisit: {
        type: Date,
        default: Date.now
    },
    lastVisit: {
        type: Date,
        default: Date.now
    },
    isLoggedIn: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for efficient queries
visitorSchema.index({ lastVisit: -1 });
visitorSchema.index({ totalVisits: -1 });
visitorSchema.index({ user: 1 });

module.exports = mongoose.model('Visitor', visitorSchema);
