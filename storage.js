const STORAGE_KEY = 'storyboardApp';

export function getStoryboards() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  return data;
}

export function saveStoryboard(storyboard) {
  const storyboards = getStoryboards();
  const index = storyboards.findIndex(sb => sb.id === storyboard.id);
  if (index >= 0) {
    storyboards[index] = storyboard;
  } else {
    storyboards.push(storyboard);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storyboards));
}

export function getStoryboardById(id) {
  const storyboards = getStoryboards();
  return storyboards.find(sb => sb.id === id) || null;
}
