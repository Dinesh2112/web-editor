import React, { useState } from 'react';
import { 
  FiLayers, 
  FiSquare, 
  FiCircle, 
  FiType, 
  FiImage, 
  FiEye, 
  FiEyeOff,
  FiChevronRight,
  FiChevronDown
} from 'react-icons/fi';
import './LeftPanel.css';

const LayerItem = ({ layer, isSelected, onSelect, onRename }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const getIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'rectangle': return <FiSquare size={14} color="#0D99FF" />;
      case 'circle': return <FiCircle size={14} color="#0D99FF" />;
      case 'text': return <FiType size={14} color="#FF70AB" />;
      case 'image': return <FiImage size={14} color="#2ECC71" />;
      default: return <FiSquare size={14} />;
    }
  };

  const type = layer.name.split('-')[0].toLowerCase() || 'rectangle';

  return (
    <div 
      className={`layer-row ${isSelected ? 'selected' : ''}`} 
      onClick={() => onSelect(layer.id)}
      onDoubleClick={() => setIsEditing(true)}
    >
      <div className="layer-content">
        <FiChevronRight size={10} className="expand-icon" />
        <div className="layer-icon">{getIcon(type)}</div>
        {isEditing ? (
          <input
            autoFocus
            className="layer-input"
            defaultValue={layer.name}
            onBlur={(e) => {
              onRename(layer.id, e.target.value);
              setIsEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onRename(layer.id, e.target.value);
                setIsEditing(false);
              }
            }}
          />
        ) : (
          <span className="layer-name">{layer.name}</span>
        )}
      </div>
      <div className="layer-actions" onClick={(e) => e.stopPropagation()}>
        <button 
          className="visibility-btn" 
          onClick={() => setIsVisible(!isVisible)}
        >
          {isVisible ? <FiEye size={12} /> : <FiEyeOff size={12} />}
        </button>
      </div>
    </div>
  );
};

const LeftPanel = ({ layers, selectedElement, setSelectedElement, updateElement }) => {
  const [isPagesExpanded, setIsPagesExpanded] = useState(true);
  const [isLayersExpanded, setIsLayersExpanded] = useState(true);

  const handleRename = (id, newName) => {
    updateElement(id, { name: newName });
  };

  return (
    <div className="figma-sidebar left">
      <div className="sidebar-section">
        <div 
          className="section-header" 
          onClick={() => setIsPagesExpanded(!isPagesExpanded)}
        >
          {isPagesExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
          <span>Pages</span>
        </div>
        {isPagesExpanded && (
          <div className="section-content">
            <div className="page-item active">Index Page</div>
          </div>
        )}
      </div>

      <div className="sidebar-section layers-section">
        <div 
          className="section-header" 
          onClick={() => setIsLayersExpanded(!isLayersExpanded)}
        >
          {isLayersExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
          <span>Layers</span>
          <span className="layer-count">{layers.length}</span>
        </div>
        {isLayersExpanded && (
          <div className="section-content layers-list">
            {layers.length === 0 ? (
              <div className="empty-state">No layers yet</div>
            ) : (
              layers.map((layer) => (
                <LayerItem 
                  key={layer.id} 
                  layer={layer} 
                  isSelected={selectedElement === layer.id}
                  onSelect={setSelectedElement}
                  onRename={handleRename}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftPanel;
