import { useState, useCallback } from 'react';
import { ChatState, Message, UserData, QuickReplyOption } from '../types';
import { translations } from '../data/translations';
import { packages } from '../data/packages';
import { generateId } from '../utils/helpers';

const initialUserData: UserData = {
  language: 'en',
  stage: 'awareness'
};

const initialState: ChatState = {
  messages: [],
  userData: initialUserData,
  isTyping: false,
  currentFlow: 'welcome'
};

export const useChat = () => {
  const [state, setState] = useState<ChatState>(initialState);

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: generateId(),
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));
  }, []);

  const updateUserData = useCallback((updates: Partial<UserData>) => {
    setState(prev => ({
      ...prev,
      userData: { ...prev.userData, ...updates }
    }));
  }, []);

  const setTyping = useCallback((isTyping: boolean) => {
    setState(prev => ({ ...prev, isTyping }));
  }, []);

  const sendBotMessage = useCallback((text: string, options?: QuickReplyOption[], delay = 1000) => {
    setTyping(true);
    
    setTimeout(() => {
      setTyping(false);
      addMessage({
        text,
        sender: 'bot',
        type: options ? 'quick-reply' : 'text',
        options
      });
    }, delay);
  }, [addMessage, setTyping]);

  const handleUserMessage = useCallback((text: string, value?: string) => {
    addMessage({ text, sender: 'user', type: 'text' });
    
    const { language } = state.userData;
    const t = translations[language];

    // Handle different flows based on current state
    if (state.currentFlow === 'welcome') {
      if (value === 'language') {
        const langOptions: QuickReplyOption[] = [
          { id: 'en', text: t.english, value: 'en', emoji: '🇬🇧' },
          { id: 'af', text: t.afrikaans, value: 'af', emoji: '🇿🇦' },
          { id: 'zu', text: t.zulu, value: 'zu', emoji: '🇿🇦' }
        ];
        sendBotMessage(t.languagePrompt, langOptions);
        setState(prev => ({ ...prev, currentFlow: 'language-select' }));
      }
    } else if (state.currentFlow === 'language-select') {
      if (['en', 'af', 'zu'].includes(value || '')) {
        updateUserData({ language: value as 'en' | 'af' | 'zu' });
        const newT = translations[value as 'en' | 'af' | 'zu'];
        
        sendBotMessage(newT.intro, undefined, 800);
        
        setTimeout(() => {
          const mainOptions: QuickReplyOption[] = [
            { id: 'packages', text: newT.viewPackages, value: 'packages', emoji: '📦' },
            { id: 'coverage', text: newT.checkCoverage, value: 'coverage', emoji: '📍' },
            { id: 'compare', text: newT.compareProviders, value: 'compare', emoji: '⚖️' },
            { id: 'support', text: newT.getSupport, value: 'support', emoji: '🆘' }
          ];
          sendBotMessage(newT.howCanHelp, mainOptions);
        }, 2000);
        
        setState(prev => ({ ...prev, currentFlow: 'main-menu' }));
      }
    } else if (state.currentFlow === 'main-menu') {
      handleMainMenuSelection(value || '');
    } else if (state.currentFlow === 'coverage-check') {
      handleCoverageFlow(value || '');
    } else if (state.currentFlow === 'package-selection') {
      handlePackageSelection(value || '');
    }
  }, [state, addMessage, sendBotMessage, updateUserData]);

  const handleMainMenuSelection = useCallback((value: string) => {
    const { language } = state.userData;
    const t = translations[language];

    switch (value) {
      case 'packages':
        sendBotMessage(t.packageIntro);
        setTimeout(() => {
          packages.forEach((pkg, index) => {
            setTimeout(() => {
              addMessage({
                text: `${pkg.name} - ${pkg.speed}`,
                sender: 'bot',
                type: 'package',
                packageData: pkg
              });
            }, (index + 1) * 500);
          });
          
          setTimeout(() => {
            const packageOptions: QuickReplyOption[] = packages.map(pkg => ({
              id: pkg.id,
              text: pkg.name,
              value: pkg.id,
              emoji: pkg.is_popular ? '⭐' : '📦'
            }));
            sendBotMessage(t.selectPackage, packageOptions);
            setState(prev => ({ ...prev, currentFlow: 'package-selection' }));
          }, packages.length * 500 + 500);
        }, 1000);
        break;
        
      case 'coverage':
        const coverageOptions: QuickReplyOption[] = [
          { id: 'share-location', text: t.shareLocation, value: 'share-location', emoji: '📍' },
          { id: 'manual-location', text: t.enterManually, value: 'manual-location', emoji: '✍️' }
        ];
        sendBotMessage(t.coveragePrompt, coverageOptions);
        setState(prev => ({ ...prev, currentFlow: 'coverage-check' }));
        break;
        
      case 'compare':
        sendBotMessage("🏆 Here's why Loop ISP beats the competition:\n\n✅ No contracts (others lock you in)\n✅ No installation fees (others charge R500+)\n✅ True prepaid (pay only for what you use)\n✅ Rural focus (we actually care about farms)\n✅ WhatsApp support (no call centers!)");
        setTimeout(() => {
          const backOptions: QuickReplyOption[] = [
            { id: 'packages', text: t.viewPackages, value: 'packages', emoji: '📦' },
            { id: 'coverage', text: t.checkCoverage, value: 'coverage', emoji: '📍' }
          ];
          sendBotMessage("What would you like to do next?", backOptions);
        }, 2000);
        break;
        
      case 'support':
        sendBotMessage("🆘 I'm here to help! You can:\n\n• Ask me anything about our packages\n• Check if we cover your area\n• Get help with technical issues\n• Speak to a human agent\n\nWhat do you need help with?");
        break;
    }
  }, [state, sendBotMessage, addMessage]);

  const handleCoverageFlow = useCallback((value: string) => {
    const { language } = state.userData;
    const t = translations[language];

    if (value === 'share-location') {
      sendBotMessage(t.processingLocation);
      
      // Simulate location check
      setTimeout(() => {
        const isAvailable = Math.random() > 0.3; // 70% chance of coverage
        
        if (isAvailable) {
          sendBotMessage(t.coverageAvailable);
          setTimeout(() => {
            const signupOptions: QuickReplyOption[] = [
              { id: 'signup', text: t.signUp, value: 'signup', emoji: '🚀' },
              { id: 'packages', text: t.viewPackages, value: 'packages', emoji: '📦' }
            ];
            sendBotMessage("Ready to get connected?", signupOptions);
            setState(prev => ({ ...prev, currentFlow: 'main-menu' }));
          }, 1500);
        } else {
          sendBotMessage(t.coverageUnavailable);
          const notifyOptions: QuickReplyOption[] = [
            { id: 'notify', text: t.notifyMe, value: 'notify', emoji: '✅' },
            { id: 'no-notify', text: t.noThanks, value: 'no-notify', emoji: '❌' }
          ];
          setTimeout(() => {
            sendBotMessage("We're expanding fast!", notifyOptions);
          }, 1000);
        }
      }, 2000);
    }
  }, [state, sendBotMessage]);

  const handlePackageSelection = useCallback((value: string) => {
    const selectedPackage = packages.find(pkg => pkg.id === value);
    if (selectedPackage) {
      updateUserData({ selectedPackage });
      
      const { language } = state.userData;
      const t = translations[language];
      
      sendBotMessage(`Great choice! The ${selectedPackage.name} package is perfect for your needs.`);
      
      setTimeout(() => {
        const nextOptions: QuickReplyOption[] = [
          { id: 'signup', text: t.signUp, value: 'signup', emoji: '🚀' },
          { id: 'coverage', text: t.checkCoverage, value: 'coverage', emoji: '📍' },
          { id: 'more-info', text: t.moreInfo, value: 'more-info', emoji: 'ℹ️' }
        ];
        sendBotMessage("What would you like to do next?", nextOptions);
        setState(prev => ({ ...prev, currentFlow: 'main-menu' }));
      }, 1500);
    }
  }, [state, sendBotMessage, updateUserData]);

  const startChat = useCallback(() => {
    const t = translations[state.userData.language];
    
    setTimeout(() => {
      sendBotMessage(t.welcome, undefined, 500);
    }, 1000);
    
    setTimeout(() => {
      sendBotMessage(t.trustSignal, undefined, 300);
    }, 2500);
    
    setTimeout(() => {
      sendBotMessage(t.noBullshit, undefined, 300);
    }, 3500);
    
    setTimeout(() => {
      const startOptions: QuickReplyOption[] = [
        { id: 'start', text: "Let's get started! 🚀", value: 'language', emoji: '🚀' }
      ];
      sendBotMessage("Ready to get connected?", startOptions);
    }, 4500);
  }, [state.userData.language, sendBotMessage]);

  return {
    state,
    handleUserMessage,
    startChat,
    addMessage,
    updateUserData,
    setTyping
  };
};