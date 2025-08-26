import React from 'react';
import { FaSquare, FaCircle, FaTextHeight, FaTrash, FaImage } from 'react-icons/fa'; // Import image icon
import { useDrag } from 'react-dnd';
import './Navbar.css';

const ShapeIcon = ({ type, children }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'SHAPE',
    item: { type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag} className={`navbar-icon ${isDragging ? 'dragging' : ''}`}>
      {children}
    </div>
  );
};

const Navbar = ({ deleteSelectedElement, addImage }) => { // Accept addImage function as prop
  return (
    <div className="navbar">
      <input type="text" className="navbar-title" placeholder="Untitled Project" />

      <div className="navbar-icons">
        <ShapeIcon type="rectangle">
          <FaSquare title="Rectangle" />
        </ShapeIcon>
        <ShapeIcon type="circle">
          <FaCircle title="Circle" />
        </ShapeIcon>
        <ShapeIcon type="text">
          <FaTextHeight title="Text" />
        </ShapeIcon>
        <div className="navbar-icon" onClick={deleteSelectedElement}>
          <FaTrash title="Delete" /> {/* Delete button */}
        </div>
        <div className="navbar-icon" onClick={addImage}>
          <FaImage title="Add Image" /> {/* Image button */}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
