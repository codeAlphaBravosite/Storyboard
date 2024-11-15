import React, { useState } from 'react';
import { Plus, Download, Eye, Upload, Sun, Moon } from 'lucide-react';
import { StoryboardFrame } from './StoryboardFrame.tsx';
import { Preview } from './Preview.tsx';
import { ImportDialog } from './ImportDialog.tsx';
import { Frame } from './index.ts';
import { exportToCSV, importFromCSV } from './csv.ts';

function App() {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const addFrame = () => {
    const newFrame: Frame = {
      id: crypto.randomUUID(),
      sceneNumber: String(frames.length + 1).padStart(2, '0'),
      script: '',
      files: [],
      duration: 3,
      notes: '',
    };
    setFrames([...frames, newFrame]);
  };

  const deleteFrame = (id: string) => {
    const newFrames = frames.filter(frame => frame.id !== id);
    newFrames.forEach((frame, index) => {
      frame.sceneNumber = String(index + 1).padStart(2, '0');
    });
    setFrames(newFrames);
  };

  const updateFrame = (id: string, data: Partial<Frame>) => {
    setFrames(frames.map(frame =>
      frame.id === id ? { ...frame, ...data } : frame
    ));
  };

  const moveFrame = (id: string, direction: 'left' | 'right') => {
    const index = frames.findIndex(frame => frame.id === id);
    if (
      (direction === 'left' && index === 0) ||
      (direction === 'right' && index === frames.length - 1)
    ) return;

    const newFrames = [...frames];
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    [newFrames[index], newFrames[newIndex]] = [newFrames[newIndex], newFrames[index]];
    
    newFrames.forEach((frame, idx) => {
      frame.sceneNumber = String(idx + 1).padStart(2, '0');
    });
    
    setFrames(newFrames);
  };

  const exportStoryboard = () => {
    const csv = exportToCSV(frames);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'storyboard.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleImport = async (file: File) => {
    const text = await file.text();
    const importedFrames = importFromCSV(text);
    setFrames(importedFrames);
    setShowImport(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Storyboard Creator
            </h1>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setShowImport(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Import</span>
              </button>
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Preview</span>
              </button>
              <button
                onClick={exportStoryboard}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {frames.map((frame, index) => (
            <StoryboardFrame
              key={frame.id}
              index={index}
              frame={frame}
              onDelete={deleteFrame}
              onUpdate={updateFrame}
              onMoveLeft={(id) => moveFrame(id, 'left')}
              onMoveRight={(id) => moveFrame(id, 'right')}
            />
          ))}
          <button
            onClick={addFrame}
            className="aspect-video bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 transition-colors duration-200 group"
          >
            <Plus className="w-8 h-8 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors duration-200" />
            <span className="text-gray-600 dark:text-gray-400 group-hover:text-blue-500 transition-colors duration-200">
              Add new scene
            </span>
          </button>
        </div>
      </main>

      {showPreview && (
        <Preview frames={frames} onClose={() => setShowPreview(false)} />
      )}

      {showImport && (
        <ImportDialog onImport={handleImport} onClose={() => setShowImport(false)} />
      )}
    </div>
  );
}

export default App;
