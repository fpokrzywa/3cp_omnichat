import React, { useState, useEffect } from 'react';
import { ChevronDown, Settings, User } from 'lucide-react';

interface HeaderProps {
  onNavigate: (page: 'chat' | 'assistants' | 'prompt-catalog' | 'resources') => void;
  currentPage: 'chat' | 'assistants' | 'prompt-catalog' | 'resources';
  onOpenPromptCatalog: () => void;
  onOpenSettings: () => void;
  onOpenAcknowledgment: () => void;
  onOpenProfile: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onNavigate, 
  currentPage, 
  onOpenPromptCatalog, 
  onOpenSettings, 
  onOpenAcknowledgment,
  onOpenProfile
}) => {
  const [userProfile, setUserProfile] = useState<any>(null);

  // Load user profile from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
  }, []);

  // Listen for profile changes
  useEffect(() => {
    const handleStorageChange = () => {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">ASC</span>
          </div>
          <button 
            onClick={() => onNavigate('assistants')}
            className={`text-sm font-medium transition-colors ${
              currentPage === 'assistants' 
                ? 'text-pink-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Advance AI Store
          </button>
          <span className="text-gray-300">|</span>
          <button 
            onClick={() => onNavigate('chat')}
            className={`text-sm font-medium transition-colors ${
              currentPage === 'chat' 
                ? 'text-pink-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Advance AI Chat
          </button>
        </div>
      </div>
      
      <nav className="flex items-center space-x-6">
        <button className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition-colors">
          <span>Manage Content</span>
          <ChevronDown className="w-4 h-4" />
        </button>
        
        <button 
          onClick={() => onNavigate('prompt-catalog')}
          className="text-gray-700 hover:text-gray-900 transition-colors"
        >
          Prompt Catalog
        </button>
        
        <button 
          onClick={() => onNavigate('resources')}
          className={`transition-colors ${
            currentPage === 'resources' 
              ? 'text-pink-600' 
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          Resources
        </button>
        
        {!userProfile?.hasAcceptedGuidelines && (
          <button 
            onClick={onOpenAcknowledgment}
            className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Guidelines
          </button>
        )}
        
        <div className="flex items-center space-x-3 ml-8">
          <button 
            onClick={onOpenSettings}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button 
            onClick={onOpenProfile}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;