import React from 'react';
import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';

interface ChatHeaderProps {
  language: 'en' | 'af' | 'zu';
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ language }) => {
  const getTitle = () => {
    switch (language) {
      case 'af': return 'Loop ISP Hulp';
      case 'zu': return 'Loop ISP Usizo';
      default: return 'Loop ISP Support';
    }
  };

  const getStatus = () => {
    switch (language) {
      case 'af': return 'Aanlyn • Antwoord gewoonlik binne minute';
      case 'zu': return 'Ku-inthanethi • Iphendula ngokuvamile emaminithini';
      default: return 'Online • Typically replies within minutes';
    }
  };

  return (
    <div className="bg-whatsapp-primary text-white px-4 py-3 flex items-center justify-between shadow-lg">
      <div className="flex items-center space-x-3">
        <button className="p-1 hover:bg-whatsapp-secondary rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-loop-primary rounded-full flex items-center justify-center font-bold text-sm">
              L
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          
          <div>
            <h1 className="font-semibold text-sm">{getTitle()}</h1>
            <p className="text-xs text-green-200">{getStatus()}</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button className="p-2 hover:bg-whatsapp-secondary rounded-full transition-colors">
          <Video size={18} />
        </button>
        <button className="p-2 hover:bg-whatsapp-secondary rounded-full transition-colors">
          <Phone size={18} />
        </button>
        <button className="p-2 hover:bg-whatsapp-secondary rounded-full transition-colors">
          <MoreVertical size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;