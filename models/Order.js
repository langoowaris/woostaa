const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    bookingType: {
        type: String,
        enum: ['webapp', 'whatsapp'],
        required: true
    },
    planType: {
        type: String,
        enum: ['hourly', 'weekly', 'monthly', 'fixed'],
        required: true
    },
    scheduledDate: {
        type: Date,
        required: true
    },
    scheduledTime: {
        type: String,
        required: true
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    selectedFactors: [{
        factorName: String,
        selectedOption: String,
        additionalCost: Number
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'upi', 'wallet', 'cod'],
        default: 'card'
    },
    paymentId: String,
    razorpayOrderId: String,
    address: {
        apartmentName: String,
        flatNumber: String,
        area: String,
        landmark: String,
        pincode: String
    },
    specialInstructions: String,
    assignedWorker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Worker'
    },
    customerFeedback: {
        rating: Number,
        comment: String,
        submittedAt: Date
    }
}, {
    timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
    if (!this.orderNumber) {
        const count = await mongoose.models.Order.countDocuments();
        this.orderNumber = `WOS${Date.now()}${count + 1}`;
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);