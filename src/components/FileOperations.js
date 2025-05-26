import { ipcRenderer } from 'electron';

export const createDirectory = async (dirName) => {
    try {
        await ipcRenderer.invoke('mkdir', dirName);
        return true;
    } catch (error) {
        console.error('Error creating directory:', error);
        return false;
    }
};

export const deleteItem = async (itemPath) => {
    try {
        await ipcRenderer.invoke('rm', itemPath);
        return true;
    } catch (error) {
        console.error('Error deleting item:', error);
        return false;
    }
};

export const copyFile = async (src, dest) => {
    try {
        await ipcRenderer.invoke('cp', src, dest);
        return true;
    } catch (error) {
        console.error('Error copying file:', error);
        return false;
    }
};

export const moveFile = async (src, dest) => {
    try {
        await ipcRenderer.invoke('mv', src, dest);
        return true;
    } catch (error) {
        console.error('Error moving file:', error);
        return false;
    }
};