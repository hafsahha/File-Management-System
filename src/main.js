const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Import virtual file system module
const virtualFS = require('./utils/virtualFileSystem');

let mainWindow;
let currentDir = '/'; // Track current virtual directory (starting at root)

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
            case 'pwd':
                return { success: true, output: currentDir };
            case 'echo':
                return { success: true, output: args.join(' ') };
            case 'help':
                return { 
                    success: true, 
                    output: `Available commands:
ls [path]        - List files and directories
cd <path>        - Change directory
mkdir <dirname>  - Create a directory
rm <path>        - Remove a file or directory
touch <filename> - Create an empty file
cat <filename>   - Display file contents
pwd              - Show current directory path
echo <text>      - Display text
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
            return { success: true, output: `Directory created: ${dirName}` };
        } else {
            return { success: false, error: `mkdir: Failed to create directory` };
        }
    } catch (err) {
        return { success: false, error: `mkdir: ${err.message}` };
    }
}

async function handleRmCommand(args) {
    if (args.length === 0) {
        return { success: false, error: 'rm: missing operand' };
    }
    
    try {
        const itemName = args[0];
        // Handle path for virtual file system
        const targetPath = itemName.startsWith('/') ? itemName : path.posix.join(currentDir, itemName);
        
        // Use virtual file system to delete item
        const result = virtualFS.deleteItem(targetPath);
        
        if (result.success) {
            return { success: true, output: `Removed: ${itemName}` };
        } else {
            return { success: false, error: `rm: ${result.error}` };
        }
    } catch (err) {
        return { success: false, error: `rm: ${err.message}` };
    }
}

async function handleTouchCommand(args) {
    if (args.length === 0) {
        return { success: false, error: 'touch: missing operand' };
    }
    
    try {
        const fileName = args[0];
        // Handle path for virtual file system
        const filePath = fileName.startsWith('/') ? fileName : path.posix.join(currentDir, fileName);
        
        // Use virtual file system to create empty file
        const result = virtualFS.createVirtualFile(filePath, '');
        
        if (result) {
            return { success: true, output: `Created/updated: ${fileName}` };
        } else {
            return { success: false, error: `touch: Failed to create file` };
        }
    } catch (err) {
        return { success: false, error: `touch: ${err.message}` };
    }
}

async function handleCatCommand(args) {
    if (args.length === 0) {
        return { success: false, error: 'cat: missing operand' };
    }
    
    try {
        const fileName = args[0];
        // Handle path for virtual file system
        const filePath = fileName.startsWith('/') ? fileName : path.posix.join(currentDir, fileName);
        
        // Use virtual file system to read file
        const result = virtualFS.readVirtualFile(filePath);
        
        if (result.success) {
            return { success: true, output: result.content };
        } else {
            return { success: false, error: `cat: ${fileName}: ${result.error}` };
        }
    } catch (err) {
        return { success: false, error: `cat: ${err.message}` };
    }
}