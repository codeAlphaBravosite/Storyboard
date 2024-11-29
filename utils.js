// Utility functions
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatDate(date) {
  return new Date(date).toLocaleString();
}

// Find this function
export function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
}

// Replace it with this updated version
export function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  updateNavigation(pageId);
}

// Add this new function
export function updateNavigation(page) {
  // Hide all nav contents first
  document.getElementById('mainNav').classList.add('hidden');
  document.getElementById('editorNav').classList.add('hidden');
  document.getElementById('previewNav').classList.add('hidden');

  // Show the appropriate nav based on page
  switch (page) {
    case 'homePage':
      document.getElementById('mainNav').classList.remove('hidden');
      break;
    case 'editorPage':
      document.getElementById('editorNav').classList.remove('hidden');
      break;
    case 'previewPage':
      document.getElementById('previewNav').classList.remove('hidden');
      break;
  }
}

export function createElementWithClass(tag, className) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  return element;
}

export function sanitizeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
