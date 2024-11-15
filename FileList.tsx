import React from 'react';
import { Plus, Trash2, Clock } from 'lucide-react';
import { FileEntry } from '../types';

interface FileListProps {
  files: FileEntry[];
  onAdd: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<FileEntry>) => void;
}

export function FileList({ files, onAdd, onDelete, onUpdate }: FileListProps) {
  return (
    <div className="space-y-3">
      {files.map((file) => (
        <div 
          key={file.id} 
          className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-2 min-w-[200px] flex-1">
            <input
              type="checkbox"
              checked={file.selected}
              onChange={(e) => onUpdate(file.id, { selected: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
            />
            <input
              type="text"
              value={file.name}
              onChange={(e) => onUpdate(file.id, { name: e.target.value })}
              placeholder="File name"
              className="flex-1 px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500 dark:text-white transition-shadow duration-200"
            />
          </div>
          
          <div className="flex items-center gap-2 min-w-[140px]">
            <Clock className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={file.timestamp}
              onChange={(e) => onUpdate(file.id, { timestamp: e.target.value })}
              placeholder="00:00:00"
              className="w-24 px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500 dark:text-white transition-shadow duration-200"
            />
          </div>

          <button
            onClick={() => onDelete(file.id)}
            className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md transition-colors duration-200"
            aria-label="Delete file"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 w-full justify-center transition-colors duration-200 group"
      >
        <Plus className="w-4 h-4 group-hover:text-blue-500 transition-colors duration-200" />
        <span className="group-hover:text-blue-500 transition-colors duration-200">Add File</span>
      </button>
    </div>
  );
}