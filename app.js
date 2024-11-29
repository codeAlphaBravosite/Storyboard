import { createStoryboard } from './types.js';
import { showPage, sanitizeHTML, formatDate, createElementWithClass } from './utils.js';
import { storage } from './storage.js';
import { SceneManager } from './scenes.js';
import { PreviewManager } from './preview.js';

document.addEventListener('DOMContentLoaded', () => {
  const sceneManager = new SceneManager();
  const previewManager = new PreviewManager();

  function renderStoryboardsList() {
  const storyboards = storage.getStoryboards();
  const container = document.getElementById('storyboardsList');
  if (!container) return;

  container.innerHTML = storyboards.length ? '' : 
    '<p class="empty-state">No storyboards yet. Create one to get started!</p>';

  storyboards
    .filter(storyboard => storyboard && storyboard.id)
    .forEach(storyboard => {
      const card = createElementWithClass('div', 'storyboard-card');
      card.innerHTML = `
        <h3>${sanitizeHTML(storyboard.title || 'Untitled Storyboard')}</h3>
        
        <div class="storyboard-metadata">
          <p>
            Scenes: ${(storyboard.scenes || []).length}
          </p>
          
          <p>
            Last edited: ${formatDate(storyboard.lastEdited || new Date())}
          </p>
        </div>

        <div class="card-actions">
          <button class="btn btn-primary edit-btn">
            Edit Storyboard
          </button>
          <button class="btn btn-secondary preview-btn">
            Preview
          </button>
          <button class="btn btn-text delete-btn">
            Delete
          </button>
        </div>
      `;

      // Add the event listeners
      card.querySelector('.edit-btn').addEventListener('click', () => {
        if (storyboard) {
          sceneManager.loadStoryboard(storyboard);
          showPage('editorPage');
        }
      });

      card.querySelector('.preview-btn').addEventListener('click', () => {
        if (storyboard) {
          previewManager.renderPreview(storyboard);
          showPage('previewPage');
        }
      });

      card.querySelector('.delete-btn').addEventListener('click', () => {
        if (storyboard && storyboard.id && confirm('Are you sure you want to delete this storyboard?')) {
          storage.deleteStoryboard(storyboard.id);
          renderStoryboardsList();
        }
      });

      container.appendChild(card);
    });
  }

  // Navigation Event Listeners
  document.getElementById('homeBtn')?.addEventListener('click', () => {
    renderStoryboardsList();
    showPage('homePage');
  });

  document.getElementById('backToHomeFromEditor')?.addEventListener('click', () => {
      renderStoryboardsList();
      showPage('homePage');
  });

  document.getElementById('backToHomeFromPreview')?.addEventListener('click', () => {
    renderStoryboardsList();
    showPage('homePage');
  });

  document.getElementById('previewFromEditor')?.addEventListener('click', () => {
    if (sceneManager.currentStoryboard) {
      previewManager.renderPreview(sceneManager.currentStoryboard);
      showPage('previewPage');
    }
  });

  document.getElementById('backToEditBtn')?.addEventListener('click', () => {
    if (sceneManager.currentStoryboard) {
          sceneManager.loadStoryboard(sceneManager.currentStoryboard);
          showPage('editorPage');
    }
});
  
  // Action Event Listeners
  document.getElementById('createNewBtn')?.addEventListener('click', () => {
    const newStoryboard = createStoryboard();
    storage.addStoryboard(newStoryboard);
    sceneManager.loadStoryboard(newStoryboard);
    showPage('editorPage');
  });

  document.getElementById('importFile')?.addEventListener('change', async (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    try {
      const storyboard = await storage.importFromCsv(file);
      if (storyboard && storyboard.id) {
        storage.addStoryboard(storyboard);
        renderStoryboardsList();
        e.target.value = '';
        alert('Storyboard imported successfully!');
      }
    } catch (error) {
      alert('Error importing file: ' + error.message);
      console.error('Import error:', error);
    }
  });

  document.getElementById('exportBtn')?.addEventListener('click', () => {
    if (previewManager.currentStoryboard) {
      const success = storage.exportToCsv(previewManager.currentStoryboard);
      if (!success) {
        alert('Error exporting storyboard. Please try again.');
      }
    }
  });

  // Initialize the home page
  renderStoryboardsList();
  showPage('homePage');
});
