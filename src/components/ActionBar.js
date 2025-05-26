import React from 'react';

const ActionBar = ({ onCreateDir, onDelete, onRefresh }) => {
    return (
        <div className="action-bar">
            <button onClick={onCreateDir}>Create Directory</button>
            <button onClick={onDelete}>Delete</button>
            <button onClick={onRefresh}>Refresh</button>
        </div>
    );
};

export default ActionBar;