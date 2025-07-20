import React, { useState } from 'react';
import { Send, Mic, Paperclip, Smile } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  language: 'en' | 'af' | 'zu';
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled, language }) => {
  const [message, setMessage] = useState('');

  const getPlaceholder = () => {
    switch (language) {
      case 'af': return 'Tik \'n boodskap...';
      case 'zu': return 'Thayipha umlayezo...';
      default: return 'Type a message...';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-3">
      <form onSubmit={handleSubmit} className="flex items-center space-x-3">
        <button
          type="button"
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Paperclip size={20} />
        </button>
        
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={getPlaceholder()}
            disabled={disabled}
            className="w-full px-4 py-2 bg-gray-100 rounded-full border-none outline-none focus:bg-white focus:ring-2 focus:ring-whatsapp-light transition-all disabled:opacity-50"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Smile size={18} />
          </button>
        </div>
        
        {message.trim() ? (
          <button
            type="submit"
            disabled={disabled}
            className="p-2 bg-whatsapp-light text-white rounded-full hover:bg-whatsapp-secondary transition-colors disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        ) : (
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Mic size={20} />
          </button>
        )}
      </form>
    </div>
  );
};

export default ChatInput;