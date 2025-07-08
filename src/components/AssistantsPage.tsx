import React, { useState } from 'react';
import { Search, Heart, ChevronDown } from 'lucide-react';

interface Assistant {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isFavorite?: boolean;
}

interface AssistantsPageProps {
  onAssistantSelect: (assistantName: string) => void;
}

const AssistantsPage: React.FC<AssistantsPageProps> = ({ onAssistantSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Sort');
  const [assistants, setAssistants] = useState<Assistant[]>([

      {
    "id": "bms-chatgpt",
    "name": "OmniChat",
    "description": "Ask questions, explore new ideas, create content, and experiment with new models.",
    "icon": "💬",
    "color": "bg-pink-100 text-pink-600",
    "isFavorite": false
  },
  {
    "id": "it-support",
    "name": "IT Support",
    "description": "Get help with common IT problems like email, devices, passwords, and more.",
    "icon": "🔧",
    "color": "bg-red-100 text-red-600",
    "isFavorite": false
  },
  {
    "id": "hr-support",
    "name": "HR Support",
    "description": "Find answers to your HR questions, from benefits to company policies and more.",
    "icon": "🧑‍🤝‍🧑",
    "color": "bg-green-100 text-green-600",
    "isFavorite": false
  },
  {
    "id": "advance-policies-assistant",
    "name": "Advance Policies Assistant",
    "description": "Get answers and summaries for your policy-related questions.",
    "icon": "📋",
    "color": "bg-purple-100 text-purple-600",
    "isFavorite": false
  },
  {
    "id": "redact-assistant",
    "name": "Redact Assistant",
    "description": "Efficiently identify and redact sensitive information from documents.",
    "icon": "✂️",
    "color": "bg-yellow-100 text-yellow-600",
    "isFavorite": false
  },
  {
    "id": "adept-assistant",
    "name": "ADEPT Assistant",
    "description": "Simplify and accelerate your data entry and processing tasks.",
    "icon": "⚡",
    "color": "bg-blue-100 text-blue-600",
    "isFavorite": false
  },
  {
    "id": "rfp-assistant",
    "name": "RFP Assistant",
    "description": "Streamline your Request for Proposal (RFP) response process.",
    "icon": "✍️",
    "color": "bg-indigo-100 text-indigo-600",
    "isFavorite": false
  },
  {
    "id": "resume-assistant",
    "name": "Resume Assistant",
    "description": "Craft compelling resumes tailored to specific job opportunities.",
    "icon": "📄",
    "color": "bg-teal-100 text-teal-600",
    "isFavorite": false
  }
  ]);

  const toggleFavorite = (assistantId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setAssistants(prevAssistants =>
      prevAssistants.map(assistant =>
        assistant.id === assistantId
          ? { ...assistant, isFavorite: !assistant.isFavorite }
          : assistant
      )
    );
  };

  const getSortedAssistants = (assistantsList: Assistant[]) => {
    switch (sortBy) {
      case 'Name A-Z':
        return [...assistantsList].sort((a, b) => a.name.localeCompare(b.name));
      case 'Name Z-A':
        return [...assistantsList].sort((a, b) => b.name.localeCompare(a.name));
      case 'Recently Added':
        return [...assistantsList].reverse();
      case 'Favorites':
        return [...assistantsList].filter(assistant => assistant.isFavorite);
      default:
        return assistantsList;
    }
  };

  const filteredAndSortedAssistants = getSortedAssistants(
    assistants.filter(assistant =>
      assistant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assistant.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Show special message when Favorites is selected but no favorites exist
  const showNoFavoritesMessage = sortBy === 'Favorites' && filteredAndSortedAssistants.length === 0 && searchQuery === '';
  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Welcome to the Advance AI Store
          </h1>
          <p className="text-gray-600">
            Each Assistant is created to help you do a specific set of tasks. Get answers to your questions, brainstorm ideas, create new content, and more!
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center space-x-4 mb-8">
          <div className="relative">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option>Sort</option>
              <option>Name A-Z</option>
              <option>Name Z-A</option>
              <option>Recently Added</option>
              <option>Favorites</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search using assistant name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          
          <span className="text-sm text-gray-500">
            Search for an Assistant
          </span>
        </div>

        {/* Assistants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedAssistants.map((assistant) => (
            <div
              key={assistant.id}
              onClick={() => onAssistantSelect(assistant.name)}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded flex items-center justify-center ${assistant.color}`}>
                    <span className="text-lg">{assistant.icon}</span>
                  </div>
                  <h3 className="font-medium text-gray-900 group-hover:text-pink-600 transition-colors">
                    {assistant.name}
                  </h3>
                </div>
                <button 
                  onClick={(e) => toggleFavorite(assistant.id, e)}
                  className={`transition-colors ${
                    assistant.isFavorite 
                      ? 'text-pink-500 hover:text-pink-600' 
                      : 'text-gray-300 hover:text-pink-500'
                  }`}
                >
                  <Heart 
                    className={`w-5 h-5 ${assistant.isFavorite ? 'fill-current' : ''}`} 
                  />
                </button>
              </div>
              
              <p className="text-sm text-gray-600 leading-relaxed">
                {assistant.description}
              </p>
            </div>
          ))}
        </div>

        {showNoFavoritesMessage ? (
          <div className="text-center py-12">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No favorite assistants yet</h3>
            <p className="text-gray-500">Click the heart icon on any assistant to add it to your favorites</p>
          </div>
        ) : filteredAndSortedAssistants.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assistants found</h3>
            <p className="text-gray-500">
              {sortBy === 'Favorites' 
                ? 'No favorite assistants match your search' 
                : 'Try adjusting your search terms'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssistantsPage;