import { createFile, createScene } from './types.js';
import { debounce } from './utils.js';
import { storage } from './storage.js';
import { renderScene, renderFile } from './SceneCard.js';
import { DialogManager } from './dialog.js';
const dialog = new DialogManager();

export class SceneManager {
  constructor() {
    this.currentStoryboard = null;
    this.saveTimeout = null;
    this.setupEventListeners();
  }

  setupEventListeners() {
    const addSceneBtn = document.getElementById('addSceneBtn');
    const saveBtn = document.getElementById('saveBtn');
    const titleInput = document.getElementById('storyboardTitle');

    addSceneBtn?.addEventListener('click', () => this.addScene());
    saveBtn?.addEventListener('click', () => this.saveStoryboard());
    titleInput?.addEventListener('input', debounce(() => this.autoSave(), 1000));

    this.setupDragAndDrop();
  }

  setupDragAndDrop() {
    const scenesList = document.getElementById('scenesList');
    if (!scenesList) return;

    scenesList.addEventListener('dragstart', (e) => {
      const sceneCard = e.target.closest('.scene-card');
      if (!sceneCard) return;
      
      sceneCard.classList.add('dragging');
      e.dataTransfer.setData('text/plain', sceneCard.dataset.id);
    });

    scenesList.addEventListener('dragend', (e) => {
      const sceneCard = e.target.closest('.scene-card');
      if (sceneCard) {
        sceneCard.classList.remove('dragging');
      }
    });

    scenesList.addEventListener('dragover', (e) => {
      e.preventDefault();
      const afterElement = this.getDragAfterElement(scenesList, e.clientY);
      const draggable = document.querySelector('.dragging');
      if (draggable) {
        if (afterElement) {
          scenesList.insertBefore(draggable, afterElement);
        } else {
          scenesList.appendChild(draggable);
        }
      }
    });

    scenesList.addEventListener('drop', (e) => {
      e.preventDefault();
      this.renumberScenes();
      this.autoSave();
    });
  }

  getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.scene-card:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  attachSceneEventListeners(sceneElement, scene) {
    const deleteBtn = sceneElement.querySelector('.delete-scene');
    const addFileBtn = sceneElement.querySelector('.add-file');
    const voScript = sceneElement.querySelector('.vo-script');
    const notes = sceneElement.querySelector('.scene-notes');
    const filesList = sceneElement.querySelector('.files-list');

    deleteBtn?.addEventListener('click', () => this.deleteScene(scene.id));
    addFileBtn?.addEventListener('click', () => this.addFile(scene.id));
    
    voScript?.addEventListener('input', debounce((e) => {
      scene.voScript = e.target.value;
      this.autoSave();
    }, 1000));

    notes?.addEventListener('input', debounce((e) => {
      scene.notes = e.target.value;
      this.autoSave();
    }, 1000));

    filesList?.addEventListener('change', (e) => {
      const fileEntry = e.target.closest('.file-entry');
      if (!fileEntry) return;

      const fileId = fileEntry.dataset.id;
      const file = scene.files.find(f => f.id === fileId);
      if (!file) return;

      if (e.target.classList.contains('file-name')) {
        file.name = e.target.value;
      } else if (e.target.classList.contains('file-timestamp')) {
        file.timestamp = e.target.value;
      } else if (e.target.classList.contains('file-final')) {
        file.isFinal = e.target.checked;
      }

      this.autoSave();
    });

    filesList?.addEventListener('click', (e) => {
      if (e.target.closest('.delete-file')) {
        const fileEntry = e.target.closest('.file-entry');
        if (fileEntry) {
          const fileId = fileEntry.dataset.id;
          scene.files = scene.files.filter(f => f.id !== fileId);
          fileEntry.remove();
          this.autoSave();
        }
      }
    });
  }

  addFile(sceneId) {
    const scene = this.currentStoryboard.scenes.find(s => s.id === sceneId);
    if (!scene) return;

    const newFile = createFile();
    scene.files.push(newFile);
    
    const filesListElement = document.querySelector(`[data-id="${sceneId}"] .files-list`);
    if (filesListElement) {
      const fileElement = document.createElement('div');
      fileElement.innerHTML = renderFile(newFile);
      filesListElement.appendChild(fileElement.firstElementChild);
    }
    
    this.autoSave();
  }

  async deleteScene(sceneId) {
    const confirmed = await dialog.confirm({
        title: 'Delete Scene',
        message: 'Are you sure you want to delete this scene? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel'
    });

    if (confirmed) {
        this.currentStoryboard.scenes = this.currentStoryboard.scenes.filter(s => s.id !== sceneId);
        document.querySelector(`[data-id="${sceneId}"]`)?.remove();
        this.renumberScenes();
        this.autoSave();
        toast.info('Scene deleted successfully');
    }
}


  addScene() {
    const newScene = createScene(this.currentStoryboard.scenes.length + 1);
    this.currentStoryboard.scenes.push(newScene);
    
    const scenesContainer = document.getElementById('scenesList');
    if (scenesContainer) {
      const sceneElement = renderScene(newScene);
      this.attachSceneEventListeners(sceneElement, newScene);
      scenesContainer.appendChild(sceneElement);
    }
    
    this.autoSave();
  }

  renumberScenes() {
    const sceneElements = document.querySelectorAll('.scene-card');
    const newSceneOrder = [];

    sceneElements.forEach((element, index) => {
      const sceneId = element.dataset.id;
      const scene = this.currentStoryboard.scenes.find(s => s.id === sceneId);
      if (scene) {
        scene.number = index + 1;
        newSceneOrder.push(scene);
        const hader = element.querySelector('h3');
        if (header) {
          header.textContent = `Scene ${scene.number}`;
        }
      }
    });

    this.currentStoryboard.scenes = newSceneOrder;
  }

  loadStoryboard(storyboard) {
    this.currentStoryboard = storyboard;
    const titleInput = document.getElementById('storyboardTitle');
    const scenesContainer = document.getElementById('scenesList');
    
    if (titleInput) {
      titleInput.value = storyboard.title;
    }
    
    if (scenesContainer) {
      scenesContainer.innerHTML = '';
      storyboard.scenes.forEach(scene => {
        const sceneElement = renderScene(scene);
        this.attachSceneEventListeners(sceneElement, scene);
        scenesContainer.appendChild(sceneElement);
      });
    }
  }

  saveStoryboard() {
    if (!this.currentStoryboard) return;

    const titleInput = document.getElementById('storyboardTitle');
    if (titleInput) {
      this.currentStoryboard.title = titleInput.value;
    }

    this.currentStoryboard.lastEdited = new Date().toISOString();
    const saved = storage.updateStoryboard(this.currentStoryboard);
    
    if (saved) {
      const saveBtn = document.getElementById('saveBtn');
      if (saveBtn) {
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saved!';
        setTimeout(() => {
          saveBtn.textContent = originalText;
        }, 2000);
      }
    }
  }

  autoSave() {
    if (!this.currentStoryboard) return;
    this.saveStoryboard();
  }
}
