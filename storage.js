import { createFile, createScene, createStoryboard } from './types.js';

// Storage management with error handling
const STORAGE_KEY = 'storyboards';

export const storage = {
  getStoryboards() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from storage:', error);
      return [];
    }
  },

  saveStoryboards(storyboards) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storyboards));
      return true;
    } catch (error) {
      console.error('Error saving to storage:', error);
      return false;
    }
  },

  addStoryboard(storyboard) {
    const storyboards = this.getStoryboards();
    storyboards.unshift(storyboard);
    return this.saveStoryboards(storyboards);
  },

  updateStoryboard(updatedStoryboard) {
    const storyboards = this.getStoryboards();
    const index = storyboards.findIndex(s => s.id === updatedStoryboard.id);
    if (index !== -1) {
      storyboards[index] = updatedStoryboard;
      return this.saveStoryboards(storyboards);
    }
    return false;
  },

  deleteStoryboard(id) {
    const storyboards = this.getStoryboards();
    const filtered = storyboards.filter(s => s.id !== id);
    return this.saveStoryboards(filtered);
  },

  exportToCsv(storyboard) {
    try {
      if (!storyboard || !storyboard.scenes) {
        console.error('Invalid storyboard data for export');
        return false;
      }

      const rows = [['Scene Number', 'VO/Script', 'Files', 'Notes']];
      
      storyboard.scenes
        .filter(scene => scene) // Filter out any null/undefined scenes
        .forEach(scene => {
          const finalFiles = (scene.files || [])  // Add null check for files
            .filter(file => file && file.isFinal)
            .map(file => `${file.name || ''} (${file.timestamp || ''})`)
            .join('; ');
        
          rows.push([
            scene.number || '',
            scene.voScript || '',
            finalFiles,
            scene.notes || ''
          ]);
      });

      const csvContent = rows
        .map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(storyboard.title || 'storyboard').replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a); // Add element to DOM
      a.click();
      document.body.removeChild(a); // Clean up
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Error exporting CSV:', error);
      return false;
    }
  },

  importFromCsv(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'));
        return;
      }

      // Get the file name without extension to use as storyboard title
      const fileName = file.name.replace(/\.[^/.]+$/, '');
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const rows = text.split('\n')
            .map(row => 
              row.split(',')
                .map(cell => cell.trim().replace(/^"|"$/g, '').replace(/""/g, '"'))
            )
            .filter(row => row.length === 4 && row.some(cell => cell.length > 0)); // Filter empty rows
          
          if (rows.length < 2) {
            throw new Error('Invalid CSV format: No valid data rows found');
          }
          
          // Remove header row
          rows.shift();
          
          const scenes = rows
            .filter(row => row[0]) // Filter rows without scene numbers
            .map(row => {
              const sceneNumber = parseInt(row[0]) || 0;
              return {
                ...createScene(sceneNumber),
                voScript: row[1] || '',
                files: row[2] ? row[2].split(';').map(fileStr => {
                  const fileMatch = fileStr.trim().match(/(.*?)\s*\((.*?)\)/);
                  return {
                    ...createFile(),
                    name: fileMatch ? fileMatch[1].trim() : fileStr.trim(),
                    timestamp: fileMatch ? fileMatch[2].trim() : new Date().toLocaleString(),
                    isFinal: true
                  };
                }) : [],
                notes: row[3] || ''
              };
            })
            .sort((a, b) => a.number - b.number); // Sort scenes by number

          if (scenes.length === 0) {
            throw new Error('No valid scenes found in the CSV file');
          }

          resolve({
            ...createStoryboard(fileName), // Use filename as storyboard title
            scenes,
            lastEdited: new Date().toISOString()
          });
        } catch (error) {
          reject(new Error(`Error processing CSV: ${error.message}`));
        }
      };

      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  }

};
