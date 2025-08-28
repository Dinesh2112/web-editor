import React, { useState } from 'react';
import './RightPanel.css';

const RightPanel = ({ selectedElement, elements, updateElement, deleteElement }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [initialX, setInitialX] = useState(0);
  const [initialRadius, setInitialRadius] = useState(0);

  if (!selectedElement) return (
    <div className="right-panel">
      <h3>Properties</h3>
      <div style={{ 
        textAlign: 'center', 
        color: 'rgba(255, 255, 255, 0.5)', 
        padding: '40px 20px',
        fontStyle: 'italic'
      }}>
        Select an element to edit its properties
      </div>
    </div>
  );

  const element = elements.find(el => el.id === selectedElement);
  if (!element) return (
    <div className="right-panel">
      <h3>Properties</h3>
      <div style={{ 
        textAlign: 'center', 
        color: 'rgba(255, 255, 255, 0.5)', 
        padding: '40px 20px',
        fontStyle: 'italic'
      }}>
        Element not found
      </div>
    </div>
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedProperties = {
      ...element,
      [name]: name === 'backgroundColor' || name === 'fontColor' ? value : parseInt(value, 10) || 0
    };
    updateElement(selectedElement, updatedProperties);
  };

  const handleFontChange = (e) => {
    const { name, value } = e.target;
    updateElement(selectedElement, { ...element, [name]: value });
  };

  const handleHeadingChange = (e) => {
    const { value } = e.target;
    updateElement(selectedElement, { ...element, headingType: value });
  };

  const handleDelete = () => {
    if (deleteElement) {
      deleteElement();
    }
  };

  const handleParentChange = (e) => {
    const newParentId = e.target.value === 'none' ? null : e.target.value;
    updateElement(selectedElement, { ...element, parentId: newParentId });
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setInitialX(e.clientX);
    setInitialRadius(element.borderRadius || 0);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const deltaX = e.clientX - initialX;
      const newRadius = Math.max(0, initialRadius + deltaX);
      updateElement(selectedElement, { ...element, borderRadius: newRadius });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div
      className="right-panel"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <h3>Properties</h3>
      
      {/* Hierarchy */}
      <div className="property-group">
        <h4>Hierarchy</h4>
        <label>
          Parent Div:
          <select value={element.parentId || 'none'} onChange={handleParentChange}>
            <option value="none">Canvas</option>
            {elements
              .filter((el) => el.id !== selectedElement)
              .map((el) => (
                <option key={el.id} value={el.id}>{el.type}-{el.id}</option>
              ))}
          </select>
        </label>
      </div>

      {/* Position */}
      <div className="property-group">
        <h4>Position</h4>
        <label>Top:
          <input type="number" name="y" value={element.y || ''} onChange={handleChange} />
        </label>

        <label>Left:
          <input type="number" name="x" value={element.x || ''} onChange={handleChange} />
        </label>
      </div>

      {/* Size */}
      <div className="property-group">
        <h4>Size</h4>
        <label>Width:
          <input type="number" name="width" value={element.width || ''} onChange={handleChange} />
        </label>

        <label>Height:
          <input type="number" name="height" value={element.height || ''} onChange={handleChange} />
        </label>
      </div>

      {/* Appearance */}
      <div className="property-group">
        <h4>Appearance</h4>
        <label>Background Color:
          <input type="color" name="backgroundColor" value={element.backgroundColor || '#ffffff'} onChange={handleChange} />
        </label>

        {/* Border Radius (only for rectangles) */}
        {element.type === 'rectangle' && (
          <label className="border-radius-label">
            Border Radius:
            <input
              type="number"
              name="borderRadius"
              value={element.borderRadius || 0}
              onChange={handleChange}
              onMouseEnter={(e) => e.target.style.cursor = 'ew-resize'}
              onMouseDown={handleMouseDown}
            />
          </label>
        )}
      </div>

      {/* Text Properties */}
      {element.type === 'text' && (
        <div className="property-group">
          <h4>Typography</h4>
          <label>Text:
            <input type="text" name="text" value={element.text || ''} onChange={handleFontChange} />
          </label>
          <label>Font Size:
            <input type="number" name="fontSize" value={element.fontSize || ''} onChange={handleFontChange} />
          </label>
          <label>Font Color:
            <input type="color" name="fontColor" value={element.fontColor || '#000000'} onChange={handleFontChange} />
          </label>
          <label>Heading Type:
            <select name="headingType" value={element.headingType || 'h1'} onChange={handleHeadingChange}>
              <option value="h1">H1</option>
              <option value="h2">H2</option>
              <option value="h3">H3</option>
              <option value="h4">H4</option>
            </select>
          </label>
        </div>
      )}
      
      <button onClick={handleDelete}>Delete Element</button>
    </div>
  );
};

export default RightPanel;
