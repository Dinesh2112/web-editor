import React, { useState } from 'react';
import './LeftPanel.css';

const LeftPanel = ({ layers, selectedElement, setSelectedElement, deleteSelectedElement }) => {
  const [editingLayerId, setEditingLayerId] = useState(null); // Track which layer is being edited

  return (
    <div className="left-panel">
      <h3>Layers</h3>
      <ul className="layers-list">
        {layers.map((layer) => (
          <li
            key={layer.id}
            className={`layer-item ${selectedElement === layer.id ? 'selected' : ''}`} // Apply class if selected
            onClick={() => setSelectedElement(layer.id)} // Set selected element on click
            onDoubleClick={() => setEditingLayerId(layer.id)} // Allow double-click to edit
          >
            {editingLayerId === layer.id ? (
              // Input field for renaming layer when in edit mode
              <input
                type="text"
                defaultValue={layer.name}
                className="layer-name"
                onBlur={(e) => {
                  // Save new layer name and exit edit mode
                  layer.name = e.target.value;
                  setEditingLayerId(null);
                }}
                autoFocus
              />
            ) : (
              <span>{layer.name}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LeftPanel;
