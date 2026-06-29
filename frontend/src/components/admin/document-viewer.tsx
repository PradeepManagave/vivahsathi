'use client';

import React, { useState } from 'react';
import { FileText, Download, Eye, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Document {
  id: string;
  name: string;
  type: string;
  url?: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  uploadedBy?: string;
  size?: string;
}

interface DocumentViewerProps {
  documents: Document[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onDownload?: (id: string) => void;
  loading?: boolean;
  className?: string;
}

const statusColors = { pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' };

export function DocumentViewer({ documents, onApprove, onReject, onDownload, loading, className }: DocumentViewerProps) {
  const [viewerFile, setViewerFile] = useState<Document | null>(null);
  const [zoom, setZoom] = useState(100);

  if (loading) return <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>;
  if (!documents || documents.length === 0) return <Card className="p-6 text-center text-gray-400"><FileText className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No documents uploaded</p></Card>;

  return (
    <div className={cn('space-y-3', className)}>
      {documents.map(doc => (
        <div key={doc.id} className="flex items-center gap-4 p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow">
          <div className="p-2 bg-gray-100 rounded-lg"><FileText className="w-5 h-5 text-gray-500" /></div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{doc.name}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
              <span>{doc.type}</span>
              {doc.size && <span>{doc.size}</span>}
              <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
            </div>
          </div>
          <Badge className={cn('text-xs', statusColors[doc.status])}>{doc.status}</Badge>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setViewerFile(doc)} title="Preview"><Eye className="w-3.5 h-3.5" /></Button>
            {onDownload && <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => onDownload(doc.id)} title="Download"><Download className="w-3.5 h-3.5" /></Button>}
            {doc.status === 'pending' && onApprove && (
              <Button variant="ghost" size="sm" className="text-xs text-green-600 h-7" onClick={() => onApprove(doc.id)}>Approve</Button>
            )}
            {doc.status === 'pending' && onReject && (
              <Button variant="ghost" size="sm" className="text-xs text-red-600 h-7" onClick={() => onReject(doc.id)}>Reject</Button>
            )}
          </div>
        </div>
      ))}

      {viewerFile && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center" onClick={() => setViewerFile(null)}>
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] m-4 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold truncate">{viewerFile.name}</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => setZoom(z => Math.max(25, z - 25))} className="p-1 hover:bg-gray-100 rounded">-</button>
                <span className="text-sm text-gray-500 w-12 text-center">{zoom}%</span>
                <button onClick={() => setZoom(z => Math.min(200, z + 25))} className="p-1 hover:bg-gray-100 rounded">+</button>
                <button onClick={() => setViewerFile(null)} className="p-1 hover:bg-gray-100 rounded ml-2"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="flex-1 p-6 overflow-auto flex items-center justify-center bg-gray-100">
              <div className="bg-white shadow rounded p-4" style={{ transform: `scale(${zoom / 100})` }}>
                <FileText className="w-16 h-16 text-gray-300 mx-auto" />
                <p className="text-sm text-gray-500 mt-2 text-center">{viewerFile.name}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
