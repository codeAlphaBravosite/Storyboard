// Utility functions
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatDate(date) {
  return new Date(date).toLocaleString();
}

export function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
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
