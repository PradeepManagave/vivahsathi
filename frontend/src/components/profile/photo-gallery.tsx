'use client';

import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface Photo {
  id: string;
  url: string;
  thumbnail?: string;
  isPrimary?: boolean;
  isVerified?: boolean;
  isPrivate?: boolean;
  uploadedAt?: string;
}

export interface PhotoGalleryProps {
  photos: Photo[];
  loading?: boolean;
  editable?: boolean;
  onSetPrimary?: (id: string) => void;
  onDelete?: (id: string) => void;
  onTogglePrivate?: (id: string) => void;
  onUpload?: () => void;
  className?: string;
}

export function PhotoGallery({
  photos,
  loading = false,
  editable = false,
  onSetPrimary,
  onDelete,
  onTogglePrivate,
  onUpload,
  className = ''
}: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const openLightbox = useCallback((index: number) => {
    setSelectedIndex(index);
    setIsFullscreen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsFullscreen(false);
    setTimeout(() => setSelectedIndex(null), 300);
  }, []);

  const navigate = useCallback((direction: 'prev' | 'next') => {
    if (selectedIndex === null) return;
    const newIndex = direction === 'next'
      ? (selectedIndex + 1) % photos.length
      : (selectedIndex - 1 + photos.length) % photos.length;
    setSelectedIndex(newIndex);
  }, [selectedIndex, photos.length]);

  if (loading) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 ${className}`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-square bg-stone-200 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ZoomIn className="w-8 h-8 text-stone-400" />
        </div>
        <p className="text-stone-500 mb-4">No photos uploaded yet</p>
        {editable && onUpload && (
          <Button variant="primary" onClick={onUpload}>
            Upload Photos
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 ${className}`}>
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="relative group aspect-square bg-stone-100 rounded-xl overflow-hidden cursor-pointer"
            onClick={() => openLightbox(index)}
          >
            <img
              src={photo.url}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

            {photo.isPrimary && (
              <div className="absolute top-2 left-2">
                <Badge variant="gold" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Primary
                </Badge>
              </div>
            )}

            {photo.isPrivate && (
              <div className="absolute top-2 right-2">
                <Badge variant="outline" className="text-xs bg-black/50 text-white border-white/20">
                  Private
                </Badge>
              </div>
            )}

            {photo.isVerified && (
              <div className="absolute bottom-2 left-2">
                <Badge variant="success" className="text-xs">
                  Verified
                </Badge>
              </div>
            )}

            {editable && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {onSetPrimary && !photo.isPrimary && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); onSetPrimary(photo.id); }}
                    className="bg-white/90 hover:bg-white"
                  >
                    <Star className="w-4 h-4" />
                  </Button>
                )}
                {onTogglePrivate && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); onTogglePrivate(photo.id); }}
                    className="bg-white/90 hover:bg-white"
                  >
                    {photo.isPrivate ? 'Public' : 'Private'}
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); onDelete(photo.id); }}
                    className="bg-error/90 hover:bg-error text-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}

        {editable && onUpload && (
          <button
            onClick={onUpload}
            className="aspect-square bg-stone-50 border-2 border-dashed border-stone-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center">
              <span className="text-2xl text-stone-500">+</span>
            </div>
            <span className="text-sm text-stone-500">Add Photo</span>
          </button>
        )}
      </div>

      {isFullscreen && selectedIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={closeLightbox}>
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); navigate('prev'); }}
            className="absolute left-4 p-2 text-white/70 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <img
            src={photos[selectedIndex].url}
            alt={`Photo ${selectedIndex + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            onClick={(e) => { e.stopPropagation(); navigate('next'); }}
            className="absolute right-4 p-2 text-white/70 hover:text-white transition-colors"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white/70 text-sm">
            <span>{selectedIndex + 1}</span>
            <span>/</span>
            <span>{photos.length}</span>
          </div>
        </div>
      )}
    </>
  );
}
