import { createStoryboard } from './types.js';
import { showPage, sanitizeHTML, formatDate, createElementWithClass } from './utils.js';
import { storage } from './storage.js';
import { SceneManager } from './scenes.js';
import { PreviewManager } from './preview.js';
import { ToastManager } from './toast.js';
import { DialogManager } from './dialog.js';
const toast = new ToastManager();
const dialog = new DialogManager();

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

      card.querySelector('.delete-btn').addEventListener('click', async () => {
    if (storyboard && storyboard.id) {
        const confirmed = await dialog.confirm({
            title: 'Delete Storyboard',
            message: 'Are you sure?',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        });
        
        if (confirmed) {
            storage.deleteStoryboard(storyboard.id);
            renderStoryboardsList();
            toast.info('Storyboard deleted successfully');
        }
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
    if (previewManager.currentStoryboard) {
          sceneManager.loadStoryboard(previewManager.currentStoryboard);
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
  if (!file) {
    toast.error('Please select a file to import');
    return;
  }

  // Check file extension
  if (!file.name.toLowerCase().endsWith('.csv')) {
    toast.error('Please select a CSV file');
    e.target.value = '';
    return;
  }

  try {
    const storyboard = await storage.importFromCsv(file);
    if (storyboard && storyboard.id) {
      storage.addStoryboard(storyboard);
      renderStoryboardsList();
      e.target.value = '';
      
      // Show preview of imported storyboard
      previewManager.renderPreview(storyboard);
      showPage('previewPage');
      
      toast.success(`Successfully Imported Storyboard: ${storyboard.title}`);
    }
  } catch (error) {
    toast.error(`Import failed: ${error.message}`);
    console.error('Import error:', error);
  } finally {
    e.target.value = ''; // Clear the input
  }
});
  
  document.getElementById('exportBtn')?.addEventListener('click', () => {
  if (previewManager.currentStoryboard) {
    const success = storage.exportToCsv(previewManager.currentStoryboard);
    if (!success) {
      toast.error('Error exporting storyboard. Please check the console for details.');
    }
  } else {
    toast.error('No storyboard available to export.');
  }
});

  // Initialize the home page
  renderStoryboardsList();
  showPage('homePage');
});
