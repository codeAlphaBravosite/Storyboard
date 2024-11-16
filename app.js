import { setupNavigation } from './navigation.js';
import { initializeSettings } from './settings.js';
import { loadHomePage } from './storyboard.js';

document.addEventListener('DOMContentLoaded', () => {
  initializeSettings(); // Load user preferences like theme
  setupNavigation(); // Handle navigation
  loadHomePage(); // Load default page
});
