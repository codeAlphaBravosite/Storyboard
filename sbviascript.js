// Select DOM elements with null checks
const toggleSwitch = document.getElementById('toggleSwitch');
const converterContent = document.getElementById('converterContent');
const scriptInput = document.getElementById('scriptInput');
const convertButton = document.getElementById('convertButton');
const previewFromEditorBtn = document.getElementById('previewFromEditor');

// Import required managers
import { PreviewManager } from './preview.js';
import { ToastManager } from './toast.js';
import { showPage } from './utils.js';
import { SceneManager } from './scenes.js';
import { storage } from './storage.js';

const toast = new ToastManager();
const previewManager = new PreviewManager();
const sceneManager = new SceneManager();

const STORAGE_KEY = 'storyboards';

// Add event listener for preview button
if (previewFromEditorBtn) {
    previewFromEditorBtn.addEventListener('click', () => {
        if (sceneManager.currentStoryboard) {
            previewManager.renderPreview(sceneManager.currentStoryboard);
            showPage('previewPage');
        } else {
            toast.error('No storyboard available to preview.');
        }
    });
}

// Function to handle toggle state
function toggleConverter(forceClose = false) {
    if (!toggleSwitch || !converterContent) return;

    const isExpanded = toggleSwitch.getAttribute('aria-expanded') === 'true';

    if (forceClose || isExpanded) {
        toggleSwitch.setAttribute('aria-expanded', 'false');
        converterContent.classList.add('hidden');
    } else {
        toggleSwitch.setAttribute('aria-expanded', 'true');
        converterContent.classList.remove('hidden');
    }
}

// Event listener for toggle button
toggleSwitch?.addEventListener('click', () => {
    toggleConverter();
});

// Helper functions
function createStoryboard(title) {
    return {
        id: Date.now().toString(),
        title,
        scenes: [],
        lastEdited: new Date().toISOString(),
    };
}

function createScene(number) {
    return {
        id: `${Date.now()}-${number}`,
        number,
        voScript: '',
        files: [],
        notes: '',
    };
}

function getStoryboards() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error reading from storage:', error);
        toast.error('Failed to load storyboards.');
        return [];
    }
}

function saveStoryboards(storyboards) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storyboards));
        return true;
    } catch (error) {
        console.error('Error saving to storage:', error);
        toast.error('Failed to save storyboards.');
        return false;
    }
}

function breakIntoScenes(text) {
    if (!text || typeof text !== 'string' || !text.trim()) {
        throw new Error('Input must be a non-empty string.');
    }

    const sceneTexts = text.split('।')
        .map(s => s.trim())
        .filter(Boolean);

    if (sceneTexts.length === 0) {
        throw new Error('No valid scenes found in the input text.');
    }

    const storyboard = createStoryboard('Imported Script');
    storyboard.scenes = sceneTexts.map((text, index) => ({
        ...createScene(index + 1),
        voScript: text,
    }));

    const storyboards = getStoryboards();
    storyboards.unshift(storyboard);

    if (!saveStoryboards(storyboards)) {
        throw new Error('Failed to save storyboard.');
    }

    return storyboard;
}

// Main Convert Button Logic
convertButton?.addEventListener('click', async () => {
    if (!scriptInput) return;

    const text = scriptInput.value.trim();

    if (!text) {
        toast.error('Please enter your script before converting.');
        return;
    }

    convertButton.disabled = true;

    try {
        const storyboard = breakIntoScenes(text);

        toast.success('Script converted successfully!');
        scriptInput.value = '';
        toggleConverter(true);

        previewManager.renderPreview(storyboard);

        // Add listeners for buttons in preview page
        const editBtn = document.getElementById('backToEditBtn');
        const exportBtn = document.getElementById('exportBtn');

        if (editBtn) {
            editBtn.onclick = () => {
                sceneManager.loadStoryboard(storyboard);
                showPage('editorPage');
            };
        }

        if (exportBtn) {
            exportBtn.onclick = null; // Clear previous listener
            exportBtn.addEventListener('click', () => {
                const success = storage.exportToCsv(storyboard);
                if (!success) {
                    toast.error('Error exporting storyboard. Please check the console for details.');
                }
            });
        }

        showPage('previewPage');
    } catch (error) {
        console.error('Conversion error:', error);
        toast.error(`Conversion failed: ${error.message}`);
    } finally {
        convertButton.disabled = false;
    }
});
