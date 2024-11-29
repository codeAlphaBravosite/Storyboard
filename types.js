// Type definitions for better code organization
export const createFile = (name = '', timestamp = '00:00:00 - 00:00:00') => ({
  id: generateId(),
  name,
  timestamp,
  isFinal: false
});

export const createScene = (number) => ({
  id: generateId(),
  number,
  voScript: '',
  files: [],
  notes: ''
});

export const createStoryboard = (title = 'Untitled') => ({
  id: generateId(),
  title,
  scenes: [],
  lastEdited: new Date().toISOString()
});

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
