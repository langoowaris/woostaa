const nodemailer = require('nodemailer');
const config = require('../config/config');

// Create transporter only if email credentials are provided
let transporter = null;
if (config.EMAIL_USER && config.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        host: config.EMAIL_HOST,
        port: config.EMAIL_PORT,
        secure: false,
        auth: {
            user: config.EMAIL_USER,
            pass: config.EMAIL_PASS
        }
    });
}

const sendVerificationEmail = async (email, token, userName) => {
    if (!transporter) {
        console.warn('Email not configured - verification email not sent');
        return;
    }

    const verificationLink = `${config.BASE_URL}/api/auth/verify-email?token=${token}`;
    
    const mailOptions = {
        from: config.EMAIL_USER,
        to: email,
        subject: 'Woostaa - Email Verification',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1A4EFF;">Welcome to Woostaa!</h2>
            <p>Hi ${userName},</p>
            <p>Thank you for signing up with Woostaa. To complete your registration, please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationLink}" style="background-color: #1A4EFF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
            </div>
            <p>Or copy and paste this link in your browser:</p>
            <p style="color: #666; word-break: break-all;">${verificationLink}</p>
            <p>If you didn't create this account, please ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #888; font-size: 12px;">© 2025 Woostaa. All rights reserved.</p>
        </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent to:', email);
    } catch (error) {
        console.error('Failed to send verification email:', error);
        throw error;
    }
};

const sendPasswordResetEmail = async (email, token, userName) => {
    if (!transporter) {
        console.warn('Email not configured - password reset email not sent');
        return;
    }

    const resetLink = `${config.BASE_URL}/reset-password?token=${token}`;
    
    const mailOptions = {
        from: config.EMAIL_USER,
        to: email,
        subject: 'Woostaa - Password Reset Request',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1A4EFF;">Password Reset Request</h2>
            <p>Hi ${userName},</p>
            <p>We received a request to reset your password for your Woostaa account. Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background-color: #1A4EFF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
            </div>
            <p>Or copy and paste this link in your browser:</p>
            <p style="color: #666; word-break: break-all;">${resetLink}</p>
            <p><strong>This link will expire in 1 hour for security reasons.</strong></p>
            <p>If you didn't request a password reset, please ignore this email. Your password will not be changed.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #888; font-size: 12px;">© 2025 Woostaa. All rights reserved.</p>
        </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Password reset email sent to:', email);
    } catch (error) {
        console.error('Failed to send password reset email:', error);
        throw error;
    }
};

const sendOrderStatusUpdateEmail = async (orderDetails, newStatus, adminNotes = '') => {
    if (!transporter) {
        console.warn('Email not configured - order status update email not sent');
        return;
    }

    const statusMessages = {
        'confirmed': {
            subject: 'Order Confirmed',
            title: 'Your Order Has Been Confirmed! 🎉',
            message: 'Great news! Your service booking has been confirmed and assigned to one of our professional team members.',
            nextSteps: 'Our team will contact you shortly to confirm the timing and any specific requirements.'
        },
        'in_progress': {
            subject: 'Service In Progress',
            title: 'Your Service Is Now In Progress 🚀',
            message: 'Our professional is now working on your service request.',
            nextSteps: 'You should expect the service to be completed within the scheduled timeframe.'
        },
        'completed': {
            subject: 'Service Completed',
            title: 'Service Completed Successfully ✅',
            message: 'Your service has been completed! We hope you\'re satisfied with the quality of our work.',
            nextSteps: 'We\'d love to hear your feedback. Please rate your experience and book again when you need our services!'
        },
        'cancelled': {
            subject: 'Order Cancelled',
            title: 'Order Cancelled ❌',
            message: 'Your service booking has been cancelled.',
            nextSteps: 'If you have any questions about this cancellation, please contact our support team. You can book again anytime!'
        }
    };

    const statusInfo = statusMessages[newStatus] || {
        subject: 'Order Status Updated',
        title: 'Order Status Updated',
        message: `Your order status has been updated to: ${newStatus}`,
        nextSteps: 'Please contact us if you have any questions.'
    };

    const mailOptions = {
        from: config.EMAIL_USER,
        to: orderDetails.userEmail,
        subject: `Woostaa - ${statusInfo.subject}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1A4EFF;">${statusInfo.title}</h2>
            <p>Hi ${orderDetails.customerName},</p>
            <p>${statusInfo.message}</p>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Order Details:</h3>
                <p><strong>Order Number:</strong> ${orderDetails.orderNumber}</p>
                <p><strong>Service:</strong> ${orderDetails.serviceName}</p>
                <p><strong>Date:</strong> ${orderDetails.scheduledDate}</p>
                <p><strong>Time:</strong> ${orderDetails.scheduledTime}</p>
                <p><strong>Amount:</strong> ₹${orderDetails.totalAmount}</p>
                <p><strong>Status:</strong> <span style="color: #1A4EFF; font-weight: bold; text-transform: uppercase;">${newStatus}</span></p>
                ${adminNotes ? `<p><strong>Notes:</strong> ${adminNotes}</p>` : ''}
            </div>
            
            <p>${statusInfo.nextSteps}</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${config.BASE_URL}/dashboard" style="background-color: #1A4EFF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Order Details</a>
            </div>
            
            <p>Thank you for choosing Woostaa!</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #888; font-size: 12px;">© 2025 Woostaa. All rights reserved.</p>
        </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Order status update email sent to: ${orderDetails.userEmail} (Status: ${newStatus})`);
    } catch (error) {
        console.error('Failed to send order status update email:', error);
        throw error;
    }
};

const sendOrderNotification = async (orderDetails, isAdmin = false) => {
    if (!transporter) {
        console.warn('Email not configured - order notification not sent');
        return;
    }

    const recipient = isAdmin ? config.ADMIN_EMAIL : orderDetails.userEmail;
    const subject = isAdmin ? 'New Order Received' : 'Order Confirmation';
    
    const mailOptions = {
        from: config.EMAIL_USER,
        to: recipient,
        subject: `Woostaa - ${subject}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1A4EFF;">${subject}</h2>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Order Details:</h3>
                <p><strong>Order Number:</strong> ${orderDetails.orderNumber}</p>
                <p><strong>Service:</strong> ${orderDetails.serviceName}</p>
                <p><strong>Date:</strong> ${orderDetails.scheduledDate}</p>
                <p><strong>Time:</strong> ${orderDetails.scheduledTime}</p>
                <p><strong>Duration:</strong> ${orderDetails.duration} minutes</p>
                <p><strong>Amount:</strong> ₹${orderDetails.totalAmount}</p>
                ${isAdmin ? `<p><strong>Customer:</strong> ${orderDetails.customerName}</p>
                <p><strong>Phone:</strong> ${orderDetails.customerPhone}</p>
                <p><strong>Email:</strong> ${orderDetails.userEmail}</p>` : ''}
                <p><strong>Address:</strong> ${orderDetails.address}</p>
                ${orderDetails.flatNumber ? `<p><strong>Flat/Unit:</strong> ${orderDetails.flatNumber}</p>` : ''}
                ${orderDetails.apartmentName ? `<p><strong>Apartment/Building:</strong> ${orderDetails.apartmentName}</p>` : ''}
                ${orderDetails.area ? `<p><strong>Area:</strong> ${orderDetails.area}</p>` : ''}
                ${orderDetails.landmark ? `<p><strong>Landmark:</strong> ${orderDetails.landmark}</p>` : ''}
                ${orderDetails.pincode ? `<p><strong>Pincode:</strong> ${orderDetails.pincode}</p>` : ''}
            </div>
            
            ${isAdmin ? `
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${config.BASE_URL}/admin.html" style="background-color: #1A4EFF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        📊 Manage Order in Admin Panel
                    </a>
                </div>
                <p>Please assign a worker and confirm this booking through the admin panel.</p>
            ` : '<p>We will contact you shortly to confirm your booking.</p>'}
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${config.BASE_URL}/dashboard.html" style="background-color: #4169FF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    View Order Details
                </a>
            </div>
            
            <p>Thank you for choosing Woostaa!</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #888; font-size: 12px;">© 2025 Woostaa. All rights reserved.</p>
        </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Order notification sent to: ${recipient}`);
    } catch (error) {
        console.error('Failed to send order notification:', error);
        throw error;
    }
};

module.exports = { sendVerificationEmail, sendOrderNotification, sendPasswordResetEmail, sendOrderStatusUpdateEmail };