'use client';
import { useState, useEffect } from 'react';
import axios from '@/utils/axiosInstance';
import { getToken, getUser } from '@/utils/sessionStorage';



export default function ConfigurationPage({ adminId: propAdminId }) {
  // ✅ Get adminId from prop OR from logged-in user's session
  const [adminId, setAdminId] = useState(null);

  useEffect(() => {
    // If adminId not provided as prop, get from logged-in user
    if (propAdminId) {
      setAdminId(propAdminId);
      console.log('✅ Using admin_id from prop:', propAdminId);
    } else {
      const user = getUser();
      if (user && user.admin_id) {
        setAdminId(user.admin_id);
        console.log('✅ Using admin_id from logged-in user:', user.admin_id);
      } else {
        console.error('❌ No admin_id found in user session');
      }
    }
  }, [propAdminId]);

  const [selectedLanguages, setSelectedLanguages] = useState(['en']); // Max 2 languages
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [testText, setTestText] = useState('Ticket number P-101 please come to counter 5');

  // ChatterBox AI Voice states
  const [chatterboxVoices, setChatterboxVoices] = useState([]);
  const [selectedChatterboxVoice, setSelectedChatterboxVoice] = useState('child');  // ✅ Default to 'child' for child boy voice
  const [chatterboxServiceStatus, setChatterboxServiceStatus] = useState('unknown');
  const [uploadingVoice, setUploadingVoice] = useState(false);
  const [synthesizing, setSynthesizing] = useState(false);

  // Default ticket layout definition
  const DEFAULT_LAYOUT = [
    { id: 'logo', type: 'logo', label: 'Company Logo', visible: true },
    { id: 'company_name', type: 'text', label: 'Company Name', value: '', visible: true, isHeading: true },
    { id: 'service_name', type: 'service', label: 'Service Type', visible: true },
    { id: 'customer_info', type: 'customer_info', label: 'Customer Info', visible: true },
    { id: 'ticket_number', type: 'ticket_no', label: 'Ticket Number', visible: true },
    { id: 'waiting_message', type: 'text', label: 'Waiting Message', value: 'Please wait. We will serve you shortly.', visible: true },
    { id: 'date_time', type: 'date_time', label: 'Date & Time', visible: true },
    { id: 'thank_you_text', type: 'text', label: 'Thank You Message', value: 'Thank you for your service!', visible: true },
    { id: 'footer_text', type: 'text', label: 'Footer / Sponsor Text', value: 'Designed by techsolutionor.com', visible: true }
  ];

  // Tabs state
  const [activeTab, setActiveTab] = useState('voice'); // 'voice' or 'ticket'

  // Ticket settings states
  const [licenseData, setLicenseData] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [ticketWaitingMessage, setTicketWaitingMessage] = useState('Please wait. We will serve you shortly.');
  const [ticketThankYouText, setTicketThankYouText] = useState('Thank you for your service!');
  const [ticketFooterText, setTicketFooterText] = useState('Designed by techsolutionor.com');
  const [layout, setLayout] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Logo upload state
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [updatingTicket, setUpdatingTicket] = useState(false);

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = getToken();
    return {
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    // Only load settings when adminId is available
    if (adminId) {
      // Load settings from database first, then fallback to localStorage
      loadSettings();

      // Check ChatterBox service status and load voices
      checkChatterboxService();

      // Load license/ticket customization settings
      loadLicenseData();
    }
  }, [adminId]);

  const loadLicenseData = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/license/admin-license/${adminId}`, {
        headers: getAuthHeaders()
      });
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        setLicenseData(data);
        setCompanyName(data.company_name || '');
        setCompanyLogo(data.company_logo || '');

        const wMsg = data.ticket_waiting_message || 'Please wait. We will serve you shortly.';
        const tText = data.ticket_thank_you_text || 'Thank you for your service!';
        const fText = data.ticket_footer_text || 'Designed by techsolutionor.com';

        setTicketWaitingMessage(wMsg);
        setTicketThankYouText(tText);
        setTicketFooterText(fText);

        // Load or initialize layout
        let loadedLayout = null;
        if (data.ticket_layout) {
          try {
            loadedLayout = JSON.parse(data.ticket_layout);

            // Check if loaded layout array is valid and not empty
            if (Array.isArray(loadedLayout) && loadedLayout.length > 0) {
              // Ensure all default layout items exist in the parsed layout
              const loadedIds = loadedLayout.map(item => item.id);

              // Map through default items and insert if missing
              DEFAULT_LAYOUT.forEach(defaultItem => {
                if (!loadedIds.includes(defaultItem.id)) {
                  // Fallback values for static fields
                  if (defaultItem.id === 'company_name') defaultItem.value = data.company_name || '';
                  if (defaultItem.id === 'waiting_message') defaultItem.value = wMsg;
                  if (defaultItem.id === 'thank_you_text') defaultItem.value = tText;
                  if (defaultItem.id === 'footer_text') defaultItem.value = fText;

                  loadedLayout.push(defaultItem);
                }
              });
            } else {
              loadedLayout = null;
            }
          } catch (e) {
            console.error('Error parsing ticket_layout JSON:', e);
            loadedLayout = null;
          }
        }

        if (!loadedLayout) {
          // Initialize default layout with current database field values
          loadedLayout = DEFAULT_LAYOUT.map(item => {
            if (item.id === 'company_name') return { ...item, value: data.company_name || '' };
            if (item.id === 'waiting_message') return { ...item, value: wMsg };
            if (item.id === 'thank_you_text') return { ...item, value: tText };
            if (item.id === 'footer_text') return { ...item, value: fText };
            return item;
          });
        }

        setLayout(loadedLayout);
      }
    } catch (error) {
      console.error('Error loading license data:', error);
    }
  };

  // Reordering and field modification helper methods
  const updateLayoutItemValue = (id, newValue) => {
    const updated = layout.map(item => {
      if (item.id === id) {
        return { ...item, value: newValue };
      }
      return item;
    });
    setLayout(updated);

    // Sync individual states if they are standard fields
    if (id === 'company_name') setCompanyName(newValue);
    if (id === 'waiting_message') setTicketWaitingMessage(newValue);
    if (id === 'thank_you_text') setTicketThankYouText(newValue);
    if (id === 'footer_text') setTicketFooterText(newValue);
  };

  const updateLayoutItemLabel = (id, newLabel) => {
    const updated = layout.map(item => {
      if (item.id === id) {
        return { ...item, label: newLabel };
      }
      return item;
    });
    setLayout(updated);
  };

  const toggleLayoutItemVisibility = (id) => {
    const updated = layout.map(item => {
      if (item.id === id) {
        return { ...item, visible: !item.visible };
      }
      return item;
    });
    setLayout(updated);
  };

  const moveItem = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= layout.length) return;

    const updated = [...layout];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setLayout(updated);
  };

  const addCustomField = () => {
    const newField = {
      id: `custom_${Date.now()}`,
      type: 'custom',
      label: 'Custom Text Field',
      value: 'Custom Message',
      visible: true
    };
    setLayout([...layout, newField]);
  };

  const deleteCustomField = (id) => {
    const updated = layout.filter(item => item.id !== id);
    setLayout(updated);
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, index) => {
    // Only allow drag if it started from the drag-handle
    if (!e.target.closest('.drag-handle')) {
      e.preventDefault();
      return;
    }
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updatedLayout = [...layout];
    const draggedItem = updatedLayout[draggedIndex];
    updatedLayout.splice(draggedIndex, 1);
    updatedLayout.splice(index, 0, draggedItem);

    setDraggedIndex(index);
    setLayout(updatedLayout);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    setLogoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload immediately
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('adminId', adminId);
      formData.append('company_logo', file);

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/license/upload-logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...getAuthHeaders()
        }
      });

      if (response.data.success) {
        setCompanyLogo(response.data.data.company_logo);
        alert('✅ Logo uploaded and saved successfully!');
      } else {
        alert('❌ Logo upload failed: ' + response.data.message);
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      alert('❌ Logo upload failed: ' + error.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSaveTicketSettings = async () => {
    if (!adminId) {
      alert('❌ Error: No admin ID found. Cannot save settings.');
      return;
    }

    setUpdatingTicket(true);
    try {
      const payload = {
        company_name: companyName,
        ticket_waiting_message: ticketWaitingMessage,
        ticket_thank_you_text: ticketThankYouText,
        ticket_footer_text: ticketFooterText,
        ticket_layout: JSON.stringify(layout)
      };

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/license/admin-license/${adminId}/ticket-settings`,
        payload,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        alert('✅ Ticket print settings saved successfully!');
        loadLicenseData();
      } else {
        alert('❌ Save failed: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error saving ticket settings:', error);
      alert('❌ Save failed: ' + error.message);
    } finally {
      setUpdatingTicket(false);
    }
  };

  const loadSettings = async () => {
    try {
      // ✅ Always require adminId - user must belong to an admin
      if (!adminId) {
        console.warn('⚠️ Waiting for adminId to load settings...');
        return;
      }

      console.log('📥 Loading voice settings for admin_id:', adminId);

      // Try to load from database with adminId
      const url = `${process.env.NEXT_PUBLIC_API_URL}/voices/settings?adminId=${adminId}`;

      const response = await axios.get(url, {
        headers: getAuthHeaders()
      });
      if (response.data.success && response.data.settings) {
        const settings = response.data.settings;
        const languages = settings.languages ? JSON.parse(settings.languages) : ['en'];
        setSelectedLanguages(languages);
        setSpeechRate(settings.speech_rate || 0.9);
        setSpeechPitch(settings.speech_pitch || 1.0);
        // Load voice_type directly from database
        setSelectedChatterboxVoice(settings.voice_type || 'child');
        console.log('📥 Loaded voice_type from database:', settings.voice_type);

        // Also save to localStorage for offline access
        localStorage.setItem('tts_settings', JSON.stringify({
          selectedLanguages: languages,
          speechRate: settings.speech_rate,
          speechPitch: settings.speech_pitch,
          selectedChatterboxVoice: settings.voice_type || 'child',
          useAI: true
        }));

        console.log('✅ Settings loaded from database:', settings);
      }
    } catch (error) {
      console.warn('⚠️ Could not load from database, using localStorage:', error.message);
      // Fallback to localStorage
      const saved = localStorage.getItem('tts_settings');
      if (saved) {
        const settings = JSON.parse(saved);
        setSelectedLanguages(settings.selectedLanguages || ['en']);
        setSpeechRate(settings.speechRate || 0.9);
        setSpeechPitch(settings.speechPitch || 1.0);
        // Load voice directly from localStorage
        setSelectedChatterboxVoice(settings.selectedChatterboxVoice || 'child');
        console.log('📥 Loaded voice_type from localStorage:', settings.selectedChatterboxVoice);
      }
    }
  };

  const checkChatterboxService = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/voices/health`);
      if (response.data.success) {
        setChatterboxServiceStatus('online');
        loadChatterboxVoices();
      } else {
        setChatterboxServiceStatus('offline');
      }
    } catch (error) {
      setChatterboxServiceStatus('offline');
    }
  };

  const loadChatterboxVoices = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/voices/list`);
      console.log('✅ Loaded voices from Python service:', response.data);
      if (response.data.success && response.data.data) {
        const voicesData = response.data.data;

        // Filter to only use voices with clean IDs (male, female, child)
        const cleanVoices = voicesData.filter(voice =>
          ['male', 'female', 'child'].includes(voice.id)
        );

        setChatterboxVoices(cleanVoices);
        console.log(`🎤 ${cleanVoices.length} voice(s) loaded (filtered for clean IDs only)`);
      }
    } catch (error) {
      console.error('❌ Failed to load ChatterBox voices:', error);
      // Set fallback voices if service is down
      setChatterboxVoices([
        { id: 'male', name: '👨 Male Voice', type: 'male' },
        { id: 'female', name: '👩 Female Voice', type: 'female' },
        { id: 'child', name: '👶 Child Voice', type: 'child' }
      ]);
    }
  };

  // Handle language selection (max 2)
  const handleLanguageToggle = (langCode) => {
    setSelectedLanguages(prev => {
      if (prev.includes(langCode)) {
        // Remove if already selected
        return prev.filter(l => l !== langCode);
      } else if (prev.length < 2) {
        // Add if less than 2 selected
        return [...prev, langCode];
      } else {
        // Replace first language if 2 already selected
        return [prev[1], langCode];
      }
    });
  };

  // Translate text to different languages
  const translateText = (text, langCode) => {
    // Parse ticket and counter from text
    const ticketMatch = text.match(/P-(\d+)|number\s+(\d+)/i);
    const counterMatch = text.match(/counter\s+(\d+)/i);

    const ticketNum = ticketMatch ? (ticketMatch[1] || ticketMatch[2]) : '101';
    const counterNum = counterMatch ? counterMatch[1] : '5';

    const translations = {
      'en': {
        text: `Ticket number ${ticketNum}\nPlease come to counter number ${counterNum}`
      },
      'ar-ae': {
        text: `التذكره رقم بي -${ticketNum}\nالذهاب إلى الكونتر رقم ${counterNum}`
      },
      'ar': {
        text: `تذكرة رقم ${ticketNum}\nالرجاء الذهاب لكونتر رقم ${counterNum}`
      },
      'ur': {
        text: `ٹکٹ نمبر ${ticketNum}\nبراہ کرم کاؤنٹر نمبر ${counterNum} پر تشریف لے جائیں`
      },
      'hi': {
        text: `टिकट नंबर ${ticketNum}\nकृपया काउंटर नंबर ${counterNum} पर जाएं`
      },
      'es': {
        text: `Número de ticket ${ticketNum}\nPor favor vaya al mostrador número ${counterNum}`
      }
    };

    return (translations[langCode] || translations['en']).text;
  };

  const handleVoiceUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingVoice(true);
    try {
      const formData = new FormData();
      formData.append('voice', file);
      formData.append('name', file.name);

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/voices/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...getAuthHeaders()
        }
      });

      if (response.data.success) {
        alert('Voice sample uploaded successfully!');
        loadChatterboxVoices();
      }
    } catch (error) {
      alert('Failed to upload voice sample: ' + error.message);
    } finally {
      setUploadingVoice(false);
    }
  };

  const handleUpdateSettings = async () => {
    // ✅ Validate adminId before saving
    if (!adminId) {
      alert('❌ Error: No admin ID found. Cannot save settings.');
      return;
    }

    const settings = {
      selectedLanguages,
      speechRate,
      speechPitch,
      selectedChatterboxVoice,
      useAI: true // Always use AI voices
    };

    try {
      // Save to database with admin_id (always required)
      const payload = {
        voice_type: selectedChatterboxVoice,
        languages: JSON.stringify(selectedLanguages), // Save as JSON array
        speech_rate: speechRate,
        speech_pitch: speechPitch,
        admin_id: adminId // ✅ Always include adminId
      };

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/voices/settings`, payload, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        // Also save to localStorage for offline access
        localStorage.setItem('tts_settings', JSON.stringify(settings));
        console.log('✅ Settings saved to database and localStorage');

        // 🔔 Broadcast settings update to ticket_info page
        try {
          const voiceSettingsChannel = new BroadcastChannel('voice-settings-update');
          voiceSettingsChannel.postMessage({
            updated: true,
            voice_type: selectedChatterboxVoice,
            languages: selectedLanguages,
            timestamp: Date.now()
          });
          voiceSettingsChannel.close();
          console.log('📢 Broadcasted voice settings update to ticket_info page');
        } catch (broadcastError) {
          console.warn('⚠️ Could not broadcast settings update:', broadcastError);
        }

        alert('✅ Settings saved successfully to database!');
      } else {
        throw new Error(response.data.message || 'Failed to save');
      }
    } catch (error) {
      console.error('❌ Error saving to database:', error);
      // Fallback: save to localStorage only
      localStorage.setItem('tts_settings', JSON.stringify(settings));
      alert('⚠️ Settings saved to browser only (database error: ' + error.message + ')');
    }
  };

  const handleTestVoice = async () => {
    if (chatterboxServiceStatus !== 'online') {
      alert('⚠️ ChatterBox AI service is offline! Please start the Python service.');
      return;
    }

    console.log('🎯 Starting voice test with:', {
      selectedLanguages,
      testText,
      speechRate,
      speechPitch,
      selectedChatterboxVoice
    });

    console.log('🔍 DEBUG - Current state selectedChatterboxVoice:', selectedChatterboxVoice);
    console.log('🔍 DEBUG - Type:', typeof selectedChatterboxVoice);
    console.log('🔍 DEBUG - Is empty?', !selectedChatterboxVoice);
    console.log('🔍 DEBUG - Is default?', selectedChatterboxVoice === 'default');

    if (selectedLanguages.length === 0) {
      alert('⚠️ Please select at least one language!');
      return;
    }

    setSynthesizing(true);
    try {
      // Test all selected languages sequentially
      for (let i = 0; i < selectedLanguages.length; i++) {
        const lang = selectedLanguages[i];
        const translatedText = translateText(testText, lang);

        console.log(`\n📢 Testing Box ${i + 1}/${selectedLanguages.length}:`);
        console.log(`   Language: ${lang}`);
        console.log(`   Text: ${translatedText}`);
        console.log(`   Voice: ${selectedChatterboxVoice}`);
        console.log(`   Rate: ${speechRate}, Pitch: ${speechPitch}`);

        console.log(`🌐 Making API request for Box ${i + 1}...`);
        console.log(`🎤 SENDING TO API - Voice Type: ${selectedChatterboxVoice}`);

        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/voices/synthesize`, {
          text: translatedText,
          language: lang,
          speed: speechRate,
          pitch: speechPitch,
          voice_type: selectedChatterboxVoice || 'child'  // Send selected voice directly
        }).catch(err => {
          console.error(`❌ Box ${i + 1} API request failed:`, err);
          throw err;
        });

        console.log(`✅ Box ${i + 1} synthesis response:`, response.data);

        if (response.data.success && response.data.audioUrl) {
          console.log(`🔊 Box ${i + 1} - Playing audio from:`, response.data.audioUrl);
          const audio = new Audio(response.data.audioUrl);
          audio.volume = 1.0;

          // Wait for audio to finish before next language
          await new Promise((resolve, reject) => {
            audio.onplay = () => console.log(`▶️ Box ${i + 1} (${lang}) - Playback started`);
            audio.onended = () => {
              console.log(`✅ Box ${i + 1} (${lang}) - Playback completed`);
              resolve();
            };
            audio.onerror = (e) => {
              console.error(`❌ Box ${i + 1} audio error:`, e);
              reject(e);
            };

            // Start playback
            audio.play().catch(err => {
              console.error(`❌ Box ${i + 1} play() failed:`, err);
              reject(err);
            });
          });

          // Pause between languages (200ms for smooth transition)
          if (i < selectedLanguages.length - 1) {
            console.log(`⏸️ Pausing 200ms before Box ${i + 2}...`);
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        } else {
          console.error(`❌ Box ${i + 1} synthesis failed:`, response.data);
          throw new Error(response.data.message || 'Synthesis failed');
        }
      }

      console.log('🎉 All voice tests completed successfully!');
      alert(`✅ Voice test successful!\n\nTested ${selectedLanguages.length} language(s):\n${selectedLanguages.map((l, i) => `${i + 1}. Box ${i + 1}: ${l}`).join('\n')}`);
    } catch (error) {
      console.error('❌ Voice synthesis error:', error);
      console.error('Error details:', error.response?.data);
      const errorMsg = error.response?.data?.message || error.message;
      alert(`❌ Voice test failed!\n\nError: ${errorMsg}\n\nCheck browser console for details.`);
    } finally {
      setSynthesizing(false);
      console.log('🏁 Voice test ended');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Configuration Settings</h1>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6 max-w-3xl">
        <button
          onClick={() => setActiveTab('voice')}
          className={`py-3 px-6 font-semibold text-sm transition-all border-b-2 outline-none ${activeTab === 'voice'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          🎙️ Announcement Settings
        </button>
        <button
          onClick={() => setActiveTab('ticket')}
          className={`py-3 px-6 font-semibold text-sm transition-all border-b-2 outline-none ${activeTab === 'ticket'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          🎫 Ticket Print Settings
        </button>
      </div>

      {/* Loading state while adminId is being fetched */}
      {!adminId && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 md:p-6 max-w-3xl">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
            <p className="text-yellow-800 font-medium text-sm md:text-base">Loading admin configuration...</p>
          </div>
        </div>
      )}

      {/* Show settings only when adminId is available */}
      {adminId && (
        <div className={`bg-white rounded-lg shadow p-4 md:p-6 transition-all ${activeTab === 'ticket' ? 'max-w-5xl' : 'max-w-3xl'
          }`}>
          {activeTab === 'voice' ? (
            <div className="space-y-4 md:space-y-6">

              {/* AI Voice Service Status */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-4 md:p-6 shadow-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg md:text-[22px] font-bold flex items-center gap-2">
                      🎙️ ChatterBox Tech Solutionor Custom Voice System
                    </h2>
                    <p className="text-white/90 mt-1">
                      Advanced Tech Solutionor-powered text-to-speech
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${chatterboxServiceStatus === 'online'
                        ? 'bg-green-500'
                        : 'bg-red-500'
                      }`}>
                      <span className="w-3 h-3 rounded-full bg-white animate-pulse"></span>
                      {chatterboxServiceStatus === 'online' ? 'Online' : 'Offline'}
                    </div>
                  </div>
                </div>
              </div>

              {/* ChatterBox AI Voice Section */}
              {chatterboxServiceStatus === 'offline' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    ⚠️ <strong>ChatterBox service is offline.</strong> Please start the Python service:
                  </p>
                  <code className="block bg-red-100 text-red-900 p-2 rounded mt-2 text-xs">
                    cd python-tts-service && python app.py
                  </code>
                </div>
              )}

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6 space-y-6">
                <h3 className="text-xl font-bold text-green-800 flex items-center gap-2">
                  🎤 AI Voice Settings
                </h3>

                {/* AI Voice Configuration */}
                <div className="space-y-4">
                  {/* Voice Type Selection - Dynamic from Python Service */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Voice Type (Dynamically Loaded)
                    </label>
                    <select
                      value={selectedChatterboxVoice}
                      onChange={(e) => {
                        console.log('🔄 Dropdown changed to:', e.target.value);
                        setSelectedChatterboxVoice(e.target.value);
                      }}
                      disabled={chatterboxServiceStatus === 'offline'}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-700"
                    >
                      {chatterboxVoices.length > 0 ? (
                        chatterboxVoices.map(voice => {
                          console.log('🎤 Voice option:', { id: voice.id, name: voice.name, type: voice.type });
                          return (
                            <option key={voice.id || voice.name} value={voice.id}>
                              {voice.name}
                            </option>
                          );
                        })
                      ) : (
                        <>
                          <option value="male">👨 Male Voice</option>
                          <option value="female">👩 Female Voice</option>
                          <option value="child">👶 Child Voice</option>
                        </>
                      )}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {chatterboxVoices.length > 0
                        ? `${chatterboxVoices.length} voice(s) loaded from Python service`
                        : 'Loading voices from Python service...'}
                    </p>
                  </div>
                </div>

                {/* Preferred Languages - Multi Select (Max 2) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Languages (Select up to 2)
                  </label>
                  <p className="text-xs text-gray-500 mb-3">Select maximum 2 languages for announcements</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                    {[
                      { code: 'en', flag: '🇬🇧', name: 'English', abbr: 'GB' },
                      { code: 'ar-ae', flag: '🇦🇪', name: 'Arabic', abbr: 'AE', subtitle: 'Dubai' },
                      { code: 'ar', flag: '🇸🇦', name: 'Arabic', abbr: 'SA' },
                      { code: 'ur', flag: '🇵🇰', name: 'Urdu', abbr: 'PK', subtitle: 'اردو' },
                      { code: 'hi', flag: '🇮🇳', name: 'Hindi', abbr: 'IN' },
                      { code: 'es', flag: '🇪🇸', name: 'Spanish', abbr: 'ES' }
                    ].map(lang => (
                      <label
                        key={lang.code}
                        className={`flex flex-col items-center justify-center p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all min-h-[90px] ${selectedLanguages.includes(lang.code)
                            ? 'border-green-500 bg-green-50 shadow-sm'
                            : 'border-gray-300 hover:border-gray-400 bg-white'
                          } ${!selectedLanguages.includes(lang.code) && selectedLanguages.length >= 2
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedLanguages.includes(lang.code)}
                          onChange={() => handleLanguageToggle(lang.code)}
                          disabled={!selectedLanguages.includes(lang.code) && selectedLanguages.length >= 2}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mb-2"
                        />
                        <span className="text-xl mb-1">{lang.flag}</span>
                        <div className="text-center">
                          <div className="text-xs md:text-sm font-bold text-gray-700">{lang.abbr}</div>
                          <div className="text-xs text-gray-600">{lang.name}</div>
                          {lang.subtitle && (
                            <div className="text-[10px] text-gray-500">{lang.subtitle}</div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Preview Boxes for Selected Languages */}
                {selectedLanguages.length > 0 && (
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Preview - Translation & Voice
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedLanguages.map((lang, index) => {
                        const langNames = {
                          'en': 'English 🇬🇧',
                          'ar': 'Arabic 🇸🇦',
                          'ar-ae': 'Dubai Arabic 🇦🇪',
                          'ur': 'Urdu 🇵🇰',
                          'hi': 'Hindi 🇮🇳',
                          'es': 'Spanish 🇪🇸'
                        };
                        const isRTL = lang === 'ar' || lang === 'ar-ae' || lang === 'ur';
                        return (
                          <div key={lang} className="border-2 border-green-300 rounded-lg p-4 bg-gradient-to-br from-green-50 to-emerald-50">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-bold text-green-700">{langNames[lang]}</h4>
                              <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">Box {index + 1}</span>
                            </div>
                            <div className={`bg-white border border-gray-300 rounded p-3 min-h-[80px] ${isRTL ? 'text-right' : 'text-left'
                              }`}>
                              <p className={`text-sm text-gray-800 whitespace-pre-line ${isRTL ? 'font-arabic' : ''
                                }`} style={isRTL ? { direction: 'rtl', fontFamily: 'Arial, sans-serif' } : {}}>
                                {translateText(testText, lang)}
                              </p>
                            </div>
                            <div className="mt-2 text-xs text-gray-600">
                              <span className="font-semibold">Voice:</span> {selectedChatterboxVoice || 'Default'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Speech Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 uppercase mb-2">
                    Speech Rate: {speechRate.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Slow (0.5x)</span>
                    <span>Normal (1.0x)</span>
                    <span>Fast (2.0x)</span>
                  </div>
                </div>

                {/* Speech Pitch */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 uppercase mb-2">
                    Speech Pitch: {speechPitch.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={speechPitch}
                    onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low (0.5)</span>
                    <span>Normal (1.0)</span>
                    <span>High (2.0)</span>
                  </div>
                </div>

                {/* Test Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 uppercase mb-2">
                    Test Text
                  </label>
                  <input
                    type="text"
                    value={testText}
                    readOnly
                    placeholder="Enter text to test voice"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed outline-none text-gray-700"
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleTestVoice}
                    disabled={synthesizing || chatterboxServiceStatus === 'offline'}
                    className={`w-full sm:flex-1 px-6 md:px-8 py-3 md:py-4 rounded-lg font-medium text-sm md:text-base transition-colors ${synthesizing || chatterboxServiceStatus === 'offline'
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                      } text-white shadow-md hover:shadow-lg`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span className="text-lg">🔊</span>
                      <span>{synthesizing ? 'Generating...' : 'Test AI Voice'}</span>
                    </span>
                  </button>
                  <button
                    onClick={handleUpdateSettings}
                    className="w-full sm:flex-1 px-6 md:px-8 py-3 md:py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm md:text-base transition-colors shadow-md hover:shadow-lg"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span className="text-lg">💾</span>
                      <span>Save Settings</span>
                    </span>
                  </button>
                </div>

                {/* Info Banner */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    <strong>ℹ️ AI Voice Information:</strong> ChatterBox uses advanced AI models for natural text-to-speech.
                    Upload voice samples to clone any voice! Settings are automatically saved and applied to all announcements.
                  </p>
                </div>
              </div> {/* Close AI Voice Settings div */}
            </div>
          ) : (
            /* Ticket Settings layout here */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Inputs (col-span-7) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    ⚙️ Ticket Builder (Drag & Drop)
                  </h3>
                  <button
                    onClick={addCustomField}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow transition-colors flex items-center gap-1"
                  >
                    <span>➕</span> Add Custom Field
                  </button>
                </div>

                {/* Layout Editor List */}
                <div className="space-y-3">
                  {layout.map((item, index) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`p-4 border rounded-xl bg-white shadow-sm flex items-start gap-3 transition-all ${draggedIndex === index ? 'border-green-500 bg-green-50/50 scale-[1.01]' : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      {/* Drag Handle */}
                      <div className="drag-handle cursor-move select-none p-1 text-gray-400 hover:text-gray-600 self-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                      </div>

                      {/* Editor Content Area */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          {/* Title/Label */}
                          {item.type === 'custom' ? (
                            <input
                              type="text"
                              value={item.label}
                              onChange={(e) => updateLayoutItemLabel(item.id, e.target.value)}
                              placeholder="Field Label"
                              className="font-bold text-sm text-gray-700 border-b border-gray-300 outline-none focus:border-green-500 bg-transparent px-1 py-0.5"
                            />
                          ) : (
                            <span className="font-bold text-sm text-gray-800">{item.label}</span>
                          )}

                          {/* Badges and Actions */}
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${item.type === 'custom' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                              }`}>
                              {item.type}
                            </span>

                            {/* Visibility Checkbox */}
                            <label className="inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={item.visible !== false}
                                onChange={() => toggleLayoutItemVisibility(item.id)}
                                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                              />
                              <span className="text-xs text-gray-500 ml-1">Visible</span>
                            </label>
                          </div>
                        </div>

                        {/* Field Value Inputs */}
                        {item.type === 'logo' && (
                          <div className="flex items-center gap-3 bg-gray-50 p-2 rounded border border-gray-100">
                            {companyLogo ? (
                              <img
                                src={`${process.env.NEXT_PUBLIC_API_URL_WS || 'http://localhost:5000'}${companyLogo}`}
                                alt="Logo"
                                className="h-10 w-10 object-contain bg-white border rounded p-1"
                              />
                            ) : (
                              <span className="text-[10px] text-gray-400 font-semibold px-2">No Logo</span>
                            )}
                            <div className="flex-1">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                id={`logo-upload-${item.id}`}
                                className="hidden"
                              />
                              <label
                                htmlFor={`logo-upload-${item.id}`}
                                className="inline-block px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold rounded cursor-pointer transition-colors shadow-sm"
                              >
                                Upload Logo
                              </label>
                            </div>
                          </div>
                        )}

                        {(item.type === 'text' || item.type === 'custom') && (
                          <input
                            type="text"
                            value={item.value || ''}
                            onChange={(e) => updateLayoutItemValue(item.id, e.target.value)}
                            placeholder={`Enter ${item.label.toLowerCase()}...`}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:ring-1 focus:ring-green-500"
                          />
                        )}

                        {item.type === 'service' && (
                          <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded italic">Prints the selected Kiosk service name dynamically.</p>
                        )}

                        {item.type === 'customer_info' && (
                          <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded italic">Prints Customer Name, Email, and Phone number if provided.</p>
                        )}

                        {item.type === 'ticket_no' && (
                          <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded italic">Prints the generated queue number (e.g. A-101).</p>
                        )}

                        {item.type === 'date_time' && (
                          <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded italic">Prints the transaction date and timestamp automatically.</p>
                        )}
                      </div>

                      {/* Right Toolbar: Arrows & Delete */}
                      <div className="flex flex-col gap-1 self-center">
                        <button
                          onClick={() => moveItem(index, 'up')}
                          disabled={index === 0}
                          title="Move Up"
                          className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 text-gray-600 text-xs"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => moveItem(index, 'down')}
                          disabled={index === layout.length - 1}
                          title="Move Down"
                          className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 text-gray-600 text-xs"
                        >
                          ▼
                        </button>
                        {item.type === 'custom' && (
                          <button
                            onClick={() => deleteCustomField(item.id)}
                            title="Delete Field"
                            className="p-1 text-red-500 hover:bg-red-50 rounded mt-1 font-bold text-xs"
                          >
                            ❌
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <div className="pt-2 border-t mt-6">
                  <button
                    onClick={handleSaveTicketSettings}
                    disabled={updatingTicket}
                    className="w-full md:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {updatingTicket ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-b-transparent"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span>💾</span>
                        <span>Save Ticket Layout</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column: Ticket Preview (col-span-5) */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4 self-start">
                  👁️ Live Kiosk Ticket Preview
                </h3>

                {/* Thermal Printer Kiosk Ticket Style */}
                <div className="w-[80mm] max-w-full bg-white border border-gray-300 shadow-xl rounded-md overflow-hidden relative" style={{ fontFamily: 'Arial, sans-serif' }}>
                  <div className="h-2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 border-b border-dashed border-gray-400"></div>

                  {/* Ticket Receipt Container */}
                  <div className="p-5 flex flex-col items-center text-center text-gray-800 space-y-3">
                    {layout.filter(item => item.visible !== false).map((item) => {
                      switch (item.type) {
                        case 'logo':
                          return (
                            <div key={item.id} className="w-full flex justify-center py-1">
                              {logoPreview || companyLogo ? (
                                <div className="p-1.5 border border-gray-100 rounded bg-white">
                                  <img
                                    src={logoPreview || `${process.env.NEXT_PUBLIC_API_URL_WS || 'http://localhost:5000'}${companyLogo}`}
                                    alt="Logo"
                                    className="max-h-[50px] max-w-[150px] object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="w-full py-1.5 bg-gray-50 text-gray-400 font-bold text-[10px] uppercase tracking-widest rounded border border-dashed border-gray-300">
                                  LOGO
                                </div>
                              )}
                            </div>
                          );
                        case 'text':
                        case 'custom':
                          // If it's the company name heading
                          if (item.id === 'company_name' || item.isHeading) {
                            return (
                              <h4 key={item.id} className="font-extrabold text-sm text-gray-900 leading-tight uppercase break-words w-full py-0.5">
                                {item.value || 'Emirates Professional Businessmen Services'}
                              </h4>
                            );
                          }
                          if (item.id === 'waiting_message') {
                            return (
                              <p key={item.id} className="text-[10px] text-gray-600 italic px-2 break-words w-full leading-normal py-0.5">
                                {item.value || 'Please wait. We will serve you shortly.'}
                              </p>
                            );
                          }
                          if (item.id === 'thank_you_text') {
                            return (
                              <p key={item.id} className="text-[10px] font-bold text-green-600 break-words w-full py-0.5">
                                {item.value || 'Thank you for your service!'}
                              </p>
                            );
                          }
                          if (item.id === 'footer_text') {
                            return (
                              <p key={item.id} className="text-[8px] text-gray-400 border-t border-dashed border-gray-200 w-full pt-1.5 break-words py-0.5">
                                {item.value || 'Designed by techsolutionor.com'}
                              </p>
                            );
                          }
                          // Custom field styling
                          return (
                            <p key={item.id} className="text-[10px] text-gray-800 break-words w-full py-0.5">
                              {item.value || ''}
                            </p>
                          );
                        case 'service':
                          return (
                            <div key={item.id} className="w-full py-0.5">
                              <p className="text-[10px] text-gray-500 uppercase tracking-wide leading-tight">Service Type</p>
                              <p className="font-black text-xs text-green-700 uppercase leading-snug">
                                VISA SERVICES
                              </p>
                            </div>
                          );
                        case 'customer_info':
                          return (
                            <div key={item.id} className="w-full text-left bg-gray-50 border border-gray-100 rounded p-2 text-[9px] text-gray-600 space-y-0.5">
                              <p><strong>Name:</strong> John Doe</p>
                              <p><strong>Email:</strong> johndoe@gmail.com</p>
                              <p><strong>Number:</strong> 03236637158</p>
                            </div>
                          );
                        case 'ticket_no':
                          return (
                            <div key={item.id} className="w-full py-0.5">
                              <p className="text-[10px] text-gray-500 uppercase tracking-wide leading-tight">Ticket No</p>
                              <h1 className="font-black text-4xl text-green-600 tracking-wider my-0.5 leading-none">
                                V-101
                              </h1>
                            </div>
                          );
                        case 'date_time':
                          return (
                            <div key={item.id} className="bg-gray-50 w-full py-1.5 px-2 rounded border border-gray-100 text-[9px] text-gray-500 font-mono">
                              Date: {new Date().toLocaleDateString('en-GB')} | Time: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </div>
                          );
                        default:
                          return null;
                      }
                    })}
                  </div>
                  <div className="h-2 bg-gradient-to-r from-gray-100 to-gray-200 border-t border-dashed border-gray-300"></div>
                </div>

                {/* Tips banner */}
                <div className="mt-4 bg-blue-50 border border-blue-100 text-blue-800 text-[11px] rounded-lg p-3 max-w-[80mm] text-center shadow-sm">
                  💡 <strong>Kiosk Preview:</strong> Drag items to customize layout order. Make sure to click "Save Ticket Layout" after ordering.
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
  // );
}
