import { sanitizeHTML } from './utils.js';

export function renderScene(scene) {
  const sceneElement = document.createElement('div');
  sceneElement.className = 'scene-card';
  sceneElement.dataset.id = scene.id;
  sceneElement.draggable = true;

  sceneElement.innerHTML = `
    <div class="scene-header">
      <h3>Scene ${scene.number}</h3>
        <button class="btn-minimal move-up" title="Move Up">↑</button>
        <button class="btn-minimal move-down" title="Move Down">↓</button>
      <button class="btn-minimal danger delete-scene">Delete Scene</button>
    </div>
    <div class="scene-content">
      <div class="scene-section">
        <div class="scene-section-header">
          <span class="scene-section-title">VO/Script</span>
        </div>
        <textarea class="vo-script" placeholder="Enter VO/Script content here...">${sanitizeHTML(scene.voScript)}</textarea>
      </div>
      
      <div class="scene-section">
        <div class="scene-section-header">
          <span class="scene-section-title">Files</span>
          <button class="btn-minimal add-file">+ Add File</button>
        </div>
        <div class="files-list">
          ${scene.files.map(file => renderFile(file)).join('')}
        </div>
      </div>
      
      <div class="scene-section">
        <div class="scene-section-header">
          <span class="scene-section-title">Notes</span>
        </div>
        <textarea class="scene-notes" placeholder="Add any additional notes here...">${sanitizeHTML(scene.notes)}</textarea>
      </div>
    </div>
  `;

  return sceneElement;
}

export function renderFile(file) {
  return `
    <div class="file-entry" data-id="${file.id}">
      <input type="text" class="file-name" value="${sanitizeHTML(file.name)}" placeholder="Filename">
      <input type="text" class="file-timestamp" value="${sanitizeHTML(file.timestamp)}" placeholder="Timestamp">
      <label class="file-final-label">
        <input type="checkbox" class="file-final" ${file.isFinal ? 'checked' : ''}>
        Final
      </label>
      <button class="btn-icon delete-file">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18"></path>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
        </svg>
      </button>
    </div>
  `;
}
