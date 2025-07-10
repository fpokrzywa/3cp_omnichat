import React, { useState, useEffect } from 'react';
import { MessageSquare, HelpCircle, ChevronDown, Mic, Send, Search, BarChart3, Image } from 'lucide-react';

interface MainContentProps {
  selectedAssistant: string;
  selectedPrompt: string;
  onPromptUsed: () => void;
  onOpenPromptCatalog: () => void;
}

const MainContent: React.FC<MainContentProps> = ({ 
  selectedAssistant, 
  selectedPrompt, 
  onPromptUsed,
  onOpenPromptCatalog
}) => {
  const [inputValue, setInputValue] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);

  // Load user profile from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
  }, []);

  // Update input when a prompt is selected
  useEffect(() => {
    if (selectedPrompt) {
      setInputValue(selectedPrompt);
    }
  }, [selectedPrompt]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    // Clear the selected prompt when user starts typing
    if (selectedPrompt && e.target.value !== selectedPrompt) {
      onPromptUsed();
    }
  };

  const handleSend = () => {
    if (inputValue.trim()) {
      // Handle sending the message here
      console.log('Sending message:', inputValue);
      setInputValue('');
      if (selectedPrompt) {
        onPromptUsed();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const actionButtons = [
    { icon: '✏️', label: 'Create a plan', shortLabel: 'Plan' },
    { icon: '💡', label: 'Brainstorm ideas', shortLabel: 'Ideas' },
    { icon: '📄', label: 'Summarize file', shortLabel: 'Summary' },
    { icon: '🔄', label: 'Compare files', shortLabel: 'Compare' },
    { icon: '💻', label: 'Code', shortLabel: 'Code' },
    { icon: '📊', label: 'Analyze', shortLabel: 'Analyze' },
    { icon: '🎓', label: 'Learn', shortLabel: 'Learn' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header - Mobile Responsive */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-pink-100 rounded flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-pink-600" />
            </div>
            <span className="font-medium text-gray-900 text-sm sm:text-base truncate">{selectedAssistant}</span>
            <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {userProfile?.isAdmin && (
              <select className="px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 max-w-20 sm:max-w-none sm:px-3 sm:text-sm">
                <option>GPT-4o</option>
                <option>GPT-4</option>
                <option>Claude-3.5</option>
                <option>Gemini Pro</option>
              </select>
            )}
            <button 
              onClick={onOpenPromptCatalog}
              className="px-2 py-1 sm:px-4 sm:py-1 bg-pink-600 text-white rounded text-xs sm:text-sm hover:bg-pink-700 transition-colors"
            >
              Prompts
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content - Mobile Responsive */}
      <div className="flex-1 flex flex-col justify-center px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="max-w-4xl w-full mx-auto">
          <h2 className="text-base sm:text-lg lg:text-xl font-medium text-gray-800 mb-4 sm:mb-6 lg:mb-8 text-center">
            Please ask {selectedAssistant} your questions
          </h2>
          
          {/* Action Buttons - Mobile Responsive Grid */}
          <div className="grid grid-cols-4 sm:flex sm:flex-wrap sm:justify-center gap-1 sm:gap-2 mb-4 sm:mb-6 lg:mb-8">
            {actionButtons.map((button, index) => (
              <button
                key={index}
                className="flex flex-col sm:flex-row items-center justify-center sm:space-x-1 px-1 py-2 sm:px-3 sm:py-1 border border-gray-200 rounded-lg sm:rounded-full text-gray-600 hover:bg-gray-50 transition-colors text-xs min-h-12 sm:min-h-0"
              >
                <span className="text-sm mb-1 sm:mb-0">{button.icon}</span>
                <span className="hidden sm:inline text-xs">{button.label}</span>
                <span className="sm:hidden text-xs text-center leading-tight">{button.shortLabel}</span>
              </button>
            ))}
          </div>
          
          <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6 text-center px-2">
            Select a category from above or ask a question, add files to the conversation using the paperclip icon.
          </p>
          
          {/* Input Section - Mobile Responsive */}
          <div className="mb-4">
            <div className="relative">
              <div className="flex items-center space-x-2 sm:space-x-3 bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200">
                <button className="p-1 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                  <span className="text-base sm:text-lg">📎</span>
                </button>
                <input
                  type="text"
                  placeholder="Ask a question..."
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 text-sm sm:text-base min-w-0"
                />
                <button className="p-1 sm:p-2 text-gray-400 hover:text-pink-600 transition-colors flex-shrink-0">
                  <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button 
                  onClick={handleSend}
                  className="p-1 sm:p-2 text-gray-400 hover:text-pink-600 transition-colors flex-shrink-0"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              
              {/* Web Search Buttons - Mobile Responsive */}
              <div className="flex flex-wrap gap-1 sm:gap-2 mt-2 sm:mt-3 justify-start">
                <button className="flex items-center space-x-1 px-2 py-1 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 transition-colors text-xs">
                  <Search className="w-3 h-3 text-gray-400" />
                  <span className="hidden sm:inline">Web Search</span>
                  <span className="sm:hidden">Web</span>
                </button>
                <button className="flex items-center space-x-1 px-2 py-1 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 transition-colors text-xs">
                  <BarChart3 className="w-3 h-3 text-gray-400" />
                  <span>Research</span>
                </button>
                <button className="flex items-center space-x-1 px-2 py-1 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 transition-colors text-xs">
                  <Image className="w-3 h-3 text-gray-400" />
                  <span className="hidden sm:inline">Generate Image</span>
                  <span className="sm:hidden">Image</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContent;