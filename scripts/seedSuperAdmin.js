/**
 * Seed script to create SuperAdmin user
 * Run with: node scripts/seedSuperAdmin.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../src/models/User');

const SUPERADMIN_DATA = {
    email: 'harishfourzerosconsulting@gmail.com',
    password: 'Silver@123',
    role: 'superadmin',
    firstName: 'Harish',
    lastName: 'Admin'
};

const seedSuperAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        // Check if superadmin already exists
        const existingAdmin = await User.findOne({ email: SUPERADMIN_DATA.email });

        if (existingAdmin) {
            console.log('SuperAdmin already exists with email:', SUPERADMIN_DATA.email);
            console.log('User ID:', existingAdmin._id);
            console.log('Role:', existingAdmin.role);
        } else {
            // Create superadmin
            const superAdmin = await User.create(SUPERADMIN_DATA);
            console.log('SuperAdmin created successfully!');
            console.log('Email:', superAdmin.email);
            console.log('User ID:', superAdmin._id);
            console.log('Role:', superAdmin.role);
        }

        await mongoose.disconnect();
        console.log('MongoDB Disconnected');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

seedSuperAdmin();
