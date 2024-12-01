import { createElementWithClass, sanitizeHTML } from './utils.js';

export class PreviewManager {
  constructor() {
    this.currentStoryboard = null;
  }

  renderPreview(storyboard) {
    this.currentStoryboard = storyboard;
    
    if (!storyboard || !storyboard.scenes) {
      console.error('Invalid storyboard data');
      return;
    }

    const titleElement = document.getElementById('previewTitle');
    const previewContainer = document.getElementById('previewScenes');
    
    if (titleElement) {
      titleElement.textContent = storyboard.title || 'Untitled Storyboard';
    }
    
    if (previewContainer) {
      previewContainer.innerHTML = '';
      storyboard.scenes
        .filter(scene => scene)
        .sort((a, b) => a.number - b.number)
        .forEach(scene => {
          const previewScene = this.createPreviewScene(scene);
          if (previewScene) previewContainer.appendChild(previewScene);
        });
    }
  }

  createPreviewScene(scene) {
    if (!scene) return null;

    const sceneElement = createElementWithClass('div', 'preview-scene');
    
    const finalFiles = (scene.files || [])
      .filter(file => file && file.isFinal)
      .map(file => `<span class="file-name timestamp-box">${sanitizeHTML(file.name || '')} ${sanitizeHTML(file.timestamp || '')}</span>`)
      .join('<br>');

    sceneElement.innerHTML = `
      <div class="scene-banner">
        <span class="scene-number">Scene ${scene.number}</span>
      </div>
      
      ${scene.voScript ? `
        <div class="preview-section">
          <div class="section-header">
            <h4>VO/Script</h4>
          </div>
          <div class="section-content vo-script">
            ${sanitizeHTML(scene.voScript)}
          </div>
        </div>
      ` : ''}
      
      ${finalFiles ? `
        <div class="preview-section">
          <div class="section-header">
            <h4>Final Files</h4>
            <span class="file-count">${(scene.files || []).filter(f => f && f.isFinal).length} files</span>
          </div>
          <div class="section-content files-list">
            ${finalFiles}
          </div>
        </div>
      ` : ''}
      
      ${scene.notes ? `
        <div class="preview-section">
          <div class="section-header">
            <h4>Notes</h4>
          </div>
          <div class="section-content notes">
            ${sanitizeHTML(scene.notes)}
          </div>
        </div>
      ` : ''}
    `;

    return sceneElement;
  }
}
