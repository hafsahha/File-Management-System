// Virtual File System implementation
const path = require('path');

// In-memory representation of our virtual file system
const vfs = {
    // Root directory
    '/': {
        type: 'directory',
        name: 'root',
        children: {},
        createdAt: new Date(),
        modifiedAt: new Date()
    }
};

// Helper function to get a node from a path
function getNodeFromPath(nodePath) {
    if (nodePath === '/') return vfs['/'];
    
    const parts = nodePath.split('/').filter(Boolean);
    let current = vfs['/'];
    
    for (const part of parts) {
        if (!current.children || !current.children[part]) {
            return null; // Path doesn't exist
        }
        current = current.children[part];
    }
    
    return current;
}

// Helper function to get parent directory of a path
function getParentDirectory(nodePath) {
    if (nodePath === '/') return null; // Root has no parent
    
    const parentPath = path.posix.dirname(nodePath);
    return getNodeFromPath(parentPath);
}

// List contents of a directory
function listDirectory(dirPath) {
    try {
        const node = getNodeFromPath(dirPath);
        
        // Check if path exists and is a directory
        if (!node) {
            return { success: false, error: 'Directory does not exist' };
        }
        
        if (node.type !== 'directory') {
            return { success: false, error: 'Not a directory' };
        }
        
        // Convert children to array format with details
        const items = Object.keys(node.children).map(name => {
            const child = node.children[name];
            return {
                name: name,
                isDirectory: child.type === 'directory',
                size: child.type === 'file' ? child.content.length : 0,
                modified: child.modifiedAt.toISOString(),
                path: dirPath === '/' ? `/${name}` : `${dirPath}/${name}`
            };
        });
        
        return { success: true, items };
    } catch (err) {
        console.error('Error listing directory:', err);
        return { success: false, error: err.message };
    }
}

// Create a virtual directory
function createVirtualDirectory(dirPath) {
    try {
        // Can't create root again
        if (dirPath === '/') {
            return false;
        }
        
        // Check if path already exists
        if (getNodeFromPath(dirPath)) {
            return false;
        }
        
        // Get parent directory
        const parentPath = path.posix.dirname(dirPath);
        const parent = getNodeFromPath(parentPath);
        
        if (!parent || parent.type !== 'directory') {
            return false;
        }
        
        // Create directory
        const dirName = path.posix.basename(dirPath);
        parent.children[dirName] = {
            type: 'directory',
            name: dirName,
            children: {},
            createdAt: new Date(),
            modifiedAt: new Date()
        };
        
        return true;
    } catch (err) {
        console.error('Error creating virtual directory:', err);
        return false;
    }
}

// Create a virtual file
function createVirtualFile(filePath, content = '') {
    try {
        // Don't allow creating file at root path
        if (filePath === '/') {
            return false;
        }
        
        // Check if path already exists
        const existing = getNodeFromPath(filePath);
        if (existing) {
            // If it's a file, update content
            if (existing.type === 'file') {
                existing.content = content;
                existing.modifiedAt = new Date();
                return true;
            }
            return false; // Can't overwrite a directory with a file
        }
        
        // Get parent directory
        const parentPath = path.posix.dirname(filePath);
        const parent = getNodeFromPath(parentPath);
        
        if (!parent || parent.type !== 'directory') {
            return false;
        }
        
        // Create file
        const fileName = path.posix.basename(filePath);
        parent.children[fileName] = {
            type: 'file',
            name: fileName,
            content: content,
            createdAt: new Date(),
            modifiedAt: new Date()
        };
        
        return true;
    } catch (err) {
        console.error('Error creating virtual file:', err);
        return false;
    }
}

// Read a virtual file
function readVirtualFile(filePath) {
    try {
        const node = getNodeFromPath(filePath);
        
        if (!node) {
            return { success: false, error: 'File not found' };
        }
        
        if (node.type !== 'file') {
            return { success: false, error: 'Not a file' };
        }
        
        return { success: true, content: node.content };
    } catch (err) {
        console.error('Error reading virtual file:', err);
        return { success: false, error: err.message };
    }
}

// Delete an item (file or directory)
function deleteItem(itemPath) {
    try {
        // Can't delete root
        if (itemPath === '/') {
            return { success: false, error: "Cannot delete root directory" };
        }
        
        // Check if item exists
        const node = getNodeFromPath(itemPath);
        if (!node) {
            return { success: false, error: 'Item does not exist' };
        }
        
        // Get parent directory
        const parentPath = path.posix.dirname(itemPath);
        const parent = getNodeFromPath(parentPath);
        
        if (!parent) {
            return { success: false, error: 'Parent directory not found' };
        }
        
        // Delete the item
        const itemName = path.posix.basename(itemPath);
        delete parent.children[itemName];
        
        return { success: true };
    } catch (err) {
        console.error('Error deleting item:', err);
        return { success: false, error: err.message };
    }
}

// Rename a file or directory
function renameItem(oldPath, newPath) {
    try {
        // Can't rename root
        if (oldPath === '/' || newPath === '/') {
            return { success: false, error: "Cannot rename root directory" };
        }
        
        // Check if source item exists
        const node = getNodeFromPath(oldPath);
        if (!node) {
            return { success: false, error: 'Source item does not exist' };
        }
        
        // Check if destination already exists
        if (getNodeFromPath(newPath)) {
            return { success: false, error: 'Destination already exists' };
        }
        
        // Get parent directories
        const oldParentPath = path.posix.dirname(oldPath);
        const newParentPath = path.posix.dirname(newPath);
        
        const oldParent = getNodeFromPath(oldParentPath);
        const newParent = getNodeFromPath(newParentPath);
        
        if (!oldParent || !newParent) {
            return { success: false, error: 'Parent directory not found' };
        }
        
        // Do the rename/move operation
        const oldName = path.posix.basename(oldPath);
        const newName = path.posix.basename(newPath);
        
        newParent.children[newName] = oldParent.children[oldName];
        newParent.children[newName].name = newName;
        delete oldParent.children[oldName];
        
        return { success: true };
    } catch (err) {
        console.error('Error renaming item:', err);
        return { success: false, error: err.message };
    }
}

// Create some sample content for testing
function createSampleContent() {
    // Create some sample directories
    createVirtualDirectory('/documents');
    createVirtualDirectory('/pictures');
    createVirtualDirectory('/music');
    createVirtualDirectory('/documents/work');
    createVirtualDirectory('/documents/personal');
    
    // Create some sample files
    createVirtualFile('/documents/readme.txt', 'This is a sample readme file.');
    createVirtualFile('/documents/work/report.txt', 'Annual report content would go here.');
    createVirtualFile('/documents/personal/notes.txt', 'Personal notes and reminders.');
    createVirtualFile('/pictures/vacation.jpg', '[BINARY IMAGE DATA]');
    createVirtualFile('/music/song.mp3', '[BINARY AUDIO DATA]');
}

// Create sample content when module loads
createSampleContent();

module.exports = {
    listDirectory,
    createVirtualDirectory,
    createVirtualFile,
    readVirtualFile,
    deleteItem,
    renameItem
};