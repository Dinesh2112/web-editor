import React, { useState, useMemo } from 'react';
import { FaCopy, FaDownload, FaEye, FaCode, FaFileCode, FaPalette } from 'react-icons/fa';
import './Codetab.css';

const CodeTab = ({ elements, CANVAS_WIDTH = 884 }) => {
  const [activeTab, setActiveTab] = useState('html');
  const [copied, setCopied] = useState(false);

  // Memoize HTML tree generation
  const htmlTree = useMemo(() => {
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
  }, [elements]);

  // Memoize HTML code generation
  const htmlCode = useMemo(() => {
    const generateHtmlForElement = (element) => {
      const childrenHtml = element.children.map(generateHtmlForElement).join('');
      
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

    return htmlTree.map(generateHtmlForElement).join('');
  }, [htmlTree]);

  // Memoize CSS generation
  const cssCode = useMemo(() => {
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
  
        const fontSizeCss = element.type === 'text' && element.fontSize ? `font-size: ${element.fontSize};` : '';
        const fontColorCss = element.type === 'text' && element.fontColor ? `color: ${element.fontColor};` : '';
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
  }, [elements, CANVAS_WIDTH]);

  // Memoize complete HTML document
  const completeHtml = useMemo(() => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Website</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
        .canvas {
            position: relative;
            width: 100vw;
            height: 100vh;
            overflow: hidden;
        }
        ${cssCode}
    </style>
</head>
<body>
    <div class="canvas">
        ${htmlCode}
    </div>
</body>
</html>`;
  }, [htmlCode, cssCode]);

  // Copy code to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Download code as file
  const downloadCode = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Get current code based on active tab
  const getCurrentCode = () => {
    switch (activeTab) {
      case 'html':
        return completeHtml;
      case 'css':
        return cssCode;
      case 'preview':
        return '';
      default:
        return '';
    }
  };

  // Get current language for syntax highlighting
  const getCurrentLanguage = () => {
    switch (activeTab) {
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      default:
        return 'text';
    }
  };

  const tabs = [
    { id: 'html', label: 'HTML', icon: FaFileCode, color: '#e34c26' },
    { id: 'css', label: 'CSS', icon: FaPalette, color: '#264de4' },
    { id: 'preview', label: 'Preview', icon: FaEye, color: '#61dafb' }
  ];

  return (
    <div className="code-tab">
      {/* Tab Navigation */}
      <div className="tab-navigation">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ '--tab-color': tab.color }}
          >
            <tab.icon />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Code Actions */}
      <div className="code-actions">
        <button
          className="action-button copy-btn"
          onClick={() => copyToClipboard(getCurrentCode())}
          title="Copy to clipboard"
        >
          <FaCopy />
          {copied ? 'Copied!' : 'Copy'}
        </button>
        
        {activeTab !== 'preview' && (
          <button
            className="action-button download-btn"
            onClick={() => {
              const ext = activeTab === 'html' ? 'html' : 'css';
              const filename = `generated-website.${ext}`;
              const mimeType = activeTab === 'html' ? 'text/html' : 'text/css';
              downloadCode(getCurrentCode(), filename, mimeType);
            }}
            title="Download file"
          >
            <FaDownload />
            Download
          </button>
        )}
      </div>

      {/* Code Content */}
      <div className="code-content">
        {activeTab === 'preview' ? (
          <div className="preview-container">
            <div className="preview-header">
              <h3>Live Preview</h3>
              <p>This is how your generated website will look</p>
            </div>
            <div className="preview-frame">
              <iframe
                srcDoc={completeHtml}
                title="Website Preview"
                className="preview-iframe"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        ) : (
          <div className="code-editor">
            <div className="code-header">
              <span className="code-language">{getCurrentLanguage().toUpperCase()}</span>
              <span className="code-info">
                {getCurrentCode().length} characters
              </span>
            </div>
            <pre className="code-display">
              <code className={`language-${getCurrentLanguage()}`}>
                {getCurrentCode()}
              </code>
            </pre>
          </div>
        )}
      </div>

      {/* Code Statistics */}
      <div className="code-stats">
        <div className="stat-item">
          <FaCode />
          <span>Elements: {elements.length}</span>
        </div>
        <div className="stat-item">
          <FaFileCode />
          <span>HTML: {htmlCode.length} chars</span>
        </div>
        <div className="stat-item">
          <FaPalette />
          <span>CSS: {cssCode.length} chars</span>
        </div>
      </div>
    </div>
  );
};

export default CodeTab;
