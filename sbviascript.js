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

const STORAGE_KEY = 'storyboards';

// Add event listener for preview button in editor
document.getElementById('previewFromEditor')?.addEventListener('click', () => {
    if (sceneManager.currentStoryboard) {
        previewManager.renderPreview(sceneManager.currentStoryboard);
        showPage('previewPage');
        
        // Ensure export button is set up correctly
        setupExportButton(sceneManager.currentStoryboard);
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

function createStoryboard(title) {
    return {
        id: Date.now().toString(),
        title: title,
        scenes: [],
        lastEdited: new Date().toISOString()
    };
}

function createScene(number) {
    return {
        id: Date.now().toString() + '-' + number,
        number: number,
        voScript: '',
        files: [],
        notes: ''
    };
}

function getStoryboards() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error reading from storage:', error);
        return [];
    }
}

function saveStoryboards(storyboards) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storyboards));
        return true;
    } catch (error) {
        console.error('Error saving to storage:', error);
        return false;
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

    // Create storyboard in the same format as storage.js
    const storyboard = createStoryboard('Untitled');
    storyboard.scenes = sceneTexts.map((text, index) => {
        const scene = createScene(index + 1);
        scene.voScript = text;
        return scene;
    });

    // Get existing storyboards and add new one at the beginning
    const storyboards = getStoryboards();
    storyboards.unshift(storyboard);
    saveStoryboards(storyboards);
    
    return storyboard;
}

// Function to set up export button
function setupExportButton(storyboard) {
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        // Remove any existing event listeners to prevent multiple bindings
        const newExportBtn = exportBtn.cloneNode(true);
        exportBtn.parentNode.replaceChild(newExportBtn, exportBtn);

        newExportBtn.onclick = () => {
            if (storyboard) {
                const success = storage.exportToCsv(storyboard);
                if (!success) {
                    toast.error('Error exporting storyboard. Please check the console for details.');
                }
            } else {
                toast.error('No storyboard available to export.');
            }
        };
    }
}

let currentStoryboard = null;

convertButton.addEventListener('click', async () => {
    const text = scriptInput.value.trim();
    
    if (!text) {
        toast.error('Please enter your script before converting.');
        return;
    }
    
    convertButton.disabled = true;
    
    try {
        // Create and store the storyboard
        currentStoryboard = breakIntoScenes(text);
        
        // Show success message
        toast.success('Script converted successfully!');
        
        // Clear the input
        scriptInput.value = '';
        
        // Close the toggle
        toggleConverter(true);
        
        // Show preview of the created storyboard
        previewManager.renderPreview(currentStoryboard);
        
        // Set up preview page buttons
        const editBtn = document.getElementById('backToEditBtn');
        
        if (editBtn) {
            // Remove any existing event listeners
            const newEditBtn = editBtn.cloneNode(true);
            editBtn.parentNode.replaceChild(newEditBtn, editBtn);

            newEditBtn.onclick = () => {
                sceneManager.loadStoryboard(currentStoryboard);
                showPage('editorPage');
                
                // Ensure the preview button in editor works with this storyboard
                const previewFromEditorBtn = document.getElementById('previewFromEditor');
                if (previewFromEditorBtn) {
                    previewFromEditorBtn.onclick = () => {
                        previewManager.renderPreview(currentStoryboard);
                        showPage('previewPage');
                        
                        // Re-setup export button when returning to preview
                        setupExportButton(currentStoryboard);
                    };
                }
            };
        }
        
        // Setup export button for the preview page
        setupExportButton(currentStoryboard);
        
        showPage('previewPage');
        
    } catch (error) {
        console.error('Conversion error:', error);
        toast.error(`Conversion failed: ${error.message}`);
    } finally {
        convertButton.disabled = false;
    }
});
