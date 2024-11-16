import { getStoryboards, saveStoryboard } from './storage.js';

export function loadHomePage() {
  const app = document.getElementById('app');
  const storyboards = getStoryboards();

  app.innerHTML = `
    <header>
      <h1>Storyboards</h1>
      <button id="new-storyboard">+ New Storyboard</button>
    </header>
    <div id="storyboard-grid">
      ${storyboards.map(sb => `
        <div class="card">
          <h3>${sb.title}</h3>
          <p>Scenes: ${sb.scenes.length}</p>
          <p>Last Modified: ${new Date(sb.modifiedAt).toLocaleString()}</p>
          <button onclick="location.hash='#editor/${sb.id}'">Edit</button>
          <button onclick="location.hash='#preview/${sb.id}'">Preview</button>
        </div>
      `).join('')}
    </div>
  `;

  document.getElementById('new-storyboard').addEventListener('click', () => {
    const newStoryboard = {
      id: Date.now().toString(),
      title: `Storyboard ${storyboards.length + 1}`,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      scenes: []
    };
    saveStoryboard(newStoryboard);
    loadHomePage();
  });
}
