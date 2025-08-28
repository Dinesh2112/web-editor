import React, { useState, useCallback, useMemo } from 'react';
import { useDrop } from 'react-dnd';
import Shape from '../Shape';
import './Canvas.css';

const Canvas = ({
  elements,
  setElements,
  selectedElement,
  setSelectedElement,
  addLayer,
  shapeCounts,
  incrementShapeCount,
}) => {
  const [scale, setScale] = useState(1);
  const CANVAS_WIDTH = 1200; // Increased canvas width
  const CANVAS_HEIGHT = 800; // Added canvas height

  // Memoize the drop function to prevent unnecessary re-renders
  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: 'SHAPE',
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      if (offset) {
        addElement(item.type, offset.x, offset.y);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [shapeCounts]);

  const generateUniqueId = useCallback(() => Date.now() + Math.random(), []);

  // Memoize the addElement function
  const addElement = useCallback((type, x, y) => {
    const currentCount = shapeCounts[type] + 1;
    const elementWidth = 100;
    const elementHeight = 100;
    
    // Calculate canvas-relative coordinates
    const canvasRect = document.querySelector('.canvas')?.getBoundingClientRect();
    if (!canvasRect) return;
    
    const canvasX = x - canvasRect.left;
    const canvasY = y - canvasRect.top;
    
    // Ensure element stays within canvas boundaries
    const newX = Math.max(0, Math.min(canvasX, CANVAS_WIDTH - elementWidth));
    const newY = Math.max(0, Math.min(canvasY, CANVAS_HEIGHT - elementHeight));
    
    const newElement = {
      id: generateUniqueId(),
      type,
      x: newX,
      y: newY,
      width: elementWidth,
      height: elementHeight,
      backgroundColor: type === 'text' ? 'transparent' : '#ffffff',
      text: type === 'text' ? 'Enter text' : '',
      fontSize: '20px',
      fontColor: '#000000',
      parentId: null,
      name: `${type}${currentCount}`,
      tagName: 'h2',
      borderRadius: 0,
    };

    setElements((prev) => [...prev, newElement]);
    addLayer({ id: newElement.id, name: newElement.name });
  }, [shapeCounts, generateUniqueId, CANVAS_WIDTH, CANVAS_HEIGHT, setElements, addLayer]);

  // Optimize the updateElement function
  const updateElement = useCallback((id, newProperties) => {
    setElements((prev) =>
      prev.map((element) => {
        if (element.id === id) {
          const updated = { ...element, ...newProperties };
          
          // Ensure element stays within canvas boundaries
          if (updated.x !== undefined) {
            updated.x = Math.max(0, Math.min(updated.x, CANVAS_WIDTH - (updated.width || element.width)));
          }
          if (updated.y !== undefined) {
            updated.y = Math.max(0, Math.min(updated.y, CANVAS_HEIGHT - (updated.height || element.height)));
          }
          if (updated.width !== undefined) {
            updated.width = Math.max(50, Math.min(updated.width, CANVAS_WIDTH - (updated.x || element.x)));
          }
          if (updated.height !== undefined) {
            updated.height = Math.max(50, Math.min(updated.height, CANVAS_HEIGHT - (updated.y || element.y)));
          }
          
          return updated;
        }
        return element;
      })
    );
  }, [CANVAS_WIDTH, CANVAS_HEIGHT, setElements]);

  const deleteSelectedElement = useCallback(() => {
    if (selectedElement !== null) {
      setElements(elements.filter((element) => element.id !== selectedElement));
      setSelectedElement(null);
    }
  }, [selectedElement, elements, setElements, setSelectedElement]);

  const handleCanvasClick = useCallback((e) => {
    if (e.target.classList.contains('canvas')) {
      setSelectedElement(null);
    }
  }, [setSelectedElement]);

  // Debounce zoom to improve performance
  const handleZoom = useCallback((e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY;
      const newScale = delta < 0 ? scale + 0.1 : Math.max(0.1, scale - 0.1);
      setScale(newScale);
    }
  }, [scale]);

  // Memoize the Shape components to prevent unnecessary re-renders
  const shapeComponents = useMemo(() => {
    return elements.map((element) => (
      <Shape
        key={element.id}
        element={element}
        updateElement={updateElement}
        setSelectedElement={setSelectedElement}
        selectedElement={selectedElement}
        deleteSelectedElement={deleteSelectedElement}
        canvasWidth={CANVAS_WIDTH}
        canvasHeight={CANVAS_HEIGHT}
      />
    ));
  }, [elements, updateElement, setSelectedElement, selectedElement, deleteSelectedElement, CANVAS_WIDTH, CANVAS_HEIGHT]);

  return (
    <div
      ref={drop}
      className={`canvas ${canDrop ? 'drop-zone' : ''} ${isOver ? 'highlight' : ''}`}
      style={{ 
        transform: `scale(${scale})`, 
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        minHeight: CANVAS_HEIGHT
      }}
      onClick={handleCanvasClick}
      onWheel={handleZoom}
    >
      {shapeComponents}
    </div>
  );
};

export default Canvas;
