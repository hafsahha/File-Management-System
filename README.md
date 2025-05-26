# Virtual File System Simulator

This project is a file system simulator built using Electron and Node.js that demonstrates how operating systems manage files and directories. It combines a graphical user interface with a command-line terminal for file operations.

## Overview

The File System Simulator uses a virtual in-memory file system rather than the actual file system of your computer. This allows for safe experimentation without affecting real files. The application features both a GUI interface similar to a file explorer and a command-line terminal interface, making it educational for understanding operating system file management concepts.

## Features

- **Virtual In-Memory File System**: All operations are performed on a simulated file system
- **Dual Interface**: 
  - Graphical UI with file/folder navigation and operations
  - Command-line terminal for executing file system commands
- **File Operations**:
  - Create directories (`mkdir`)
  - Create files (`touch`)
  - Navigate directories (`cd`)
  - List contents (`ls`)
  - Delete files/folders (`rm`)
  - Display file contents (`cat`)
  - Show current path (`pwd`)
  - Display text (`echo`)
- **Visual Representation**: Icons to distinguish between files and folders

## Project Structure

```
file-management-system/
├── index.html                # Main HTML interface
├── package.json              # Project configuration and dependencies
├── preload.js                # Safely exposes Node.js APIs to renderer process
├── src/
│   ├── main.js               # Main process (application entry point)
│   ├── renderer.js           # Renderer process (UI logic)
│   ├── components/           # UI components
│   │   ├── ActionBar.js      # Action buttons component
│   │   ├── FileList.js       # File list display component
│   │   └── FileOperations.js # File operation handlers
│   ├── styles/
│   │   └── main.css          # Application styling
│   └── utils/
│       └── virtualFileSystem.js  # In-memory file system implementation
└── assets/
    └── icons/                # UI icons
        ├── delete.svg
        ├── file.svg
        └── folder.svg
```

## Installation

1. Make sure you have [Node.js](https://nodejs.org/) installed on your system
2. Clone or download this repository
3. Open a terminal and navigate to the project directory
4. Install the dependencies:
   ```
   npm install
   ```

## Running the Application

To start the File System Simulator:

```
npm start
```

## How to Use

### GUI Interface

- **Navigate**: Click on folder names to navigate into directories
- **Go Back**: Use the back button to return to the parent directory
- **Refresh**: Click the refresh button to update the file list
- **Delete**: Use the delete button next to files/folders to remove them
- **Toggle Terminal**: Open the command-line interface for more advanced operations

### Terminal Interface

The terminal supports the following commands:

- `ls [path]` - List files and directories
- `cd <path>` - Change directory (use `..` to go up one level)
- `mkdir <dirname>` - Create a directory
- `rm <path>` - Remove a file or directory
- `touch <filename>` - Create an empty file
- `cat <filename>` - Display file contents
- `pwd` - Show current directory path
- `echo <text>` - Display text
- `help` - Show available commands

### Virtual File System

The application starts with a sample directory structure containing:
- `/documents/` - Sample document files
- `/pictures/` - Sample picture files
- `/music/` - Sample music files

This structure is loaded in memory and does not affect your actual file system.

## Educational Purpose

This simulator is designed to demonstrate how operating systems manage files and directories. It illustrates concepts like:

- File system hierarchies and paths
- File operations (creation, deletion, navigation)
- Command parsing and execution
- User interface interaction with file systems

## Technical Details

- **Framework**: Electron.js
- **UI**: HTML, CSS, and JavaScript
- **Architecture**: Uses a main process and renderer process with IPC communication
- **File System**: Custom in-memory implementation for educational purposes
│   ├── components            # Contains reusable components
│   │   ├── FileList.js       # Displays a list of files and directories
│   │   ├── ActionBar.js      # Contains buttons for file operations
│   │   └── FileOperations.js  # Logic for file operations
│   ├── utils                 # Utility functions for file system operations
│   │   └── fileSystem.js     # Abstracts file system interactions
│   └── styles                # Styles for the application
│       └── main.css          # Main stylesheet
├── assets                    # Contains assets like icons
│   └── icons
│       ├── folder.svg        # Icon for folders
│       ├── file.svg          # Icon for files
│       └── delete.svg        # Icon for delete action
├── index.html                # Main HTML file
├── package.json              # Configuration file for npm
├── preload.js                # Exposes Node.js functionalities securely
└── README.md                 # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd file-management-system
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the application:
   ```
   npm start
   ```

## Usage

- Launch the application to view the file management interface.
- Use the action bar to create directories, delete files, and refresh the file list.
- Navigate through the file system using the provided functionalities.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.