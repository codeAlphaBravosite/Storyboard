const toggleSwitch = document.getElementById('toggleSwitch');
const converterContent = document.getElementById('converterContent');
const scriptInput = document.getElementById('scriptInput');
const convertButton = document.getElementById('convertButton');

// Import required managers from existing modules
import { PreviewManager } from './preview.js';
import { ToastManager } from './toast.js';
import { showPage } from './utils.js';
import { SceneManager } from './scenes.js';
import { storage } from './storage.js';

const toast = new ToastManager();
const previewManager = new PreviewManager();
const sceneManager = new SceneManager();

// Add event listener for preview button in editor
document.getElementById('previewFromEditor')?.addEventListener('click', () => {
    if (sceneManager.currentStoryboard) {
        previewManager.renderPreview(sceneManager.currentStoryboard);
        showPage('previewPage');
    }
});

// Toggle visibility when button is clicked
toggleSwitch.addEventListener('click', () => {
    toggleConverter();
});

// Function to handle toggle state
function toggleConverter(forceClose = false) {
    const isExpanded = toggleSwitch.getAttribute('aria-expanded') === 'true';
    if (forceClose) {
        toggleSwitch.setAttribute('aria-expanded', 'false');
        converterContent.classList.add('hidden');
    } else {
        toggleSwitch.setAttribute('aria-expanded', !isExpanded);
        converterContent.classList.toggle('hidden');
    }
}

function breakIntoScenes(text) {
    if (!text || typeof text !== 'string') {
        throw new Error('Invalid input: text must be a non-empty string');
    }
    const sceneTexts = text.split('।')
        .map(s => s.trim())
        .filter(s => s);

    if (sceneTexts.length === 0) {
        throw new Error('No valid scenes found in the input text');
    }

    const storyboard = createStoryboard('Untitled');
    storyboard.scenes = sceneTexts.map((text, index) => {
        const scene = createScene(index + 1);
        scene.voScript = text;
        return scene;
    });

    const storyboards = storage.getStoryboards();
    storyboards.unshift(storyboard);
    storage.saveStoryboards(storyboards);

    // Synchronize storyboard across managers
    sceneManager.currentStoryboard = storyboard;
    previewManager.currentStoryboard = storyboard;

    return storyboard;
}

convertButton.addEventListener('click', async () => {
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

        // Render Preview
        previewManager.renderPreview(storyboard);

        // Add event listeners for Preview Page buttons
        const editBtn = document.getElementById('backToEditBtn');
        const exportBtn = document.getElementById('exportBtn');

        if (editBtn) {
            editBtn.onclick = () => {
                sceneManager.loadStoryboard(storyboard);
                showPage('editorPage');
                const previewFromEditorBtn = document.getElementById('previewFromEditor');
                if (previewFromEditorBtn) {
                    previewFromEditorBtn.onclick = () => {
                        previewManager.renderPreview(storyboard);
                        showPage('previewPage');
                    };
                }
            };
        }

        if (exportBtn) {
            exportBtn.onclick = null;
            exportBtn.onclick = () => {
                const success = storage.exportToCsv(storyboard);
                if (!success) {
                    toast.error('Error exporting storyboard. Please check the console for details.');
                }
            };
        }

        showPage('previewPage');
    } catch (error) {
        console.error('Conversion error:', error);
        toast.error(`Conversion failed: ${error.message}`);
    } finally {
        convertButton.disabled = false;
    }
});
