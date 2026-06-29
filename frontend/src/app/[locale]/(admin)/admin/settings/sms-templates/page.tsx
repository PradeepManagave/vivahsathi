'use client';

import { useState } from 'react';
import { 
  MessageSquare, Plus, Edit2, Trash2, Copy, Search,
  Eye, Send, ChevronDown, X, Loader2, CheckCircle,
  AlertTriangle, Settings, Users, Heart, Star, Calendar
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface SmsTemplate {
  id: string;
  name: string;
  category: string;
  subject?: string;
  content: string;
  variables: string[];
  status: 'active' | 'inactive';
  lastSent?: string;
  sentCount: number;
}

const mockTemplates: SmsTemplate[] = [
  {
    id: '1',
    name: 'Welcome Message',
    category: 'onboarding',
    content: 'Welcome to The Heritage - M-Plus Matrimony! Your profile is now live. Start exploring matches at {link}',
    variables: ['link'],
    status: 'active',
    lastSent: '2024-01-15',
    sentCount: 1523
  },
  {
    id: '2',
    name: 'Interest Received',
    category: 'interest',
    content: 'Congratulations! You received a new interest from {sender_name}. View their profile: {link}',
    variables: ['sender_name', 'link'],
    status: 'active',
    lastSent: '2024-01-15',
    sentCount: 4521
  },
  {
    id: '3',
    name: 'Mutual Match',
    category: 'match',
    content: 'It\'s a match! {match_name} also showed interest in you. Connect now: {link}',
    variables: ['match_name', 'link'],
    status: 'active',
    lastSent: '2024-01-14',
    sentCount: 892
  },
  {
    id: '4',
    name: 'Membership Expiry Reminder',
    category: 'membership',
    content: 'Your {plan_name} membership expires on {expiry_date}. Renew now to continue enjoying premium features.',
    variables: ['plan_name', 'expiry_date'],
    status: 'active',
    lastSent: '2024-01-13',
    sentCount: 456
  },
  {
    id: '5',
    name: 'KYC Verification Complete',
    category: 'verification',
    content: 'Great news! Your KYC verification is complete. You now have a verified badge on your profile. {link}',
    variables: ['link'],
    status: 'active',
    lastSent: '2024-01-12',
    sentCount: 234
  },
  {
    id: '6',
    name: 'Profile Update Reminder',
    category: 'engagement',
    content: 'Complete your profile to get 3x more matches! Add photos and details: {link}',
    variables: ['link'],
    status: 'active',
    lastSent: '2024-01-10',
    sentCount: 2341
  }
];

const categories = [
  { id: 'all', name: 'All Templates', count: mockTemplates.length },
  { id: 'onboarding', name: 'Onboarding', count: 1 },
  { id: 'interest', name: 'Interest', count: 1 },
  { id: 'match', name: 'Match', count: 1 },
  { id: 'membership', name: 'Membership', count: 1 },
  { id: 'verification', name: 'Verification', count: 1 },
  { id: 'engagement', name: 'Engagement', count: 1 }
];

export default function SmsTemplatesPage() {
  const [templates, setTemplates] = useState<SmsTemplate[]>(mockTemplates);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SmsTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'onboarding',
    content: '',
    status: 'active'
  });
  const [processing, setProcessing] = useState(false);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreate = async () => {
    setProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newTemplate: SmsTemplate = {
        id: Date.now().toString(),
        name: formData.name,
        category: formData.category,
        content: formData.content,
        status: formData.status as 'active' | 'inactive',
        variables: formData.content.match(/\{(\w+)\}/g)?.map(v => v.replace(/[{}]/g, '')) || [],
        sentCount: 0
      };
      setTemplates([...templates, newTemplate]);
      setShowCreateModal(false);
      setFormData({ name: '', category: 'onboarding', content: '', status: 'active' });
    } finally {
      setProcessing(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedTemplate) return;
    setProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTemplates(templates.map(t =>
        t.id === selectedTemplate.id
          ? {
              ...t,
              ...formData,
              status: formData.status as 'active' | 'inactive',
              variables: formData.content.match(/\{(\w+)\}/g)?.map(v => v.replace(/[{}]/g, '')) || []
            }
          : t
      ));
      setShowEditModal(false);
      setSelectedTemplate(null);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    setTemplates(templates.filter(t => t.id !== id));
  };

  const handleDuplicate = (template: SmsTemplate) => {
    const newTemplate: SmsTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      sentCount: 0,
      lastSent: undefined
    };
    setTemplates([...templates, newTemplate]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'onboarding': return <Users className="w-4 h-4" />;
      case 'interest': return <Heart className="w-4 h-4" />;
      case 'match': return <Star className="w-4 h-4" />;
      case 'membership': return <Settings className="w-4 h-4" />;
      case 'verification': return <CheckCircle className="w-4 h-4" />;
      case 'engagement': return <MessageSquare className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SMS Templates</h1>
          <p className="text-gray-500">Manage automated SMS templates for member communication</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010]"
        >
          <Plus className="w-4 h-4" />
          Create Template
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013]"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-[#570013] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {category.name} ({category.count})
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#570013]/10 flex items-center justify-center">
                  {getCategoryIcon(template.category)}
                </div>
                <div>
                  <h3 className="font-semibold">{template.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{template.category}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                template.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {template.status}
              </span>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <p className="text-sm text-gray-600 line-clamp-3">{template.content}</p>
            </div>

            {/* Variables */}
            <div className="flex flex-wrap gap-1 mb-3">
              {template.variables.map((variable) => (
                <span
                  key={variable}
                  className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded"
                >
                  {`{${variable}}`}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <Send className="w-4 h-4" />
                <span>{template.sentCount.toLocaleString()} sent</span>
              </div>
              {template.lastSent && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Last: {template.lastSent}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 border-t pt-3">
              <button
                onClick={() => { setSelectedTemplate(template); setShowPreviewModal(true); }}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={() => { setSelectedTemplate(template); setFormData({
                  name: template.name,
                  category: template.category,
                  content: template.content,
                  status: template.status
                }); setShowEditModal(true); }}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDuplicate(template)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Copy className="w-4 h-4" />
                Duplicate
              </button>
              <button
                onClick={() => handleDelete(template.id)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg ml-auto"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Create SMS Template</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Welcome Message"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="onboarding">Onboarding</option>
                  <option value="interest">Interest</option>
                  <option value="match">Match</option>
                  <option value="membership">Membership</option>
                  <option value="verification">Verification</option>
                  <option value="engagement">Engagement</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg resize-none"
                  placeholder="Use {variable_name} for dynamic content"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available variables: {'{link}'}, {'{name}'}, {'{sender_name}'}, {'{match_name}'}, {'{plan_name}'}, {'{expiry_date}'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="p-4 border-t flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={processing || !formData.name || !formData.content}
                className="flex-1 py-3 bg-[#570013] text-white rounded-lg font-medium hover:bg-[#450010] disabled:opacity-50"
              >
                {processing ? 'Creating...' : 'Create Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Edit Template</h3>
              <button onClick={() => { setShowEditModal(false); setSelectedTemplate(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="onboarding">Onboarding</option>
                  <option value="interest">Interest</option>
                  <option value="match">Match</option>
                  <option value="membership">Membership</option>
                  <option value="verification">Verification</option>
                  <option value="engagement">Engagement</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="p-4 border-t flex gap-3">
              <button
                onClick={() => { setShowEditModal(false); setSelectedTemplate(null); }}
                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                disabled={processing || !formData.name || !formData.content}
                className="flex-1 py-3 bg-[#570013] text-white rounded-lg font-medium hover:bg-[#450010] disabled:opacity-50"
              >
                {processing ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Template Preview</h3>
              <button onClick={() => { setShowPreviewModal(false); setSelectedTemplate(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-500 mb-2">Preview with sample data:</p>
                <p className="text-gray-800">
                  {selectedTemplate.content
                    .replace(/\{link\}/g, 'https://heritagematrimony.com/profile/123')
                    .replace(/\{name\}/g, 'Rahul')
                    .replace(/\{sender_name\}/g, 'Priya')
                    .replace(/\{match_name\}/g, 'Priya')
                    .replace(/\{plan_name\}/g, 'Premium')
                    .replace(/\{expiry_date\}/g, '31 Dec 2024')}
                </p>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>Characters: {selectedTemplate.content.length}</span>
                <span>SMS Count: ~{Math.ceil(selectedTemplate.content.length / 160)}</span>
              </div>
              <button
                onClick={() => copyToClipboard(selectedTemplate.content)}
                className="w-full py-2 border border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50"
              >
                <Copy className="w-4 h-4" />
                Copy Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
