export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'quick-reply' | 'location' | 'package' | 'image';
  options?: QuickReplyOption[];
  packageData?: Package;
  imageUrl?: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  description: string;
}

export interface QuickReplyOption {
  id: string;
  text: string;
  value: string;
  descriptionLines?: string[];
}

export interface Package {
  id: string;
  package_code: string;
  name: string;
  speed: string;
  price: number;
  price_display: string;
  description: string;
  features: string[];
  is_popular?: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface UserData {
  name?: string;
  phone?: string;
  language: 'en' | 'af' | 'zu';
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  selectedPackage?: Package;
  stage: 'awareness' | 'consideration' | 'decision' | 'retention' | 'advocacy';
  selectedServiceProviderId?: string;
}

export interface ChatState {
  messages: Message[];
  userData: UserData;
  isTyping: boolean;
  currentFlow: string;
}