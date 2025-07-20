import { Package } from '../types';

export const packages: Package[] = [
  {
    id: 'basic',
    name: 'Farm Connect',
    speed: '10 Mbps',
    price: 'R15/day',
    description: 'Perfect for WhatsApp, email, and basic browsing',
    features: [
      'WhatsApp & social media',
      'Email & basic browsing', 
      'Weather updates',
      'Banking apps',
      'No contract required'
    ]
  },
  {
    id: 'standard',
    name: 'Family Plus',
    speed: '25 Mbps',
    price: 'R25/day',
    description: 'Great for families - streaming and video calls',
    features: [
      'Everything in Farm Connect',
      'Video calls with family',
      'YouTube & Netflix',
      'Multiple devices',
      'Priority support'
    ],
    popular: true
  },
  {
    id: 'premium',
    name: 'Business Pro',
    speed: '50 Mbps',
    price: 'R45/day',
    description: 'For small businesses and heavy users',
    features: [
      'Everything in Family Plus',
      'Fast file uploads',
      'Video conferencing',
      'Cloud backup',
      '24/7 business support'
    ]
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