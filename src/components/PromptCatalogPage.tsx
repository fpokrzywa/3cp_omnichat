import React, { useState } from 'react';
import { Search, Heart, ChevronDown, X, RefreshCw, Edit3 } from 'lucide-react';
import { mongoService, type MongoPrompt } from '../services/mongoService';
import CreatePromptForm from './CreatePromptForm';

interface Prompt {
  id: string;
  title: string;
  description: string;
  assistant: string;
  task?: string;
  functionalArea?: string;
  tags: string[];
  user?: string;
  system?: string;
  owner?: string;
}

interface PromptCatalogPageProps {
  onPromptSelect: (promptText: string, assistantName: string) => void;
}

const PromptCatalogPage: React.FC<PromptCatalogPageProps> = ({ onPromptSelect }) => {
  const [activeTab, setActiveTab] = useState<'enterprise' | 'your'>('enterprise');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssistant, setSelectedAssistant] = useState('All Assistants');
  const [selectedTask, setSelectedTask] = useState('Select Task...');
  const [selectedFunctionalArea, setSelectedFunctionalArea] = useState('Select Functional Area...');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);

  // Load prompts from MongoDB when component mounts
  React.useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async (forceRefresh: boolean = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const mongoPrompts = await mongoService.getPrompts(forceRefresh);
      const convertedPrompts: Prompt[] = mongoPrompts.map(prompt => ({
        id: prompt.id,
        title: prompt.title,
        description: prompt.description,
        assistant: prompt.assistant,
        task: prompt.task,
        functionalArea: prompt.functionalArea,
        tags: prompt.tags,
        user: (prompt as any).user,
        system: (prompt as any).system,
        owner: (prompt as any).owner
      }));
      setPrompts(convertedPrompts);
      
      // Log connection info for debugging
      console.log('n8n Connection Info:', mongoService.getConnectionInfo());
    } catch (error) {
      // Error is already handled in mongoService, just set fallback state
      console.log('Using fallback prompt data due to connection issues');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleCreatePrompt = async (promptData: any) => {
    try {
      let success;
      if (editingPrompt) {
        // Update existing prompt
        const updateId = editingPrompt.mongoId || editingPrompt.id;
        success = await mongoService.updatePrompt(updateId, promptData);
      } else {
        // Add new prompt
        success = await mongoService.addPrompt(promptData);
      }
      
      if (success) {
        // Refresh the prompts list to include the new prompt
        await loadPrompts(true);
        console.log(editingPrompt ? 'Prompt updated successfully' : 'Prompt created successfully');
      } else {
        console.warn(`Failed to ${editingPrompt ? 'update' : 'save'} prompt to n8n webhook, but continuing...`);
        // Still close the form and refresh to show any cached changes
        setShowCreateForm(false);
        setEditingPrompt(null);
        await loadPrompts(true);
      }
    } catch (error) {
      console.error(`Error in prompt ${editingPrompt ? 'update' : 'creation'} process:`, error);
      // Still close the form to prevent user confusion
      setShowCreateForm(false);
      setEditingPrompt(null);
    }
  };

  const handleEditPrompt = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setShowCreateForm(true);
  };

  const handleRefresh = () => {
    console.log('Refresh button clicked - forcing data refresh');
    loadPrompts(true);
  };

  // All available assistants from the assistants page
  const availableAssistants = [
    'OmniChat',
    'IT Support',
    'HR Support',
    'Advance Policies Assitant',
    'Redact Assistant',
    'ADEPT Assistant',
    'RFP Assistant',
    'RFP Assistant',
    'Resume Assistant'
  ];

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAssistant = selectedAssistant === 'All Assistants' || prompt.assistant === selectedAssistant;
    const matchesTask = selectedTask === 'Select Task...' || prompt.task === selectedTask;
    const matchesFunctionalArea = selectedFunctionalArea === 'Select Functional Area...' || 
                                 prompt.functionalArea === selectedFunctionalArea;
    
    return matchesSearch && matchesAssistant && matchesTask && matchesFunctionalArea;
  });

  const handlePromptClick = (prompt: Prompt) => {
    onPromptSelect(prompt.description, prompt.assistant);
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
    setEditingPrompt(null);
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Prompt Catalog
          </h1>
          <p className="text-gray-600">
            Discover and use pre-built prompts to get the most out of your AI assistants. Browse by category, assistant, or search for specific use cases.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex items-center justify-between border-b border-gray-200 mb-6">
          <div className="flex">
          <button
            onClick={() => setActiveTab('enterprise')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'enterprise'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Advance Common Prompts
          </button>
          <button
            onClick={() => setActiveTab('your')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'your'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Your Prompts
          </button>
        </div>
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
              isRefreshing ? 'text-gray-400' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Assistant</label>
              <div className="relative">
                <select
                  value={selectedAssistant}
                  onChange={(e) => setSelectedAssistant(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option>All Assistants</option>
                  {availableAssistants.map((assistant) => (
                    <option key={assistant} value={assistant}>
                      {assistant}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  {selectedAssistant !== 'All Assistants' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAssistant('All Assistants');
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <ChevronDown className="w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Task</label>
              <div className="relative">
                <select
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option>Select Task...</option>
                  <option>Files</option>
                  <option>Commercialization</option>
                  <option>Research</option>
                  <option>Talent Acquisition</option>
                  <option>Documentation</option>
                  <option>Analysis</option>
                  <option>Support</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Functional Area</label>
              <div className="relative">
                <select
                  value={selectedFunctionalArea}
                  onChange={(e) => setSelectedFunctionalArea(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option>Select Functional Area...</option>
                  <option>Research & Development</option>
                  <option>Commercial</option>
                  <option>Human Resources</option>
                  <option>Information Technology</option>
                  <option>Compliance</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[400px]">
          {activeTab === 'enterprise' ? (
            <>
              {isLoading ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading prompts...</p>
                </div>
              ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="prompt-card bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer group relative"
                >
                  <div onClick={() => handlePromptClick(prompt)} className="h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs font-medium text-gray-500">{prompt.assistant}</span>
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 leading-relaxed mb-2 group-hover:text-pink-600 transition-colors">
                        {prompt.title}
                      </h3>
                    </div>
                    <button className="text-gray-300 hover:text-pink-500 transition-colors flex-shrink-0 ml-2">
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed mb-4">
                    {prompt.description}
                  </p>

                  {/* Hidden fields to store user and system data */}
                  <div className="hidden">
                    <span data-user={prompt.user || ''}></span>
                    <span data-system={prompt.system || ''}></span>
                    <span data-owner={prompt.owner || ''}></span>
                  </div>

                  {prompt.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {prompt.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                  
                  {/* Edit button - positioned in bottom right corner */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Edit button clicked for prompt:', prompt);
                      handleEditPrompt(prompt);
                    }}
                    className="absolute bottom-3 right-3 p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No personal prompts yet</h3>
              <p className="text-gray-500 mb-6">Create your first prompt to get started</p>
              <button 
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                Create New Prompt
              </button>
            </div>
          )}

          {filteredPrompts.length === 0 && activeTab === 'enterprise' && !isLoading && (
            <div className="text-center py-16">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No prompts found</h3>
              <p className="text-gray-500">Try adjusting your search terms or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Prompt Form Modal */}
      <CreatePromptForm
        isOpen={showCreateForm}
        onClose={handleCloseForm}
        onSubmit={handleCreatePrompt}
        editingPrompt={editingPrompt}
      />
    </div>
  );
};

export default PromptCatalogPage;