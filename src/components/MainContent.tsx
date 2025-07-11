import React, { useState, useEffect } from 'react';
import { MessageSquare, HelpCircle, ChevronDown, Mic, Send, Search, BarChart3, Image, Paperclip, Copy, Edit3 } from 'lucide-react';
import { chatService, type ChatMessage, type ChatThread } from '../services/chatService';

interface MainContentProps {
  selectedAssistant: string;
  selectedAssistantId: string;
  selectedPrompt: string;
  onPromptUsed: () => void;
  onOpenPromptCatalog: () => void;
}

const MainContent: React.FC<MainContentProps> = ({ 
  selectedAssistant, 
  selectedAssistantId,
  selectedPrompt, 
  onPromptUsed,
  onOpenPromptCatalog
}) => {
  const [inputValue, setInputValue] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentThread, setCurrentThread] = useState<ChatThread | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAssistantId, setShowAssistantId] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  // Load user profile from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
  }, []);

  // Initialize or switch chat thread when assistant changes
  useEffect(() => {
    const existingThread = chatService.getCurrentThread();
    
    // If there's an existing thread for this assistant, use it
    if (existingThread && existingThread.assistantId === selectedAssistantId) {
      setCurrentThread(existingThread);
    } else {
      // Create new thread for this assistant
      const threadId = chatService.createThread(selectedAssistantId, selectedAssistant);
      const newThread = chatService.getThread(threadId);
      setCurrentThread(newThread);
    }
  }, [selectedAssistant, selectedAssistantId]);

  // Update current thread state periodically to catch changes
  useEffect(() => {
    const interval = setInterval(() => {
      const thread = chatService.getCurrentThread();
      if (thread && (!currentThread || thread.id !== currentThread.id || thread.messages.length !== currentThread.messages.length)) {
        setCurrentThread(thread);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [currentThread]);

  // Auto-scroll to bottom when new messages arrive or when streaming
  useEffect(() => {
    scrollToBottom();
  }, [currentThread?.messages, streamingMessage]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

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

  const handleSend = async () => {
    if (inputValue.trim()) {
      setIsLoading(true);
      setIsStreaming(true);
      setStreamingMessage('');
      setError(null);
      
      try {
        await chatService.sendMessageWithStreaming(inputValue.trim(), (chunk) => {
          setStreamingMessage(chunk);
        });
        const updatedThread = chatService.getCurrentThread();
        setCurrentThread(updatedThread);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
        setStreamingMessage('');
      }
      
      setInputValue('');
      if (selectedPrompt) {
        onPromptUsed();
      }
    }
  };

  const handleClearChat = () => {
    if (currentThread) {
      chatService.deleteThread(currentThread.id);
      const threadId = chatService.createThread(selectedAssistantId, selectedAssistant);
      const newThread = chatService.getThread(threadId);
      setCurrentThread(newThread);
    }
  };

  const handleStopStreaming = () => {
    chatService.stopStreaming();
    setIsStreaming(false);
    setStreamingMessage('');
    setIsLoading(false);
  };

  const handleCopyMessage = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleEditMessage = (message: ChatMessage) => {
    setEditingMessageId(message.id);
    setEditingText(message.content);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingText('');
  };

  const handleSendEdit = async () => {
    if (!currentThread || !editingMessageId || !editingText.trim()) return;

    // Find the index of the message being edited
    const messageIndex = currentThread.messages.findIndex(msg => msg.id === editingMessageId);
    if (messageIndex === -1) return;

    // Update the message content
    const updatedMessages = [...currentThread.messages];
    updatedMessages[messageIndex] = {
      ...updatedMessages[messageIndex],
      content: editingText.trim()
    };

    // Remove all messages after the edited message
    const messagesToKeep = updatedMessages.slice(0, messageIndex + 1);
    
    // Update the thread with only the messages up to the edited one
    const updatedThread = {
      ...currentThread,
      messages: messagesToKeep,
      updatedAt: new Date()
    };

    // Update the thread in the service
    chatService.updateThread(updatedThread);
    setCurrentThread(updatedThread);

    // Clear editing state
    setEditingMessageId(null);
    setEditingText('');

    // Send the edited message to get a new response
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingMessage('');
    setError(null);
    
    try {
      await chatService.sendMessageWithStreaming(editingText.trim(), (chunk) => {
        setStreamingMessage(chunk);
      });
      const refreshedThread = chatService.getCurrentThread();
      setCurrentThread(refreshedThread);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setStreamingMessage('');
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
    { icon: '🎓', label: 'Learn', shortLabel: 'Learn' }
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
            <div className="relative group">
              <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 cursor-help" />
              {/* Tooltip */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                Assistant ID: {selectedAssistantId || selectedAssistant}
                {/* Arrow pointing up */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-gray-800"></div>
              </div>
            </div>
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
            <button 
              onClick={handleClearChat}
              className="px-2 py-1 sm:px-3 sm:py-1 border border-gray-300 text-gray-600 rounded text-xs sm:text-sm hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
      
      {/* Chat Messages Area */}
      <div className="flex-1 flex flex-col px-3 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-hidden">
        {currentThread && currentThread.messages.length > 0 ? (
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto mb-4 space-y-4">
            {currentThread.messages.map((message) => (
              <div
                key={message.id}
               className={`flex ${
                 message.role === 'user' 
                   ? editingMessageId === message.id 
                     ? 'justify-start' 
                     : 'justify-end' 
                   : 'justify-start'
               }`}
              >
               <div className={`group ${
                 message.role === 'user' && editingMessageId === message.id
                   ? 'w-full'
                   : 'max-w-[80%] sm:max-w-[70%]'
               }`}>
                  {/* Message Content */}
                  <div
                    className={`px-4 py-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-white text-gray-900 border border-pink-500 rounded-xl'
                        : 'bg-white border border-gray-200 text-gray-800'
                    }`}
                  >
                    {editingMessageId === message.id ? (
                      /* Edit Mode */
                    <div className="w-full bg-gray-50 text-gray-900 rounded-xl">
                      <div className="space-y-3">
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-full p-3 bg-white text-gray-900 border rounded-lg text-sm resize-none"
                          rows={3}
                          autoFocus
                          placeholder="Edit your message..."
                        />
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2 text-sm bg-white text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSendEdit}
                            disabled={!editingText.trim()}
                            className="px-4 py-2 text-sm bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    </div>
                    ) : (
                      /* Normal Display Mode */
                      <>
                        {message.isLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="text-sm text-gray-500">Thinking...</span>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        )}
                        <div className={`text-xs mt-2 ${
                          message.role === 'user' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </>
                    )}
                  </div>
                
                  {/* Hover Actions for User Messages - Under entire message bubble */}
                {message.role === 'user' && editingMessageId !== message.id && (
                  <div className="flex justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex items-center space-x-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1">
                      <button
                        onClick={() => handleCopyMessage(message.content)}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors"
                        title="Copy message"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleEditMessage(message)}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors"
                        title="Edit message"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
                </div>
              </div>
            ))}
            
            {/* Loading/Thinking Message */}
            {isLoading && !streamingMessage && (
              <div className="flex justify-start">
                <div className="max-w-[80%] sm:max-w-[70%] px-4 py-3 rounded-lg bg-white border border-gray-200 text-gray-800">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-500">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Streaming Message */}
            {isStreaming && streamingMessage && (
              <div className="flex justify-start">
                <div className="max-w-[80%] sm:max-w-[70%] px-4 py-3 rounded-lg bg-white border border-gray-200 text-gray-800">
                  <p className="text-sm whitespace-pre-wrap">{streamingMessage}</p>
                </div>
              </div>
            )}
            
            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          /* Welcome Screen - Only show when no messages */
          <div className="flex-1 flex flex-col justify-center">
            <div className="max-w-4xl w-full mx-auto">
              <h2 className="text-base sm:text-lg lg:text-xl font-medium text-gray-800 mb-4 sm:mb-6 lg:mb-8 text-center">
                Please ask {selectedAssistant} your questions
              </h2>
              
              <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6 text-center px-2">
                Ask a question or add files to the conversation using the paperclip icon.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Input Section - Always at bottom */}
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="flex items-center space-x-2 sm:space-x-3 bg-white rounded-lg p-2 sm:p-3 border border-gray-200 shadow-sm">
              <button className="p-1 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <input
                type="text"
                placeholder="Ask a question..."
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 text-sm sm:text-base min-w-0 disabled:opacity-50"
              />
              <button 
                className="p-1 sm:p-2 text-gray-400 hover:text-pink-600 transition-colors flex-shrink-0"
                disabled={isLoading}
              >
                <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button 
                onClick={isStreaming ? handleStopStreaming : handleSend}
                disabled={isLoading && !isStreaming || (!inputValue.trim() && !isStreaming)}
                className={`p-2 sm:p-3 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg ${
                  isStreaming 
                    ? 'text-gray-400 hover:text-gray-600' 
                    : 'text-gray-400 hover:text-pink-600'
                }`}
              >
                {isStreaming ? (
                  <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
                  </div>
                ) : (
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
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
  );
};

export default MainContent;