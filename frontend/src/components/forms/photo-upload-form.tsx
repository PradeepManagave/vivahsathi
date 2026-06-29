'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PhotoUploadFormProps {
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  onUpload: (files: File[]) => Promise<void>;
  existingPhotos?: { id: string; url: string; isPrimary?: boolean }[];
  onDelete?: (id: string) => void;
  onSetPrimary?: (id: string) => void;
  className?: string;
}

export function PhotoUploadForm({ maxFiles = 10, maxSize = 5 * 1024 * 1024, accept = 'image/jpeg,image/png,image/webp', onUpload, existingPhotos = [], onDelete, onSetPrimary, className }: PhotoUploadFormProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList) => {
    setError(null);
    const valid: File[] = [];
    for (const f of Array.from(files)) {
      if (!accept.split(',').some(t => f.type.match(t.replace('*', '.*')))) { setError(`Invalid file type: ${f.name}`); continue; }
      if (f.size > maxSize) { setError(`${f.name} exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`); continue; }
      valid.push(f);
    }
    if (existingPhotos.length + previews.length + valid.length > maxFiles) { setError(`Maximum ${maxFiles} photos allowed`); return; }
    const newPreviews = valid.map(f => URL.createObjectURL(f));
    setPreviews(p => [...p, ...newPreviews]);
    setError(null);
    if (valid.length > 0) { doUpload(valid); }
  };

  const doUpload = async (files: File[]) => {
    setUploading(true);
    try { await onUpload(files); } catch (e: any) { setError(e?.message || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const removePreview = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setPreviews(p => p.filter((_, i) => i !== index));
  };

  const totalPhotos = existingPhotos.length + previews.length;

  return (
    <div className={cn('space-y-4', className)}>
      <div
        className={cn('border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer', dragOver ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400', error && 'border-red-300 bg-red-50')}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files) handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept={accept} multiple className="hidden" onChange={e => e.target.files && handleFiles(e.target.files)} disabled={uploading} />
        {uploading ? (
          <div><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary mb-2" /><p className="text-sm text-gray-500">Uploading...</p></div>
        ) : (
          <div><Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" /><p className="font-medium">Drop photos here or click to browse</p><p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP up to {Math.round(maxSize / 1024 / 1024)}MB ({totalPhotos}/{maxFiles})</p></div>
        )}
      </div>
      {error && <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{error}</p>}

      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {existingPhotos.map(p => (
          <div key={p.id} className="relative group aspect-square rounded-lg overflow-hidden border">
            <img src={p.url} alt="" className="w-full h-full object-cover" />
            {p.isPrimary && <span className="absolute top-1 left-1 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded font-bold">PRIMARY</span>}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              {!p.isPrimary && onSetPrimary && <button onClick={() => onSetPrimary(p.id)} className="p-1 bg-white rounded text-xs font-medium">Set Primary</button>}
              {onDelete && <button onClick={() => onDelete(p.id)} className="p-1 bg-red-500 text-white rounded"><X className="w-3.5 h-3.5" /></button>}
            </div>
          </div>
        ))}
        {previews.map((p, i) => (
          <div key={`preview-${i}`} className="relative aspect-square rounded-lg overflow-hidden border border-primary">
            <img src={p} alt="" className="w-full h-full object-cover" />
            <button onClick={() => removePreview(i)} className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full"><X className="w-3 h-3" /></button>
            <div className="absolute bottom-1 left-1"><Loader2 className="w-4 h-4 animate-spin text-primary" /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
