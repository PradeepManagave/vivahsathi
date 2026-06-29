'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Heart, Calendar, MapPin, Search, Filter,
  Plus, Eye, X, Upload, Loader2
} from 'lucide-react';
import { cmsService } from '@/lib/api/services/cms.service';
import { SuccessStory } from '@/types';

interface StorySubmission {
  maleName: string;
  femaleName: string;
  marriageDate: string;
  location: string;
  story: string;
  photos: File[];
}

export default function SuccessStoriesPage() {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'gallery' | 'admin'>('gallery');
  const [selectedStory, setSelectedStory] = useState<SuccessStory | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [submission, setSubmission] = useState<StorySubmission>({
    maleName: '',
    femaleName: '',
    marriageDate: '',
    location: '',
    story: '',
    photos: []
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    setLoading(true);
    try {
      const res = await cmsService.getSuccessStories({ status: 'published' });
      setStories(res.data.map((s: any) => ({
        id: s.id,
        title: s.title || `${s.groomName || ''} & ${s.brideName || ''}`,
        slug: s.slug || s.id,
        content: s.content || s.excerpt || '',
        excerpt: s.excerpt || s.content?.substring(0, 200),
        coverImage: s.coverImage,
        brideName: s.brideName,
        groomName: s.groomName,
        weddingDate: s.weddingDate,
        location: s.location,
        isFeatured: s.isFeatured ?? false,
        status: s.status === 'published' ? 'approved' : 'pending',
        publishedAt: s.publishedAt,
        createdAt: s.createdAt,
      } as SuccessStory)));
    } catch {
      // Fall back to empty
    } finally { setLoading(false); }
  };

  const filteredStories = stories.filter(story => {
    const matchesSearch = `${story.groomName || ''} & ${story.brideName || ''}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (story.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || story.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = stories.filter(s => s.status === 'pending').length;

  const handleApprove = async (storyId: string) => {
    setStories(stories.map(s => 
      s.id === storyId ? { ...s, status: 'approved', publishedAt: new Date().toISOString() } : s
    ));
  };

  const handleReject = async (storyId: string) => {
    setStories(stories.map(s => 
      s.id === storyId ? { ...s, status: 'rejected' } : s
    ));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setShowSubmitModal(false);
      setSubmission({
        maleName: '',
        femaleName: '',
        marriageDate: '',
        location: '',
        story: '',
        photos: []
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#570013] to-[#3a000d] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Heart className="w-8 h-8" />
            Success Stories
          </h1>
          <p className="text-white/80">Real couples who found love through M-Plus Matrimony</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs & Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setViewMode('gallery')}
              className={`px-4 py-2 rounded-lg font-medium ${
                viewMode === 'gallery' ? 'bg-[#570013] text-white' : 'bg-white text-gray-600'
              }`}
            >
              Gallery
            </button>
            <button
              onClick={() => setViewMode('admin')}
              className={`px-4 py-2 rounded-lg font-medium relative ${
                viewMode === 'admin' ? 'bg-[#570013] text-white' : 'bg-white text-gray-600'
              }`}
            >
              Admin Panel
              {pendingCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>
          
          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010]"
          >
            <Plus className="w-4 h-4" />
            Share Your Story
          </button>
        </div>

        {/* Gallery View */}
        {viewMode === 'gallery' && (
          <>
            {/* Search & Filter */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stories..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013]"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013]"
              >
                <option value="all">All Stories</option>
                <option value="approved">Approved</option>
              </select>
            </div>

            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[#570013]" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStories.filter(s => s.status === 'approved').map((story) => (
                  <Link
                    key={story.id}
                    href={`/success-stories/${story.id}`}
                    className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow block"
                  >
                    <div className="relative aspect-video bg-gradient-to-br from-[#570013]/20 to-[#fdc34d]/20">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                          <Heart className="w-10 h-10 text-[#570013]" />
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3 flex items-center gap-2">
                        <span className="px-2 py-1 bg-white/90 rounded-full text-xs font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {story.weddingDate ? new Date(story.weddingDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' }) : ''}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1">{`${story.groomName || ''} & ${story.brideName || ''}`}</h3>
                      <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {story.location}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2">{story.excerpt || story.content?.substring(0, 200)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* Admin View */}
        {viewMode === 'admin' && (
          <>
            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by couple names..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013]"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013]"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Admin Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Couple</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marriage Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStories.map((story) => (
                    <tr key={story.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#570013]/10 flex items-center justify-center">
                            <Heart className="w-5 h-5 text-[#570013]" />
                          </div>
                          <div>
                            <p className="font-medium">{`${story.groomName || ''} & ${story.brideName || ''}`}</p>
                            <p className="text-sm text-gray-500">{story.groomName} & {story.brideName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {story.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(story.weddingDate || story.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          story.status === 'approved' ? 'bg-green-100 text-green-700' :
                          story.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {story.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(story.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {story.status === 'pending' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprove(story.id)}
                              className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(story.id)}
                              className="px-3 py-1 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {story.status === 'approved' && (
                          <button
                            onClick={() => setSelectedStory(story)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      {/* Story Detail Modal */}
      {selectedStory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <div className="h-48 bg-gradient-to-br from-[#570013] to-[#3a000d] flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
                  <Heart className="w-12 h-12 text-white" />
                </div>
                <button
                  onClick={() => setSelectedStory(null)}
                  className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-1">{`${selectedStory.groomName || ''} & ${selectedStory.brideName || ''}`}</h2>
                <p className="text-gray-500 flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {selectedStory.location}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Married on {new Date(selectedStory.weddingDate || selectedStory.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              <div className="flex items-center justify-center gap-6 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#570013]">&mdash;</p>
                  <p className="text-sm text-gray-500">Story</p>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#570013]">&mdash;</p>
                  <p className="text-sm text-gray-500">Photos</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold mb-2">Their Story</h3>
                <p className="text-gray-600">{selectedStory.excerpt || selectedStory.content}</p>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Calendar className="w-4 h-4" />
                Approved on {new Date(selectedStory.publishedAt || selectedStory.createdAt).toLocaleDateString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Story Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Share Your Success Story</h3>
              <button onClick={() => setShowSubmitModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Groom's Name</label>
                  <input
                    type="text"
                    value={submission.maleName}
                    onChange={(e) => setSubmission({ ...submission, maleName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bride's Name</label>
                  <input
                    type="text"
                    value={submission.femaleName}
                    onChange={(e) => setSubmission({ ...submission, femaleName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Enter name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marriage Date</label>
                <input
                  type="date"
                  value={submission.marriageDate}
                  onChange={(e) => setSubmission({ ...submission, marriageDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={submission.location}
                  onChange={(e) => setSubmission({ ...submission, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="City, State"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Story</label>
                <textarea
                  value={submission.story}
                  onChange={(e) => setSubmission({ ...submission, story: e.target.value })}
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg resize-none"
                  placeholder="Share how you met and your journey together..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photos (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#570013] cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Click to upload photos</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-3 bg-[#570013] text-white rounded-lg font-medium hover:bg-[#450010] disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  'Submit Story'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
