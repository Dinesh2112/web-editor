import React, { useState, useMemo } from 'react';
import { FiCopy, FiDownload, FiEye, FiCode, FiCheck, FiMonitor, FiLayout } from 'react-icons/fi';
import './Codetab.css';

const CodeTab = ({ elements, CANVAS_WIDTH = 3000, CANVAS_HEIGHT = 3000 }) => {
  const [activeTab, setActiveTab] = useState('html');
  const [copied, setCopied] = useState(false);

  // Advanced Spatial Tree Logic
  // This builds a tree where shapes inside other shapes are nested in the HTML
  const generateTree = useMemo(() => {
    // Sort by area so parents always come before children
    const sorted = [...elements].sort((a, b) => (b.width * b.height) - (a.width * a.height));
    const tree = [];
    const map = new Map();

    sorted.forEach(el => {
      const node = { ...el, children: [] };
      map.set(el.id, node);

      let foundParentId = null;
      let minParentArea = Infinity;

      sorted.forEach(potentialParent => {
        if (potentialParent.id === el.id || potentialParent.type === 'text') return;
        
        // Check containment (spatial nesting)
        const isInside = (
          el.x >= potentialParent.x &&
          el.y >= potentialParent.y &&
          (el.x + el.width) <= (potentialParent.x + potentialParent.width) &&
          (el.y + el.height) <= (potentialParent.y + potentialParent.height)
        );

        if (isInside) {
          const area = potentialParent.width * potentialParent.height;
          if (area < minParentArea) {
            minParentArea = area;
            foundParentId = potentialParent.id;
          }
        }
      });

      if (foundParentId && map.has(foundParentId)) {
        map.get(foundParentId).children.push(node);
      } else {
        tree.push(node); // Root element
      }
    });
    return tree;
  }, [elements]);

  const generateHTML = (nodes, indent = 1) => {
    const space = '    '.repeat(indent);
    return nodes.map(node => {
      const idStr = `id="${node.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}"`;
      const classStr = `class="${node.type}"`;
      const childrenHtml = generateHTML(node.children, indent + 1);
      
      if (node.type === 'text') {
        return `${space}<div ${idStr} ${classStr}>${node.text}</div>`;
      }
      if (node.children.length > 0) {
        return `${space}<div ${idStr} ${classStr}>\n${childrenHtml}\n${space}</div>`;
      }
      return `${space}<div ${idStr} ${classStr}></div>`;
    }).join('\n');
  };

  const generateCSS = (nodes, parent = null) => {
    let css = '';
    nodes.forEach(node => {
      const idSelector = `#${node.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      
      // Calculate RELATIVE positioning if nested
      const relX = parent ? node.x - parent.x : node.x;
      const relY = parent ? node.y - parent.y : node.y;

      css += `${idSelector} {\n`;
      css += `    position: absolute;\n`;
      css += `    left: ${relX}px;\n`;
      css += `    top: ${relY}px;\n`;
      css += `    width: ${node.width}px;\n`;
      css += `    height: ${node.height}px;\n`;
      
      if (node.type !== 'text') {
        css += `    background-color: ${node.backgroundColor};\n`;
        if (node.borderRadius) css += `    border-radius: ${node.borderRadius}px;\n`;
      } else {
        css += `    color: ${node.fontColor};\n`;
        css += `    font-size: ${node.fontSize}px;\n`;
        css += `    font-weight: ${node.fontWeight};\n`;
        css += `    display: flex;\n`;
        css += `    align-items: center;\n`;
        css += `    justify-content: center;\n`;
      }
      
      if (node.type === 'image') {
        css += `    background-image: url('${node.src}');\n`;
        css += `    background-size: cover;\n`;
        css += `    background-position: center;\n`;
      }

      css += `}\n\n`;
      css += generateCSS(node.children, node);
    });
    return css;
  };

  const htmlBody = useMemo(() => generateHTML(generateTree), [generateTree]);
  const cssStyle = useMemo(() => generateCSS(generateTree), [generateTree]);

  const fullArtifact = useMemo(() => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Studio Pro Export</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
    <style>
        :root { --canvas-w: ${CANVAS_WIDTH}px; --canvas-h: ${CANVAS_HEIGHT}px; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            background-color: #f0f0f0; 
            font-family: 'Inter', sans-serif; 
            display: flex;
            justify-content: center;
            overflow-x: hidden;
        }
        .canvas-root { 
            position: relative; 
            width: var(--canvas-w); 
            height: var(--canvas-h); 
            background-color: white; 
            box-shadow: 0 50px 100px rgba(0,0,0,0.1);
        }
        ${cssStyle}
    </style>
</head>
<body>
    <div class="canvas-root">
${htmlBody}
    </div>
</body>
</html>
  `.trim(), [htmlBody, cssStyle, CANVAS_WIDTH, CANVAS_HEIGHT]);

  const copy = () => {
    navigator.clipboard.writeText(fullArtifact);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-studio">
      <div className="studio-nav">
        <div className="studio-tabs">
          <button className={`st-tab ${activeTab === 'html' ? 'active' : ''}`} onClick={() => setActiveTab('html')}>
            <FiCode size={13} /> <span>Generated Code</span>
          </button>
          <button className={`st-tab ${activeTab === 'preview' ? 'active' : ''}`} onClick={() => setActiveTab('preview')}>
            <FiMonitor size={13} /> <span>Live Deployment Preview</span>
          </button>
        </div>
        
        <div className="studio-actions">
          <button className="st-btn primary" onClick={copy}>
            {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
            <span>{copied ? 'Copied Bundle' : 'Copy HTML/CSS Bundle'}</span>
          </button>
          <button className="st-btn secondary">
            <FiDownload size={14} />
            <span>Download .zip</span>
          </button>
        </div>
      </div>

      <div className="studio-workspace">
        {activeTab === 'html' ? (
          <div className="st-editor">
            <div className="editor-chrome">
              <div className="dot red" /> <div className="dot yellow" /> <div className="dot green" />
              <span className="file-name">index.html</span>
            </div>
            <pre className="code-pre"><code>{fullArtifact}</code></pre>
          </div>
        ) : (
          <div className="st-preview">
            <div className="preview-toolbar">
              <FiLayout size={14} /> <span>Simulated Web View ({CANVAS_WIDTH}px)</span>
            </div>
            <div className="preview-window">
              <iframe srcDoc={fullArtifact} title="Deployment View" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeTab;
