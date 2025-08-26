import React, { useState, useEffect } from 'react';
import './Shape.css';

const Shape = ({ element, updateElement, setSelectedElement, selectedElement }) => {
  const {
    id, type, x, y, width, height, backgroundColor = '#ffffff',
    text, fontSize, fontWeight, fontColor, parentDiv, borderRadius = 0, src
  } = element;

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [initialMousePosition, setInitialMousePosition] = useState({ x: 0, y: 0 });
  const [initialElementPosition, setInitialElementPosition] = useState({ x, y });
  const [initialDimensions, setInitialDimensions] = useState({ width, height });
  const [isEditing, setIsEditing] = useState(false);
  const [inputText, setInputText] = useState(text);
  const [initialBorderRadius, setInitialBorderRadius] = useState(borderRadius);
  const [isBorderRadiusDragging, setIsBorderRadiusDragging] = useState(false);

  // Track the position of the text and update the element after editing
  const handleBlur = () => {
    setIsEditing(false);
    updateElement(id, { text: inputText, x, y }); // Keep x and y up-to-date
  };

  // Handle drag and resize functionality
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const deltaX = e.clientX - initialMousePosition.x;
        const deltaY = e.clientY - initialMousePosition.y;
        const newX = Math.max(0, initialElementPosition.x + deltaX);
        const newY = Math.max(0, initialElementPosition.y + deltaY);
        updateElement(id, { x: newX, y: newY });
      } else if (isResizing) {
        const deltaX = e.clientX - initialMousePosition.x;
        const deltaY = e.clientY - initialMousePosition.y;

        let newWidth = initialDimensions.width;
        let newHeight = initialDimensions.height;
        let newX = initialElementPosition.x;
        let newY = initialElementPosition.y;

        switch (resizeDirection) {
          case 'bottom-right':
            newWidth = Math.max(50, initialDimensions.width + deltaX);
            newHeight = Math.max(50, initialDimensions.height + deltaY);
            break;
          case 'bottom-left':
            newWidth = Math.max(50, initialDimensions.width - deltaX);
            newX = initialElementPosition.x + deltaX;
            newHeight = Math.max(50, initialDimensions.height + deltaY);
            break;
          case 'top-right':
            newWidth = Math.max(50, initialDimensions.width + deltaX);
            newHeight = Math.max(50, initialDimensions.height - deltaY);
            newY = initialElementPosition.y + deltaY;
            break;
          case 'top-left':
            newWidth = Math.max(50, initialDimensions.width - deltaX);
            newX = initialElementPosition.x + deltaX;
            newHeight = Math.max(50, initialDimensions.height - deltaY);
            newY = initialElementPosition.y + deltaY;
            break;
          case 'all-sides':
            newWidth = Math.max(50, initialDimensions.width + deltaX);
            newHeight = Math.max(50, initialDimensions.height + deltaY);
            break;
          default:
            break;
        }

        if (type === 'circle') {
          newHeight = newWidth; // Maintain aspect ratio for circles
        }

        updateElement(id, { x: newX, y: newY, width: newWidth, height: newHeight });
      } else if (isBorderRadiusDragging) {
        const deltaX = e.clientX - initialMousePosition.x;
        const newBorderRadius = Math.max(0, initialBorderRadius + deltaX); // Prevent negative border radius
        updateElement(id, { borderRadius: newBorderRadius });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setIsBorderRadiusDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isDragging, isResizing, isBorderRadiusDragging, initialMousePosition,
    initialElementPosition, initialDimensions, resizeDirection,
    initialBorderRadius, updateElement, id
  ]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setSelectedElement(id);
    e.stopPropagation();

    if (e.target.dataset.handle) {
      setIsResizing(true);
      setResizeDirection(e.target.dataset.handle);
      setInitialMousePosition({ x: e.clientX, y: e.clientY });
      setInitialDimensions({ width, height });
      setInitialElementPosition({ x, y });
    } else {
      setIsDragging(true);
      setInitialMousePosition({ x: e.clientX, y: e.clientY });
      setInitialElementPosition({ x, y });
    }
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e) => {
    setInputText(e.target.value);
  };

  const isSelected = selectedElement === id;

  const handleBorderRadiusMouseDown = (e) => {
    if (e.button === 2) { // Only activate on right-click
      e.preventDefault();
      setInitialMousePosition({ x: e.clientX });
      setInitialBorderRadius(borderRadius);
      setIsBorderRadiusDragging(true);
    }
  };

  return (
    <div
      className={`shape ${type}`} // Corrected className syntax
      style={{
        left: `${x}px`, // Corrected template literal usage for inline styles
        top: `${y}px`,
        width: type === 'circle' ? `${height}px` : `${width}px`,
        height: type === 'circle' ? `${height}px` : `${height}px`,
        borderRadius: type === 'circle' ? '50%' : `${borderRadius}px`,
        backgroundColor: type === 'text' ? 'transparent' : backgroundColor || '#ffffff',
        position: 'absolute',
        cursor: 'default',
        border: isSelected && (isEditing || isResizing) ? '2px dotted blue' : 'none',
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => e.preventDefault()}
    >
      {type === 'text' ? (
        isEditing ? (
          <input
            type="text"
            value={inputText}
            onChange={handleChange}
            onBlur={handleBlur}
            style={{
              width: '100%',
              height: '100%',
              border: '2px dotted blue',
              backgroundColor: 'transparent',
              color: '#000',
              outline: 'none',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
            autoFocus
          />
        ) : (
          <span
            style={{
              width: '100%',
              height: '100%',
              display: 'inline-block',
              cursor: 'text',
              padding: '5px',
              fontSize: fontSize ? `${fontSize}px` : '16px',
              fontWeight: fontWeight || 'normal',
              color: fontColor || '#000000',
              border: 'none',
            }}
          >
            {inputText}
          </span>
        )
      ) : type === 'image' ? (
        <img
          src={src}
          alt="Element"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: `${borderRadius}px`,
            cursor: 'move',
          }}
        />
      ) : null}

      {/* Invisible handle for border-radius drag interaction */}
      {isSelected && (
        <div
          className="border-radius-handle"
          onMouseDown={handleBorderRadiusMouseDown}
          style={{
            position: 'absolute',
            top: '0',
            right: '-20px',
            cursor: 'ew-resize',
            width: '10px',
            height: '10px',
            backgroundColor: 'transparent'
          }}
        />
      )}

      {/* Resize handles for selected elements */}
      {isSelected && (
        <>
          <div className="handle top-left" data-handle="top-left"></div>
          <div className="handle top-right" data-handle="top-right"></div>
          <div className="handle bottom-left" data-handle="bottom-left"></div>
          <div className="handle bottom-right" data-handle="bottom-right"></div>
        </>
      )}
    </div>
  );
};

export default Shape;
