import React from 'react';
import './Codetab.css'; // Create a CSS file for styling

const CodeTab = ({ htmlCode, cssCode }) => {
  return (
    <div className="code-tab">
      <div className="code-section">
        <h3>HTML</h3>
        <pre>{htmlCode}</pre>
      </div>
      <div className="code-section">
        <h3>CSS</h3>
        <pre>{cssCode}</pre>
      </div>
    </div>
  );
};

export default CodeTab;
