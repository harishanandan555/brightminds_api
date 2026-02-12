const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

const resetBetaStatus = async (email) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        const user = await User.findOne({ email });

        if (!user) {
            console.log(`❌ User with email "${email}" not found.`);
            process.exit(1);
        }

        console.log(`Found user: ${user.email}`);
        console.log('Current Beta Status:', user.betaProgram);

        // Reset beta program
        user.betaProgram = {
            hasAccepted: false,
            hasDeclined: false,
            acceptedAt: null,
            declinedAt: null,
            hasSeenConfirmation: false,
            ipAddress: null,
            userAgent: null
        };

        await user.save();

        console.log('✅ Beta status has been reset to default.');
        console.log('New Beta Status:', user.betaProgram);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

const email = process.argv[2];

if (!email) {
    console.error('Usage: node scripts/resetBetaStatus.js <email>');
    process.exit(1);
}

resetBetaStatus(email);
