import React from 'react';
import { X } from 'lucide-react';

interface AcknowledgmentOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const AcknowledgmentOverlay: React.FC<AcknowledgmentOverlayProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Acknowledgments</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-700">
            This application is built with the following technologies and services:
          </p>
          
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• React & TypeScript for the frontend</li>
            <li>• Tailwind CSS for styling</li>
            <li>• OpenAI API for AI capabilities</li>
            <li>• MongoDB for data storage</li>
            <li>• Lucide React for icons</li>
          </ul>
          
          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500">
              Thank you to all the open source contributors and service providers that make this application possible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcknowledgmentOverlay;