const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

// Import virtual file system module
const virtualFS = require('./utils/virtualFileSystem');
const { storage } = require('./utils/virtualFileSystem');

let mainWindow;
let currentDir = '/'; // Track current virtual directory (starting at root)
let editorWindow = null;
let currentEditingFile = null;

// Initialize Memory visualizer window
let memoryVisualizerWindow = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, '..', 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false
        }
    });

    mainWindow.loadFile(path.join(__dirname, '..', 'index.html'));
    
    // Comment out the line below if you don't need developer tools
    // mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// IPC communication for file operations
ipcMain.handle('get-files', async (event, dirPath = null) => {
    try {
        // If a specific path is provided, update currentDir
        if (dirPath) {
            if (dirPath.startsWith('/')) {
                currentDir = dirPath;
            } else {
                // Join paths for virtual file system
                currentDir = path.posix.join(currentDir, dirPath);
            }
        }
        
        // Use virtual file system to list directory
        const result = virtualFS.listDirectory(currentDir);
        
        if (result.success) {
            return {
                items: result.items,
                currentDir: currentDir
            };
        } else {
            return { items: [], currentDir: currentDir, error: result.error };
        }
    } catch (err) {
        console.error('Error reading directory:', err);
        return { items: [], currentDir: currentDir, error: err.message };
    }
});

ipcMain.handle('navigate', async (event, newPath) => {
    try {
        // Handle paths for virtual file system
        const targetPath = newPath.startsWith('/') ? newPath : path.posix.join(currentDir, newPath);
        
        // Use virtual file system to list directory
        const result = virtualFS.listDirectory(targetPath);
        
        if (result.success) {
            currentDir = targetPath;
            return {
                items: result.items,
                currentDir: currentDir
            };
        } else {
            return { items: [], currentDir: currentDir, error: 'Invalid directory' };
        }
    } catch (err) {
        console.error('Error navigating to directory:', err);
        return { items: [], currentDir: currentDir, error: err.message };
    }
});

ipcMain.handle('mkdir', async (event, dirName) => {
    try {
        // Create the full path for the new directory
        const newDirPath = path.posix.join(currentDir, dirName);
        
        // Use virtual file system to create directory
        const result = virtualFS.createVirtualDirectory(newDirPath);
        
        if (result) {
            return { success: true, path: newDirPath };
        } else {
            return { success: false, error: 'Failed to create directory' };
        }
    } catch (err) {
        console.error('Error creating directory:', err);
        return { success: false, error: err.message };
    }
});

ipcMain.handle('create-file', async (event, fileName, content = '') => {
    try {
        // Create the full path for the new file
        const newFilePath = path.posix.join(currentDir, fileName);
        
        // Use virtual file system to create file
        const result = virtualFS.createVirtualFile(newFilePath, content);
        
        if (result) {
            // Send updated memory data to frontend
            const memoryData = virtualFS.getMemoryVisualizationData();
            console.log('Memory Data:', memoryData);
            event.sender.send('memory-data', memoryData);
            return { success: true, path: newFilePath };
        } else {
            return { success: false, error: 'Failed to create file' };
        }
    } catch (err) {
        console.error('Error creating file:', err);
        return { success: false, error: err.message };
    }
});

ipcMain.handle('rm', async (event, itemPath) => {
    try {
        // Use virtual file system to delete item
        const result = virtualFS.deleteItem(itemPath);
        return result;
    } catch (err) {
        console.error('Error removing item:', err);
        return { success: false, error: err.message };
    }
});

// Terminal command handlers
ipcMain.handle('get-current-dir', async () => {
    return currentDir;
});

ipcMain.handle('ls', async (event, dirPath = null) => {
    try {
        // Handle path for virtual file system
        const targetDir = dirPath ? (dirPath.startsWith('/') ? dirPath : path.posix.join(currentDir, dirPath)) : currentDir;
        
        // Use virtual file system to list directory
        const result = virtualFS.listDirectory(targetDir);
        
        if (result.success) {
            const itemNames = result.items.map(item => {
                return item.isDirectory ? `${item.name}/` : item.name;
            });
            return { success: true, items: itemNames };
        } else {
            return { success: false, error: 'Directory does not exist' };
        }
    } catch (err) {
        console.error('Error listing directory:', err);
        return { success: false, error: err.message };
    }
});

ipcMain.handle('cd', async (event, dirPath) => {
    try {
        // Handle special cases
        if (dirPath === '..') {
            // Go to parent directory
            if (currentDir === '/') {
                return { success: true, currentDir }; // Already at root
            }
            const parentDir = path.posix.dirname(currentDir);
            
            // Check if parent directory exists in virtual file system
            const result = virtualFS.listDirectory(parentDir);
            if (result.success) {
                currentDir = parentDir;
                return { success: true, currentDir };
            }
        } else if (dirPath === '/' || dirPath === '~') {
            // Go to root directory (~ also points to root in our virtual FS)
            currentDir = '/';
            return { success: true, currentDir };
        } else {
            // Regular directory navigation
            const targetDir = dirPath.startsWith('/') ? dirPath : path.posix.join(currentDir, dirPath);
            
            // Check if target directory exists in virtual file system
            const result = virtualFS.listDirectory(targetDir);
            if (result.success) {
                currentDir = targetDir;
                return { success: true, currentDir };
            }
        }
        return { success: false, error: 'Invalid directory' };
    } catch (err) {
        console.error('Error changing directory:', err);
        return { success: false, error: err.message };
    }
});

ipcMain.handle('touch', async (event, filePath) => {
    try {
        // Handle path for virtual file system
        const targetFile = filePath.startsWith('/') ? filePath : path.posix.join(currentDir, filePath);
        
        // Use virtual file system to create empty file
        const result = virtualFS.createVirtualFile(targetFile, '');
        
        if (result) {
            return { success: true, path: targetFile };
        } else {
            return { success: false, error: 'Failed to create file' };
        }
    } catch (err) {
        console.error('Error touching file:', err);
        return { success: false, error: err.message };
    }
});

ipcMain.handle('cat', async (event, filePath) => {
    try {
        // Handle path for virtual file system
        const targetFile = filePath.startsWith('/') ? filePath : path.posix.join(currentDir, filePath);
        
        // Use virtual file system to read file
        const result = virtualFS.readVirtualFile(targetFile);
        
        if (result.success) {
            return { success: true, content: result.content };
        } else {
            return { success: false, error: result.error };
        }
    } catch (err) {
        console.error('Error reading file:', err);
        return { success: false, error: err.message };
    }
});

ipcMain.handle('read-file', async (event, filePath) => {
    try {
        // Handle path for virtual file system
        const targetFile = filePath.startsWith('/') ? filePath : path.posix.join(currentDir, filePath);
        
        // Use virtual file system to read file
        const result = virtualFS.readVirtualFile(targetFile);
        
        if (result.success) {
            return { success: true, content: result.content };
        } else {
            return { success: false, error: result.error };
        }
    } catch (err) {
        console.error('Error reading file:', err);
        return { success: false, error: err.message };
    }
});

ipcMain.handle('write-file', async (event, filePath, content) => {
    try {
        // Handle path for virtual file system
        const targetFile = filePath.startsWith('/') ? filePath : path.posix.join(currentDir, filePath);
        
        // Use virtual file system to create/update file
        const result = virtualFS.createVirtualFile(targetFile, content);
        
        if (result) {
            return { success: true };
        } else {
            return { success: false, error: 'Failed to write file' };
        }
    } catch (err) {
        console.error('Error writing file:', err);
        return { success: false, error: err.message };
    }
});

ipcMain.handle('execute-command', async (event, commandString) => {
    try {
        // Parse command
        const args = commandString.trim().split(/\s+/);
        const command = args.shift().toLowerCase();
        
        // Execute command
        switch (command) {
            case 'ls':
                return await handleLsCommand(args);
            case 'cd':
                return await handleCdCommand(args);
            case 'mkdir':
                return await handleMkdirCommand(args);
            case 'rm':
            case 'rmdir':
                return await handleRmCommand(args);
            case 'touch':
                return await handleTouchCommand(args);
            case 'cat':
                return await handleCatCommand(args);
            case 'nano':
                return await handleNanoCommand(args);
            case 'visualize':
            case 'vis':
                return await handleVisualizeCommand();
            case 'testfile':
                return await handleTestFileCommand(args);
            case 'pwd':
                return { success: true, output: currentDir };
            case 'help':
                return { 
                    success: true, 
                    output: `Available commands:
ls [path]        - List files and directories
cd <path>        - Change directory
mkdir <dirname>  - Create a directory
rm <path>        - Remove a file or directory
touch <filename> - Create an empty file
nano <filename>  - Edit a file content
visualize (vis)  - Show memory allocation visualization
testfile <size>  - Create a test file with specified size in KB
pwd              - Show current directory path
help             - Show this help message` 
                };
            default:
                return { success: false, error: `Command not found: ${command}` };
        }
    } catch (err) {
        console.error('Error executing command:', err);
        return { success: false, error: err.message };
    }
});

// Command handler functions
async function handleLsCommand(args) {
    try {
        const dirPath = args.length > 0 ? args[0] : null;
        // Handle path for virtual file system
        const targetDir = dirPath ? (dirPath.startsWith('/') ? dirPath : path.posix.join(currentDir, dirPath)) : currentDir;
        
        // Use virtual file system to list directory
        const result = virtualFS.listDirectory(targetDir);
        
        if (result.success) {
            const formattedItems = result.items.map(item => {
                return item.isDirectory ? `${item.name}/` : item.name;
            });
            return { success: true, output: formattedItems.join('  ') };
        } else {
            return { success: false, error: `ls: cannot access '${dirPath}': No such file or directory` };
        }
    } catch (err) {
        return { success: false, error: `ls: ${err.message}` };
    }
}

async function handleCdCommand(args) {
    if (args.length === 0) {
        // Default to root directory if no args in virtual FS
        currentDir = '/';
        return { success: true, output: `Changed directory to: ${currentDir}` };
    }
    
    try {
        const dirPath = args[0];
        
        // Handle special cases
        if (dirPath === '..') {
            // Go to parent directory
            if (currentDir === '/') {
                return { success: true, output: `Already at root directory` };
            }
            const parentDir = path.posix.dirname(currentDir);
            
            // Check if parent directory exists in virtual file system
            const result = virtualFS.listDirectory(parentDir);
            if (result.success) {
                currentDir = parentDir;
                return { success: true, output: `Changed directory to: ${currentDir}` };
            }
        } else if (dirPath === '~' || dirPath === '/') {
            // Go to root directory (~ also points to root in our virtual FS)
            currentDir = '/';
            return { success: true, output: `Changed directory to: ${currentDir}` };
        } else {
            // Regular directory navigation
            const targetDir = dirPath.startsWith('/') ? dirPath : path.posix.join(currentDir, dirPath);
            
            // Check if target directory exists in virtual file system
            const result = virtualFS.listDirectory(targetDir);
            if (result.success) {
                currentDir = targetDir;
                return { success: true, output: `Changed directory to: ${currentDir}` };
            }
        }
        return { success: false, error: `cd: ${dirPath}: No such directory` };
    } catch (err) {
        return { success: false, error: `cd: ${err.message}` };
    }
}

async function handleMkdirCommand(args) {
    if (args.length === 0) {
        return { success: false, error: 'mkdir: missing operand' };
    }
    
    try {
        const dirName = args[0];
        // Handle path for virtual file system
        const newDirPath = dirName.startsWith('/') ? dirName : path.posix.join(currentDir, dirName);
        
        // Use virtual file system to create directory
        const result = virtualFS.createVirtualDirectory(newDirPath);
        
        if (result) {
            return { success: true, path: newDirPath };
        } else {
            return { success: false, error: 'Failed to create directory' };
        }
    } catch (err) {
        return { success: false, error: err.message };
    }
}

async function handleRmCommand(args) {
    if (args.length === 0) {
        return { success: false, error: 'rm: missing operand' };
    }
    
    try {
        const itemPath = args[0];
        // Handle path for virtual file system
        const targetPath = itemPath.startsWith('/') ? itemPath : path.posix.join(currentDir, itemPath);
        
        // Use virtual file system to delete item
        const result = virtualFS.deleteItem(targetPath);
        
        if (result.success) {
            return { success: true };
        } else {
            return { success: false, error: result.error };
        }
    } catch (err) {
        return { success: false, error: err.message };
    }
}

async function handleTouchCommand(args) {
    if (args.length === 0) {
        return { success: false, error: 'touch: missing operand' };
    }
    
    try {
        const fileName = args[0];
        // Handle path for virtual file system
        const newFilePath = fileName.startsWith('/') ? fileName : path.posix.join(currentDir, fileName);
        
        // Use virtual file system to create empty file
        const result = virtualFS.createVirtualFile(newFilePath, '');
        
        if (result) {
            return { success: true, path: newFilePath };
        } else {
            return { success: false, error: 'Failed to create file' };
        }
    } catch (err) {
        return { success: false, error: err.message };
    }
}

async function handleCatCommand(args) {
    if (args.length === 0) {
        return { success: false, error: 'cat: missing operand' };
    }
    
    try {
        const filePath = args[0];
        // Handle path for virtual file system
        const targetFile = filePath.startsWith('/') ? filePath : path.posix.join(currentDir, filePath);
        
        // Use virtual file system to read file
        const result = virtualFS.readVirtualFile(targetFile);
        
        if (result.success) {
            return { success: true, content: result.content };
        } else {
            return { success: false, error: result.error };
        }
    } catch (err) {
        return { success: false, error: err.message };
    }
}

// Handle the nano command
async function handleNanoCommand(args) {
    if (args.length === 0) {
        return { success: false, error: 'nano: missing file operand' };
    }
    
    try {
        const fileName = args[0];
        // Handle path for virtual file system
        const filePath = fileName.startsWith('/') ? fileName : path.posix.join(currentDir, fileName);
        
        // Check if file exists, if not create it
        let fileContent = '';
        const fileResult = virtualFS.readVirtualFile(filePath);
        
        if (fileResult.success) {
            fileContent = fileResult.content;
        } else {
            // Create a new file
            if (!virtualFS.createVirtualFile(filePath, '')) {
                return { success: false, error: `nano: cannot create file ${fileName}` };
            }
        }
        
        // If a new content is provided as the second argument
        if (args.length > 1) {
            // Extract content from the argument (remove quotes if present)
            let newContent = args.slice(1).join(' ');
            if (newContent.startsWith('"') && newContent.endsWith('"')) {
                newContent = newContent.slice(1, -1);
            }
            
            // Write the content to the file
            const writeResult = virtualFS.writeToFile(filePath, newContent);
            if (!writeResult.success) {
                return { success: false, error: `nano: ${writeResult.error}` };
            }
            
            return { success: true, output: `File saved: ${fileName} with content: ${newContent}` };
        }
        
        // Otherwise, open the editor window
        currentEditingFile = filePath;
        
        // Create a new window for the editor
        editorWindow = new BrowserWindow({
            width: 600,
            height: 400,
            title: `Edit: ${fileName}`,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });
        
        // Load the editor HTML file
        editorWindow.loadFile('src/editor.html');
        
        // Send file data once the window is ready
        editorWindow.webContents.on('did-finish-load', () => {
            editorWindow.webContents.send('init-editor', {
                filename: fileName,
                content: fileContent
            });
        });
        
        // Handle window closed
        editorWindow.on('closed', () => {
            editorWindow = null;
        });
        
        // Return success initially, actual saving will happen via IPC
        return { 
            success: true, 
            output: `Opening editor for: ${fileName}`
        };
    } catch (err) {
        return { success: false, error: `nano: ${err.message}` };
    }
}

// IPC handlers for editor window
ipcMain.on('save-file', (event, content) => {
    if (currentEditingFile) {
        virtualFS.writeToFile(currentEditingFile, content);
        if (editorWindow) {
            editorWindow.close();
        }
    }
});

ipcMain.on('cancel-edit', () => {
    if (editorWindow) {
        editorWindow.close();
    }
});

// Open Memory Visualizer
function openMemoryVisualizer() {
    if (memoryVisualizerWindow) {
        memoryVisualizerWindow.focus();
        return;
    }
    
    memoryVisualizerWindow = new BrowserWindow({
        width: 800,
        height: 600,
        title: 'Memory Allocation Visualizer',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    
    memoryVisualizerWindow.loadFile('src/memoryVisualizer_fixed.html');
    
    memoryVisualizerWindow.on('closed', () => {
        memoryVisualizerWindow = null;
    });
}

// IPC handler for memory data
ipcMain.on('get-memory-data', (event) => {
    const memoryData = virtualFS.getMemoryVisualizationData();
    console.log('Storage State:', storage);
    event.sender.send('memory-data', memoryData);
});

// Handle the visualize command
async function handleVisualizeCommand() {
    openMemoryVisualizer();
    return { 
        success: true, 
        output: `Opening memory allocation visualizer...`
    };
}

// Handle the testfile command - creates a file with specified size for testing allocation strategies
async function handleTestFileCommand(args) {
    if (args.length < 1) {
        return { success: false, error: 'testfile: missing size parameter. Usage: testfile <size_in_KB>' };
    }
    
    try {
        // Parse size in KB
        const sizeKB = parseInt(args[0]);
        if (isNaN(sizeKB) || sizeKB <= 0) {
            return { success: false, error: 'testfile: Invalid size. Please provide a positive number.' };
        }
        
        // Generate random content of specified size
        const contentSize = sizeKB * 1024; // Convert KB to bytes
        const fileName = `test_file_${sizeKB}kb_${Date.now().toString().slice(-6)}.dat`;
        const filePath = path.posix.join(currentDir, fileName);
        
        // Generate random content (simulate binary data)
        let content = '';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const contentChunkSize = 1024; // Generate in chunks for performance
        
        for (let i = 0; i < contentSize; i += contentChunkSize) {
            const chunkSize = Math.min(contentChunkSize, contentSize - i);
            for (let j = 0; j < chunkSize; j++) {
                content += chars.charAt(Math.floor(Math.random() * chars.length));
            }
        }
        
        // Create the test file
        const startTime = Date.now();
        const result = virtualFS.createVirtualFile(filePath, content);
        const endTime = Date.now();
        
        if (result) {
            const blocksUsed = Math.ceil(contentSize / 1024);
            return { 
                success: true, 
                output: `Created test file: ${fileName}
File size: ${sizeKB} KB (${contentSize} bytes)
Blocks required: ${blocksUsed}
Allocation time: ${endTime - startTime}ms
Use 'visualize' command to see how it was allocated.`
            };
        } else {
            return { success: false, error: `Failed to create test file. Not enough storage space?` };
        }
    } catch (err) {
        return { success: false, error: `testfile: ${err.message}` };
    }
}