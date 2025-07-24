import React, { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';

interface CreatePromptFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (promptData: any) => void;
  editingPrompt?: Prompt | null;
}

interface Prompt {
  id: string;
  title: string;
  description: string;
  assistant: string;
  task?: string;
  functionalArea?: string;
  tags: string[];
}

const CreatePromptForm: React.FC<CreatePromptFormProps> = ({ isOpen, onClose, onSubmit, editingPrompt }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    functionalAreas: [] as string[],
    task: '',
    tags: '',
    assistant: '',
    user: '',
    system: '',
    owner: ''
  });

  const [userProfile, setUserProfile] = useState<any>(null);

  // Load user profile and set owner
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setUserProfile(profile);
      setFormData(prev => ({ ...prev, owner: profile.name || 'Current User' }));
    }
  }, []);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editingPrompt) {
        // Populate form with existing prompt data
        setFormData({
          title: editingPrompt.title,
          description: editingPrompt.description,
          functionalAreas: editingPrompt.functionalArea ? editingPrompt.functionalArea.split(', ') : [],
          task: editingPrompt.task || '',
          tags: editingPrompt.tags.join(', '),
          assistant: editingPrompt.assistant,
          user: '',
          system: '',
          owner: userProfile?.name || 'Current User'
        });
      } else {
        // Reset form for new prompt
        setFormData({
          title: '',
          description: '',
          functionalAreas: [],
          task: '',
          tags: '',
          assistant: '',
          user: '',
          system: '',
          owner: userProfile?.name || 'Current User'
        });
      }
    }
  }, [isOpen, userProfile, editingPrompt]);

  const functionalAreaOptions = [
    'Research & Development',
    'Commercial',
    'Human Resources',
    'Information Technology',
    'Compliance',
    'Finance',
    'Marketing',
    'Operations',
    'Legal',
    'Quality Assurance'
  ];

  const taskOptions = [
    'Files',
    'Commercialization',
    'Research',
    'Talent Acquisition',
    'Documentation',
    'Analysis',
    'Support',
    'Brainstorming',
    'Planning',
    'Review'
  ];

  const availableAssistants = [
    'OmniChat',
    'IT Support',
    'HR Support',
    'Advance Policies Assistant',
    'Redact Assistant',
    'ADEPT Assistant',
    'RFP Assistant',
    'Resume Assistant'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFunctionalAreaToggle = (area: string) => {
    setFormData(prev => ({
      ...prev,
      functionalAreas: prev.functionalAreas.includes(area)
        ? prev.functionalAreas.filter(a => a !== area)
        : [...prev.functionalAreas, area]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert tags string to array
    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const promptData = {
      id: `custom_${Date.now()}`,
      title: formData.title,
      description: formData.description,
      functionalArea: formData.functionalAreas.join(', '),
      task: formData.task || undefined,
      tags: tagsArray,
      assistant: formData.assistant,
      user: formData.user,
      system: formData.system,
      owner: formData.owner
    };

    // Submit to parent component for handling
    onSubmit(promptData);
    onClose();
  };

  const isFormValid = formData.title.trim() && formData.description.trim() && formData.assistant.trim();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {editingPrompt ? 'Edit Prompt' : 'Create New Prompt'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter prompt title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what this prompt does"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                required
              />
            </div>

            {/* Functional Area - Multiple Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Functional Area
              </label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {functionalAreaOptions.map((area) => (
                    <label key={area} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.functionalAreas.includes(area)}
                        onChange={() => handleFunctionalAreaToggle(area)}
                        className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                      />
                      <span className="text-sm text-gray-700">{area}</span>
                    </label>
                  ))}
                </div>
              </div>
              {formData.functionalAreas.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.functionalAreas.map((area) => (
                    <span
                      key={area}
                      className="inline-flex items-center px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded-full"
                    >
                      {area}
                      <button
                        type="button"
                        onClick={() => handleFunctionalAreaToggle(area)}
                        className="ml-1 text-pink-600 hover:text-pink-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Task */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task
              </label>
              <select
                value={formData.task}
                onChange={(e) => handleInputChange('task', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">Select Task...</option>
                {taskOptions.map((task) => (
                  <option key={task} value={task}>
                    {task}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <textarea
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                placeholder="Enter tags separated by commas (e.g., Marketing, Analysis, Research)"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple tags with commas</p>
            </div>

            {/* Assistant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assistant <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.assistant}
                onChange={(e) => handleInputChange('assistant', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              >
                <option value="">Select Assistant...</option>
                {availableAssistants.map((assistant) => (
                  <option key={assistant} value={assistant}>
                    {assistant}
                  </option>
                ))}
              </select>
            </div>

            {/* User */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User
              </label>
              <textarea
                value={formData.user}
                onChange={(e) => handleInputChange('user', e.target.value)}
                placeholder="User-specific instructions or context"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              />
            </div>

            {/* System */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                System
              </label>
              <textarea
                value={formData.system}
                onChange={(e) => handleInputChange('system', e.target.value)}
                placeholder="System-level instructions or configuration"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Owner - Auto-populated */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Owner
              </label>
              <input
                type="text"
                value={formData.owner}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Auto-populated from your profile</p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingPrompt ? 'Update Prompt' : 'Create Prompt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePromptForm;