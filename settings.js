export function initializeSettings() {
  const darkMode = JSON.parse(localStorage.getItem('darkMode')) || false;
  document.body.classList.toggle('dark-mode', darkMode);
  setupThemeToggle(darkMode);
}

function setupThemeToggle(initialState) {
  const header = document.querySelector('header');
  const themeToggle = document.createElement('button');
  themeToggle.textContent = initialState ? 'Light Mode' : 'Dark Mode';
  themeToggle.addEventListener('click', () => {
    const darkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    themeToggle.textContent = darkMode ? 'Light Mode' : 'Dark Mode';
  });
  header?.appendChild(themeToggle);
}
