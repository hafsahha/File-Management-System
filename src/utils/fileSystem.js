// filepath: file-management-system/src/utils/fileSystem.js
const fs = require('fs');
const path = require('path');

function readDirectory(dirPath) {
    try {
        return fs.readdirSync(dirPath);
    } catch (error) {
        console.error(`Error reading directory: ${error.message}`);
        return [];
    }
}

function createDirectory(dirPath) {
    try {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
            return true;
        } else {
            console.error(`Directory already exists: ${dirPath}`);
            return false;
        }
    } catch (error) {
        console.error(`Error creating directory: ${error.message}`);
        return false;
    }
}

function deleteItem(itemPath) {
    try {
        if (fs.existsSync(itemPath)) {
            const stats = fs.statSync(itemPath);
            if (stats.isDirectory()) {
                fs.rmdirSync(itemPath, { recursive: true });
            } else {
                fs.unlinkSync(itemPath);
            }
            return true;
        } else {
            console.error(`Item does not exist: ${itemPath}`);
            return false;
        }
    } catch (error) {
        console.error(`Error deleting item: ${error.message}`);
        return false;
    }
}

function copyFile(srcPath, destPath) {
    try {
        fs.copyFileSync(srcPath, destPath);
        return true;
    } catch (error) {
        console.error(`Error copying file: ${error.message}`);
        return false;
    }
}

function moveFile(srcPath, destPath) {
    try {
        fs.renameSync(srcPath, destPath);
        return true;
    } catch (error) {
        console.error(`Error moving file: ${error.message}`);
        return false;
    }
}

module.exports = {
    readDirectory,
    createDirectory,
    deleteItem,
    copyFile,
    moveFile
};