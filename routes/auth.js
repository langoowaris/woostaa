const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');
const { auth } = require('../middleware/auth');
const config = require('../config/config');

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
    try {
        const { email, password, fullName, phone } = req.body;

        // Validate required fields
        if (!email || !password || !fullName || !phone) {
            return res.status(400).json({
                error: 'All fields are required: email, password, fullName, and phone number'
            });
        }

        // Validate phone number format (basic validation)
        if (phone.trim().length < 10) {
            return res.status(400).json({
                error: 'Please enter a valid phone number (at least 10 digits)'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            // Check if user is already verified
            if (existingUser.isVerified) {
                return res.status(400).json({ error: 'User already exists with this email' });
            }

            // Check if verification email was sent recently (within last 2 minutes)
            const now = new Date();
            const lastSent = existingUser.lastVerificationEmailSent;
            const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);

            if (lastSent && lastSent > twoMinutesAgo) {
                const timeLeft = Math.ceil((lastSent.getTime() + 2 * 60 * 1000 - now.getTime()) / 1000);
                return res.status(400).json({
                    error: `Verification email already sent. Please wait ${timeLeft} seconds before requesting another.`,
                    waitTime: timeLeft
                });
            }

            // Resend verification email for existing unverified user
            const verificationToken = uuidv4();
            existingUser.verificationToken = verificationToken;
            existingUser.lastVerificationEmailSent = now;
            await existingUser.save();

            await sendVerificationEmail(email, verificationToken, existingUser.fullName);

            return res.status(200).json({
                message: 'Verification email has been resent. Please check your email to verify your account.',
                userId: existingUser._id
            });
        }

        // Create verification token
        const verificationToken = uuidv4();

        // Create new user
        const user = new User({
            email,
            password,
            fullName,
            phone,
            verificationToken,
            lastVerificationEmailSent: new Date()
        });

        await user.save();

        // Send verification email
        await sendVerificationEmail(email, verificationToken, fullName);

        res.status(201).json({
            message: 'User registered successfully. Please check your email to verify your account.',
            userId: user._id
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;


        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials wrong email' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials wrong password' });
        }

        // Check if email is verified
        if (!user.isVerified) {
            return res.status(400).json({
                error: 'Please verify your email before logging in',
                needsVerification: true,
                userId: user._id
            });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, email: user.email },
            config.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                phone: user.phone,
                role: user.role,
                isProfileComplete: user.profile.isProfileComplete
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Verify email
router.get('/verify-email', async (req, res) => {
    try {
        const { token } = req.query;

        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            return res.status(400).json({ error: 'Invalid verification token' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.redirect(`${config.BASE_URL}/login?verified=true`);
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ error: 'Email verification failed' });
    }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { apartmentName, flatNumber, area, landmark, pincode, emergencyContact, specialInstructions, phone, fullName } = req.body;

        const user = await User.findById(req.user.id);

        // Update top-level user fields if provided
        if (phone !== undefined) {
            if (!phone || phone.trim() === '') {
                return res.status(400).json({ error: 'Phone number cannot be empty' });
            }
            if (phone.trim().length < 10) {
                return res.status(400).json({ error: 'Please enter a valid phone number (at least 10 digits)' });
            }
            user.phone = phone.trim();
        }

        if (fullName !== undefined) {
            if (!fullName || fullName.trim() === '') {
                return res.status(400).json({ error: 'Full name cannot be empty' });
            }
            user.fullName = fullName.trim();
        }

        // Update profile fields
        user.profile = {
            apartmentName: apartmentName || user.profile?.apartmentName,
            flatNumber: flatNumber || user.profile?.flatNumber,
            area: area || user.profile?.area,
            landmark: landmark || user.profile?.landmark,
            pincode: pincode || user.profile?.pincode,
            emergencyContact: emergencyContact || user.profile?.emergencyContact,
            specialInstructions: specialInstructions || user.profile?.specialInstructions,
            isProfileComplete: true
        };

        await user.save();

        console.log('Profile updated for user:', user.email, 'Phone:', user.phone);
        res.json({ message: 'Profile updated successfully', user: await User.findById(user._id).select('-password') });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Profile update failed' });
    }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ error: 'Email already verified' });
        }

        // Check if verification email was sent recently (within last 2 minutes)
        const now = new Date();
        const lastSent = user.lastVerificationEmailSent;
        const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);

        if (lastSent && lastSent > twoMinutesAgo) {
            const timeLeft = Math.ceil((lastSent.getTime() + 2 * 60 * 1000 - now.getTime()) / 1000);
            return res.status(400).json({
                error: `Verification email already sent. Please wait ${timeLeft} seconds before requesting another.`,
                waitTime: timeLeft
            });
        }

        const verificationToken = uuidv4();
        user.verificationToken = verificationToken;
        user.lastVerificationEmailSent = now;
        await user.save();

        await sendVerificationEmail(email, verificationToken, user.fullName);

        res.json({ message: 'Verification email sent' });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ error: 'Failed to resend verification email' });
    }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal whether user exists or not for security
            return res.status(200).json({ message: 'If an account with this email exists, a password reset link has been sent.' });
        }

        // Generate reset token
        const resetToken = uuidv4();
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

        user.passwordResetToken = resetToken;
        user.passwordResetExpires = resetExpires;
        await user.save();

        // Send password reset email
        await sendPasswordResetEmail(email, resetToken, user.fullName);

        res.status(200).json({ message: 'If an account with this email exists, a password reset link has been sent.' });
    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ error: 'Failed to process password reset request' });
    }
});

// Reset password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired password reset token' });
        }

        // Update password
        user.password = newPassword; // Will be hashed by pre-save middleware
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully. You can now log in with your new password.' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

// Validate password reset token
router.get('/validate-reset-token', async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired password reset token' });
        }

        res.status(200).json({
            message: 'Token is valid',
            userEmail: user.email,
            userName: user.fullName
        });
    } catch (error) {
        console.error('Token validation error:', error);
        res.status(500).json({ error: 'Failed to validate token' });
    }
});

module.exports = router;