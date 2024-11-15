import React from 'react';
import { Frame } from '../types';
import { Clock, X } from 'lucide-react';

interface PreviewProps {
  frames: Frame[];
  onClose: () => void;
}

export function Preview({ frames, onClose }: PreviewProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Storyboard Preview</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
              aria-label="Close preview"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {frames.map((frame) => (
              <div 
                key={frame.id} 
                className="bg-white/10 backdrop-blur rounded-xl overflow-hidden border border-white/20 hover:border-white/30 transition-colors duration-200"
              >
                <div className="aspect-video bg-black/50 flex items-center justify-center relative group">
                  <span className="text-4xl font-bold text-white/40 group-hover:text-white/60 transition-opacity duration-200">
                    Scene {frame.sceneNumber}
                  </span>
                </div>
                
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-white/60 mb-2">Script/VO</h3>
                    <p className="text-white text-sm whitespace-pre-wrap leading-relaxed">
                      {frame.script || 'No script provided'}
                    </p>
                  </div>

                  {frame.files.some(f => f.selected) && (
                    <div>
                      <h3 className="text-sm font-medium text-white/60 mb-3">Files</h3>
                      <ul className="space-y-2">
                        {frame.files
                          .filter(f => f.selected)
                          .map(file => (
                            <li
                              key={file.id}
                              className="flex items-center justify-between text-sm bg-white/5 rounded-lg p-3"
                            >
                              <span className="text-white">{file.name}</span>
                              <span className="text-white/60 flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                {file.timestamp}
                              </span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                  {frame.notes && (
                    <div>
                      <h3 className="text-sm font-medium text-white/60 mb-2">Notes</h3>
                      <p className="text-white text-sm leading-relaxed">
                        {frame.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}