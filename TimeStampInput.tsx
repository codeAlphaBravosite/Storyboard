import React from 'react';
import { TimeStamp } from './index.ts';

interface TimeStampInputProps {
  value: TimeStamp;
  onChange: (value: TimeStamp) => void;
}

export function TimeStampInput({ value, onChange }: TimeStampInputProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min="0"
        max="23"
        value={value.hours}
        onChange={(e) => onChange({ ...value, hours: Number(e.target.value) })}
        className="w-16 px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
      />
      <span className="text-gray-500 dark:text-gray-400">:</span>
      <input
        type="number"
        min="0"
        max="59"
        value={value.minutes}
        onChange={(e) => onChange({ ...value, minutes: Number(e.target.value) })}
        className="w-16 px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
      />
      <span className="text-gray-500 dark:text-gray-400">:</span>
      <input
        type="number"
        min="0"
        max="59"
        value={value.seconds}
        onChange={(e) => onChange({ ...value, seconds: Number(e.target.value) })}
        className="w-16 px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
      />
    </div>
  );
}
