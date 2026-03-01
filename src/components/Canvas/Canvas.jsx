import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useDrop } from 'react-dnd';
import Shape from '../Shape';
import './Canvas.css';

const Canvas = ({
  elements,
  setElements,
  selectedElement,
  setSelectedElement,
  updateElement,
}) => {
  const [scale, setScale] = useState(1);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  const CANVAS_WIDTH = 3000; 
  const CANVAS_HEIGHT = 3000;

  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: 'SHAPE',
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      if (offset && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (offset.x - rect.left) / scale;
        const y = (offset.y - rect.top) / scale;
        addElement(item.type, x, y);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [scale, elements]);

  const addElement = useCallback((type, x, y) => {
    const id = Date.now() + Math.random();
    
    // Industrial defaults with proper initial sizing
    const defaults = {
      rectangle: { width: 200, height: 120, backgroundColor: '#333333', borderRadius: 8 },
      circle: { width: 150, height: 150, backgroundColor: '#0D99FF', borderRadius: 999 },
      text: { width: 300, height: 60, backgroundColor: 'transparent', text: 'Edit this text', fontSize: 32, fontColor: '#FFFFFF', fontWeight: '600' },
      image: { width: 400, height: 250, backgroundColor: '#252525', src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60' }
    };

    const config = defaults[type] || defaults.rectangle;

    const newElement = {
      id,
      type,
      x: x - (config.width / 2),
      y: y - (config.height / 2),
      ...config,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${elements.length + 1}`,
      parentId: null,
      tagName: type === 'text' ? 'h2' : 'div',
    };

    setElements((prev) => [...prev, newElement]);
    setSelectedElement(id);
  }, [setElements, setSelectedElement, elements.length]);

  // Optimized Zoom and Pan logic
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY;
        const zoomStep = 0.002;
        setScale(prev => Math.min(Math.max(0.1, prev - delta * zoomStep), 5));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    
    // Center logic on mount
    if (elements.length === 0) {
      container.scrollLeft = (CANVAS_WIDTH / 2) - (container.clientWidth / 2);
      container.scrollTop = (CANVAS_HEIGHT / 2) - (container.clientHeight / 2);
    }
    
    return () => container.removeEventListener('wheel', handleWheel);
  }, [elements.length]);

  const handleCanvasClick = (e) => {
    if (e.target.classList.contains('canvas') || e.target.classList.contains('canvas-container')) {
      setSelectedElement(null);
    }
  };

  return (
    <div 
      className="canvas-container" 
      ref={containerRef}
      onMouseDown={handleCanvasClick}
    >
      <div
        ref={(node) => {
          drop(node);
          canvasRef.current = node;
        }}
        className={`canvas ${canDrop ? 'is-dropping' : ''} ${isOver ? 'is-over' : ''}`}
        style={{ 
          transform: `scale(${scale})`, 
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
        }}
      >
        {elements.map((element, index) => (
          <Shape
            key={element.id}
            element={element}
            updateElement={updateElement}
            setSelectedElement={setSelectedElement}
            selectedElement={selectedElement}
            scale={scale}
            index={index} // Pass index for progressive z-indexing
          />
        ))}

        {elements.length === 0 && !isOver && (
          <div className="canvas-placeholder">
            <h1>Workspace Ready</h1>
            <p>Drag elements from the top bar to begin. Use Ctrl+Scroll to zoom.</p>
          </div>
        )}
      </div>
      
      <div className="canvas-hud">
        <div className="zoom-chip">{Math.round(scale * 100)}%</div>
        <div className="coord-chip">Canvas: {CANVAS_WIDTH}x{CANVAS_HEIGHT}</div>
      </div>
    </div>
  );
};

export default Canvas;
