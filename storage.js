import { createFile, createScene, createStoryboard } from './types.js';
import { ToastManager } from './toast.js';
const toast = new ToastManager();

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

  // Add this new helper function here
  escapeCSVField(field) {
    if (field === null || field === undefined) {
      return '';
    }
    const stringField = String(field);
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
      return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
  },

  exportToCsv(storyboard) {
    try {
      if (!storyboard || !storyboard.scenes) {
        console.error('Invalid storyboard data for export');
        toast.error('Failed to export CSV: Invalid storyboard data.');
        return false;
      }

      // Add BOM for Unicode support
      let csvContent = '\ufeff';
      
      // Create header
      const header = ['Scene Number', 'VO/Script', 'Files', 'Notes']
        .map(field => this.escapeCSVField(field))
        .join(',');
      csvContent += header + '\n';

      // Add rows
      storyboard.scenes
        .filter(scene => scene)
        .forEach(scene => {
          const finalFiles = (scene.files || [])
            .filter(file => file && file.isFinal)
            .map(file => `${file.name || ''} (${file.timestamp || ''})`)
            .join('; ');

          const row = [
            scene.number || '',
            scene.voScript || '',
            finalFiles,
            scene.notes || ''
          ].map(field => this.escapeCSVField(field)).join(',');

          csvContent += row + '\n';
        });

      // Create blob with UTF-8 encoding
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${storyboard.title || 'Untitled Storyboard'}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Successfully Exported!');
      return true;
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Error exporting');
      return false;
    }
  },

  importFromCsv(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'));
        return;
      }

      const fileName = file.name
        .replace(/\.csv$/i, '')
        .replace(/_/g, ' ');
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          let text = e.target.result;
          
          // Remove BOM if present
          if (text.charCodeAt(0) === 0xFEFF) {
            text = text.slice(1);
          }

          // Split into rows, handling quoted fields properly
          const parseCSVRow = (row) => {
            const fields = [];
            let field = '';
            let inQuotes = false;
            
            for (let i = 0; i < row.length; i++) {
              const char = row[i];
              
              if (char === '"') {
                if (inQuotes && row[i + 1] === '"') {
                  field += '"';
                  i++;
                } else {
                  inQuotes = !inQuotes;
                }
              } else if (char === ',' && !inQuotes) {
                fields.push(field);
                field = '';
              } else {
                field += char;
              }
            }
            fields.push(field);
            return fields;
          };

          const rows = text.split(/\r?\n/)
            .map(row => parseCSVRow(row))
            .filter(row => row.length === 4 && row.some(cell => cell.length > 0));

          if (rows.length < 2) {
            throw new Error('Invalid CSV format: No valid data rows found');
          }

          rows.shift(); // Remove header row

          const scenes = rows
            .filter(row => row[0])
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
            .sort((a, b) => a.number - b.number);

          if (scenes.length === 0) {
            throw new Error('No valid scenes found in the CSV file');
          }

          resolve({
            ...createStoryboard(fileName),
            scenes,
            lastEdited: new Date().toISOString()
          });
        } catch (error) {
          reject(new Error(`Error processing CSV: ${error.message}`));
        }
      };

      // Use UTF-8 encoding for FileReader
      reader.readAsText(file, 'UTF-8');
    });
  }

};
