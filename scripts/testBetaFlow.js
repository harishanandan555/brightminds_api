const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

const API_URL = 'http://localhost:5002/api/v1';

// Random user data
const testUser = {
    firstName: 'Beta',
    lastName: 'ReAccepter',
    email: `betareaccept_${Date.now()}@example.com`,
    password: 'password123',
    role: 'teacher'
};

let token = '';
let userId = '';

const runTest = async () => {
    try {
        console.log('🚀 Starting Beta Re-Acceptance Test...');

        // 1. Register User
        console.log(`\n1. Registering user: ${testUser.email}...`);
        const regRes = await axios.post(`${API_URL}/auth/register`, testUser);
        token = regRes.data.token;
        userId = regRes.data.user.id;
        console.log('✅ Registration successful.');

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        // 2. Decline Beta First
        console.log('\n2. Declining Beta Agreement...');
        const declineRes = await axios.post(`${API_URL}/beta/decline`, {}, config);
        if (declineRes.data.success && declineRes.data.data.betaProgram.hasDeclined) {
            console.log('✅ Declined successfully.');
        } else {
            console.error('❌ Decline failed.');
            process.exit(1);
        }

        // 3. Verify Declined Status
        console.log('\n3. Verifying Declined Status...');
        const declineStatusRes = await axios.get(`${API_URL}/beta/status`, config);
        if (declineStatusRes.data.data.hasDeclined && !declineStatusRes.data.data.hasAccepted) {
            console.log('✅ Status confirms declined.');
        } else {
            console.error('❌ Status incorrect after decline.');
            console.log(declineStatusRes.data.data);
            process.exit(1);
        }

        // 4. Accept Beta (Should now succeed)
        console.log('\n4. Accepting Beta Agreement (Re-acceptance)...');
        try {
            const acceptRes = await axios.post(`${API_URL}/beta/accept`, {}, config);
            console.log('Response:', acceptRes.data);
            if (acceptRes.data.success && acceptRes.data.data.betaProgram.hasAccepted) {
                console.log('✅ Accepted successfully (overwrote decline).');
            } else {
                console.error('❌ Accept failed.');
            }
        } catch (err) {
            console.error('❌ Accept failed with error:', err.response ? err.response.data : err.message);
            process.exit(1);
        }

        // 5. Verify Final Status
        console.log('\n5. Verifying Final Status...');
        const finalStatusRes = await axios.get(`${API_URL}/beta/status`, config);
        const finalStatus = finalStatusRes.data.data;
        console.log('Final Status:', finalStatus);

        // Note: We expect hasAccepted to be true. hasDeclined should be falsified by the accept logic in controller?
        // Let's check the controller logic I just modified.
        // user.betaProgram = { hasAccepted: true, hasDeclined: false ... } -> Yes it resets the object.

        if (finalStatus.hasAccepted && !finalStatus.hasDeclined) {
            console.log('✅ Final status correct: Accepted stores as true, Declined as false.');
        } else {
            console.error('❌ Final status incorrect.');
        }

        console.log('\n🎉 Re-Acceptance Test Complete!');

    } catch (error) {
        console.error('Test Failed:', error.message);
        if (error.response) {
            console.error('Response Data:', error.response.data);
        }
    }
};

runTest();
