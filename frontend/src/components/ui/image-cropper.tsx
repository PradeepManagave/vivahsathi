'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Crop, ZoomIn, ZoomOut, RotateCw, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ImageCropperProps {
  src: string;
  onCrop: (blob: Blob) => void;
  onCancel: () => void;
  aspectRatio?: number;
  width?: number;
  height?: number;
  className?: string;
}

export function ImageCropper({ src, onCrop, onCancel, aspectRatio = 1, width = 400, height = 400, className }: ImageCropperProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - crop.x, y: e.clientY - crop.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCrop({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const applyCrop = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const size = Math.min(width, height);
    canvas.width = size;
    canvas.height = size / aspectRatio;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2, img.naturalWidth, img.naturalHeight);
    ctx.restore();

    canvas.toBlob(blob => { if (blob) onCrop(blob); }, 'image/jpeg', 0.9);
  };

  return (
    <div className={cn('fixed inset-0 z-50 bg-black/80 flex items-center justify-center', className)}>
      <div className="bg-white rounded-xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2"><Crop className="w-4 h-4" />Crop Image</h3>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>

        <div
          ref={containerRef}
          className="relative bg-gray-900 m-4 rounded-lg overflow-hidden cursor-move"
          style={{ width: '100%', height: 300 }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="absolute inset-0 flex items-center justify-center" style={{ transform: `translate(${crop.x}px, ${crop.y}px)` }}>
            <img
              ref={imgRef}
              src={src}
              alt="Crop"
              className="max-w-full max-h-full transition-transform"
              style={{ transform: `scale(${zoom}) rotate(${rotation}deg)`, maxWidth: 'none' }}
              draggable={false}
            />
          </div>
          <div className="absolute inset-0 border-2 border-white/50 pointer-events-none" style={{ borderRadius: aspectRatio === 1 ? '50%' : 12, margin: '20%' }} />
        </div>

        <div className="flex items-center justify-center gap-4 px-4 pb-4">
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-2 hover:bg-gray-100 rounded"><ZoomOut className="w-5 h-5" /></button>
          <input type="range" min="50" max="200" value={Math.round(zoom * 100)} onChange={e => setZoom(Number(e.target.value) / 100)} className="flex-1 max-w-[200px]" />
          <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="p-2 hover:bg-gray-100 rounded"><ZoomIn className="w-5 h-5" /></button>
          <button onClick={() => setRotation(r => (r + 90) % 360)} className="p-2 hover:bg-gray-100 rounded"><RotateCw className="w-5 h-5" /></button>
        </div>

        <div className="flex gap-3 p-4 border-t">
          <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
          <Button onClick={applyCrop} className="flex-1"><Check className="w-4 h-4 mr-2" />Apply</Button>
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

