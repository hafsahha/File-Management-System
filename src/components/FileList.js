import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';

const FileList = () => {
    const [files, setFiles] = useState([]);

    useEffect(() => {
        loadFiles();
    }, []);

    const loadFiles = async () => {
        const fileList = await ipcRenderer.invoke('get-files', '.');
        setFiles(fileList);
    };

    return (
        <div>
            <h2>File List</h2>
            <ul>
                {files.map((file, index) => (
                    <li key={index}>{file}</li>
                ))}
            </ul>
        </div>
    );
};

export default FileList;