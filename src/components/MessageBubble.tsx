import React from 'react';
import { Message } from '../types';
import { formatTime } from '../utils/helpers';
import { Check, CheckCheck } from 'lucide-react';
import PackageCard from './PackageCard';

interface MessageBubbleProps {
  message: Message;
  onQuickReply?: (text: string, value: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onQuickReply }) => {
  const isUser = message.sender === 'user';
  
  if (message.type === 'package' && message.packageData) {
    return (
      <div className="flex justify-start mb-4">
        <div className="max-w-xs">
          <PackageCard package={message.packageData} />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isUser 
          ? 'bg-whatsapp-bubble text-gray-800 rounded-br-none' 
          : 'bg-whatsapp-received text-gray-800 rounded-bl-none shadow-sm'
      }`}>
        <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
        
        {message.options && (
          <div className="mt-3 space-y-2">
            {message.options.map((option) => (
              <div key={option.id} className="space-y-2">
                {console.log('Rendering option:', option)}
                {console.log('Option descriptionLines:', option.descriptionLines)}
                <button
                  onClick={() => onQuickReply?.(option.text, option.value)}
                  className="w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors text-sm font-medium text-blue-700"
                >
                  {option.text}
                </button>
                {option.descriptionLines && (
                  <div>
                    {console.log('Rendering description lines:', option.descriptionLines)}
                    <div className="ml-1 text-xs text-gray-600 space-y-1">
                      {option.descriptionLines.map((line, index) => (
                        <div key={index} className="flex items-start leading-relaxed">
                          <span className="mr-1">•</span>
                          <span>{line}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className={`flex items-center justify-end mt-1 space-x-1 ${
          isUser ? 'text-gray-600' : 'text-gray-500'
        }`}>
          <span className="text-xs">{formatTime(message.timestamp)}</span>
          {isUser && (
            <div className="text-blue-500">
              <CheckCheck size={14} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;