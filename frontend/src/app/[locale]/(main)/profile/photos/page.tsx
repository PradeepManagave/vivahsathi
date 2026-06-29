'use client';

import React, { useState, useCallback } from 'react';
import { Upload, Trash2, Star, Image as ImageIcon, Check, X, Loader2 } from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  isPrimary: boolean;
  status: 'approved' | 'pending' | 'rejected';
  uploadedAt: string;
}

const mockPhotos: Photo[] = [
  { id: '1', url: '', isPrimary: true, status: 'approved', uploadedAt: '2026-05-15' },
  { id: '2', url: '', isPrimary: false, status: 'approved', uploadedAt: '2026-05-16' },
  { id: '3', url: '', isPrimary: false, status: 'pending', uploadedAt: '2026-05-18' },
];

export default function ProfilePhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>(mockPhotos);
  const [uploading, setUploading] = useState(false);

  const handleUpload = useCallback(async () => {
    setUploading(true);
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 1500));
    const newPhoto: Photo = {
      id: String(Date.now()),
      url: '',
      isPrimary: false,
      status: 'pending',
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    setPhotos(prev => [...prev, newPhoto]);
    setUploading(false);
  }, []);

  const setAsPrimary = useCallback((id: string) => {
    setPhotos(prev => prev.map(p => ({
      ...p,
      isPrimary: p.id === id
    })));
  }, []);

  const deletePhoto = useCallback((id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  }, []);

  const approvedCount = photos.filter(p => p.status === 'approved').length;
  const pendingCount = photos.filter(p => p.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Photos</h1>
          <p className="text-gray-500">Manage your profile photos</p>
        </div>
      </div>

      {/* Photo Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-gray-900">{photos.length}</p>
          <p className="text-sm text-gray-500">Total Photos</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
          <p className="text-sm text-gray-500">Approved</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
          <p className="text-sm text-gray-500">Pending Review</p>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Photos</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Drag and drop photos here, or click to browse</p>
          <p className="text-sm text-gray-500 mb-4">JPG, PNG up to 5MB each. Maximum 10 photos.</p>
          <button
            onClick={handleUpload}
            disabled={uploading || photos.length >= 10}
            className="flex items-center gap-2 px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010] transition-colors disabled:opacity-50 mx-auto"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Photo
              </>
            )}
          </button>
        </div>
      </div>

      {/* Photo Guidelines */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
        <h3 className="font-semibold text-blue-900 mb-2">Photo Guidelines</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Clear face photo required as primary photo</li>
          <li>• Recent photos (taken within last 6 months)</li>
          <li>• No group photos, filters, or heavy editing</li>
          <li>• Photos are reviewed before being published</li>
        </ul>
      </div>

      {/* Photo Grid */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Photos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              </div>
              
              {photo.isPrimary && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-[#570013] text-white text-xs font-medium rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-white" />
                  Primary
                </div>
              )}
              
              <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full ${
                photo.status === 'approved' ? 'bg-green-100 text-green-700' :
                photo.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {photo.status === 'approved' && <Check className="w-3 h-3 inline mr-1" />}
                {photo.status}
              </div>

              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                {!photo.isPrimary && photo.status === 'approved' && (
                  <button
                    onClick={() => setAsPrimary(photo.id)}
                    className="p-2 bg-white rounded-lg hover:bg-gray-100"
                    title="Set as primary"
                  >
                    <Star className="w-4 h-4 text-gray-700" />
                  </button>
                )}
                <button
                  onClick={() => deletePhoto(photo.id)}
                  className="p-2 bg-white rounded-lg hover:bg-red-50"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
        {photos.length === 0 && (
          <div className="text-center py-12">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No photos uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
