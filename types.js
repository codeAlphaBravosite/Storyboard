// Type definitions for better code organization
export const createFile = (name = '', timestamp = '') => ({
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

export const createStoryboard = (title = 'Untitled Storyboard') => ({
  id: generateId(),
  title,
  scenes: [],
  lastEdited: new Date().toISOString()
});

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}