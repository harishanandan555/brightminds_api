require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const checkBetaUser = async (email, password) => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);

        console.log('Connected to MongoDB...\n');

        // Find user by email
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.log(`❌ User with email "${email}" not found.`);
            process.exit(1);
        }

        console.log('=== USER INFORMATION ===');
        console.log(`Email: ${user.email}`);
        console.log(`Name: ${user.firstName} ${user.lastName}`);
        console.log(`Role: ${user.role}`);
        console.log(`Created At: ${user.createdAt}`);
        console.log(`User ID: ${user._id}`);
        
        // Check password
        if (password) {
            const isPasswordCorrect = await user.matchPassword(password);
            console.log(`\n🔐 Password Check: ${isPasswordCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);
        }

        // Check beta program status
        console.log('\n=== BETA PROGRAM STATUS ===');
        if (user.betaProgram) {
            console.log(`Has Accepted: ${user.betaProgram.hasAccepted ? '✅ YES' : '❌ NO'}`);
            console.log(`Has Declined: ${user.betaProgram.hasDeclined ? '✅ YES' : '❌ NO'}`);
            console.log(`Accepted At: ${user.betaProgram.acceptedAt || 'N/A'}`);
            console.log(`Declined At: ${user.betaProgram.declinedAt || 'N/A'}`);
            console.log(`Has Seen Confirmation: ${user.betaProgram.hasSeenConfirmation ? '✅ YES' : '❌ NO'}`);
            console.log(`IP Address: ${user.betaProgram.ipAddress || 'N/A'}`);
            console.log(`User Agent: ${user.betaProgram.userAgent || 'N/A'}`);
        } else {
            console.log('⚠️  No beta program data (default state)');
        }

        console.log('\n✅ Check complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

// Get email and password from command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email) {
    console.error('Usage: node checkBetaUser.js <email> [password]');
    process.exit(1);
}

checkBetaUser(email, password);
