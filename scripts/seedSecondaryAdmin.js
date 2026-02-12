/**
 * Seed script to create another SuperAdmin user
 * Run with: node scripts/seedSecondaryAdmin.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../src/models/User');

const ADMIN_DATA = {
    email: 'harish@upabled.com',
    password: 'Silver@321',
    role: 'superadmin',
    firstName: 'Harish',
    lastName: 'UpAbled'
};

const seedSecondaryAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected to:', mongoose.connection.name);

        // Check if user already exists
        const existingUser = await User.findOne({ email: ADMIN_DATA.email });

        if (existingUser) {
            console.log('User already exists with email:', ADMIN_DATA.email);
            // Update to superadmin if not already
            if (existingUser.role !== 'superadmin') {
                existingUser.role = 'superadmin';
                await existingUser.save();
                console.log('User upgraded to SuperAdmin!');
            } else {
                console.log('User is already a SuperAdmin.');
            }
        } else {
            // Create superadmin
            const newAdmin = await User.create(ADMIN_DATA);
            console.log('SuperAdmin created successfully!');
            console.log('Email:', newAdmin.email);
            console.log('Role:', newAdmin.role);
        }

        await mongoose.disconnect();
        console.log('MongoDB Disconnected');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

seedSecondaryAdmin();
