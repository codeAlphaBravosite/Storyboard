import { getStoryboardById } from './storage.js';

export function loadPreviewPage(storyboardId) {
  const storyboard = getStoryboardById(storyboardId);
  const app = document.getElementById('app');

  app.innerHTML = `
    <header>
      <h1>Preview: ${storyboard.title}</h1>
      <button onclick="location.hash='#home'">Back to Home</button>
    </header>
    <div id="preview-list">
      ${storyboard.scenes.map(scene => `
        <div class="scene-preview">
          <p>${scene.script}</p>
        </div>
      `).join('')}
    </div>
  `;
}
