import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle } from 'lucide-react';
import { reverseGeocode, getRandomTestCoordinate, isValidCoordinates, TEST_COORDINATES } from './services/geocoding';
import { 
  createCustomer, 
  checkCoverage, 
  CustomerData, 
  getActivePackages, 
  Package,
  logInteraction,
  trackJourneyStage,
  trackPackageSelection,
  findCoverageAreaByCoordinates,
  CoverageArea,
  getServiceProvidersForCoverageArea
} from './services/supabase';
import { ServiceProvider } from './types';
import MessageBubble from './components/MessageBubble';

interface UserData {
  preferred_language?: 'en' | 'af' | 'zu';
  selected_package?: string;
  selected_package_id?: string;
  selectedServiceProviderId?: string;
  selectedServiceProviderName?: string;
  gps_coordinates?: string;
  gps_location?: string;
  manual_location?: string;
  name?: string;
  phone_number?: string;
  consent?: boolean;
  coverage_available?: boolean;
  coverage_area_id?: string;
  customer_id?: string;
  session_id?: string;
  pending_interactions?: Array<{
    session_id: string;
    interaction_type: 'message' | 'quick_reply' | 'location_share' | 'package_selection' | 'consent' | 'coverage_check';
    message_text?: string;
    quick_reply_selected?: string;
    language_used: 'en' | 'af' | 'zu';
    metadata: any;
  }>;
}

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
  type?: 'text' | 'quick-reply';
  options?: QuickReplyOption[];
}

interface QuickReplyOption {
  id: string;
  text: string;
  value: string;
  emoji?: string;
  descriptionLines?: string[];
}

type FlowStep = 'welcome' | 'packages' | 'location' | 'provider_selection' | 'name' | 'phone' | 'consent' | 'complete';

type LocationStep = 'request' | 'processing' | 'area_confirmation' | 'coverage_check';

function App() {
  const [currentStep, setCurrentStep] = useState<FlowStep>('welcome');
  const [locationStep, setLocationStep] = useState<LocationStep>('request');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [userData, setUserData] = useState<UserData>({});
  const [packages, setPackages] = useState<Package[]>([]);
  const [foundCoverageArea, setFoundCoverageArea] = useState<CoverageArea | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialMessagesDisplayed = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Generate session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setUserData(prev => ({ ...prev, session_id: sessionId }));
    
    // Load packages
    loadPackages();
    
    // Start the welcome flow only once
    if (!initialMessagesDisplayed.current) {
      initialMessagesDisplayed.current = true;
      setTimeout(() => {
        showWelcomeMessage();
      }, 1000);
    }
  }, []);

  const loadPackages = async () => {
    try {
      const activePackages = await getActivePackages();
      setPackages(activePackages);
    } catch (error) {
      console.error('Error loading packages:', error);
      // Fallback packages for demo
      setPackages([
        {
          id: 'basic',
          package_code: 'basic',
          package_code: 'basic',
          name: 'Farm Connect',
          speed: '10 Mbps',
          price: 15,
          price_display: 'R15/day',
          description: 'Perfect for WhatsApp, email, and basic browsing',
          features: ['WhatsApp & social media', 'Email & basic browsing', 'Weather updates', 'Banking apps', 'No contract required'],
          is_popular: false,
          is_active: true,
          sort_order: 1
        },
        {
          id: 'standard',
          package_code: 'standard',
          package_code: 'standard',
          name: 'Family Plus',
          speed: '25 Mbps',
          price: 25,
          price_display: 'R25/day',
          description: 'Great for families - streaming and video calls',
          features: ['Everything in Farm Connect', 'Video calls with family', 'YouTube & Netflix', 'Multiple devices', 'Priority support'],
          is_popular: true,
          is_active: true,
          sort_order: 2
        },
        {
          id: 'premium',
          package_code: 'premium',
          package_code: 'premium',
          name: 'Business Pro',
          speed: '50 Mbps',
          price: 45,
          price_display: 'R45/day',
          description: 'For small businesses and heavy users',
          features: ['Everything in Family Plus', 'Fast file uploads', 'Video conferencing', 'Cloud backup', '24/7 business support'],
          is_popular: false,
          is_active: true,
          sort_order: 3
        }
      ]);
    }
  };

  const addMessage = (text: string, sender: 'bot' | 'user', options?: QuickReplyOption[]) => {
    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text,
      sender,
      timestamp: new Date(),
      type: options ? 'quick-reply' : 'text',
      options
    };
    setMessages(prev => [...prev, message]);
  };

  const showTyping = (duration: number = 1500): Promise<void> => {
    return new Promise((resolve) => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        resolve();
      }, duration);
    });
  };

  const showWelcomeMessage = async () => {
    await showTyping(1000);
    addMessage("👋 Hi there! Welcome to Loop ISP - South Africa's most affordable prepaid internet!", 'bot');
    
    await showTyping(1500);
    addMessage("Ready to get connected?", 'bot', [
      { id: 'start', text: "Let's get started! 🚀", value: 'start', emoji: '🚀' }
    ]);
  };

  const showPackageSelection = async () => {
    await showTyping(1000);
    addMessage("Here are our popular prepaid packages:", 'bot');
    
    const packageReplies: QuickReplyOption[] = packages.map(pkg => {
      console.log('Creating package reply for:', pkg.name);
      console.log('Package features:', pkg.features);
      console.log('Package price:', pkg.price_display);
      
      const descriptionLines = [
        pkg.price_display,
        ...pkg.features.slice(0, 3)
      ];
      
      console.log('Description lines:', descriptionLines);
      
      return {
        id: pkg.id,
        text: pkg.name,
        value: pkg.id,
        descriptionLines: descriptionLines
      };
    });
    
    console.log('Final packageReplies:', packageReplies);
    
    await showTyping(800);
    addMessage("Which package interests you most?", 'bot', packageReplies);
    
    // Debug log to check if descriptions are being passed
    console.log('Package replies with descriptions:', packageReplies);
  };

  const showLocationRequest = async () => {
    setCurrentStep('location');
    setLocationStep('request');
    
    await showTyping(800);
    addMessage("How would you like to share your location?", 'bot', [
      { id: 'gps', text: '📍 Share GPS Location', value: 'gps', emoji: '📍' },
      { id: 'manual', text: '✍️ Enter Location Manually', value: 'manual', emoji: '✍️' }
    ]);
  };

  const handleGPSLocation = async () => {
    setLocationStep('processing');
    
    try {
      await showTyping(1000);
      addMessage("📍 Accessing your GPS location...", 'bot');
      
      // Get actual GPS location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported by this browser'));
          return;
        }
        
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
      });
      
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      
      addMessage(`📍 Location shared: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, 'user');
      
      await showTyping(1500);
      addMessage("🔍 Checking coverage in your area...", 'bot');
      
      // Reverse geocode to get human-readable location
      const locationResult = await reverseGeocode(lat, lng);
      
      // Store GPS data
      setUserData(prev => ({
        ...prev,
        gps_coordinates: `${lat},${lng}`,
        gps_location: locationResult.formatted_address
      }));
      
      // Check coverage area using actual GPS coordinates
      const coverageResult = await findCoverageAreaByCoordinates(lat, lng);
      
      if (coverageResult.found && coverageResult.area) {
        setFoundCoverageArea(coverageResult.area);
        setUserData(prev => ({
          ...prev,
          coverage_area_id: coverageResult.area!.id,
          coverage_available: true
        }));
        
        await showTyping(1000);
        addMessage(`📍 Location: ${locationResult.formatted_address}`, 'bot');
        
        await showTyping(800);
        addMessage(`🎉 Great news! We have ${coverageResult.area.coverage_quality} coverage in the ${coverageResult.area.area_name} area.`, 'bot');
        
        // Proceed directly to service provider selection
        showServiceProviderSelection(coverageResult.area.id);
      } else {
        // No coverage found
        setUserData(prev => ({ ...prev, coverage_available: false }));
        
        await showTyping(1000);
        addMessage(`📍 Location: ${locationResult.formatted_address}`, 'bot');
        
        await showTyping(800);
        addMessage("😔 Sorry, service is not available in your area yet. We're expanding rapidly!", 'bot');
        
        await showTyping(1000);
        addMessage("Would you like us to notify you when we expand to your location?", 'bot', [
          { id: 'notify_yes', text: '✅ Yes, notify me', value: 'notify_yes', emoji: '✅' },
          { id: 'notify_no', text: '❌ No thanks', value: 'notify_no', emoji: '❌' }
        ]);
      }
    } catch (error) {
      console.error('GPS location error:', error);
      
      let errorMessage = "❌ Unable to access your GPS location. ";
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Please enable location permissions and try again.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage += "Location request timed out.";
            break;
        }
      } else {
        errorMessage += "Please try again or enter your location manually.";
      }
      
      await showTyping(1000);
      addMessage(errorMessage, 'bot', [
        { id: 'retry_gps', text: '🔄 Try GPS Again', value: 'gps', emoji: '🔄' },
        { id: 'manual_location', text: '✍️ Enter Manually', value: 'manual', emoji: '✍️' }
      ]);
      setLocationStep('request');
    }
  };

  const handleManualLocation = async () => {
    setLocationStep('processing');
    
    await showTyping(1000);
    addMessage("Please type your location (city, town, or area):", 'bot');
    
    // For demo, we'll simulate user input
    setTimeout(() => {
      const demoLocation = "Johannesburg";
      addMessage(demoLocation, 'user');
      processManualLocation(demoLocation);
    }, 2000);
  };

  const processManualLocation = async (location: string) => {
    await showTyping(1500);
    addMessage("🔍 Checking coverage in your area...", 'bot');
    
    // Store manual location
    setUserData(prev => ({
      ...prev,
      manual_location: location
    }));
    
    try {
      // Check coverage using manual location
      const coverageResult = await checkCoverage(undefined, location);
      
      if (coverageResult.available && coverageResult.area) {
        setFoundCoverageArea(coverageResult.area);
        setUserData(prev => ({
          ...prev,
          coverage_area_id: coverageResult.area!.id,
          coverage_available: true
        }));
        
        await showTyping(1000);
        addMessage(`🎉 Great news! We have ${coverageResult.area.coverage_quality} coverage in the ${coverageResult.area.area_name} area.`, 'bot');
        
        // Proceed directly to service provider selection
        showServiceProviderSelection(coverageResult.area.id);
      } else {
        // No coverage found
        setUserData(prev => ({ ...prev, coverage_available: false }));
        
        await showTyping(1000);
        addMessage("😔 Sorry, service is not available in your area yet. We're expanding rapidly!", 'bot');
        
        await showTyping(1000);
        addMessage("Would you like us to notify you when we expand to your location?", 'bot', [
          { id: 'notify_yes', text: '✅ Yes, notify me', value: 'notify_yes', emoji: '✅' },
          { id: 'notify_no', text: '❌ No thanks', value: 'notify_no', emoji: '❌' }
        ]);
      }
    } catch (error) {
      console.error('Manual location check error:', error);
      
      await showTyping(1000);
      addMessage("❌ Sorry, I had trouble checking coverage for that location. Please try again.", 'bot', [
        { id: 'retry_manual', text: '🔄 Try Again', value: 'manual', emoji: '🔄' },
        { id: 'try_gps', text: '📍 Use GPS Instead', value: 'gps', emoji: '📍' }
      ]);
      setLocationStep('request');
    }
  };

  const showServiceProviderSelection = async (coverageAreaId: string) => {
    setCurrentStep('provider_selection');
    
    try {
      // Fetch available service providers for this coverage area
      const providers = await getServiceProvidersForCoverageArea(coverageAreaId);
      
      if (providers.length > 0) {
        await showTyping(800);
        addMessage("Select from available providers in your area:", 'bot');
        
        const providerReplies: QuickReplyOption[] = providers.map(provider => ({
          id: provider.id,
          text: provider.name,
          value: provider.id,
          emoji: '🌐',
          descriptionLines: [provider.description]
        }));
        
        await showTyping(500);
        addMessage("Choose your preferred provider:", 'bot', providerReplies);
      } else {
        // Fallback if no providers found in database
        await showTyping(800);
        addMessage("Select from available providers in your area:", 'bot');
        
        await showTyping(500);
        addMessage("Choose your preferred provider:", 'bot', [
          { 
            id: 'openserve', 
            text: 'Openserve', 
            value: 'openserve', 
            emoji: '🌐',
            descriptionLines: ["Telkom's fibre network with wide coverage"]
          },
          { 
            id: 'vumatel', 
            text: 'Vumatel', 
            value: 'vumatel', 
            emoji: '🌐',
            descriptionLines: ["Premium fibre infrastructure for residential areas"]
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching service providers:', error);
      
      await showTyping(800);
      addMessage("Select from available providers in your area:", 'bot');
      
      await showTyping(500);
      addMessage("Choose your preferred provider:", 'bot', [
        { 
          id: 'openserve', 
          text: 'Openserve', 
          value: 'openserve', 
          emoji: '🌐',
          descriptionLines: ["Telkom's fibre network with wide coverage"]
        },
        { 
          id: 'vumatel', 
          text: 'Vumatel', 
          value: 'vumatel', 
          emoji: '🌐',
          descriptionLines: ["Premium fibre infrastructure for residential areas"]
        }
      ]);
    }
  };


  const showNameRequest = async () => {
    setCurrentStep('name');
    
    await showTyping(1000);
    addMessage("Excellent! Now I need a few details to set up your account.", 'bot');
    
    await showTyping(800);
    addMessage("What's your full name?", 'bot');
  };

  const showPhoneRequest = async () => {
    setCurrentStep('phone');
    
    await showTyping(1000);
    addMessage(`Thanks ${userData.name}! What's your phone number?`, 'bot');
  };

  const showConsentRequest = async () => {
    setCurrentStep('consent');
    
    await showTyping(1000);
    addMessage("Almost done! I need your consent to process your information and set up your internet service.", 'bot');
    
    await showTyping(800);
    addMessage("Do you agree to our terms and conditions?", 'bot', [
      { id: 'consent_yes', text: '✅ Yes, I agree', value: 'yes', emoji: '✅' },
      { id: 'consent_no', text: '❌ No, I don\'t agree', value: 'no', emoji: '❌' }
    ]);
  };

  const handleConsent = async (agreed: boolean) => {
    if (agreed) {
      setUserData(prev => ({ ...prev, consent: true }));
      
      await showTyping(1000);
      addMessage("Perfect! Let me set up your account now...", 'bot');
      
      await showTyping(2000);
      
      // Save to database
      try {
        await saveCustomerToSupabase();
        showCompletionMessage();
      } catch (error) {
        console.error('Error saving customer:', error);
        addMessage("❌ Sorry, there was an error setting up your account. Please try again later.", 'bot');
      }
    } else {
      await showTyping(800);
      addMessage("I understand. Without consent, I can't proceed with setting up your account. Feel free to come back anytime!", 'bot');
    }
  };

  const saveCustomerToSupabase = async () => {
    const selectedPackage = packages.find(pkg => pkg.id === userData.selected_package_id);
    
    const customerData: CustomerData = {
      name: userData.name || '',
      phone_number: userData.phone_number || '',
      preferred_language: userData.preferred_language || 'en',
      gps_coordinates: userData.gps_coordinates,
      gps_location: userData.gps_location,
      manual_location: userData.manual_location,
      coverage_available: userData.coverage_available || false,
      coverage_area_id: userData.coverage_area_id,
      status: 'pending',
      current_journey_stage: 'decision',
      selected_package_id: userData.selected_package_id,
      selected_package_code: selectedPackage?.package_code,
      selected_service_provider_id: userData.selectedServiceProviderId,
      consent_given: true,
      consent_timestamp: new Date().toISOString(),
      acquisition_source: 'whatsapp_onboarding',
      system_input_process: 'bolt'
    };

    const customer = await createCustomer(customerData);
    setUserData(prev => ({ ...prev, customer_id: customer.id }));
    
    // Log final interaction
    if (userData.session_id) {
      await logInteraction({
        customer_id: customer.id,
        session_id: userData.session_id,
        interaction_type: 'consent',
        message_text: 'Customer provided consent and completed onboarding',
        language_used: userData.preferred_language || 'en',
        metadata: {
          selected_package: selectedPackage?.name,
          selected_service_provider: userData.selectedServiceProviderId,
          coverage_area: userData.coverage_area_id,
          location_method: userData.gps_coordinates ? 'gps' : 'manual'
        },
        system_input_process: 'bolt'
      });
    }
    
    // Track journey completion
    await trackJourneyStage(customer.id, 'consideration', 'decision', 'onboarding_completed', {
      package_selected: selectedPackage?.name,
      service_provider_selected: userData.selectedServiceProviderId
    });
  };

  const showCompletionMessage = async () => {
    setCurrentStep('complete');
    
    const selectedPackage = packages.find(pkg => pkg.id === userData.selected_package_id);
    
    await showTyping(1000);
    addMessage("🎉 Congratulations! Your Loop ISP account has been created successfully!", 'bot');
    
    await showTyping(1000);
    addMessage(`📦 Package: ${selectedPackage?.name} (${selectedPackage?.price_display})`, 'bot');
    
    if (userData.selectedServiceProviderName) {
      await showTyping(800);
      addMessage(`🌐 Service Provider: ${userData.selectedServiceProviderName}`, 'bot');
    }
    
    await showTyping(1000);
    addMessage("📱 You'll receive an SMS with activation instructions within 24 hours.", 'bot');
    
    await showTyping(800);
    addMessage("Welcome to the Loop ISP family! 🚀", 'bot');
  };

  const handleQuickReply = async (text: string, value: string) => {
    addMessage(text, 'user');
    
    if (currentStep === 'welcome' && value === 'start') {
      setUserData(prev => ({ ...prev, preferred_language: 'en' }));
      showPackageSelection();
    } else if (currentStep === 'welcome' && packages.length > 0 && packages.some(pkg => pkg.id === value)) {
      const selectedPackage = packages.find(pkg => pkg.id === value);
      setUserData(prev => ({ 
        ...prev, 
        selected_package: selectedPackage?.name,
        selected_package_id: selectedPackage?.id 
      }));
      
      showLocationRequest();
    } else if (currentStep === 'location') {
      if (value === 'gps') {
        handleGPSLocation();
      } else if (value === 'manual') {
        handleManualLocation();
      } else if (value === 'retry_gps') {
        handleGPSLocation();
      } else if (value === 'retry_manual') {
        handleManualLocation();
      } else if (value === 'try_gps') {
        handleGPSLocation();
      } else if (value === 'notify_yes' || value === 'notify_no') {
        await showTyping(1000);
        if (value === 'notify_yes') {
          addMessage("✅ Thank you! We'll notify you as soon as service becomes available in your area.", 'bot');
        } else {
          addMessage("👍 No problem! Feel free to check back anytime.", 'bot');
        }
        
        await showTyping(1000);
        addMessage("Thanks for your interest in Loop ISP! 🚀", 'bot');
      }
    } else if (currentStep === 'provider_selection') {
      // Handle service provider selection
      // Find the provider name from the text that was clicked
      setUserData(prev => ({ 
        ...prev, 
        selectedServiceProviderId: value,
        selectedServiceProviderName: text // Store the display name
      }));
      
      // Proceed directly to name request
      showNameRequest();
    } else if (currentStep === 'consent') {
      if (value === 'yes') {
        handleConsent(true);
      } else if (value === 'no') {
        handleConsent(false);
      }
    }
  };

  const handleUserInput = (input: string) => {
    addMessage(input, 'user');
    
    if (currentStep === 'location' && locationStep === 'processing') {
      processManualLocation(input);
    } else if (currentStep === 'name') {
      setUserData(prev => ({ ...prev, name: input }));
      showPhoneRequest();
    } else if (currentStep === 'phone') {
      setUserData(prev => ({ ...prev, phone_number: input }));
      showConsentRequest();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Chat Header */}
        <div className="bg-whatsapp-primary text-white p-4 flex items-center space-x-3">
          <img 
            src="https://static.wixstatic.com/media/1420b0_7ffb91f8f06e47f08a3e2f74031443e8~mv2.png/v1/fill/w_600,h_413,al_c,lg_1,q_85,enc_avif,quality_auto/Loop%20Logo%20no%20backgtround.png" 
            alt="Loop ISP Logo" 
            className="w-10 h-10 object-contain"
          />
          <div>
            <h1 className="font-semibold">Loop ISP</h1>
            <p className="text-sm opacity-90">Online</p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="h-[31.2rem] overflow-y-auto p-4 space-y-4 bg-whatsapp-bg">
          {messages.map((message) => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              onQuickReply={handleQuickReply} 
            />
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-whatsapp-received px-4 py-3 rounded-lg rounded-bl-none shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          {(currentStep === 'name' || currentStep === 'phone') ? (
            <form onSubmit={(e) => {
              e.preventDefault();
              const input = e.currentTarget.elements.namedItem('userInput') as HTMLInputElement;
              if (input.value.trim()) {
                handleUserInput(input.value.trim());
                input.value = '';
              }
            }} className="flex items-center space-x-2">
              <input
                name="userInput"
                type="text"
                placeholder={currentStep === 'name' ? 'Enter your full name...' : 'Enter your phone number...'}
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 outline-none focus:bg-white focus:ring-2 focus:ring-whatsapp-light"
                autoFocus
              />
              <button 
                type="submit"
                className="p-2 bg-whatsapp-light text-white rounded-full hover:bg-whatsapp-secondary transition-colors"
              >
                <MessageCircle size={18} />
              </button>
            </form>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-100 rounded-full px-4 py-2">
                <span className="text-gray-500 text-sm">WhatsApp chat simulation</span>
              </div>
              <button className="p-2 bg-whatsapp-light text-white rounded-full hover:bg-whatsapp-secondary transition-colors">
                <MessageCircle size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;