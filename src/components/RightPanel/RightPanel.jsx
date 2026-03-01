import React from 'react';
import { 
  FiAlignLeft, 
  FiAlignCenter, 
  FiAlignRight, 
  FiChevronDown,
  FiPlus,
  FiTrash2,
  FiEye
} from 'react-icons/fi';
import {
  MdAlignVerticalTop,
  MdAlignVerticalCenter,
  MdAlignVerticalBottom
} from 'react-icons/md';
import './RightPanel.css';

const PropertyInput = ({ label, value, onChange, type = "number", suffix = "" }) => (
  <div className="property-field">
    <div className="field-label">{label}</div>
    <div className="field-control">
      <input 
        type={type} 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="field-input"
        spellCheck={false}
      />
      {suffix && <span className="field-suffix">{suffix}</span>}
    </div>
  </div>
);

const RightPanel = ({ selectedElement, elements, updateElement, deleteElement }) => {
  const element = elements.find(el => el.id === selectedElement);

  if (!element) return (
    <div className="figma-sidebar right">
      <div className="sidebar-section">
        <div className="section-header">Design</div>
        <div className="empty-state">Select a layer to view properties</div>
      </div>
    </div>
  );

  const handleUpdate = (name, val) => {
    let finalVal = val;
    if (['x', 'y', 'width', 'height', 'fontSize', 'borderRadius'].includes(name)) {
      finalVal = parseFloat(val) || 0;
    }
    updateElement(selectedElement, { [name]: finalVal });
  };

  return (
    <div className="figma-sidebar right">
      <div className="sidebar-section tight">
        <div className="alignment-bar">
          <FiAlignLeft className="align-icon" title="Align Left" />
          <FiAlignCenter className="align-icon" title="Align Horizontal Center" />
          <FiAlignRight className="align-icon" title="Align Right" />
          <div className="divider-v"></div>
          <MdAlignVerticalTop className="align-icon" title="Align Top" />
          <MdAlignVerticalCenter className="align-icon" title="Align Vertical Center" />
          <MdAlignVerticalBottom className="align-icon" title="Align Bottom" />
        </div>
      </div>

      <div className="divider-h"></div>

      <div className="sidebar-section">
        <div className="section-header">Layout</div>
        <div className="property-grid-2x2">
          <PropertyInput label="X" value={Math.round(element.x)} onChange={(v) => handleUpdate('x', v)} />
          <PropertyInput label="Y" value={Math.round(element.y)} onChange={(v) => handleUpdate('y', v)} />
          <PropertyInput label="W" value={Math.round(element.width)} onChange={(v) => handleUpdate('width', v)} />
          <PropertyInput label="H" value={Math.round(element.height)} onChange={(v) => handleUpdate('height', v)} />
        </div>
        <div className="property-grid-2x2 mt-12">
          <PropertyInput label="∠" value={0} onChange={() => {}} suffix="°" />
          <PropertyInput label="R" value={element.borderRadius} onChange={(v) => handleUpdate('borderRadius', v)} />
        </div>
      </div>

      <div className="divider-h"></div>

      <div className="sidebar-section">
        <div className="section-header">
          <span>Fill</span>
          <FiPlus size={14} className="add-icon" />
        </div>
        <div className="fill-item">
          <div 
            className="color-preview" 
            style={{ backgroundColor: element.backgroundColor }}
            onClick={() => document.getElementById('color-picker').click()}
          ></div>
          <input 
            id="color-picker"
            type="color" 
            value={element.backgroundColor} 
            onChange={(e) => handleUpdate('backgroundColor', e.target.value)}
            style={{ display: 'none' }}
          />
          <span className="hex-value">{element.backgroundColor.toUpperCase()}</span>
          <span className="opacity-value">100%</span>
          <FiEye size={12} className="eye-icon" />
        </div>
      </div>

      {element.type === 'text' && (
        <>
          <div className="divider-h"></div>
          <div className="sidebar-section">
            <div className="section-header">Text</div>
            <div className="typography-group">
              <div className="font-selector">
                <span>Inter</span>
                <FiChevronDown size={14} />
              </div>
              <div className="font-weight-selector">
                <span>{element.fontWeight || 'Regular'}</span>
                <FiChevronDown size={14} />
              </div>
              <div className="property-grid-2x2 mt-12">
                <PropertyInput label="Size" value={element.fontSize} onChange={(v) => handleUpdate('fontSize', v)} />
                <PropertyInput label="Line" value={1.2} onChange={() => {}} />
              </div>
            </div>
          </div>
        </>
      )}

      <div className="sidebar-section mt-auto p-16">
        <button className="delete-layer-btn" onClick={deleteElement}>
          <FiTrash2 size={14} />
          <span>Delete Layer</span>
        </button>
      </div>
    </div>
  );
};

export default RightPanel;
