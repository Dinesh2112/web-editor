import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import './Shape.css';

const Shape = ({ element, updateElement, setSelectedElement, selectedElement, scale, index }) => {
  const {
    id, type, x, y, width, height, backgroundColor,
    text, fontSize, fontWeight, fontColor, borderRadius, src
  } = element;

  // Use local state for high-frequency updates
  const [localPos, setLocalPos] = useState({ x, y, w: width, h: height });
  const isInteracting = useRef(false);
  const startRef = useRef({ mx: 0, my: 0, sx: 0, sy: 0, sw: 0, sh: 0, dir: '' });
  const shapeRef = useRef(null);

  // Sync state with props when NOT interacting
  useEffect(() => {
    if (!isInteracting.current) {
      setLocalPos({ x, y, w: width, h: height });
    }
  }, [x, y, width, height]);

  const snap = (val) => Math.round(val / 4) * 4;

  const onMouseDown = (e) => {
    e.stopPropagation();
    setSelectedElement(id);

    const isHandle = e.target.classList.contains('resize-handle');
    const dir = isHandle ? e.target.dataset.dir : '';

    isInteracting.current = true;
    startRef.current = {
      mx: e.clientX,
      my: e.clientY,
      sx: x,
      sy: y,
      sw: width,
      sh: height,
      dir
    };

    const handleMouseMove = (moveE) => {
      if (!isInteracting.current) return;

      const dx = (moveE.clientX - startRef.current.mx) / scale;
      const dy = (moveE.clientY - startRef.current.my) / scale;
      const { sx, sy, sw, sh, dir: d } = startRef.current;

      let next = { x: sx, y: sy, w: sw, h: sh };

      if (!d) { // Dragging
        next.x = snap(sx + dx);
        next.y = snap(sy + dy);
      } else { // Resizing
        if (d.includes('r')) next.w = Math.max(10, snap(sw + dx));
        if (d.includes('b')) next.h = Math.max(10, snap(sh + dy));
        if (d.includes('l')) {
          const newW = Math.max(10, snap(sw - dx));
          next.x = sx + (sw - newW);
          next.w = newW;
        }
        if (d.includes('t')) {
          const newH = Math.max(10, snap(sh - dy));
          next.y = sy + (sh - newH);
          next.h = newH;
        }
      }

      setLocalPos(next);

      // FORCE DIRECT DOM UPDATE for maximum smoothness (60fps)
      if (shapeRef.current) {
        shapeRef.current.style.transform = `translate(${next.x}px, ${next.y}px)`;
        shapeRef.current.style.width = `${next.w}px`;
        shapeRef.current.style.height = `${next.h}px`;
      }
    };

    const handleMouseUp = () => {
      if (isInteracting.current) {
        isInteracting.current = false;
        // Batch sync to main elements state
        updateElement(id, { 
          x: localPos.current?.x || 0, // Fallback if ref was used, but we'll use state
          ...localPos 
        });
        
        // Final commit to React State tree
        updateElement(id, { 
          x: localPos.x, 
          y: localPos.y, 
          width: localPos.w, 
          height: localPos.h 
        });
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const isSelected = selectedElement === id;

  // Progressive Z-Index: Selected is always top, newer elements are above older
  const zIndex = useMemo(() => {
    if (isInteracting.current) return 9999;
    if (isSelected) return 999;
    return 10 + index;
  }, [isSelected, index]);

  const containerStyle = useMemo(() => ({
    transform: `translate(${localPos.x}px, ${localPos.y}px)`,
    width: `${localPos.w}px`,
    height: `${localPos.h}px`,
    zIndex
  }), [localPos, zIndex]);

  const contentStyle = useMemo(() => ({
    backgroundColor: type === 'text' ? 'transparent' : backgroundColor,
    borderRadius: type === 'circle' ? '50%' : `${borderRadius}px`,
    color: fontColor,
    fontSize: `${fontSize}px`,
    fontWeight: fontWeight,
  }), [type, backgroundColor, borderRadius, fontColor, fontSize, fontWeight]);

  return (
    <div
      ref={shapeRef}
      className={`shape-wrapper ${type} ${isSelected ? 'active' : ''}`}
      style={containerStyle}
      onMouseDown={onMouseDown}
    >
      <div className="shape-surface" style={contentStyle}>
        {type === 'text' && (
          <div 
            className="text-content" 
            contentEditable 
            suppressContentEditableWarning
            onBlur={(e) => updateElement(id, { text: e.currentTarget.textContent })}
          >
            {text}
          </div>
        )}
        
        {type === 'image' && (
          <img src={src} alt="Layer" draggable={false} className="image-content" />
        )}
      </div>

      {isSelected && (
        <div className="selection-overlay">
          <div className="resize-handle tl" data-dir="tl" />
          <div className="resize-handle tr" data-dir="tr" />
          <div className="resize-handle bl" data-dir="bl" />
          <div className="resize-handle br" data-dir="br" />
          <div className="resize-handle t" data-dir="t" />
          <div className="resize-handle b" data-dir="b" />
          <div className="resize-handle l" data-dir="l" />
          <div className="resize-handle r" data-dir="r" />
          
          {/* Boundary Labels (Figma Style) */}
          <div className="dim-label top">{Math.round(localPos.w)}</div>
          <div className="dim-label side">{Math.round(localPos.h)}</div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Shape);
