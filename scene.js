import { getStoryboardById, saveStoryboard } from './storage.js';

export function loadEditorPage(storyboardId) {
  const app = document.getElementById('app');
  const storyboard = getStoryboardById(storyboardId);

  app.innerHTML = `
    <header>
      <h1>Edit Storyboard: ${storyboard.title}</h1>
      <button id="save-storyboard">Save</button>
    </header>
    <div id="scene-list">
      ${storyboard.scenes.map(scene => `
        <div class="scene">
          <textarea>${scene.script}</textarea>
          <button>Delete</button>
        </div>
      `).join('')}
      <button id="add-scene">Add Scene</button>
    </div>
  `;

  document.getElementById('add-scene').addEventListener('click', () => {
    storyboard.scenes.push({
      id: Date.now().toString(),
      script: '',
      createdAt: Date.now(),
      modifiedAt: Date.now()
    });
    saveStoryboard(storyboard);
    loadEditorPage(storyboardId);
  });

  document.getElementById('save-storyboard').addEventListener('click', () => {
    saveStoryboard(storyboard);
    alert('Storyboard saved!');
  });
}
