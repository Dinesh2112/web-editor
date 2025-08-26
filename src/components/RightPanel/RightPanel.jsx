import React, { useState } from 'react';
import './RightPanel.css';

const RightPanel = ({ selectedElement, elements, updateElement, deleteElement }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [initialX, setInitialX] = useState(0);
  const [initialRadius, setInitialRadius] = useState(0);

  if (!selectedElement) return <div className="right-panel">No element selected</div>;

  const element = elements.find(el => el.id === selectedElement);
  if (!element) return <div className="right-panel">Element not found</div>;

  const CANVAS_WIDTH = 836;

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedProperties = {
      ...element,
      [name]: name === 'backgroundColor' ? value : parseInt(value, 10) || 0
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

  const handleDelete = () => deleteElement(selectedElement);

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

  const rightValue = CANVAS_WIDTH - (element.x + element.width);

  return (
    <div
      className="right-panel"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <h3>Properties</h3>
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

      {/* Position */}
      <label>Top:
        <input type="number" name="y" value={element.y || ''} onChange={handleChange} />
      </label>

      <label>Left:
        <input type="number" name="x" value={element.x || ''} onChange={handleChange} />
      </label>

      <label>Right:
        <input type="number" name="right" value={rightValue || ''} readOnly />
      </label>

      {/* Size */}
      <label>Width:
        <input type="number" name="width" value={element.width || ''} onChange={handleChange} />
      </label>

      <label>Height:
        <input type="number" name="height" value={element.height || ''} onChange={handleChange} />
      </label>

      {/* Color */}
      <label>Background Color:
        <input type="color" name="backgroundColor" value={element.backgroundColor || '#ffffff'} onChange={handleChange} />
      </label>

      {/* Border Radius (only for rectangles) */}
      {element.type === 'rectangle' && (
        <label
          className="border-radius-label"
          style={{ cursor: 'default' }}
        >
          Border Radius:
          <input
            type="number"
            name="borderRadius"
            value={element.borderRadius || 0}
            onChange={handleChange}
            style={{ width: '60px' }}
            onMouseEnter={(e) => e.target.style.cursor = 'ew-resize'}
            onMouseDown={handleMouseDown}
          />
        </label>
      )}

      {/* Text Properties */}
      {element.type === 'text' && (
        <>
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
        </>
      )}
      <button onClick={handleDelete}>Delete Element</button>
    </div>
  );
};

export default RightPanel;
