document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const fileListTable = document.getElementById('file-list').getElementsByTagName('tbody')[0];
    const currentPathDisplay = document.getElementById('current-path');
    const btnBack = document.getElementById('btn-back');
    const btnRefresh = document.getElementById('btn-refresh');

    // Current path state
    let currentPath = '';
    let previousPath = '';

    // Function to format file size
    function formatSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Format date to local date string
    function formatDate(dateString) {
        return new Date(dateString).toLocaleString();
    }

    // Load files from current directory
    async function loadFiles() {
        try {
            const result = await window.api.getFiles();
            currentPath = result.currentDir;
            currentPathDisplay.textContent = currentPath;
            
            // Clear the table
            fileListTable.innerHTML = '';
            
            // Add files to the table
            result.items.forEach(item => {
                const row = fileListTable.insertRow();
                
                // Name cell with icon
                const nameCell = row.insertCell();
                const icon = document.createElement('i');
                icon.className = item.isDirectory ? 'fas fa-folder' : 'fas fa-file';
                icon.style.marginRight = '8px';
                nameCell.appendChild(icon);
                
                const nameText = document.createTextNode(item.name);
                nameCell.appendChild(nameText);
                nameCell.style.cursor = 'pointer';
                
                // Add click event for navigation
                nameCell.addEventListener('click', () => {
                    if (item.isDirectory) {
                        navigateToDirectory(item.name);
                    }
                });
                
                // Type cell
                const typeCell = row.insertCell();
                typeCell.textContent = item.isDirectory ? 'Folder' : 'File';
                
                // Size cell
                const sizeCell = row.insertCell();
                sizeCell.textContent = item.isDirectory ? '-' : formatSize(item.size);
                
                // Modified date cell
                const dateCell = row.insertCell();
                dateCell.textContent = formatDate(item.modified);
                
                // Actions cell
                const actionsCell = row.insertCell();
                
                // Delete button
                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                deleteBtn.className = 'btn-delete';
                deleteBtn.title = 'Delete';
                deleteBtn.onclick = () => deleteItem(item.path);
                actionsCell.appendChild(deleteBtn);
            });
        } catch (error) {
            console.error('Error loading files:', error);
            alert('Error loading files: ' + error.message);
        }
    }

    // Navigate to a directory
    async function navigateToDirectory(dirName) {
        try {
            previousPath = currentPath;
            const result = await window.api.navigate(dirName);
            currentPath = result.currentDir;
            currentPathDisplay.textContent = currentPath;
            
            // Clear the table
            fileListTable.innerHTML = '';
            
            // Add files to the table
            result.items.forEach(item => {
                const row = fileListTable.insertRow();
                
                // Name cell with icon
                const nameCell = row.insertCell();
                const icon = document.createElement('i');
                icon.className = item.isDirectory ? 'fas fa-folder' : 'fas fa-file';
                icon.style.marginRight = '8px';
                nameCell.appendChild(icon);
                
                const nameText = document.createTextNode(item.name);
                nameCell.appendChild(nameText);
                nameCell.style.cursor = 'pointer';
                
                // Add click event for navigation
                nameCell.addEventListener('click', () => {
                    if (item.isDirectory) {
                        navigateToDirectory(item.name);
                    }
                });
                
                // Type cell
                const typeCell = row.insertCell();
                typeCell.textContent = item.isDirectory ? 'Folder' : 'File';
                
                // Size cell
                const sizeCell = row.insertCell();
                sizeCell.textContent = item.isDirectory ? '-' : formatSize(item.size);
                
                // Modified date cell
                const dateCell = row.insertCell();
                dateCell.textContent = formatDate(item.modified);
                
                // Actions cell
                const actionsCell = row.insertCell();
                
                // Delete button
                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                deleteBtn.className = 'btn-delete';
                deleteBtn.title = 'Delete';
                deleteBtn.onclick = () => deleteItem(item.path);
                actionsCell.appendChild(deleteBtn);
            });
        } catch (error) {
            console.error('Error navigating directory:', error);
            alert('Error navigating directory: ' + error.message);
        }
    }

    // Go back to previous directory
    function goBack() {
        const parts = currentPath.split(/[\\\/]/);
        parts.pop();
        const parentDir = parts.join('/') || '/';
        navigateToDirectory(parentDir);
    }

    // Create a new folder
    async function createFolder() {
        const folderName = prompt('Enter folder name:');
        if (folderName) {
            try {
                const result = await window.api.mkdir(folderName);
                if (result.success) {
                    loadFiles();
                } else {
                    alert('Error creating folder: ' + result.error);
                }
            } catch (error) {
                console.error('Error creating folder:', error);
                alert('Error creating folder: ' + error.message);
            }
        }
    }

    // Create a new file
    async function createFile() {
        const fileName = prompt('Enter file name:');
        if (fileName) {
            const content = prompt('Enter file content (optional):') || '';
            try {
                const result = await window.api.createFile(fileName, content);
                if (result.success) {
                    loadFiles();
                } else {
                    alert('Error creating file: ' + result.error);
                }
            } catch (error) {
                console.error('Error creating file:', error);
                alert('Error creating file: ' + error.message);
            }
        }
    }

    // Delete a file or folder
    async function deleteItem(itemPath) {
        const confirmed = confirm('Are you sure you want to delete this item?');
        if (confirmed) {
            try {
                const result = await window.api.rm(itemPath);
                if (result.success) {
                    loadFiles();
                } else {
                    alert('Error deleting item: ' + result.error);
                }
            } catch (error) {
                console.error('Error deleting item:', error);
                alert('Error deleting item: ' + error.message);
            }
        }
    }

    // Terminal functionality
    const terminal = document.getElementById('terminal');
    const terminalOutput = document.getElementById('terminal-output');
    const terminalInput = document.getElementById('terminal-input');
    const btnToggleTerminal = document.getElementById('btn-toggle-terminal');
    const btnClearTerminal = document.getElementById('btn-clear-terminal');
    
    let commandHistory = [];
    let historyIndex = -1;

    // Toggle terminal visibility
    function toggleTerminal() {
        terminal.classList.toggle('hidden');
        if (!terminal.classList.contains('hidden')) {
            terminalInput.focus();
        }
    }

    // Clear terminal output
    function clearTerminal() {
        terminalOutput.innerHTML = `
            <div class="terminal-welcome">Welcome to File System Simulator Command Line</div>
            <div class="terminal-help">Type 'help' to see available commands</div>
        `;
    }

    // Add command to terminal
    function addCommandToTerminal(command) {
        const commandDiv = document.createElement('div');
        commandDiv.className = 'terminal-command';
        commandDiv.innerHTML = `<span class="prompt">$</span> ${command}`;
        terminalOutput.appendChild(commandDiv);
    }

    // Add result to terminal
    function addResultToTerminal(result, isError = false) {
        const resultDiv = document.createElement('div');
        resultDiv.className = isError ? 'terminal-result terminal-error' : 'terminal-result';
        resultDiv.textContent = result;
        terminalOutput.appendChild(resultDiv);
        
        // Scroll to bottom
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    // Execute terminal command
    async function executeTerminalCommand(command) {
        if (!command.trim()) return;
        
        // Add to history
        commandHistory.push(command);
        historyIndex = commandHistory.length;
        
        // Display command
        addCommandToTerminal(command);
        
        try {
            // Execute command
            const result = await window.api.executeCommand(command);
            
            // Display result
            if (result.success) {
                if (result.output) {
                    addResultToTerminal(result.output);
                }
                // Refresh file list if the command might have changed it
                if (['mkdir', 'rm', 'rmdir', 'touch'].includes(command.split(' ')[0])) {
                    loadFiles();
                }
                // Update path display if directory changed
                if (command.startsWith('cd ')) {
                    currentPath = await window.api.getCurrentDir();
                    currentPathDisplay.textContent = currentPath;
                }
            } else {
                addResultToTerminal(result.error, true);
            }
        } catch (error) {
            console.error('Error executing command:', error);
            addResultToTerminal(`Error: ${error.message}`, true);
        }
        
        // Clear input and focus
        terminalInput.value = '';
        terminalInput.focus();
    }

    // Handle terminal input
    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = terminalInput.value.trim();
            executeTerminalCommand(command);
        } else if (e.key === 'ArrowUp') {
            // Navigate command history (up)
            if (historyIndex > 0) {
                historyIndex--;
                terminalInput.value = commandHistory[historyIndex];
                
                // Move cursor to end
                setTimeout(() => {
                    terminalInput.selectionStart = terminalInput.value.length;
                    terminalInput.selectionEnd = terminalInput.value.length;
                }, 0);
            }
            e.preventDefault();
        } else if (e.key === 'ArrowDown') {
            // Navigate command history (down)
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                terminalInput.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                terminalInput.value = '';
            }
            e.preventDefault();
        }
    });

    // Event listeners
    btnBack.addEventListener('click', goBack);
    btnRefresh.addEventListener('click', loadFiles);
    btnToggleTerminal.addEventListener('click', toggleTerminal);
    btnClearTerminal.addEventListener('click', clearTerminal);

    // Initial load
    loadFiles();
});