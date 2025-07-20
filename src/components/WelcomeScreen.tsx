import React from 'react';
import { MessageCircle, Wifi, Shield, Zap } from 'lucide-react';

interface WelcomeScreenProps {
  onStartChat: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartChat }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-whatsapp-primary via-whatsapp-secondary to-whatsapp-light flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-whatsapp-primary text-white p-6 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-12 h-12 bg-loop-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">L</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Loop ISP</h1>
          <p className="text-whatsapp-bg opacity-90">South Africa's Most Affordable Rural Internet</p>
        </div>

        {/* Features */}
        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Zap className="text-green-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">No Contracts</h3>
              <p className="text-sm text-gray-600">Pay only for what you use</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Wifi className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Fast & Reliable</h3>
              <p className="text-sm text-gray-600">Up to 50 Mbps speeds</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Shield className="text-purple-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Rural Focus</h3>
              <p className="text-sm text-gray-600">Built for farms & small towns</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-whatsapp-light bg-opacity-20 rounded-full flex items-center justify-center">
              <MessageCircle className="text-whatsapp-primary" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">WhatsApp Support</h3>
              <p className="text-sm text-gray-600">Get help in your language</p>
            </div>
          </div>
        </div>

        {/* Trust Signals */}
        <div className="px-6 pb-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-2">Trusted by</p>
            <p className="font-bold text-loop-primary text-lg">10,000+ Rural Families</p>
            <p className="text-xs text-gray-500 mt-1">Across South Africa</p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="p-6 pt-0">
          <button
            onClick={onStartChat}
            className="w-full bg-whatsapp-light hover:bg-whatsapp-secondary text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
          >
            <MessageCircle size={20} />
            <span>Start WhatsApp Chat</span>
          </button>
          
          <p className="text-xs text-gray-500 text-center mt-3">
            No signup required • Free consultation • Available in English, Afrikaans & isiZulu
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;