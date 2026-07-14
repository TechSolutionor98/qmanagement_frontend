'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import Image from 'next/image';
import axios from '@/utils/axiosInstance';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/Components/ProtectedRoute';
import { getToken, getUser } from '@/utils/sessionStorage';
import logo from '@/Components/images/logo_main.png'

function TicketInfoContent() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [calledTicket, setCalledTicket] = useState('');
  const [calledTickets, setCalledTickets] = useState([]);
  const [currentCounter, setCurrentCounter] = useState('');
  const [lastAnnouncedTime, setLastAnnouncedTime] = useState(null);
  const announcedTimestampsRef = useRef(new Set()); // ✅ Ref BEFORE state
  // Load announced timestamps from localStorage on mount
  const [announcedTimestamps, setAnnouncedTimestamps] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('announced_timestamps');
      if (saved) {
        try {
          const loadedSet = new Set(JSON.parse(saved));
          announcedTimestampsRef.current = loadedSet; // Sync ref immediately
          return loadedSet;
        } catch (e) {
          console.error('Error loading announced timestamps:', e);
        }
      }
    }
    return new Set();
  });
  const [lastVoiceTime, setLastVoiceTime] = useState(null);
  const [aiVoiceReady, setAiVoiceReady] = useState(false);
  const [isAnnouncing, setIsAnnouncing] = useState(false); // Prevent overlapping announcements
  const isAnnouncingRef = useRef(false); // Ref to avoid stale closure
  const [announcementQueue, setAnnouncementQueue] = useState([]); // Queue for pending tickets
  // Separate state for displayed ticket (only updates after announcement completesa
  const [displayedTicket, setDisplayedTicket] = useState('');
  const [displayedCounter, setDisplayedCounter] = useState('');
  const [broadcastChannel, setBroadcastChannel] = useState(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false); // Auto-enabled in background
  const [audioEnabled, setAudioEnabled] = useState(false); // Track user interaction for audio
  const [cachedVoiceSettings, setCachedVoiceSettings] = useState(null); // Cache settings
  const [lastSettingsFetch, setLastSettingsFetch] = useState(0); // Track last fetch time

  // Counter Display Config from database
  const [leftLogoUrl, setLeftLogoUrl] = useState('');
  const [rightLogoUrl, setRightLogoUrl] = useState('');
  const [contentType, setContentType] = useState('video');
  const [videoUrl, setVideoUrl] = useState('');
  const [sliderImages, setSliderImages] = useState([]);
  const [sliderTimer, setSliderTimer] = useState(5);
  const [tickerContent, setTickerContent] = useState('Welcome to Dubai Economic Department Services');

  // Remove hardcoded slides - images don't exist in production
  // const slides = ['/assets/img/33.png', '/assets/img/22.png', '/assets/img/11.png'];
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const apiUrlWs = process.env.NEXT_PUBLIC_API_URL_WS || 'http://localhost:5000';

  // Session validation - check every 10 seconds
  useEffect(() => {
    const validateSessionStatus = async () => {
      const token = getToken();
      if (!token) {
        // Don't redirect on missing token - auth guard handles this
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/sessions/validate`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Only logout on 401 Unauthorized (session terminated by admin)
        if (response.status === 401) {
          const data = await response.json().catch(() => ({}));
          console.log('❌ Session terminated by administrator');
          alert('Your session has been terminated by the administrator. You will be redirected to login.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          router.push('/login');
          return;
        }

        // For other errors (500, network issues), just log but don't logout
        if (!response.ok) {
          console.warn('⚠️ Session validation failed (HTTP ' + response.status + ') - will retry');
          return;
        }

        const data = await response.json();

        // Check if session is marked as invalid
        if (data.valid === false) {
          console.log('❌ Session invalidated by administrator');
          alert('Your session has been terminated by the administrator. You will be redirected to login.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          router.push('/login');
        } else {
          console.log('✅ Session valid');
        }
      } catch (error) {
        // Network error - don't logout, just log and retry later
        console.warn('⚠️ Session validation network error:', error.message, '- will retry');
      }
    };

    // Check after 2 seconds (page load time), then every 10 seconds
    const initialTimeout = setTimeout(validateSessionStatus, 2000);
    const interval = setInterval(validateSessionStatus, 10000);

    // Also check when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Page visible - checking session');
        validateSessionStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [router]);

  // Check authentication on mount
  useEffect(() => {
    const token = getToken();
    const user = getUser();

    if (!token || !user) {
      console.log('🔐 No authentication found, redirecting to ticket-info-login');
      router.push('/login');
      return;
    }

    if (user.role !== 'ticket_info') {
      console.log('❌ User role is not ticket_info, redirecting to ticket-info-login');
      router.push('/login');
      return;
    }

    console.log('✅ Ticket info user authenticated:', user.username);
  }, [router]);

  // Fetch called tickets and update display
  const fetchCalledTickets = async () => {
    const token = getToken();
    const user = getUser();
    if (!token || !user) {
      console.warn('⚠️ No token or user found - cannot fetch tickets');
      return;
    }

    try {
      console.log('🌐 API Call: GET', `${apiUrl}/user/called-tickets`);
      console.log('🔑 Token:', token ? 'Present' : 'Missing');

      const response = await fetch(`${apiUrl}/user/called-tickets`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response Status:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('📥 Backend tickets response:', data);

        if (data.success && data.tickets && data.tickets.length > 0) {
          console.log('═══════════════════════════════════════════════');
          console.log('🔍 POLLING CYCLE - Full Backend Response');
          console.log('═══════════════════════════════════════════════');
          console.log('🔍 ALL TICKETS from backend (before filter):', data.tickets.map(t => ({
            ticket: t.ticket_number,
            status: t.status,
            counter: t.counter_no
          })));
          console.log('🎭 Currently displayed ticket:', displayedTicket);
          console.log('═══════════════════════════════════════════════');

          // ✅ Check if displayed ticket's status changed
          let shouldClearDisplay = false;
          if (displayedTicket) {
            console.log('✅ Step 1: Checking displayed ticket status...');
            const normalizedDisplayed = String(displayedTicket).trim().toLowerCase();
            console.log('   Normalized displayed:', normalizedDisplayed);

            const displayedTicketData = data.tickets.find(t => {
              const normalized = String(t.ticket_number).trim().toLowerCase();
              console.log('   Comparing:', normalized, '===', normalizedDisplayed, '?', normalized === normalizedDisplayed);
              return normalized === normalizedDisplayed;
            });

            console.log('🔍 Step 2: Search result:', {
              displayed: displayedTicket,
              found: displayedTicketData ? 'YES' : 'NO',
              ticketData: displayedTicketData,
              status: displayedTicketData?.status,
              statusLower: displayedTicketData?.status?.toLowerCase(),
              isCalled: displayedTicketData?.status?.toLowerCase() === 'called'
            });

            // Mark for clearing if status is not 'called'
            if (displayedTicketData) {
              const statusLower = displayedTicketData.status?.toLowerCase();
              console.log('✅ Step 3: Status check - Is', statusLower, '!== called ?', statusLower !== 'called');

              if (statusLower !== 'called') {
                console.log('⚠️⚠️⚠️ SHOULD CLEAR - Ticket', displayedTicket, 'status:', displayedTicketData.status);
                shouldClearDisplay = true;
              }
            } else {
              console.log('⚠️ Displayed ticket NOT FOUND in backend response - will clear');
              shouldClearDisplay = true;
            }
          } else {
            console.log('ℹ️ No ticket currently displayed, skipping check');
          }

          // Filter: ONLY show tickets with 'called' status AND valid counter_no
          const calledOnlyTickets = data.tickets.filter(ticket =>
            ticket.status &&
            ticket.status.toLowerCase() === 'called' &&
            ticket.counter_no !== null &&
            ticket.counter_no !== undefined &&
            ticket.counter_no !== ''
          );

          console.log('✅ FILTERED tickets (status=called + valid counter):', calledOnlyTickets.map(t => ({
            ticket: t.ticket_number,
            status: t.status,
            counter: t.counter_no
          })));
          console.log(`📊 Total: ${data.tickets.length} tickets, Filtered: ${calledOnlyTickets.length} valid tickets`);

          setCalledTickets(calledOnlyTickets);

          console.log('✅ Step 4: Checking shouldClearDisplay flag:', shouldClearDisplay);

          // ✅ Clear display if marked or if displayed ticket not in called list
          if (shouldClearDisplay) {
            console.log('✅✅✅ CLEARING DISPLAY NOW - Status changed ✅✅✅');
            console.log('   Setting displayedTicket to empty string');
            console.log('   Setting displayedCounter to empty string');
            setDisplayedTicket('');
            setDisplayedCounter('');
            console.log('✅ Display cleared successfully!');
            return; // Don't announce old ticket
          }

          console.log('ℹ️ shouldClearDisplay=false, continuing with normal flow...');

          // ✅ Check if currently displayed ticket is still in called status
          if (displayedTicket) {
            // Normalize for comparison (trim and lowercase)
            const normalizedDisplayed = String(displayedTicket).trim().toLowerCase();

            const stillCalled = calledOnlyTickets.some(t => {
              const normalizedTicket = String(t.ticket_number).trim().toLowerCase();
              const isCalled = t.status && t.status.toLowerCase() === 'called';
              return normalizedTicket === normalizedDisplayed && isCalled;
            });

            if (!stillCalled) {
              console.log('⚠️ Displayed ticket', displayedTicket, 'is no longer in called status - clearing display');
              setDisplayedTicket('');
              setDisplayedCounter('');
            }
          }

          // ✅ If no called tickets at all, clear display
          if (calledOnlyTickets.length === 0 && displayedTicket) {
            console.log('⚠️ No called tickets available - clearing display');
            setDisplayedTicket('');
            setDisplayedCounter('');
          }

          // Get the latest ticket (first one - sorted by called_at DESC)
          if (calledOnlyTickets.length > 0) {
            const latestTicket = calledOnlyTickets[0];
            const latestTimestamp = new Date(latestTicket.called_at).getTime();

            console.log('🎫 Latest ticket from backend:', {
              ticket: latestTicket.ticket_number,
              counter: latestTicket.counter_no,
              called_at: latestTicket.called_at,
              status: latestTicket.status,
              timestamp: latestTimestamp
            });

            // Check if this is a NEW call (check timestamp, not just ticket number)
            const ticketNumber = latestTicket.ticket_number;

            console.log('🔍 Checking if ticket already announced:');
            console.log('   Ticket:', ticketNumber);
            console.log('   Timestamp:', latestTimestamp);
            console.log('   called_at:', latestTicket.called_at);
            console.log('   Announced timestamps Set size:', announcedTimestampsRef.current.size);
            console.log('   Announced timestamps:', Array.from(announcedTimestampsRef.current));
            console.log('   Is in Set?', announcedTimestampsRef.current.has(latestTimestamp));

            // ✅ Check CURRENT ref value (not stale state)
            if (announcedTimestampsRef.current.has(latestTimestamp)) {
              console.log('ℹ️ This call already announced previously (timestamp in history), skipping:', ticketNumber, 'timestamp:', latestTimestamp);
              return;
            }

            // This is a NEW call (different timestamp) - announce it!
            console.log('🆕 NEW CALL DETECTED:', ticketNumber, 'at timestamp', latestTimestamp);
            if (lastAnnouncedTime) {
              console.log('📊 Previous announcement timestamp:', lastAnnouncedTime);
            }
            console.log('📚 Total announced timestamps so far:', announcedTimestamps.size);

            // If announcement is in progress, add to queue
            if (isAnnouncingRef.current) {
              console.log('⏳ Announcement in progress, adding to queue');
              setAnnouncementQueue(queue => {
                // Check if this exact ticket+timestamp already in queue
                const exists = queue.some(t => t.ticket === ticketNumber && t.timestamp === latestTimestamp);
                if (!exists) {
                  return [...queue, {
                    ticket: ticketNumber,
                    counter: latestTicket.counter_no || 'N/A',
                    timestamp: latestTimestamp
                  }];
                }
                return queue;
              });
            } else {
              // Update display immediately if no announcement in progress
              console.log('🔄 Updating display and triggering voice');
              setCalledTicket(ticketNumber);
              setCurrentCounter(latestTicket.counter_no || 'N/A');
              setLastAnnouncedTime(latestTimestamp);
              // Add to announced timestamps history and save to localStorage
              setAnnouncedTimestamps(prev => {
                const newSet = new Set([...prev, latestTimestamp]);
                announcedTimestampsRef.current = newSet; // ✅ Update ref immediately
                localStorage.setItem('announced_timestamps', JSON.stringify([...newSet]));
                return newSet;
              });
              console.log('✅ Added timestamp to history and saved to localStorage:', latestTimestamp);
            }
          } else {
            console.log('ℹ️ No called tickets available');
          }
        } else {
          console.warn('⚠️ Backend response success=false or no tickets array');
        }
      } else {
        console.error('❌ API call failed:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
      }
    } catch (error) {
      console.error('❌ Error fetching called tickets:', error);
      console.error('❌ Error details:', error.message, error.stack);
    }
  };

  // Fetch counter display configuration from database
  const fetchDisplayConfig = async () => {
    try {
      const token = getToken();
      const user = getUser();

      if (!token) {
        console.warn('⚠️ No token found - cannot fetch display config');
        return;
      }

      // Get admin_id from current user
      const adminId = user?.admin_id;
      if (!adminId) {
        console.error('❌ No admin_id found for ticket_info user:', user);
        return;
      }

      console.log('📡 Fetching display config for admin_id:', adminId);

      // Add admin_id as query parameter
      const response = await axios.get(`${apiUrl}/counter-display/config?adminId=${adminId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const { config, images } = response.data;

        console.log('📦 Display config response:', { config, imagesCount: images?.length });

        if (config) {
          setLeftLogoUrl(config.left_logo_url || '');
          setRightLogoUrl(config.right_logo_url || '');
          setContentType(config.content_type || 'video');
          setVideoUrl(config.video_url || '');
          setSliderTimer(config.slider_timer || 5);
          setTickerContent(config.ticker_content || 'Welcome to Dubai Economic Department Services');

          console.log('✅ Display config loaded:', {
            leftLogo: config.left_logo_url ? 'Yes' : 'No',
            rightLogo: config.right_logo_url ? 'Yes' : 'No',
            contentType: config.content_type,
            videoUrl: config.video_url ? 'Yes' : 'No'
          });
        }

        // Load selected images for slider
        if (images && images.length > 0) {
          const selectedImages = images.filter(img => img.is_selected === 1);
          const imageUrls = selectedImages.map(img => `${process.env.NEXT_PUBLIC_API_URL_WS}${img.image_url}`);
          setSliderImages(imageUrls);
          console.log('✅ Slider images loaded:', selectedImages.length, imageUrls);
        }
      } else {
        console.error('❌ Display config fetch failed:', response.data);
      }
    } catch (error) {
      console.error('❌ Error fetching display config:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
    }
  };

  // Auto-slide functionality for images
  useEffect(() => {
    if (contentType === 'images' && sliderImages.length > 0) {
      const slideInterval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
      }, sliderTimer * 1000);
      return () => clearInterval(slideInterval);
    }
  }, [contentType, sliderImages, sliderTimer]);

  // Fetch called tickets on mount and set up polling
  useEffect(() => {
    console.log('🔄 Starting ticket polling...');
    console.log('🔧 API URL:', apiUrl);
    console.log('🔧 Full endpoint:', `${apiUrl}/user/called-tickets`);

    // Fetch display config on mount
    fetchDisplayConfig();

    fetchCalledTickets();
    const pollInterval = setInterval(() => {
      console.log('🔃 Polling backend for new tickets...');
      fetchCalledTickets();
    }, 2000); // Check every 2 seconds
    return () => {
      console.log('⏹️ Stopping ticket polling');
      clearInterval(pollInterval);
    };
  }, []); // Empty dependencies - poll should run continuously without restart

  // ✅ Auto-clear displayedTicket if it's no longer in called status
  useEffect(() => {
    if (!displayedTicket) return; // No ticket displayed, nothing to check

    // Check if displayed ticket is still in the called tickets list
    const normalizedDisplayed = String(displayedTicket).trim().toLowerCase();
    const stillCalled = calledTickets.some(t => {
      const normalized = String(t.ticket_number).trim().toLowerCase();
      return normalized === normalizedDisplayed && t.status?.toLowerCase() === 'called';
    });

    if (!stillCalled) {
      console.log('⚠️⚠️⚠️ AUTO-CLEAR: Displayed ticket', displayedTicket, 'not in called list anymore');
      setDisplayedTicket('');
      setDisplayedCounter('');
    }
  }, [calledTickets, displayedTicket]); // Run whenever calledTickets or displayedTicket changes


  // Setup BroadcastChannel for cross-tab communication
  useEffect(() => {
    console.log('🚀 Setting up BroadcastChannel for ticket_info');

    // Create broadcast channel for ticket calls
    const channel = new BroadcastChannel('ticket-calls');
    setBroadcastChannel(channel);

    // Also listen for voice settings updates
    const voiceSettingsChannel = new BroadcastChannel('voice-settings-update');

    voiceSettingsChannel.onmessage = (event) => {
      console.log('🔔 Voice settings updated by admin:', event.data);
      if (event.data && event.data.updated) {
        console.log('🔄 Admin changed voice settings - will use NEW settings on next announcement');
        // Clear localStorage cache
        localStorage.removeItem('tts_settings');
        // Settings will be fetched fresh from database on next announcement
      }
    };

    // Listen for messages from dashboard
    channel.onmessage = (event) => {
      console.log('🔔 BroadcastChannel received:', event.data);

      if (event.data && event.data.ticket) {
        const { ticket, counter, timestamp } = event.data;

        console.log('🔄 Updating display with:', { ticket, counter, timestamp });

        // ✅ Check CURRENT ref value (not stale state)
        if (announcedTimestampsRef.current.has(timestamp)) {
          console.log('ℹ️ BroadcastChannel call already announced previously (timestamp in history), skipping:', ticket, 'timestamp:', timestamp);
          return;
        }

        console.log('🆕 NEW BroadcastChannel call detected:', ticket, 'timestamp:', timestamp);

        // Check if announcement is in progress
        if (isAnnouncingRef.current) {
          console.log('⏳ Announcement in progress, adding BroadcastChannel ticket to queue');
          setAnnouncementQueue(queue => {
            const exists = queue.some(t => t.ticket === ticket && t.timestamp === timestamp);
            if (!exists) {
              return [...queue, {
                ticket: ticket,
                counter: counter || 'N/A',
                timestamp: timestamp
              }];
            }
            return queue;
          });
        } else {
          // Update display immediately if no announcement in progress
          setCalledTicket(ticket);
          setCurrentCounter(counter || 'N/A');
          setLastAnnouncedTime(timestamp);
          // Add to announced timestamps history and save to localStorage
          setAnnouncedTimestamps(prev => {
            const newSet = new Set([...prev, timestamp]);
            announcedTimestampsRef.current = newSet; // ✅ Update ref immediately
            localStorage.setItem('announced_timestamps', JSON.stringify([...newSet]));
            return newSet;
          });
          console.log('✅ Added BroadcastChannel timestamp to history and saved to localStorage:', timestamp);
        }

        console.log('✅ State updated successfully - announcement will trigger automatically');

        // Refresh table from backend
        fetchCalledTickets();
      }
    };

    // Also check localStorage on mount for existing data
    const ticketData = localStorage.getItem('latest_ticket_call');
    if (ticketData) {
      try {
        const data = JSON.parse(ticketData);
        console.log('📦 Found existing ticket in localStorage:', data);
        if (data.ticket && data.timestamp) {
          setCalledTicket(data.ticket);
          setCurrentCounter(data.counter || 'N/A');
          setLastAnnouncedTime(data.timestamp);
          // Note: announcedTimestamps already loaded from localStorage in useState initializer
          console.log('✅ Loaded ticket from localStorage on mount:', data.timestamp);
        }
      } catch (e) {
        console.error('❌ Error parsing localStorage data:', e);
      }
    }

    return () => {
      console.log('🧹 Closing BroadcastChannels');
      channel.close();
      voiceSettingsChannel.close();
    };
  }, []);

  // Check ChatterBox AI service status on mount
  useEffect(() => {
    const checkAiVoiceService = async () => {
      try {
        const response = await axios.get(`${apiUrl}/voices/health`);
        if (response.data.status === 'ok' && response.data.python_service === 'online') {
          setAiVoiceReady(true);
          console.log('✅ ChatterBox AI Voice service is ready');
        } else {
          // Service exists but Python TTS is offline - don't spam console
          setAiVoiceReady(false);
        }
      } catch (error) {
        // Service not available - silently disable voice features
        setAiVoiceReady(false);
      }
    };

    checkAiVoiceService();
  }, [apiUrl]);

  // Translation helper function
  const translateTicketText = (ticketNumber, counterNumber, langCode) => {
    const translations = {
      'en': {
        text: `Ticket number ${ticketNumber} please come to counter number ${counterNumber}`
      },
      'ar-ae': {
        text: `التذكره رقم بي -${ticketNumber} الذهاب إلى الكونتر رقم ${counterNumber}`
      },
      'ar': {
        text: `تذكرة رقم ${ticketNumber} الرجاء الذهاب لكونتر رقم ${counterNumber}`
      },
      'ur': {
        text: `ٹکٹ نمبر ${ticketNumber} براہ کرم کاؤنٹر نمبر ${counterNumber} پر تشریف لے جائیں`
      },
      'hi': {
        text: `टिकट नंबर ${ticketNumber} कृपया काउंटर नंबर ${counterNumber} पर जाएं`
      },
      'es': {
        text: `Número de ticket ${ticketNumber} por favor vaya al mostrador número ${counterNumber}`
      }
    };

    return translations[langCode] || translations['en'];
  };

  // Enable audio on user click
  const handleEnableAudio = async () => {
    try {
      // Initialize AudioContext
      if (typeof window !== 'undefined') {
        if (!window.audioContext) {
          window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (window.audioContext.state === 'suspended') {
          await window.audioContext.resume();
        }
      }

      // Play silent audio to unlock
      const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
      silentAudio.volume = 0.001;
      await silentAudio.play();
      silentAudio.pause();

      setAudioUnlocked(true);
      setAudioEnabled(true);
      console.log('✅ Audio enabled by user interaction');
      return true;
    } catch (e) {
      console.error('❌ Failed to enable audio:', e);
      return false;
    }
  };

  // ✅ Attempt silent audio unlock in background (doesn't hide button)
  useEffect(() => {
    const attemptSilentUnlock = async () => {
      console.log('🔊 Attempting silent audio unlock...');

      try {
        // Try to unlock AudioContext silently
        if (typeof window !== 'undefined') {
          if (!window.audioContext) {
            window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
          }
          if (window.audioContext.state === 'suspended') {
            await window.audioContext.resume();
          }
        }

        // Try silent audio (but don't set audioEnabled yet - keep button visible)
        const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
        silentAudio.volume = 0.001;
        await silentAudio.play();
        silentAudio.pause();

        setAudioUnlocked(true); // Mark as unlocked but keep button visible
        console.log('✅ Audio unlocked silently (button still visible)');
      } catch (e) {
        console.log('⚠️ Silent unlock failed - button will be shown');
      }
    };

    // Try silent unlock on mount
    attemptSilentUnlock();
  }, []);

  // Silent background audio enabler - no user interaction needed
  const enableAudioSilently = async () => {
    try {
      // Initialize AudioContext
      if (typeof window !== 'undefined') {
        if (!window.audioContext) {
          window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (window.audioContext.state === 'suspended') {
          await window.audioContext.resume();
        }
      }

      // Play silent audio to unlock
      const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
      silentAudio.volume = 0.001;
      await silentAudio.play();
      silentAudio.pause();

      setAudioUnlocked(true);
      console.log('✅ Audio enabled silently in background');
      return true;
    } catch (e) {
      console.log('⚠️ Silent audio enable attempt...');
      return false;
    }
  };

  // Continuous background audio enabler - runs automatically
  useEffect(() => {
    let enableInterval;

    // Start trying to enable audio immediately and continuously
    const tryEnableAudio = async () => {
      try {
        if (typeof window !== 'undefined') {
          if (!window.audioContext) {
            window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
          }
          if (window.audioContext.state === 'suspended') {
            await window.audioContext.resume();
          }
        }

        const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
        silentAudio.volume = 0.001;
        await silentAudio.play();
        silentAudio.pause();

        setAudioUnlocked(true);
        return true;
      } catch (e) {
        return false;
      }
    };

    // Try immediately on mount
    tryEnableAudio();

    // Keep trying every 500ms until successful
    enableInterval = setInterval(() => {
      tryEnableAudio().then(success => {
        if (success) {
          clearInterval(enableInterval);
        }
      });
    }, 500);

    return () => {
      if (enableInterval) clearInterval(enableInterval);
    };
  }, []);

  // Auto-enable audio on any user interaction (background - no UI)
  useEffect(() => {
    const handleUserInteraction = async () => {
      if (!audioUnlocked) {
        await enableAudioSilently();
      } else if (window.audioContext && window.audioContext.state === 'suspended') {
        await window.audioContext.resume();
      }
    };

    const events = ['click', 'touchstart', 'keydown', 'mousedown', 'mousemove', 'scroll'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { passive: true, once: false });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [audioUnlocked]);

  // Initialize AudioContext on mount and keep it active
  useEffect(() => {
    // Auto-enable audio silently on page load
    console.log('🔊 Auto-enabling audio in background...');

    // Initialize AudioContext
    if (typeof window !== 'undefined' && !window.audioContext) {
      try {
        window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('✅ AudioContext created');
      } catch (e) {
        console.log('⚠️ AudioContext creation failed:', e);
      }
    }

    // Attempt silent unlock
    const unlockAudio = async () => {
      try {
        if (window.audioContext && window.audioContext.state === 'suspended') {
          await window.audioContext.resume();
          console.log('✅ AudioContext resumed');
        }

        // Create and play silent audio
        const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
        silentAudio.volume = 0.001;

        try {
          await silentAudio.play();
          silentAudio.pause();
          silentAudio.remove();
          setAudioUnlocked(true);
          setAudioEnabled(true); // ✅ Also set audioEnabled when successful
          console.log('✅ Audio auto-enabled successfully (silent)');
        } catch (playError) {
          // If autoplay fails, retry periodically
          console.log('⚠️ Silent audio play blocked, will retry on interaction...');
        }
      } catch (e) {
        console.log('⚠️ Audio unlock attempt:', e.name);
      }
    };

    unlockAudio();

    // ✅ AGGRESSIVE: Auto-unlock on ANY user interaction
    const aggressiveUnlock = () => {
      if (!audioUnlocked) {
        console.log('🔓 User interaction detected, unlocking audio...');
        unlockAudio();
      }
    };

    // Listen to multiple interaction events
    const events = ['click', 'touchstart', 'keydown', 'mousemove', 'scroll'];
    events.forEach(event => {
      document.addEventListener(event, aggressiveUnlock, { once: true, passive: true });
    });

    // Keep AudioContext resumed and retry audio unlock
    const contextResumeInterval = setInterval(async () => {
      if (window.audioContext && window.audioContext.state === 'suspended') {
        await window.audioContext.resume().catch(() => { });
      }
      // Retry silent unlock if not yet unlocked
      if (!audioUnlocked) {
        unlockAudio();
      }
    }, 1000);

    return () => {
      clearInterval(contextResumeInterval);
      events.forEach(event => {
        document.removeEventListener(event, aggressiveUnlock);
      });
    };
  }, [audioUnlocked]);

  // Announce ticket using ChatterBox AI with admin-configured settings
  const announceTicket = async (ticketNumber, counterNumber) => {
    if (!aiVoiceReady) {
      console.error('❌ ChatterBox AI Voice service not ready');
      alert('⚠️ Voice service offline - announcement skipped');
      return;
    }

    // ✅ CRITICAL: Check REF immediately to prevent race conditions
    if (isAnnouncingRef.current) {
      console.warn('⚠️ ⚠️ Announcement already in progress (REF check in function), skipping duplicate call...');
      return;
    }

    // Prevent overlapping announcements
    if (isAnnouncing) {
      console.warn('⚠️ Announcement already in progress (STATE check), skipping...');
      return;
    }

    // ✅ Set BOTH immediately to block any other simultaneous calls
    setIsAnnouncing(true);
    isAnnouncingRef.current = true;
    console.log('🔒 Announcement LOCKED (both state and ref set)');

    // ✅ UPDATE DISPLAY IMMEDIATELY when announcement starts (not at the end)
    console.log('🔄 Updating display NOW: Ticket', ticketNumber, 'Counter', counterNumber);
    setDisplayedTicket(ticketNumber);
    setDisplayedCounter(counterNumber);

    // Show visual feedback that announcement is starting (for production debugging)
    if (typeof window !== 'undefined' && window.document) {
      document.title = `🔊 Announcing ${ticketNumber}`;
    }

    // 🔔 Play notification sound and wait 0.5 seconds before announcement
    try {
      console.log('🔔 Playing notification sound...');
      const notificationSound = new Audio('/ding-dong-81717.mp3');
      notificationSound.volume = 0.7;
      notificationSound.playbackRate = 0.7; // Slow down the sound

      // Play notification sound
      notificationSound.play().then(() => {
        console.log('✅ Notification sound playing');
        setAudioEnabled(true); // Hide button after successful play
      }).catch(err => {
        console.warn('⚠️ Notification play blocked:', err.message);
      });

      // ⏱️ Wait 0.3 seconds before starting announcement
      await new Promise(resolve => setTimeout(resolve, 10));
      console.log('⏰ 0.3 second delay completed, starting announcement...');
    } catch (error) {
      console.warn('⚠️ Notification sound failed, continuing with announcement:', error.message);
      // Continue even if notification fails
    }

    // Get admin's saved TTS settings from database first, then localStorage
    let settings = {
      selectedChatterboxVoice: 'male',  // Default to 'male' instead of 'default'
      speechRate: 0.9,
      speechPitch: 1.0,
      selectedLanguages: ['en'] // Support multiple languages
    };

    // ✅ Use cached settings if available and less than 30 seconds old
    const now = Date.now();
    const CACHE_DURATION = 30000; // 30 seconds

    if (cachedVoiceSettings && (now - lastSettingsFetch) < CACHE_DURATION) {
      console.log('⚡ Using CACHED voice settings (fetched', Math.round((now - lastSettingsFetch) / 1000), 'seconds ago)');
      settings = cachedVoiceSettings;
    } else {
      console.log('🔄 Fetching fresh voice settings from database...');
      try {
        // Try to load from database with authentication token
        const token = getToken();
        const user = getUser();

        console.log('🔑 Token:', token ? 'Present' : 'Missing');
        console.log('👤 Current user:', user?.username, '| Role:', user?.role, '| Admin ID:', user?.admin_id);

        // Build URL with admin_id if available (for ticket_info users)
        let settingsUrl = `${apiUrl}/voices/settings`;
        const params = new URLSearchParams();
        params.append('t', Date.now().toString());

        if (user?.admin_id) {
          params.append('adminId', user.admin_id.toString());
          console.log('📌 Fetching settings for admin_id:', user.admin_id);
        }

        settingsUrl += `?${params.toString()}`;
        console.log('🌐 Full settings URL:', settingsUrl);

        const response = await axios.get(settingsUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('📦 Voice settings response (FRESH):', response.data);
        console.log('📦 Settings received:', response.data?.settings);

        if (response.data.success && response.data.settings) {
          const dbSettings = response.data.settings;

          console.log('🎯 Database settings received:', {
            voice_type: dbSettings.voice_type,
            language: dbSettings.language,
            languages: dbSettings.languages,
            speech_rate: dbSettings.speech_rate,
            speech_pitch: dbSettings.speech_pitch
          });

          // Parse languages array
          let languages = ['en'];
          if (dbSettings.languages) {
            try {
              languages = JSON.parse(dbSettings.languages);
              console.log('✅ Parsed languages array:', languages);
            } catch (e) {
              console.warn('⚠️ Failed to parse languages, using single language');
              languages = [dbSettings.language || 'en'];
            }
          } else if (dbSettings.language) {
            languages = [dbSettings.language];
            console.log('✅ Using single language:', languages);
          }

          settings = {
            selectedChatterboxVoice: dbSettings.voice_type || 'male',
            speechRate: parseFloat(dbSettings.speech_rate) || 0.9,
            speechPitch: parseFloat(dbSettings.speech_pitch) || 1.0,
            selectedLanguages: languages
          };
          console.log('✅ FINAL settings from database:', settings);

          // ✅ Cache the settings
          setCachedVoiceSettings(settings);
          setLastSettingsFetch(now);
        } else {
          console.log('⚠️ No custom settings found in database, using defaults:', settings);
        }
      } catch (error) {
        console.error('❌ ERROR fetching voice settings from database:');
        console.error('   Status:', error.response?.status);
        console.error('   Message:', error.message);
        console.error('   Response:', error.response?.data);

        // Fallback to localStorage
        const savedSettings = localStorage.getItem('tts_settings');
        if (savedSettings) {
          try {
            const parsed = JSON.parse(savedSettings);
            settings.selectedLanguages = parsed.selectedLanguages || [parsed.preferredLanguage || 'en'];
            settings.selectedChatterboxVoice = parsed.selectedChatterboxVoice || 'male';
            settings.speechRate = parseFloat(parsed.speechRate) || 0.9;
            settings.speechPitch = parseFloat(parsed.speechPitch) || 1.0;
            console.log('✅ Fallback: Using localStorage settings:', settings);
          } catch (e) {
            console.error('❌ Error parsing localStorage TTS settings:', e);
            console.log('⚠️ Using hardcoded defaults:', settings);
          }
        } else {
          console.log('⚠️ No localStorage settings found, using hardcoded defaults:', settings);
        }

        // ✅ Cache the fallback settings too
        setCachedVoiceSettings(settings);
        setLastSettingsFetch(now);
      }
    }

    console.log('═══════════════════════════════════════════════');
    console.log('🎙️ TICKET ANNOUNCEMENT - SETTINGS BEING USED:');
    console.log('═══════════════════════════════════════════════');
    console.log('  🎫 Ticket:', ticketNumber);
    console.log('  🏪 Counter:', counterNumber);
    console.log('  🌐 Languages:', settings.selectedLanguages);
    console.log('  🎤 Voice Type:', settings.selectedChatterboxVoice);
    console.log('  ⚡ Speech Rate:', settings.speechRate);
    console.log('  🎵 Speech Pitch:', settings.speechPitch);
    console.log('═══════════════════════════════════════════════');

    // Stop any existing audio (cleanup)
    if (typeof window !== 'undefined') {
      const existingAudios = document.querySelectorAll('audio');
      existingAudios.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
        audio.remove();
      });
      console.log('🧹 Cleaned up existing audio elements');
    }

    try {
      // Announce in each selected language sequentially (Box 1 first, then Box 2)
      for (let i = 0; i < settings.selectedLanguages.length; i++) {
        const lang = settings.selectedLanguages[i];
        const translation = translateTicketText(ticketNumber, counterNumber, lang);

        console.log(`📢 Box ${i + 1}: Announcing in ${lang}:`, translation.text);

        // Call ChatterBox AI synthesis endpoint
        const response = await axios.post(`${apiUrl}/voices/synthesize`, {
          text: translation.text,
          voice_type: settings.selectedChatterboxVoice || 'male',  // ✅ Fallback to 'male' instead of 'default'
          speed: settings.speechRate || 0.9,  // ✅ Changed from 'rate' to 'speed'
          pitch: settings.speechPitch || 1.0,
          language: lang
        });

        if (response.data.success && response.data.audioUrl) {
          console.log(`✅ Box ${i + 1} audio generated:`, response.data.audioUrl);

          // Construct proper audio URL - add cache buster
          let audioUrl = response.data.audioUrl;

          // If URL is relative, make it absolute
          if (!audioUrl.startsWith('http://') && !audioUrl.startsWith('https://')) {
            // Use Python TTS service URL (default: http://localhost:3002)
            const pythonServiceUrl = process.env.NEXT_PUBLIC_PYTHON_TTS_URL || 'http://localhost:3002';
            audioUrl = `${pythonServiceUrl}${audioUrl}`;
          }

          // Add cache buster to prevent caching issues
          audioUrl = `${audioUrl}?t=${Date.now()}`;

          console.log(`🔊 Box ${i + 1} final audio URL:`, audioUrl);

          // ⚡ REMOVED: HEAD request verification - adds unnecessary ~500ms delay
          // Audio player will handle errors automatically

          // Play audio and wait for completion before next language
          await new Promise((resolve, reject) => {
            const audio = new Audio();

            // ✅ HIGH QUALITY AUDIO PLAYBACK SETTINGS
            audio.volume = 0.95; // Slightly reduced to prevent clipping/distortion
            audio.preload = 'auto';
            audio.crossOrigin = 'anonymous';

            // Enable better audio processing (if supported by browser)
            if ('mozPreservesPitch' in audio) {
              audio.mozPreservesPitch = true; // Firefox
            }
            if ('webkitPreservesPitch' in audio) {
              audio.webkitPreservesPitch = true; // Chrome/Safari
            }
            if ('preservesPitch' in audio) {
              audio.preservesPitch = true; // Standard
            }

            // Set src AFTER setting up event listeners to avoid race conditions
            let isResolved = false;
            let playbackTimeout = null;

            // Cleanup function
            const cleanup = () => {
              if (playbackTimeout) clearTimeout(playbackTimeout);
              try {
                audio.pause();
                audio.src = '';
                audio.remove();
              } catch (e) { }
            };

            audio.onloadeddata = () => {
              console.log(`✅ Box ${i + 1} audio data loaded, starting playback...`);
            };

            audio.oncanplaythrough = () => {
              console.log(`✅ Box ${i + 1} audio can play through, duration: ${audio.duration}s`);
            };

            audio.onplay = () => {
              console.log(`▶️ Box ${i + 1} (${lang}) announcement started`);
              // Set a maximum timeout based on audio duration + buffer
              const maxDuration = (audio.duration || 30) * 1000 + 5000; // duration + 5s buffer
              playbackTimeout = setTimeout(() => {
                if (!isResolved) {
                  console.log(`⏰ Box ${i + 1} timeout reached, moving on...`);
                  isResolved = true;
                  cleanup();
                  resolve();
                }
              }, maxDuration);
            };

            audio.onended = () => {
              if (isResolved) return;
              isResolved = true;
              console.log(`✅ Box ${i + 1} (${lang}) announcement completed successfully`);
              cleanup();
              resolve();
            };

            let hasErrored = false; // Prevent infinite error loop

            audio.onerror = (e) => {
              if (hasErrored || isResolved) {
                console.log(`⏭️ Already handled error for Box ${i + 1}, skipping`);
                return;
              }
              hasErrored = true;
              isResolved = true;

              console.error(`❌ Box ${i + 1} audio error:`, e);
              console.error(`❌ Failed audio URL:`, audioUrl);
              console.error(`❌ Audio error code:`, audio.error?.code);
              console.error(`❌ Audio error message:`, audio.error?.message);

              cleanup();
              resolve(); // Continue to next language
            };

            // Set source and load
            audio.src = audioUrl;
            audio.load(); // Explicitly load the audio

            // Handle autoplay policy with user interaction requirement
            const playPromise = audio.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  console.log(`✅ Box ${i + 1} audio playing successfully`);
                  setAudioUnlocked(true); // Mark as unlocked on successful play
                })
                .catch(error => {
                  if (isResolved) return;

                  console.warn(`⚠️ Box ${i + 1} play blocked by browser:`, error.name);

                  // For NotAllowedError (autoplay blocked by browser)
                  if (error.name === 'NotAllowedError') {
                    console.log('🔄 AUTOPLAY BLOCKED - Auto-retrying on next interaction...');

                    // Auto-retry with aggressive approach
                    const retryPlay = async () => {
                      try {
                        // Force resume AudioContext
                        if (window.audioContext) {
                          if (window.audioContext.state === 'suspended') {
                            await window.audioContext.resume();
                          }
                          if (window.audioContext.state !== 'running') {
                            window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                          }
                        }

                        // Retry play immediately
                        await audio.play();
                        console.log(`✅ Box ${i + 1} audio playing after auto-retry`);
                        setAudioUnlocked(true);
                        setAudioEnabled(true);
                      } catch (retryError) {
                        // Silent fail - continue to next language
                        console.log(`⏭️ Box ${i + 1} skipped (browser policy)`);
                        if (!isResolved) {
                          isResolved = true;
                          cleanup();
                          resolve();
                        }
                      }
                    };

                    // Aggressive retry: multiple attempts
                    setTimeout(() => retryPlay(), 50);
                    setTimeout(() => retryPlay(), 200);
                    setTimeout(() => retryPlay(), 500);

                    // Also setup listeners for any page interaction
                    const interactionEvents = ['mousemove', 'scroll', 'touchstart', 'click', 'keydown'];
                    const handleInteraction = () => {
                      retryPlay();
                      interactionEvents.forEach(evt =>
                        document.removeEventListener(evt, handleInteraction)
                      );
                    };

                    interactionEvents.forEach(evt =>
                      document.addEventListener(evt, handleInteraction, { once: true, passive: true })
                    );
                  } else {
                    // For other errors, cleanup and continue
                    console.error(`❌ Box ${i + 1} playback error:`, error.message);
                    if (!isResolved) {
                      isResolved = true;
                      cleanup();
                      resolve();
                    }
                  }
                });
            }
          }).catch(err => {
            console.error(`❌ Promise rejected for Box ${i + 1}:`, err);
            // Continue even if this language fails
          });

          // Small pause between languages (200ms) - pehli complete hone ke turant baad dosri
          if (i < settings.selectedLanguages.length - 1) {
            console.log(`⏸️ Pausing 200ms before Box ${i + 2}...`);
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        } else {
          console.error(`❌ Box ${i + 1} synthesis failed:`, response.data);
        }
      }

      console.log('✅ All language announcements completed');

      // Display was already updated at START of announcement

      // Restore title
      if (typeof window !== 'undefined' && window.document) {
        document.title = 'Ticket Info Display';
      }
    } catch (error) {
      console.error('❌ ChatterBox AI announcement error:', error.message);
      // Show error for debugging on production
      if (typeof window !== 'undefined' && window.document) {
        document.title = `❌ Error: ${error.message}`;
        setTimeout(() => {
          document.title = 'Ticket Info Display';
        }, 5000);
      }
    } finally {
      setIsAnnouncing(false);
      isAnnouncingRef.current = false;
      // Check if there are pending tickets in queue
      setAnnouncementQueue(prev => {
        if (prev.length > 0) {
          const nextTicket = prev[0];
          console.log('📢 Processing next ticket from queue:', nextTicket);

          // Update display with next ticket
          setTimeout(() => {
            setCalledTicket(nextTicket.ticket);
            setCurrentCounter(nextTicket.counter);
            setLastAnnouncedTime(nextTicket.timestamp);
            // Add to announced timestamps history and save to localStorage
            setAnnouncedTimestamps(prevSet => {
              const newSet = new Set([...prevSet, nextTicket.timestamp]);
              announcedTimestampsRef.current = newSet; // ✅ Update ref immediately
              localStorage.setItem('announced_timestamps', JSON.stringify([...newSet]));
              return newSet;
            });
            console.log('✅ Added queued ticket timestamp to history and saved to localStorage:', nextTicket.timestamp);
          }, 500); // Small delay before next ticket

          // Remove processed ticket from queue
          return prev.slice(1);
        }
        return prev;
      });
    }
  };

  // Voice announcement when new ticket is called
  useEffect(() => {
    console.log('🔊 Voice effect triggered with:', {
      lastAnnouncedTime,
      lastVoiceTime,
      calledTicket,
      currentCounter,
      aiVoiceReady,
      isAnnouncing,
      isAnnouncingRef: isAnnouncingRef.current,
      queueLength: announcementQueue.length,
      timeDiff: lastAnnouncedTime && lastVoiceTime ? lastAnnouncedTime - lastVoiceTime : 'N/A'
    });

    // ✅ CRITICAL: Check REF first to prevent double announcements during simultaneous calls
    if (isAnnouncingRef.current) {
      console.log('⚠️ Announcement in progress (REF check), ignoring new trigger');
      return;
    }

    // Double-check state as well
    if (isAnnouncing) {
      console.log('⚠️ Announcement in progress (STATE check), ignoring new trigger');
      return;
    }

    // Only trigger announcement if we have a new ticket and all languages can complete
    if (lastAnnouncedTime && lastAnnouncedTime !== lastVoiceTime && calledTicket && aiVoiceReady) {
      console.log('✅ All conditions met, scheduling AI voice announcement');
      console.log('📊 Announcement details:', {
        ticket: calledTicket,
        counter: currentCounter,
        timestamp: new Date(lastAnnouncedTime).toISOString()
      });
      setLastVoiceTime(lastAnnouncedTime);

      // Small delay to ensure everything is ready
      setTimeout(() => {
        // ✅ Double-check before calling - prevents race conditions during delay
        if (isAnnouncingRef.current) {
          console.log('⚠️ Announcement started during setTimeout delay, skipping this call');
          return;
        }

        console.log('🎤 Calling announceTicket function NOW');
        console.log('🔒 Display will remain locked until ALL languages complete');
        announceTicket(calledTicket, currentCounter)
          .catch(error => {
            console.error('❌ announceTicket failed:', error);
            setIsAnnouncing(false); // Unlock on error
            isAnnouncingRef.current = false; // Unlock ref on error
          });
      }, 150);
    } else {
      if (!lastAnnouncedTime) console.log('⏸️ Waiting: lastAnnouncedTime is null');
      if (lastAnnouncedTime === lastVoiceTime) console.log('⏸️ Skipping: Already announced this ticket');
      if (!calledTicket) console.log('⏸️ Waiting: calledTicket is empty');
      if (!aiVoiceReady) console.log('⏸️ Waiting: ChatterBox AI service not ready');
    }
  }, [lastAnnouncedTime, calledTicket, currentCounter, lastVoiceTime, aiVoiceReady, isAnnouncing, announcementQueue]);

  return (
    <ProtectedRoute allowedRoles={['ticket_info']}>
      <div className="ticket-display-root flex flex-col h-screen w-full bg-white text-white font-sans overflow-hidden">

        {/* Enable Audio Button - Floating at top */}
        {!audioEnabled && (
          <div className="fixed top-[1vh] left-1/2 transform -translate-x-1/2 z-50">
            <button
              onClick={handleEnableAudio}
              className="enable-audio-btn bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-2xl animate-bounce border-2 border-white"
            >
              🔊 Click to Enable Audio
            </button>
          </div>
        )}

        {/* Header Section - Logos + Now Calling */}
        <div className="header-section w-full flex flex-row justify-around items-center bg-white/95 shadow-lg border-b border-gray-300">
          {/* Left Logo */}
          <div className="header-logo-box text-center">
            {leftLogoUrl ? (
              <img
                src={`${apiUrlWs}${leftLogoUrl}`}
                alt="Left Logo"
                className="header-logo mx-auto object-contain"
              />
            ) : (
              <img
                src={logo}
                alt="Logo"
                className="header-logo mx-auto object-contain"
              />
            )}
          </div>

          {/* Now Calling Section */}
          <div className="now-calling-box text-center border-l-[3px] border-r-[3px] border-gray-300">
            <div className="text-black font-bold">
              <b className="now-calling-label text-red-600">Now Calling</b>
              <br />
              <span className="now-calling-ticket uppercase font-bold">{displayedTicket || 'Waiting...'}</span>
              {displayedTicket && (
                <>
                  <span className="now-calling-dash inline-block bg-black align-middle rounded-sm"></span>
                  <span className="now-calling-ticket font-bold">{displayedCounter || 'N/A'}</span>
                </>
              )}
            </div>
          </div>

          {/* Right Logo */}
          <div className="header-logo-box text-center">
            {rightLogoUrl ? (
              <img
                src={`${apiUrlWs}${rightLogoUrl}`}
                alt="Right Logo"
                className="header-logo mx-auto object-contain"
              />
            ) : (
              <img
                src={logo}
                alt="Logo"
                className="header-logo mx-auto object-contain"
              />
            )}
          </div>
        </div>

        {/* Full Width Table Section */}
        <div className="flex-1 bg-green-700 flex flex-col overflow-hidden overflow-y-auto">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className="table-header bg-green-700 text-white text-center font-bold shadow-lg">
                  Ticket
                </th>
                <th className="table-header bg-green-700 text-white text-center font-bold shadow-lg">
                  Counter
                </th>
              </tr>
            </thead>
            <tbody>
              {calledTickets.length === 0 ? (
                <tr>
                  <td colSpan="2" className="bg-white text-gray-500 table-empty-text text-center">
                    No tickets called yet
                  </td>
                </tr>
              ) : (
                (() => {
                  // Filter unique tickets by ticket_number AND ensure status is 'called' (case-insensitive)
                  const filteredForDisplay = calledTickets.filter(ticket =>
                    ticket.status && ticket.status.toLowerCase() === 'called'
                  );
                  console.log('🖥️ DISPLAY TABLE: Rendering tickets:', filteredForDisplay.map(t => ({
                    ticket: t.ticket_number,
                    status: t.status,
                    counter: t.counter_no
                  })));

                  // Get unique tickets and sort: current calling ticket at top
                  const uniqueTickets = Array.from(new Map(
                    filteredForDisplay.map(item => [item.ticket_number, item])
                  ).values());

                  // Normalize ticket numbers for comparison (remove spaces, lowercase)
                  const normalizeTicket = (ticket) => {
                    return ticket ? String(ticket).toLowerCase().trim() : '';
                  };

                  // Use displayedTicket (currently announcing) for sorting, not calledTicket
                  const currentTicketNormalized = normalizeTicket(displayedTicket);

                  console.log('🎯 Current ANNOUNCING ticket (normalized):', currentTicketNormalized);
                  console.log('🎯 All tickets in table:', uniqueTickets.map(t => normalizeTicket(t.ticket_number)));

                  // Sort: currently ANNOUNCING ticket first (displayedTicket), then rest by time
                  const sortedTickets = uniqueTickets.sort((a, b) => {
                    const aNormalized = normalizeTicket(a.ticket_number);
                    const bNormalized = normalizeTicket(b.ticket_number);

                    // If this is the currently calling ticket, move to top
                    if (aNormalized === currentTicketNormalized) return -1;
                    if (bNormalized === currentTicketNormalized) return 1;
                    // Otherwise sort by called_at (newest first)
                    return new Date(b.called_at) - new Date(a.called_at);
                  });

                  return sortedTickets
                    .slice(0, 10) // Show top 10
                    .map((item, index) => {
                      // Highlight the currently ANNOUNCING ticket (displayedTicket)
                      const isCurrentTicket = normalizeTicket(item.ticket_number) === currentTicketNormalized;
                      const bgColor = isCurrentTicket ? 'bg-yellow-200' : 'bg-white';

                      return (
                        <tr key={index} className={`border-b-2 border-[#e6e9ec] ${isCurrentTicket ? 'animate-pulse' : ''}`}>
                          <td className={`table-cell-text ${bgColor} text-black uppercase text-center align-middle font-bold`}>
                            {item.ticket_number}
                          </td>
                          <td className={`table-cell-text ${bgColor} text-black text-center align-middle font-bold`}>
                            {item.counter_no || 'N/A'}
                          </td>
                        </tr>
                      );
                    });
                })()
              )}
            </tbody>
          </table>
        </div>

        {/* News Ticker - Dynamic from database */}
        <div className="ticker-bar w-full bg-[#333] text-white font-bold flex items-center justify-center">
          <marquee className="w-full">{tickerContent}</marquee>
        </div>

        {/* ============================================ */}
        {/* VW-BASED RESPONSIVE STYLES                   */}
        {/* Works on ANY resolution proportionally        */}
        {/* 344x1032, 1920x1080, 4K etc.                */}
        {/* ============================================ */}
        <style jsx>{`
        /* ---- Base: Use vw for all sizing so everything scales with screen width ---- */
        
        .enable-audio-btn {
          font-size: clamp(10px, 3.5vw, 24px);
          padding: clamp(4px, 1.2vw, 16px) clamp(8px, 3vw, 32px);
        }
        
        /* Header */
        .header-section {
          padding: clamp(4px, 1vw, 12px) 0;
          min-height: clamp(50px, 12vw, 150px);
        }
        
        .header-logo-box {
          flex: 0 0 25%;
          padding: 0 clamp(2px, 0.5vw, 8px);
        }
        
        .header-logo {
          width: auto;
          height: clamp(30px, 9vw, 130px);
          max-width: 100%;
        }
        
        .now-calling-box {
          flex: 0 0 50%;
          padding: clamp(2px, 0.5vw, 8px) clamp(4px, 1vw, 16px);
        }
        
        .now-calling-label {
          font-size: clamp(12px, 5vw, 50px);
          line-height: 1.2;
        }
        
        .now-calling-ticket {
          font-size: clamp(14px, 5.5vw, 50px);
          line-height: 1.2;
        }
        
        .now-calling-dash {
          width: clamp(12px, 4vw, 50px);
          height: clamp(2px, 0.5vw, 8px);
          margin: 0 clamp(4px, 0.8vw, 12px);
        }
        
        /* Table Header */
        .table-header {
          font-size: clamp(14px, 5.5vw, 80px);
          padding: clamp(4px, 1.2vw, 15px) clamp(2px, 0.5vw, 8px);
        }
        
        /* Table Cells */
        .table-cell-text {
          font-size: clamp(16px, 7vw, 100px);
          padding: clamp(4px, 1.5vw, 20px) clamp(2px, 0.5vw, 8px);
        }
        
        .table-empty-text {
          font-size: clamp(10px, 3vw, 24px);
          padding: clamp(8px, 2vw, 32px) 0;
        }
        
        /* Ticker */
        .ticker-bar {
          font-size: clamp(10px, 3.5vw, 32px);
          padding: clamp(4px, 1vw, 16px);
          min-height: clamp(28px, 5vw, 70px);
        }
        
        /* ---- Portrait narrow screens (like 344x1032) ---- */
        /* When width < height (portrait orientation) AND narrow */
        @media (max-width: 500px) and (min-height: 700px) {
          .header-section {
            min-height: clamp(50px, 8vh, 120px);
            padding: clamp(2px, 0.5vh, 6px) 0;
          }
          
          .header-logo {
            height: clamp(25px, 6vh, 80px);
          }
          
          .now-calling-label {
            font-size: clamp(12px, 4.5vw, 28px);
          }
          
          .now-calling-ticket {
            font-size: clamp(14px, 5vw, 32px);
          }
          
          .table-header {
            font-size: clamp(14px, 5vw, 36px);
            padding: clamp(3px, 1vw, 8px);
          }
          
          .table-cell-text {
            font-size: clamp(16px, 6.5vw, 42px);
            padding: clamp(6px, 2vw, 12px) clamp(2px, 0.5vw, 4px);
          }
          
          .ticker-bar {
            font-size: clamp(9px, 3vw, 18px);
            min-height: clamp(24px, 4vh, 50px);
          }
        }
        
        /* ---- Ultra narrow screens (below 360px width) ---- */
        @media (max-width: 360px) {
          .header-logo-box {
            flex: 0 0 22%;
          }
          
          .now-calling-box {
            flex: 0 0 56%;
          }
          
          .now-calling-label {
            font-size: clamp(11px, 4vw, 20px);
          }
          
          .now-calling-ticket {
            font-size: clamp(12px, 4.5vw, 22px);
          }
          
          .header-logo {
            height: clamp(22px, 7vw, 50px);
          }
          
          .table-header {
            font-size: clamp(12px, 4.5vw, 24px);
            padding: clamp(2px, 0.8vw, 6px);
          }
          
          .table-cell-text {
            font-size: clamp(14px, 6vw, 32px);
            padding: clamp(4px, 1.5vw, 10px) clamp(1px, 0.3vw, 4px);
          }
          
          .now-calling-dash {
            width: clamp(8px, 3vw, 20px);
            height: 2px;
            margin: 0 clamp(2px, 0.5vw, 6px);
          }
        }

        /* ---- Large Screens (1440px+) ---- */
        @media (min-width: 1440px) {
          .table-header {
            font-size: clamp(48px, 4.5vw, 100px);
            padding: clamp(8px, 0.8vw, 15px);
          }
          
          .table-cell-text {
            font-size: clamp(65px, 5.5vw, 120px);
            padding: clamp(8px, 1vw, 20px);
          }
          
          .now-calling-label {
            font-size: clamp(36px, 3.2vw, 60px);
          }
          
          .now-calling-ticket {
            font-size: clamp(36px, 3.2vw, 60px);
          }
          
          .header-logo {
            height: clamp(80px, 7vw, 140px);
          }
        }
        
        /* Smooth scrolling for touch */
        .overflow-y-auto {
          -webkit-overflow-scrolling: touch;
        }
        
        /* Prevent text overflow on narrow screens */
        .table-cell-text,
        .table-header,
        .now-calling-ticket {
          word-break: break-word;
          overflow-wrap: break-word;
        }
      `}</style>
      </div>
    </ProtectedRoute>
  );
}

// Export wrapped component with Suspense
export default function TicketInfo() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    }>
      <TicketInfoContent />
    </Suspense>
  );
}
