import React, { useEffect, useState } from 'react';
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
  const gridSpacing = 50;
  const CANVAS_WIDTH = 884; // Set the full width limit for the canvas

  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: 'SHAPE',
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      addElement(item.type, offset.x, offset.y);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const generateUniqueId = () => Date.now() + Math.random();

  const addElement = (type, x, y) => {
    const currentCount = shapeCounts[type] + 1;
    const elementWidth = 100;
    const newElement = {
      id: generateUniqueId(),
      type,
      x: Math.min(x, CANVAS_WIDTH - elementWidth), // Keep initial placement within boundary
      y: Math.round(y / gridSpacing) * gridSpacing,
      width: elementWidth,
      height: 100,
      backgroundColor: '#ffffff',
      text: type === 'text' ? 'Enter text' : '',
      fontSize: '20px', // Default font size for text elements
      fontColor: '#000000', // Default font color
      parentId: null,
      name: `${type}${currentCount}`,
      tagName: 'h2', // Default tagName for text elements
      borderRadius: 0, // Initialize border-radius to 0
    };

    shapeCounts[type] = currentCount;
    const overlappingElement = findOverlappingElement(newElement);
    if (overlappingElement) {
      newElement.parentId = overlappingElement.id;
    }

    setElements((prev) => [...prev, newElement]);
    addLayer({ id: newElement.id, name: newElement.name });

    if (!window.livePreviewTab) openNewTab();
    updateLivePreview();
  };

  const findOverlappingElement = (newElement) => {
    return elements.find((element) => {
      const isOverlapping =
        newElement.x < element.x + element.width &&
        newElement.x + newElement.width > element.x &&
        newElement.y < element.y + element.height &&
        newElement.y + newElement.height > element.y;

      return isOverlapping;
    });
  };

  const updateElement = (id, newProperties) => {
    setElements((prev) =>
      prev.map((element) =>
        element.id === id
          ? {
              ...element,
              ...newProperties,
              // Ensure the element doesn’t go beyond the canvas boundary, considering its width
              x: Math.min(newProperties.x, CANVAS_WIDTH - (newProperties.width || element.width)),
            }
          : element
      )
    );
    updateLivePreview();
  };

  const deleteSelectedElement = () => {
    if (selectedElement !== null) {
      setElements(elements.filter((element) => element.id !== selectedElement));
      setSelectedElement(null);
      updateLivePreview();
    }
  };

  const handleCanvasClick = (e) => {
    if (e.target.classList.contains('canvas')) setSelectedElement(null);
  };

  const handleZoom = (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY;
      const newScale = delta < 0 ? scale + 0.1 : Math.max(0.1, scale - 0.1);
      setScale(newScale);
    }
  };

  const openNewTab = () => {
    window.livePreviewTab = window.open('', '_blank', 'width=1000,height=600');
    window.livePreviewTab.document.write(`
      <html>
        <head>
          <title>Live Preview</title>
          <link rel="stylesheet" href="styles.css">
          <style>
            body { font-family: Arial, sans-serif; display: flex; }
            .code-container { flex: 1; padding: 10px; }
            pre { background-color: #f0f0f0; padding: 10px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="code-container">
            <h3>HTML</h3>
            <pre id="html-code"></pre>
          </div>
          <div class="code-container">
            <h3>CSS</h3>
            <pre id="css-code"></pre>
          </div>
        </body>
      </html>
    `);
  };

  const generateHtmlTree = (elements) => {
    const elementMap = {};
    const rootElements = [];

    elements.forEach((element) => {
      elementMap[element.id] = { ...element, children: [] };
    });

    elements.forEach((element) => {
      if (element.parentId) {
        elementMap[element.parentId].children.push(elementMap[element.id]);
      } else {
        rootElements.push(elementMap[element.id]);
      }
    });

    return rootElements;
  };

  const generateHtmlCode = (tree) => {
    const generateHtmlForElement = (element) => {
      const childrenHtml = element.children.map(generateHtmlForElement).join('');
      
      // If it's a text element, render as h1, h2, h3, etc.
      if (element.type === 'text') {
        return `<${element.tagName} class="${element.name}" style="font-size: ${element.fontSize}; color: ${element.fontColor};">
                  ${element.text}
                </${element.tagName}>`;
      }

      return `
        <div class="${element.name}">
          ${element.text ? element.text : ''}
          ${childrenHtml}
        </div>
      `;
    };

    return tree.map(generateHtmlForElement).join('');
  };

  const generateCss = (elements) => {
    return elements
      .map((element) => {
        let leftCss, topCss, widthCss, heightCss;
  
        leftCss = `${(element.x / CANVAS_WIDTH) * 100}vw`;
        topCss = `${element.y}px`;
        widthCss = `${(element.width / CANVAS_WIDTH) * 100}vw`;
        heightCss = `${element.height}px`;
  
        const borderRadiusCss = element.type === 'rectangle' && element.borderRadius > 0
          ? `border-radius: ${element.borderRadius}px;`
          : (element.type === 'circle' ? 'border-radius: 50%;' : '');
  
        // Only apply text-specific styles for text elements (font-size, color)
        const fontSizeCss = element.type === 'text' && element.fontSize ? `font-size: ${element.fontSize};` : '';
        const fontColorCss = element.type === 'text' && element.fontColor ? `color: ${element.fontColor};` : '';
  
        // Set background color to transparent for text elements
        const backgroundColorCss = element.type === 'text' ? 'background-color: transparent;' : `background-color: ${element.backgroundColor};`;
  
        const shapeCss = `
          width: ${element.type !== 'text' ? widthCss : 'auto'};
          height: ${element.type !== 'text' ? heightCss : 'auto'};
          ${borderRadiusCss}
          ${fontSizeCss}
          ${fontColorCss}
        `;
  
        return `
          .${element.name} {
            position: absolute;
            ${backgroundColorCss}
            left: ${leftCss};
            top: ${topCss};
            ${shapeCss}
          }
        `;
      })
      .join('\n');
  };

  const updateLivePreview = () => {
    if (window.livePreviewTab && !window.livePreviewTab.closed) {
      const tree = generateHtmlTree(elements);
      const htmlCode = generateHtmlCode(tree);
      const cssCode = generateCss(elements);
  
      window.livePreviewTab.document.getElementById('html-code').textContent = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
      <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <div class="canvas">
      ${htmlCode}
    </div>
  </body>
  </html>`;
  
      window.livePreviewTab.document.getElementById('css-code').textContent = cssCode;
    }
  };

  useEffect(() => {
    updateLivePreview();
  }, [elements]);

  return (
    <div
      ref={drop}
      className="canvas"
      style={{ transform: `scale(${scale})`, width: CANVAS_WIDTH }}
      onClick={handleCanvasClick}
      onWheel={handleZoom}
    >
      {elements.map((element) => (
        <Shape
          key={element.id}
          element={element}
          updateElement={updateElement}
          setSelectedElement={setSelectedElement}
          selectedElement={selectedElement}
          deleteSelectedElement={deleteSelectedElement}
          updateLivePreview={updateLivePreview}
        />
      ))}
    </div>
  );
};

export default Canvas;
