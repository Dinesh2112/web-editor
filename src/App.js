import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Navbar from './components/Navbar/Navbar';
import LeftPanel from './components/LeftPanel/LeftPanel';
import Canvas from './components/Canvas/Canvas';
import RightPanel from './components/RightPanel/RightPanel';
import './App.css';

function App() {
  const [elements, setElements] = useState([]); // Store all elements on the canvas
  const [selectedElement, setSelectedElement] = useState(null); // Track the selected element
  const [layers, setLayers] = useState([]); // Store all layers for the LeftPanel
  const [shapeCounts, setShapeCounts] = useState({ rectangle: 0, circle: 0, text: 0 }); // Track counts of each shape

  const updateElement = (id, updatedElement) => {
    setElements(elements.map(el => (el.id === id ? updatedElement : el)));
  };

  const deleteSelectedElement = () => {
    if (selectedElement !== null) {
      const deletedElement = elements.find(element => element.id === selectedElement);
      if (deletedElement) {
        // Decrease count for the deleted element's type
        setShapeCounts(prevCounts => ({
          ...prevCounts,
          [deletedElement.type]: Math.max(0, prevCounts[deletedElement.type] - 1) // Prevent count going below 0
        }));
      }

      // Remove the corresponding layer from the LeftPanel
      setLayers(layers.filter(layer => layer.id !== selectedElement));

      // Remove the element from the canvas
      setElements(elements.filter(element => element.id !== selectedElement));
      setSelectedElement(null); // Unselect after deletion
    }
  };

  const addLayer = (layer) => {
    setLayers((prevLayers) => [...prevLayers, layer]); // Add the new layer to the global state
  };

  const incrementShapeCount = (type) => {
    setShapeCounts((prevCounts) => ({
      ...prevCounts,
      [type]: prevCounts[type] + 1 // Increment count for the specific shape type
    }));
  };

  // Delete the selected element by pressing the delete key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' && selectedElement !== null) {
        deleteSelectedElement();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElement, elements]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        <Navbar deleteSelectedElement={deleteSelectedElement} />
        <div className="content">
          <LeftPanel
            layers={layers}
            selectedElement={selectedElement}
            setSelectedElement={setSelectedElement}
            deleteSelectedElement={deleteSelectedElement} // Pass delete functionality
          />
          <Canvas
            elements={elements}
            setElements={setElements}
            selectedElement={selectedElement}
            setSelectedElement={setSelectedElement}
            addLayer={addLayer}
            incrementShapeCount={incrementShapeCount} // Pass increment function to Canvas
            shapeCounts={shapeCounts} // Pass shapeCounts to Canvas
            updateElement={updateElement} // Pass updateElement to Canvas
            setLayers={setLayers} // Pass setLayers to Canvas for layer management
            layers={layers} // Pass layers to Canvas
          />
          <RightPanel
            selectedElement={selectedElement}
            elements={elements}
            updateElement={updateElement}
          />
        </div>
      </div>
    </DndProvider>
  );
}

export default App;
