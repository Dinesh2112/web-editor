import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Navbar from './components/Navbar/Navbar';
import LeftPanel from './components/LeftPanel/LeftPanel';
import Canvas from './components/Canvas/Canvas';
import RightPanel from './components/RightPanel/RightPanel';
import CodeTab from './components/CodingTab/CodeTab';
import './App.css';

function App() {
  const [elements, setElements] = useState([]); // Store all elements on the canvas
  const [selectedElement, setSelectedElement] = useState(null); // Track the selected element
  const [layers, setLayers] = useState([]); // Store all layers for the LeftPanel
  const [shapeCounts, setShapeCounts] = useState({ rectangle: 0, circle: 0, text: 0 }); // Track counts of each shape
  const [showWelcome, setShowWelcome] = useState(true); // Welcome screen state
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [showCodeTab, setShowCodeTab] = useState(false); // Code generation tab state

  // Simulate loading on app start
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setShowWelcome(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const updateElement = (id, updatedElement) => {
    setElements(elements.map(el => (el.id === id ? updatedElement : el)));
  };

  const deleteSelectedElement = useCallback(() => {
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
  }, [selectedElement, elements, layers, setElements, setLayers, setSelectedElement]);

  const addLayer = (layer) => {
    setLayers((prevLayers) => [...prevLayers, layer]); // Add the new layer to the global state
  };

  const incrementShapeCount = (type) => {
    setShapeCounts((prevCounts) => ({
      ...prevCounts,
      [type]: prevCounts[type] + 1 // Increment count for the specific shape type
    }));
  };

  const toggleCodeTab = () => {
    setShowCodeTab(!showCodeTab);
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
  }, [selectedElement, deleteSelectedElement]);

  // Welcome screen component
  const WelcomeScreen = () => (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="welcome-logo">
          <div className="logo-icon">🎨</div>
          <h1>Website Editor</h1>
          <p>Professional Design Tool</p>
        </div>
        <div className="welcome-features">
          <div className="feature">
            <span className="feature-icon">✨</span>
            <span>Modern UI Design</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🚀</span>
            <span>Drag & Drop Interface</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🎯</span>
            <span>Real-time Properties</span>
          </div>
          <div className="feature">
            <span className="feature-icon">💻</span>
            <span>Code Generation</span>
          </div>
        </div>
        <div className="welcome-loading">
          <div className="loading-spinner"></div>
          <span>Initializing...</span>
        </div>
      </div>
    </div>
  );

  // Loading screen component
  const LoadingScreen = () => (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-logo">🎨</div>
        <h2>Loading Website Editor</h2>
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
        <p>Preparing your workspace...</p>
      </div>
    </div>
  );

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (showWelcome) {
    return <WelcomeScreen />;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        <Navbar 
          deleteSelectedElement={deleteSelectedElement} 
          toggleCodeTab={toggleCodeTab}
          showCodeTab={showCodeTab}
        />
        <div className="content">
          <LeftPanel
            layers={layers}
            selectedElement={selectedElement}
            setSelectedElement={setSelectedElement}
            deleteSelectedElement={deleteSelectedElement} // Pass delete functionality
          />
          {showCodeTab ? (
            <CodeTab elements={elements} CANVAS_WIDTH={1200} />
          ) : (
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
          )}
          <RightPanel
            selectedElement={selectedElement}
            elements={elements}
            updateElement={updateElement}
            deleteElement={deleteSelectedElement}
          />
        </div>
      </div>
    </DndProvider>
  );
}

export default App;
