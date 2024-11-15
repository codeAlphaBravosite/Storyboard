import { Frame, FileEntry } from '../types';
import Papa from 'papaparse';

export const exportToCSV = (frames: Frame[]): string => {
  const data = frames.map(frame => ({
    sceneNumber: frame.sceneNumber,
    script: frame.script,
    notes: frame.notes,
    files: JSON.stringify(frame.files),
  }));

  return Papa.unparse(data);
};

export const importFromCSV = (csvContent: string): Frame[] => {
  const { data } = Papa.parse(csvContent, { header: true });
  
  return data.map((row: any) => ({
    id: crypto.randomUUID(),
    sceneNumber: row.sceneNumber,
    script: row.script,
    notes: row.notes || '',
    files: JSON.parse(row.files || '[]'),
    duration: 3,
  }));
};