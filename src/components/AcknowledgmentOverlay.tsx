import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AcknowledgmentOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const AcknowledgmentOverlay: React.FC<AcknowledgmentOverlayProps> = ({ isOpen, onClose }) => {
  const [acknowledged, setAcknowledged] = useState(false);

  const handleClose = () => {
    setAcknowledged(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Acknowledgement</h2>
          <button 
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <p className="text-gray-600 leading-relaxed">
            Welcome to Advance AI Store! This outlines the guidelines and policies for using AI Store, a digital resource designed to enhance productivity and collaboration.
          </p>

          {/* Monitoring and Compliance */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Monitoring and Compliance</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>The use of this resource is subject to monitoring.</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <span>You must follow all Advance Company policies, and procedures including the </span>
                  <button className="text-pink-600 hover:text-pink-700 underline">
                    Advance Solutions Responsible AI SOP
                  </button>
                  <span>.</span>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <span>Your use of publicly available consumer versions of GenAI tools and similar products are subject to this </span>
                  <button className="text-pink-600 hover:text-pink-700 underline">
                    announcement
                  </button>
                  <span> and other relevant </span>
                  <button className="text-pink-600 hover:text-pink-700 underline">
                    Advance Solutions policies
                  </button>
                  <span>.</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Accuracy and Verification */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Accuracy and Verification</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>Responses from Advance AI Store may be inaccurate. Always verify accuracy of responses.</span>
              </li>
            </ul>
          </div>

          {/* Copyright, Permissions, and Licensed Data */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Copyright, Permissions, and Licensed Data</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>Third party materials may be subject to copyright. Ensure that you have the necessary permissions</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>In some instances, Advance Solutions  has acquired a license to use certain data (including personal data). In such cases, there might be restrictions on the use of the data. You should verify that your intended use is compatible with such licenses.</span>
              </li>
            </ul>
          </div>

          {/* Ethical Concerns */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Ethical Concerns</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <span>If you encounter an ethical concern, such as biased AI output, report it immediately to the </span>
                  <button className="text-pink-600 hover:text-pink-700 underline">
                    Advance Solutions HR Team & AI Team
                  </button>
                  <span>.</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Using personal data */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Using personal data</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>Use only the personal data needed to achieve your business objective.</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>Avoid making automated decisions about individuals based solely on AI output.</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>Use personal data in accordance with the privacy notice or consent provided by individuals.</span>
              </li>
            </ul>
          </div>

          {/* Questions and Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Questions and Contact Information</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <span>For questions or concerns, please reach out to the Data Risk Office (</span>
                  <button className="text-pink-600 hover:text-pink-700 underline">
                    ai_admin@advancesolutions.com
                  </button>
                  <span>) or the </span>
                  <button className="text-pink-600 hover:text-pink-700 underline">
                    Privacy Law Team
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="acknowledge"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500 focus:ring-2"
            />
            <label htmlFor="acknowledge" className="text-sm text-gray-700 cursor-pointer">
              I Acknowledge my Responsibility to use this AI based on Advance Solutions Guidelines Above
            </label>
          </div>
          
          <button
            onClick={handleClose}
            className="px-6 py-2 text-pink-600 hover:text-pink-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcknowledgmentOverlay;