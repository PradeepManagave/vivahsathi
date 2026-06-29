'use client';

import { useState, useRef, DragEvent } from 'react';
import { Upload, X, File, Image } from 'lucide-react';
import { Button } from './button';

interface FileUploadProps {
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  value?: File[];
  onChange?: (files: File[]) => void;
  onError?: (error: string) => void;
  preview?: boolean;
}

export function FileUpload({ accept = 'image/*', maxSize = 5 * 1024 * 1024, maxFiles = 1, multiple = false, value = [], onChange, onError, preview = true }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const validate = (files: File[]): File[] => {
    const valid: File[] = [];
    for (const file of files) {
      if (file.size > maxSize) { onError?.('File too large'); continue; }
      valid.push(file);
    }
    return valid;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    const valid = validate(fileArray);
    const total = multiple ? [...value, ...valid].slice(0, maxFiles) : valid.slice(0, 1);
    onChange?.(total);
  };

  const removeFile = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    onChange?.(updated);
  };

  return (
    <div className="space-y-3">
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
        <p className="text-sm font-medium mb-1">Drop files here or click to browse</p>
        <p className="text-xs text-gray-500">Max {maxSize / 1024 / 1024}MB per file</p>
        <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      </div>

      {preview && value.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {value.map((file, i) => (
            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border">
              {file.type.startsWith('image/') ? (
                <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <File className="w-8 h-8 text-gray-400" />
                  <p className="text-xs text-gray-500 mt-1 px-1 truncate w-full text-center">{file.name}</p>
                </div>
              )}
              <button onClick={() => removeFile(i)} className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3 text-white" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
