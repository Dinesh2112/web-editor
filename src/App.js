import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Navbar from './components/Navbar/Navbar';
import LeftPanel from './components/LeftPanel/LeftPanel';
import Canvas from './components/Canvas/Canvas';
import RightPanel from './components/RightPanel/RightPanel';
import CodeTab from './components/CodingTab/CodeTab';
import './App.css';

// Root App Component - The Orchestrator
function App() {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [showCodeTab, setShowCodeTab] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Project State
  useEffect(() => {
    // Premium loading sequence
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Performance-optimized update function
  const updateElement = useCallback((id, updates) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  }, []);

  // Professional Deletion logic with hierarchy awareness
  const deleteSelectedElement = useCallback(() => {
    if (!selectedElement) return;

    setElements((prev) => {
      const filtered = prev.filter((el) => el.id !== selectedElement);
      // Detach children if parent is deleted
      return filtered.map(el => el.parentId === selectedElement ? { ...el, parentId: null } : el);
    });
    setSelectedElement(null);
  }, [selectedElement]);

  // Global Keyboard Shortcuts (Figma Style)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in an input
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.contentEditable === 'true') return;

      if (e.key === 'Delete' || e.key === 'Backspace') deleteSelectedElement();
      if (e.key === 'Escape') setSelectedElement(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelectedElement]);

  if (isLoading) return (
    <div className="loading-screen">
      <div className="loading-logo">🎨</div>
      <div className="loading-bar">
        <div className="loading-progress" />
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 'bold' }}>BOOTING STUDIO PRO...</p>
    </div>
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        <Navbar 
          deleteSelectedElement={deleteSelectedElement} 
          toggleCodeTab={() => setShowCodeTab(!showCodeTab)}
          showCodeTab={showCodeTab}
        />
        
        <main className="content">
          <LeftPanel
            layers={elements}
            selectedElement={selectedElement}
            setSelectedElement={setSelectedElement}
            updateElement={updateElement}
          />
          
          {showCodeTab ? (
            <CodeTab elements={elements} CANVAS_WIDTH={2000} />
          ) : (
            <Canvas
              elements={elements}
              setElements={setElements}
              selectedElement={selectedElement}
              setSelectedElement={setSelectedElement}
              updateElement={updateElement}
            />
          )}

          <RightPanel
            selectedElement={selectedElement}
            elements={elements}
            updateElement={updateElement}
            deleteElement={deleteSelectedElement}
          />
        </main>
      </div>
    </DndProvider>
  );
}

export default App;
