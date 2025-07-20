import { Package } from '../types';

export const packages: Package[] = [
  {
    id: 'basic',
    package_code: 'basic',
    name: 'Farm Connect',
    speed: '10 Mbps',
    price: 15,
    price_display: 'R15/day',
    description: 'Perfect for WhatsApp, email, and basic browsing',
    features: [
      'WhatsApp & social media',
      'Email & basic browsing', 
      'Weather updates',
      'Banking apps',
      'No contract required'
    ],
    is_popular: false,
    is_active: true,
    sort_order: 1
  },
  {
    id: 'standard',
    package_code: 'standard',
    name: 'Family Plus',
    speed: '25 Mbps',
    price: 25,
    price_display: 'R25/day',
    description: 'Great for families - streaming and video calls',
    features: [
      'Everything in Farm Connect',
      'Video calls with family',
      'YouTube & Netflix',
      'Multiple devices',
      'Priority support'
    ],
    is_popular: true,
    is_active: true,
    sort_order: 2
  },
  {
    id: 'premium',
    package_code: 'premium',
    name: 'Business Pro',
    speed: '50 Mbps',
    price: 45,
    price_display: 'R45/day',
    description: 'For small businesses and heavy users',
    features: [
      'Everything in Family Plus',
      'Fast file uploads',
      'Video conferencing',
      'Cloud backup',
      '24/7 business support'
    ],
    is_popular: false,
    is_active: true,
    sort_order: 3
  }
];

export const competitors = [
  {
    name: 'Telkom',
    issues: ['Long contracts', 'High installation fees', 'Poor rural coverage']
  },
  {
    name: 'MTN',
    issues: ['Expensive data', 'Complex packages', 'Hidden costs']
  },
  {
    name: 'Vodacom', 
    issues: ['Contract lock-in', 'Poor customer service', 'Overpriced']
  }
];