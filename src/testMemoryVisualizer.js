// Memory Visualization Test Script
const { ipcRenderer } = require('electron');

// Helper to generate content of specific size
function generateContent(sizeInKB, useText = false) {
    // Generate a string of specific size
    // 1 KB = 1024 bytes (characters)
    if (!useText) {
        const chunk = 'X'.repeat(1024); // 1KB chunk
        return chunk.repeat(sizeInKB);
    } else {
        // Generate text-based content for better visualization
        const baseText = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Hello, this is an example of a file stored using linked allocation. This text will be repeated multiple times to create
a file large enough to span across multiple blocks. Each block is 1KB in size, so a file larger than 1KB will need
multiple blocks to store its contents. In linked allocation, these blocks don't need to be contiguous and can be scattered
across the storage space, with each block pointing to the next one in the chain.

This demonstrates how files are stored in a fragmented storage where contiguous blocks might not be available.
`;
        // Pad the text to reach desired size
        let content = '';
        while (content.length < sizeInKB * 1024) {
            content += baseText;
        }
        // Trim to exact size
        return content.substring(0, sizeInKB * 1024);
    }
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
        
        // First, fill more of the storage to create significant fragmentation
        console.log('Creating many temporary files to fragment storage...');
        const tempFiles = [];
        
        // Create more temporary files to increase fragmentation
        for (let i = 0; i < 50; i++) {
            const filePath = `/test/temp${i}.txt`;
            await ipcRenderer.invoke('write-file', filePath, generateContent(3));
            tempFiles.push(filePath);
        }
        
        // Delete more alternating files to create fragmentation patterns
        console.log('Creating fragmentation pattern...');
        for (let i = 0; i < tempFiles.length; i++) {
            // Create a pattern: delete every other file, then keep 2, delete 1, etc.
            if (i % 3 === 0 || i % 5 === 0) {
                await ipcRenderer.invoke('rm', tempFiles[i]);
            }
        }
          // Now create files that should use linked allocation due to fragmentation
        // Using text content for better visibility in hover tooltips
        console.log('Creating files that should use linked allocation...');
          // Add files that should use linked allocation due to fragmentation
        console.log('Creating medium1.txt (5KB) with linked allocation...');
        await ipcRenderer.invoke('write-file', '/test/linked/medium1.txt', generateContent(5, true));
        
        // Force more fragmentation between file creations
        for (let i = 0; i < 10; i++) {
            const tempFile = `/test/fragmentation${i}.txt`;
            await ipcRenderer.invoke('write-file', tempFile, generateContent(1));
            if (i % 2 === 0) {
                await ipcRenderer.invoke('rm', tempFile);
            }
        }
        
        console.log('Creating medium2.txt (6KB) with linked allocation...');
        await ipcRenderer.invoke('write-file', '/test/linked/medium2.txt', generateContent(6, true));
        
        // Create more fragmentation
        for (let i = 10; i < 20; i++) {
            const tempFile = `/test/fragmentation${i}.txt`;
            await ipcRenderer.invoke('write-file', tempFile, generateContent(1));
            if (i % 2 === 1) {
                await ipcRenderer.invoke('rm', tempFile);
            }
        }
        
        console.log('Creating medium3.txt (7KB) with linked allocation...');
        await ipcRenderer.invoke('write-file', '/test/linked/medium3.txt', generateContent(7, true));
        
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
