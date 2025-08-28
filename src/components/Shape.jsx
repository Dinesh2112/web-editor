import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import './Shape.css';

const Shape = ({ element, updateElement, setSelectedElement, selectedElement, deleteSelectedElement, canvasWidth, canvasHeight }) => {
  const {
    id, type, x, y, width, height, backgroundColor = '#ffffff',
    text, fontSize, fontWeight, fontColor, borderRadius = 0, src
  } = element;

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [inputText, setInputText] = useState(text);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);

  const shapeRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Memoize selection state
  const isSelected = useMemo(() => selectedElement === id, [selectedElement, id]);

  // Throttle updates to 60fps for smooth performance
  const throttledUpdate = useCallback((updates) => {
    const now = performance.now();
    if (now - lastUpdateTime >= 16.67) { // 60fps = 16.67ms per frame
      updateElement(id, updates);
      setLastUpdateTime(now);
    } else {
      // Cancel previous animation frame and schedule new one
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(() => {
        updateElement(id, updates);
        setLastUpdateTime(performance.now());
      });
    }
  }, [id, updateElement, lastUpdateTime]);

  // Handle mouse down for dragging and resizing
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedElement(id);
    
    if (e.target.dataset.handle) {
      // Start resizing
      setIsResizing(true);
      setResizeDirection(e.target.dataset.handle);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: width,
        height: height,
        startX: x,
        startY: y
      });
    } else {
      // Start dragging
      setIsDragging(true);
      setDragStart({
        x: e.clientX - x,
        y: e.clientY - y
      });
    }
  }, [id, x, y, width, height, setSelectedElement]);

  // Handle mouse move for smooth dragging and resizing
  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(e.clientX - dragStart.x, canvasWidth - width));
      const newY = Math.max(0, Math.min(e.clientY - dragStart.y, canvasHeight - height));
      
      // Use throttled update for smooth performance
      throttledUpdate({ x: newX, y: newY });
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = resizeStart.startX;
      let newY = resizeStart.startY;
      
      switch (resizeDirection) {
        case 'bottom-right':
          newWidth = Math.max(50, Math.min(resizeStart.width + deltaX, canvasWidth - resizeStart.startX));
          newHeight = Math.max(50, Math.min(resizeStart.height + deltaY, canvasHeight - resizeStart.startY));
          break;
        case 'bottom-left':
          newWidth = Math.max(50, Math.min(resizeStart.width - deltaX, resizeStart.startX));
          newX = Math.max(0, Math.min(resizeStart.startX + deltaX, canvasWidth - 50));
          newHeight = Math.max(50, Math.min(resizeStart.height + deltaY, canvasHeight - resizeStart.startY));
          break;
        case 'top-right':
          newWidth = Math.max(50, Math.min(resizeStart.width + deltaX, canvasWidth - resizeStart.startX));
          newHeight = Math.max(50, Math.min(resizeStart.height - deltaY, resizeStart.startY));
          newY = Math.max(0, Math.min(resizeStart.startY + deltaY, canvasHeight - 50));
          break;
        case 'top-left':
          newWidth = Math.max(50, Math.min(resizeStart.width - deltaX, resizeStart.startX));
          newHeight = Math.max(50, Math.min(resizeStart.height - deltaY, resizeStart.startY));
          newX = Math.max(0, Math.min(resizeStart.startX + deltaX, canvasWidth - 50));
          newY = Math.max(0, Math.min(resizeStart.startY + deltaY, canvasHeight - 50));
          break;
        case 'left':
          newWidth = Math.max(50, Math.min(resizeStart.width - deltaX, resizeStart.startX));
          newX = Math.max(0, Math.min(resizeStart.startX + deltaX, canvasWidth - 50));
          break;
        case 'right':
          newWidth = Math.max(50, Math.min(resizeStart.width + deltaX, canvasWidth - resizeStart.startX));
          break;
        case 'top':
          newHeight = Math.max(50, Math.min(resizeStart.height - deltaY, resizeStart.startY));
          newY = Math.max(0, Math.min(resizeStart.startY + deltaY, canvasHeight - 50));
          break;
        case 'bottom':
          newHeight = Math.max(50, Math.min(resizeStart.height + deltaY, canvasHeight - resizeStart.startY));
          break;
        default:
          break;
      }
      
      // Maintain aspect ratio for circles
      if (type === 'circle') {
        const size = Math.min(newWidth, newHeight);
        newWidth = size;
        newHeight = size;
      }
      
      // Use throttled update for smooth performance
      throttledUpdate({ x: newX, y: newY, width: newWidth, height: newHeight });
    }
  }, [isDragging, isResizing, dragStart, resizeStart, resizeDirection, width, height, canvasWidth, canvasHeight, throttledUpdate, type]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection(null);
    
    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Add event listeners only when needed
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseup', handleMouseUp, { passive: true });
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Handle double click for text editing
  const handleDoubleClick = useCallback(() => {
    if (type === 'text') {
      setIsEditing(true);
    }
  }, [type]);

  // Handle text input change
  const handleTextChange = useCallback((e) => {
    setInputText(e.target.value);
  }, []);

  // Handle text input blur
  const handleTextBlur = useCallback(() => {
    setIsEditing(false);
    updateElement(id, { text: inputText });
  }, [inputText, updateElement, id]);

  // Memoize shape styles
  const shapeStyles = useMemo(() => ({
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
    borderRadius: type === 'circle' ? '50%' : `${borderRadius}px`,
    backgroundColor: type === 'text' ? 'transparent' : backgroundColor,
    position: 'absolute',
    cursor: isDragging || isResizing ? 'grabbing' : 'grab',
    userSelect: 'none',
    touchAction: 'none',
  }), [x, y, width, height, type, borderRadius, backgroundColor, isDragging, isResizing]);

  // Memoize text styles
  const textStyles = useMemo(() => ({
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'text',
    padding: '8px',
    fontSize: fontSize ? `${fontSize}px` : '16px',
    fontWeight: fontWeight || 'normal',
    color: fontColor || '#000000',
    border: 'none',
    background: 'transparent',
    outline: 'none',
    textAlign: 'center',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    userSelect: 'text',
  }), [fontSize, fontWeight, fontColor]);

  return (
    <div
      ref={shapeRef}
      className={`shape ${type} ${isSelected ? 'selected' : ''}`}
      style={shapeStyles}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      data-type={type}
    >
      {type === 'text' ? (
        isEditing ? (
          <input
            type="text"
            value={inputText}
            onChange={handleTextChange}
            onBlur={handleTextBlur}
            style={textStyles}
            autoFocus
          />
        ) : (
          <span style={textStyles}>
            {inputText || 'Double-click to edit'}
          </span>
        )
      ) : type === 'image' ? (
        <img
          src={src}
          alt="Element"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          draggable={false}
        />
      ) : null}

      {/* Resize handles - only show when selected */}
      {isSelected && (
        <>
          <div className="handle top-left" data-handle="top-left" />
          <div className="handle top-right" data-handle="top-right" />
          <div className="handle bottom-left" data-handle="bottom-left" />
          <div className="handle bottom-right" data-handle="bottom-right" />
          <div className="handle left" data-handle="left" />
          <div className="handle right" data-handle="right" />
          <div className="handle top" data-handle="top" />
          <div className="handle bottom" data-handle="bottom" />
        </>
      )}
    </div>
  );
};

export default React.memo(Shape);
