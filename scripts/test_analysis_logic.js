/**
 * Test script to verify the actionable points to progressItems mapping logic.
 */

const mockAnalysis = {
    actionablePoints: [
        {
            category: 'academic',
            title: 'Improve reading comprehension',
            description: 'Focus on main idea and supporting details.',
            priority: 'high',
            timeline: 'short-term'
        },
        {
            category: 'behavioral',
            title: 'Reduce off-task behavior',
            description: 'Implement a token economy system.',
            priority: 'medium',
            timeline: 'long-term'
        },
        {
            category: 'social',
            title: 'Practice turn-taking in conversations',
            description: 'Use social stories and role-playing.',
            priority: 'low',
            timeline: 'short-term'
        }
    ]
};

function transformActionablePointsToProgressItems(analysis) {
    const progressItems = [];
    const now = new Date();

    if (analysis.actionablePoints && Array.isArray(analysis.actionablePoints)) {
        analysis.actionablePoints.forEach((point) => {
            const item = {
                id: `test-id-${progressItems.length}`,
                title: `[${point.priority ? point.priority.charAt(0).toUpperCase() + point.priority.slice(1) : 'Medium'}] ${point.title}`,
                status: 'pending',
                notes: `Category: ${point.category || 'General'}\nTimeline: ${point.timeline || 'Not specified'}\n${point.description || ''}`,
                createdAt: now,
                updatedAt: now
            };
            progressItems.push(item);
        });
    }
    return progressItems;
}

// Run test
console.log('--- Testing Actionable Points to Progress Items Mapping ---');
const result = transformActionablePointsToProgressItems(mockAnalysis);

console.log(`\nGenerated ${result.length} progress items:\n`);

result.forEach((item, index) => {
    console.log(`Item ${index + 1}:`);
    console.log(`  Title: ${item.title}`);
    console.log(`  Status: ${item.status}`);
    console.log(`  Notes: ${item.notes.replace(/\n/g, '\\n')}`);
    console.log('');
});

// Assertions
let allPassed = true;

if (result.length !== 3) {
    console.error('FAIL: Expected 3 items, got', result.length);
    allPassed = false;
}

if (result[0].title !== '[High] Improve reading comprehension') {
    console.error('FAIL: Item 0 title mismatch');
    allPassed = false;
}

if (result[1].title !== '[Medium] Reduce off-task behavior') {
    console.error('FAIL: Item 1 title mismatch');
    allPassed = false;
}

if (result[2].title !== '[Low] Practice turn-taking in conversations') {
    console.error('FAIL: Item 2 title mismatch');
    allPassed = false;
}

if (allPassed) {
    console.log('--- All tests PASSED ---');
} else {
    console.log('--- Some tests FAILED ---');
    process.exit(1);
}
