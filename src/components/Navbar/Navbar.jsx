import React from 'react';
import { 
  FiMousePointer, 
  FiSquare, 
  FiCircle, 
  FiType, 
  FiImage, 
  FiPlay, 
  FiShare2, 
  FiCode, 
  FiTrash2,
  FiChevronDown
} from 'react-icons/fi';
import { useDrag } from 'react-dnd';
import './Navbar.css';

const ToolIcon = ({ type, icon: Icon, title, isActive }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'SHAPE',
    item: { type }, // This MUST be 'type' as the key
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div 
      ref={drag} 
      className={`tool-icon ${isActive ? 'active' : ''} ${isDragging ? 'dragging' : ''}`} 
      title={title}
    >
      <Icon size={18} />
    </div>
  );
};

const Navbar = ({ deleteSelectedElement, toggleCodeTab, showCodeTab }) => {
  return (
    <nav className="figma-navbar">
      <div className="nav-left">
        <div className="logo-container">
          <div className="figma-logo">
            <div className="logo-dot blue"></div>
            <div className="logo-dot purple"></div>
            <div className="logo-dot orange"></div>
          </div>
          <div className="project-info">
            <span className="project-name">Website Studio Pro</span>
            <FiChevronDown size={12} className="meta-icon" />
          </div>
        </div>
      </div>

      <div className="nav-center">
        <div className="toolbar">
          <div className="tool-group">
            <div className="tool-icon active" title="Move (V)">
              <FiMousePointer size={18} />
            </div>
          </div>
          <div className="divider"></div>
          <div className="tool-group">
            <ToolIcon type="rectangle" icon={FiSquare} title="Rectangle (R)" />
            <ToolIcon type="circle" icon={FiCircle} title="Circle (O)" />
            <ToolIcon type="text" icon={FiType} title="Text (T)" />
            <ToolIcon type="image" icon={FiImage} title="Image (I)" />
          </div>
        </div>
      </div>

      <div className="nav-right">
        <div className="action-group">
          <button 
            className={`nav-btn secondary ${showCodeTab ? 'active' : ''}`} 
            onClick={toggleCodeTab}
          >
            <FiCode size={16} />
            <span>Developer Mode</span>
          </button>
          
          <button className="nav-btn primary">
            <FiShare2 size={16} />
            <span>Share Project</span>
          </button>

          <div className="nav-btn preview">
            <FiPlay size={14} fill="currentColor" />
          </div>
        </div>

        <div className="divider"></div>

        <button className="nav-btn danger" onClick={deleteSelectedElement} title="Delete Layer">
          <FiTrash2 size={18} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
