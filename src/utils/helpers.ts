export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export const simulateTypingDelay = (text: string): number => {
  // Simulate realistic typing speed (40-60 WPM)
  const wordsPerMinute = 50;
  const words = text.split(' ').length;
  const baseDelay = (words / wordsPerMinute) * 60 * 1000;
  
  // Add some randomness and ensure minimum delay
  return Math.max(800, baseDelay + Math.random() * 500);
};

export const detectLanguage = (text: string): 'en' | 'af' | 'zu' | null => {
  const afrikaans = ['hallo', 'dankie', 'asseblief', 'goed', 'ja', 'nee'];
  const zulu = ['sawubona', 'ngiyabonga', 'yebo', 'cha', 'kunjani'];
  
  const lowerText = text.toLowerCase();
  
  if (afrikaans.some(word => lowerText.includes(word))) return 'af';
  if (zulu.some(word => lowerText.includes(word))) return 'zu';
  
  return null;
};