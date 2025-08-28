import React from 'react';
import { FaSquare, FaCircle, FaTextHeight, FaTrash, FaImage, FaSave, FaDownload, FaUndo, FaRedo, FaCode } from 'react-icons/fa';
import { useDrag } from 'react-dnd';
import './Navbar.css';

const ShapeIcon = ({ type, children, title }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'SHAPE',
    item: { type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag} className={`navbar-icon ${isDragging ? 'dragging' : ''}`} title={title}>
      {children}
    </div>
  );
};

const ActionButton = ({ icon: Icon, onClick, title, className = '', isActive = false }) => (
  <div className={`navbar-icon ${className} ${isActive ? 'active' : ''}`} onClick={onClick} title={title}>
    <Icon />
  </div>
);

const Navbar = ({ deleteSelectedElement, addImage, toggleCodeTab, showCodeTab }) => {
  return (
    <div className="navbar">
      <div className="navbar-left">
        <input type="text" className="navbar-title" placeholder="Untitled Project" />
        <div className="navbar-version">v1.0.0</div>
      </div>

      <div className="navbar-center">
        <div className="navbar-section">
          <span className="navbar-section-label">Shapes</span>
          <div className="navbar-icons">
            <ShapeIcon type="rectangle" title="Rectangle">
              <FaSquare />
            </ShapeIcon>
            <ShapeIcon type="circle" title="Circle">
              <FaCircle />
            </ShapeIcon>
            <ShapeIcon type="text" title="Text">
              <FaTextHeight />
            </ShapeIcon>
          </div>
        </div>
      </div>

      <div className="navbar-right">
        <div className="navbar-section">
          <span className="navbar-section-label">Actions</span>
          <div className="navbar-icons">
            <ActionButton 
              icon={FaUndo} 
              onClick={() => {}} 
              title="Undo" 
              className="action-btn"
            />
            <ActionButton 
              icon={FaRedo} 
              onClick={() => {}} 
              title="Redo" 
              className="action-btn"
            />
            <ActionButton 
              icon={FaSave} 
              onClick={() => {}} 
              title="Save" 
              className="action-btn primary"
            />
            <ActionButton 
              icon={FaDownload} 
              onClick={() => {}} 
              title="Export" 
              className="action-btn"
            />
            <ActionButton 
              icon={FaImage} 
              onClick={addImage} 
              title="Add Image" 
              className="action-btn"
            />
            <ActionButton 
              icon={FaCode} 
              onClick={toggleCodeTab} 
              title={showCodeTab ? "Show Canvas" : "Show Code"} 
              className="action-btn code-btn"
              isActive={showCodeTab}
            />
            <ActionButton 
              icon={FaTrash} 
              onClick={deleteSelectedElement} 
              title="Delete" 
              className="action-btn danger"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
