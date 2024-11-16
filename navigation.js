import { loadHomePage } from './storyboard.js';
import { loadEditorPage } from './scene.js';
import { loadPreviewPage } from './preview.js';

export function setupNavigation() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

function handleRoute() {
  const route = window.location.hash.slice(1);
  const [page, id] = route.split('/');

  switch (page) {
    case 'home':
      loadHomePage();
      break;
    case 'editor':
      loadEditorPage(id);
      break;
    case 'preview':
      loadPreviewPage(id);
      break;
    default:
      loadHomePage();
  }
}
