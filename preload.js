const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    getFiles: (dirPath) => ipcRenderer.invoke('get-files', dirPath),
    navigate: (newPath) => ipcRenderer.invoke('navigate', newPath),
    mkdir: (dirName) => ipcRenderer.invoke('mkdir', dirName),
    createFile: (fileName, content) => ipcRenderer.invoke('create-file', fileName, content),
    rm: (itemPath) => ipcRenderer.invoke('rm', itemPath),
    copyFile: (src, dest) => ipcRenderer.invoke('copy-file', src, dest),
    moveFile: (src, dest) => ipcRenderer.invoke('move-file', src, dest),
    
    // Terminal specific commands
    executeCommand: (command) => ipcRenderer.invoke('execute-command', command),
    getCurrentDir: () => ipcRenderer.invoke('get-current-dir'),
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
    cat: (filePath) => ipcRenderer.invoke('cat', filePath),
    ls: (dirPath) => ipcRenderer.invoke('ls', dirPath),
    cd: (dirPath) => ipcRenderer.invoke('cd', dirPath),
    touch: (filePath) => ipcRenderer.invoke('touch', filePath),
});