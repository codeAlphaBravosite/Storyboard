import React from 'react';
import { Trash2, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Frame } from './index.ts';
import { FileList } from './FileList.tsx';

interface StoryboardFrameProps {
  index: number;
  frame: Frame;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Frame>) => void;
  onMoveLeft: (id: string) => void;
  onMoveRight: (id: string) => void;
}

export function StoryboardFrame({
  index,
  frame,
  onDelete,
  onUpdate,
  onMoveLeft,
  onMoveRight,
}: StoryboardFrameProps) {
  const addFile = () => {
    const newFile = {
      id: crypto.randomUUID(),
      name: '',
      timestamp: '00:00:00',
      selected: false,
    };
    onUpdate(frame.id, { files: [...frame.files, newFile] });
  };

  const updateFile = (fileId: string, data: Partial<typeof frame.files[0]>) => {
    const newFiles = frame.files.map((file) =>
      file.id === fileId ? { ...file, ...data } : file
    );
    onUpdate(frame.id, { files: newFiles });
  };

  const deleteFile = (fileId: string) => {
    const newFiles = frame.files.filter((file) => file.id !== fileId);
    onUpdate(frame.id, { files: newFiles });
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700 dark:text-gray-200">Scene</span>
          <input
            type="text"
            value={frame.sceneNumber}
            onChange={(e) => onUpdate(frame.id, { sceneNumber: e.target.value })}
            className="w-20 px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            placeholder="#"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onMoveLeft(frame.id)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => onMoveRight(frame.id)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => onDelete(frame.id)}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
          >
            <Trash2 className="w-5 h-5 text-red-500" />
          </button>
        </div>
      </div>

      <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <span className="text-4xl font-bold text-gray-400 dark:text-gray-600">
          Scene {frame.sceneNumber || '?'}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Script/VO Dialogue
          </label>
          <textarea
            value={frame.script}
            onChange={(e) => onUpdate(frame.id, { script: e.target.value })}
            placeholder="Enter script or voice-over dialogue..."
            className="w-full p-2 border rounded text-sm min-h-[100px] dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Files & Timestamps
          </label>
          <FileList
            files={frame.files}
            onAdd={addFile}
            onDelete={deleteFile}
            onUpdate={updateFile}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Additional Notes
          </label>
          <textarea
            value={frame.notes}
            onChange={(e) => onUpdate(frame.id, { notes: e.target.value })}
            placeholder="Add any additional notes..."
            className="w-full p-2 border rounded text-sm min-h-[80px] dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
}
