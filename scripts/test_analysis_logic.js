const assert = require('assert');
const projectController = require('../src/controllers/projectController');

// Mock Request and Response
const req = {
    body: {
        studentName: "Test Student",
        gradeLevel: "5",
        studentAge: 10,
        presentLevels: "struggles with reading",
        currentPerformance: "below grade level",
        goals: "improve reading fluency",
        accommodations: "extra time",
        relatedServices: ["Speech"]
    },
    user: { id: "teacher123" }
};

const res = {
    status: function (code) {
        this.statusCode = code;
        return this;
    },
    json: function (data) {
        this.data = data;
        return this;
    }
};

// Mock OpenAI
const mockOpenAIResponse = {
    choices: [{
        message: {
            content: JSON.stringify({
                summary: "Test Summary",
                instructionalFocus: [{ area: "Academic", details: "Focus on reading" }],
                strategies: { academic: ["Phonics"], cognitive: [], behavioral: [] },
                shortTermGoals: ["Read 100 wpm"],
                longTermGoals: ["Read grade level text"],
                accommodations: ["Extra time"],
                services: ["Speech"],
                progressMonitoring: "Weekly logs",
                familyCollaboration: "Monthly meetings"
            })
        }
    }]
};

// Mock OpenAI Library
const originalOpenAI = require('openai');
require.cache[require.resolve('openai')] = {
    exports: class MockOpenAI {
        constructor() {
            this.chat = {
                completions: {
                    create: async () => mockOpenAIResponse
                }
            };
        }
    }
};

// Helper to run test
async function runTest() {
    console.log("Running AI Analysis Controller Test...");

    // We need to handle the fact that projectController requires OpenAI internally.
    // Since we can't easily mock require in this simple script without a test runner or proxyquire,
    // we might need to rely on the fact that we changed the code to require('openai') inside the function 
    // OR we might just test the JSON parsing logic if we extract it.

    // However, since projectController has `const OpenAI = require('openai');` probably at top or inside.
    // Let's check the file content again. It requires it INSIDE the function.
    // So we can try to hijack require.

    // A simpler approach for the 'verification' in this environment:
    // Create a shadow copy of the controller that uses our mock, or just trust the logic if we inspect it.
    // But let's try to mock the module cache.

    try {
        // Run the controller function
        // Note: we need to mock process.env.OPENAI_API_KEY
        process.env.OPENAI_API_KEY = "test_key";

        await projectController.generateAnalysis(req, res);

        console.log("Status Code:", res.statusCode);
        console.log("Response Data:", JSON.stringify(res.data, null, 2));

        assert.strictEqual(res.statusCode, 200, "Status code should be 200");
        assert.ok(res.data.analysis.summary, "Analysis should have a summary");
        assert.strictEqual(res.data.analysis.summary, "Test Summary", "Summary should match mock");

        console.log("Test PASSED!");
    } catch (e) {
        console.error("Test FAILED:", e);
    }
}

// Check if we can run this. 
// If 'openai' is not installed in node_modules, this might fail unless we mock it before require.
// The user environment likely has it.
runTest();
