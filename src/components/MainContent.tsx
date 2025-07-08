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
    { icon: '✏️', label: 'Create a plan' },
    { icon: '💡', label: 'Brainstorm ideas' },
    { icon: '📄', label: 'Summarize file' },
    { icon: '🔄', label: 'Compare files' },
    { icon: '💻', label: 'Code' },
    { icon: '📊', label: 'Analyze' },
    { icon: '🎓', label: 'Learn' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-pink-100 rounded flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-pink-600" />
            </div>
            <span className="font-medium text-gray-900">{selectedAssistant}</span>
            <HelpCircle className="w-4 h-4 text-gray-400" />
          </div>
          
          <div className="flex items-center space-x-2">
            {userProfile?.isAdmin && (
              <select className="px-3 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-pink-500">
                <option>GPT-4o</option>
                <option>GPT-4</option>
                <option>Claude-3.5</option>
                <option>Gemini Pro</option>
              </select>
            )}
            <button 
              onClick={onOpenPromptCatalog}
              className="px-4 py-1 bg-pink-600 text-white rounded text-sm hover:bg-pink-700 transition-colors flex items-center space-x-1"
            >
              <span>Prompts</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="max-w-2xl w-full text-center">
          <h2 className="text-xl font-medium text-gray-800 mb-12">
            Please ask {selectedAssistant} your questions
          </h2>
          
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {actionButtons.map((button, index) => (
              <button
                key={index}
                className="px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-all duration-200 flex items-center space-x-2 text-sm"
              >
                <span className="text-xs">{button.icon}</span>
                <span className="font-medium">{button.label}</span>
              </button>
            ))}
          </div>
          
          <p className="text-gray-500 text-sm mb-8">
            Select a category from above or ask a question, add files to the conversation using the paperclip icon.
          </p>
          
          <div className="mb-8">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <span className="text-lg">📎</span>
                  </button>
                  <input
                    type="text"
                    placeholder="Ask a question..."
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400"
                  />
                  <button className="p-2 text-gray-400 hover:text-pink-600 transition-colors">
                    <Mic className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleSend}
                    className="p-2 text-gray-400 hover:text-pink-600 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Web Search Buttons - Small and Left Aligned */}
              <div className="flex gap-2 mt-3">
                <button className="flex items-center space-x-1 px-3 py-1 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 transition-colors text-xs">
                  <Search className="w-3 h-3 text-gray-400" />
                  <span>Web Search</span>
                </button>
                <button className="flex items-center space-x-1 px-3 py-1 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 transition-colors text-xs">
                  <BarChart3 className="w-3 h-3 text-gray-400" />
                  <span>Research</span>
                </button>
                <button className="flex items-center space-x-1 px-3 py-1 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 transition-colors text-xs">
                  <Image className="w-3 h-3 text-gray-400" />
                  <span>Generate Image</span>
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