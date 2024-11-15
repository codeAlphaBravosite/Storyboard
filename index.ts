export interface Frame {
  id: string;
  sceneNumber: string;
  script: string;
  files: FileEntry[];
  duration: number;
  notes: string;
}

export interface FileEntry {
  id: string;
  name: string;
  timestamp: string;
  selected: boolean;
}

export interface TimeStamp {
  hours: number;
  minutes: number;
  seconds: number;
}