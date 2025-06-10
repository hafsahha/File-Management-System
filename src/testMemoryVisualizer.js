// Memory Visualization Test Script
const { ipcRenderer } = require('electron');

// Helper to generate content of specific size
function generateContent(sizeInKB) {
    // Generate a string of specific size
    // 1 KB = 1024 bytes (characters)
    const chunk = 'X'.repeat(1024); // 1KB chunk
    return chunk.repeat(sizeInKB);
}

// Test file creation with different sizes and allocation strategies
async function runMemoryVisualizationTest() {
    console.log('Starting memory visualization test...');
    
    try {
        // 1. Create test directory
        console.log('Creating test directories...');
        await ipcRenderer.invoke('mkdir', '/test');
        await ipcRenderer.invoke('mkdir', '/test/contiguous');
        await ipcRenderer.invoke('mkdir', '/test/linked');
        await ipcRenderer.invoke('mkdir', '/test/indexed');
        
        // 2. Create small files for contiguous allocation (1-3 KB)
        console.log('Creating small files for contiguous allocation...');
        await ipcRenderer.invoke('write-file', '/test/contiguous/small1.txt', generateContent(1));
        await ipcRenderer.invoke('write-file', '/test/contiguous/small2.txt', generateContent(2));
        await ipcRenderer.invoke('write-file', '/test/contiguous/small3.txt', generateContent(3));
        
        // 3. Create medium files with intentional fragmentation for linked allocation
        console.log('Creating files for linked allocation test...');
        
        // First, fill most of the storage to create fragmentation
        console.log('Creating temporary files to fragment storage...');
        const tempFiles = [];
        for (let i = 0; i < 10; i++) {
            const filePath = `/test/temp${i}.txt`;
            await ipcRenderer.invoke('write-file', filePath, generateContent(4));
            tempFiles.push(filePath);
        }
        
        // Delete every other file to create gaps
        console.log('Deleting alternate files to create fragmentation...');
        for (let i = 0; i < tempFiles.length; i += 2) {
            await ipcRenderer.invoke('rm', tempFiles[i]);
        }
        
        // Now create files that should use linked allocation due to fragmentation
        console.log('Creating files that should use linked allocation...');
        await ipcRenderer.invoke('write-file', '/test/linked/medium1.txt', generateContent(6));
        await ipcRenderer.invoke('write-file', '/test/linked/medium2.txt', generateContent(7));
        
        // 4. Create large files for indexed allocation (8+ KB)
        console.log('Creating large files for indexed allocation...');
        await ipcRenderer.invoke('write-file', '/test/indexed/large1.txt', generateContent(8));
        await ipcRenderer.invoke('write-file', '/test/indexed/large2.txt', generateContent(10));
        
        // 5. Refresh memory visualization view
        console.log('Test files created successfully. Please refresh the memory visualizer to see results.');
        
        return { success: true, message: 'Test completed successfully' };
    } catch (error) {
        console.error('Error during test execution:', error);
        return { success: false, error: error.toString() };
    }
}

// Export the test function
module.exports = {
    runMemoryVisualizationTest
};
