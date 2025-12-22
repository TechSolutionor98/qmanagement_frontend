'use client';
import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/utils/axiosInstance';
import { getToken, getUser } from '@/utils/sessionStorage';

// Memoized components for better performance
const TicketCard = memo(({ ticket, isCurrentTicket, onSelect, isAccepted }) => {
  const handleClick = useCallback(() => {
    if (isAccepted) {
      alert('Please complete or cancel the current ticket before selecting a transferred ticket.');
      return;
    }
    onSelect(ticket.ticketNumber);
  }, [isAccepted, onSelect, ticket.ticketNumber]);

  return (
    <tr 
      onClick={handleClick}
      className={`cursor-pointer transition-colors ${
        isCurrentTicket 
          ? 'bg-blue-200 hover:bg-blue-300' 
          : 'hover:bg-blue-100'
      }`}
    >
      <td className="px-6 py-4 uppercase whitespace-nowrap text-sm font-medium text-blue-900">
        {ticket.ticketNumber?.toString().toUpperCase()}
      </td>
      <td className="px-6 py-4 uppercase whitespace-nowrap text-sm text-gray-900">
        {ticket.service?.toUpperCase()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {ticket.transfer_by || 'N/A'}
      </td>
    </tr>
  );
});

TicketCard.displayName = 'TicketCard';

const UnassignedTicketRow = memo(({ ticket }) => (
  <tr className="hover:bg-gray-50">
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.id}</td>
    <td className="px-6 py-4 uppercase whitespace-nowrap text-sm font-medium text-gray-900">
      {ticket.ticketNumber?.toString().toUpperCase()}
    </td>
    <td className="px-6 py-4 uppercase whitespace-nowrap text-sm text-gray-900">
      {ticket.service?.toUpperCase()}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{ticket.submissionTime}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{ticket.submissionDate}</td>
  </tr>
));

UnassignedTicketRow.displayName = 'UnassignedTicketRow';

export default function UserDashboard({ adminId = null }) {
  const router = useRouter();
  const [currentTicket, setCurrentTicket] = useState('');
  const [manualTicketId, setManualTicketId] = useState('');
  const [totalPending, setTotalPending] = useState(0);
  const [unassignedTickets, setUnassignedTickets] = useState([]);
  const [assignedServices, setAssignedServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visibleTickets, setVisibleTickets] = useState(5);
  const [isCalling, setIsCalling] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [notSolvedReason, setNotSolvedReason] = useState('');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferUsername, setTransferUsername] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [showNextConfirmModal, setShowNextConfirmModal] = useState(false);
  const [isNextProcessing, setIsNextProcessing] = useState(false);
  const [isTransferProcessing, setIsTransferProcessing] = useState(false);
  const [isNotSolvedProcessing, setIsNotSolvedProcessing] = useState(false);
  const [transferredTickets, setTransferredTickets] = useState([]);
  const [showCalledDrawer, setShowCalledDrawer] = useState(false);
  const [calledTickets, setCalledTickets] = useState([]);
  const [userCounter, setUserCounter] = useState(null);
  const [showNextButton, setShowNextButton] = useState(true);
  const [showTransferButton, setShowTransferButton] = useState(true);
  const [noPermissions, setNoPermissions] = useState(false);

  // Refs for broadcast channels to avoid recreating them
  const lockChannelRef = useRef(null);
  const transferChannelRef = useRef(null);
  const callChannelRef = useRef(null);

  const apiUrl = useMemo(() => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api', []);
  const isSuperAdminMode = useMemo(() => adminId !== null, [adminId]);

  // Memoized refresh permissions function
  const refreshUserPermissions = useCallback(async () => {
    const token = getToken();
    const user = getUser();
    
    if (!token || !user) return;

    try {
      const response = await axios.get(`${apiUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const freshUser = response.data.user || response.data;
      
      if (freshUser && freshUser.permissions) {
        const updatedUser = { ...user, permissions: freshUser.permissions };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('storage'));
        
        if (!freshUser.permissions.canCallTickets) {
          setNoPermissions(true);
        } else {
          setNoPermissions(false);
        }
      }
    } catch (error) {
      console.error('❌ Failed to refresh permissions:', error);
    }
  }, [apiUrl]);

  // Optimized fetchAssignedTickets with useCallback
  const fetchAssignedTickets = useCallback(async (showLoader = false) => {
    if (noPermissions && !isSuperAdminMode) return;
    const token = getToken();
    if (!token) return;
    
    try {
      if (showLoader) setLoading(true);
      
      const endpoint = isSuperAdminMode 
        ? `${apiUrl}/user/tickets/assigned?status=Pending&adminId=${adminId}`
        : `${apiUrl}/user/tickets/assigned?status=Pending`;
      
      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        const allTickets = res.data.tickets || [];
        const services = res.data.assignedServices || [];
        
        const userStr = localStorage.getItem('user');
        const currentUser = userStr ? JSON.parse(userStr) : null;
        const currentUsername = currentUser?.username || '';
        
        const transferred = allTickets.filter(t => t.transfered === currentUsername && t.transfer_by);
        const regular = allTickets.filter(t => !(t.transfered === currentUsername && t.transfer_by));
        
        setUnassignedTickets(regular);
        setTransferredTickets(transferred);
        setTotalPending(regular.length);
        setAssignedServices(services);
        
        const tickets = regular;
        const currentExistsInRegular = tickets.some(t => t.ticketNumber === currentTicket);
        const currentExistsInTransferred = transferred.some(t => t.ticketNumber === currentTicket);
        
        if (currentExistsInTransferred) {
          // Keep transferred ticket
        } else if (!currentTicket && tickets.length > 0) {
          setCurrentTicket(tickets[0].ticketNumber);
        } else if (currentTicket && !currentExistsInRegular && !currentExistsInTransferred && !isCalling && !isAccepted) {
          if (tickets.length > 0) {
            setCurrentTicket(tickets[0].ticketNumber);
          } else {
            setCurrentTicket('');
          }
        }
      }
    } catch (error) {
      console.error('[UserDashboard] Error fetching tickets:', error);
      
      if (error.response?.status === 403 && error.response?.data?.missing_permission) {
        alert(error.response.data.message || 'You do not have permission to access the dashboard');
        const user = getUser();
        let permissions = user?.permissions;
        if (typeof permissions === 'string') {
          try { permissions = JSON.parse(permissions); } catch (e) { permissions = null; }
        }
        if (permissions?.canCreateTickets) {
          router.push('/user/completed-tasks');
        } else {
          router.push('/login');
        }
        return;
      }
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [noPermissions, isSuperAdminMode, apiUrl, adminId, currentTicket, isCalling, isAccepted, router]);

  // Optimized fetchAvailableUsers
  const fetchAvailableUsers = useCallback(async () => {
    if (noPermissions && !isSuperAdminMode) return;
    const token = getToken();
    if (!token) return;
    
    try {
      const endpoint = isSuperAdminMode 
        ? `${apiUrl}/user/all?adminId=${adminId}`
        : `${apiUrl}/user/all`;
      
      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        setAvailableUsers(res.data.users || res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, [noPermissions, isSuperAdminMode, apiUrl, adminId]);

  // Optimized fetchCalledTickets
  const fetchCalledTickets = useCallback(async () => {
    if (noPermissions && !isSuperAdminMode) return;
    const token = getToken();
    if (!token) return;
    
    try {
      const endpoint = isSuperAdminMode
        ? `${apiUrl}/user/called-tickets/today?adminId=${adminId}`
        : `${apiUrl}/user/called-tickets/today`;
      
      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        setCalledTickets(res.data.tickets || []);
      }
    } catch (error) {
      console.error('Error fetching called tickets:', error);
      setCalledTickets([]);
    }
  }, [noPermissions, isSuperAdminMode, apiUrl, adminId]);

  // Memoized handlers
  const handleCall = useCallback(async () => {
    if (noPermissions && !isSuperAdminMode) return;
    if (currentTicket && !isCalling) {
      const token = getToken();
      if (!token) return;
      
      setIsCalling(true);
      
      try {
        const requestBody = isSuperAdminMode 
          ? { ticketNumber: currentTicket, adminId: adminId, isSuperAdmin: true }
          : { ticketNumber: currentTicket };
        
        const response = await axios.post(
          `${apiUrl}/user/call-ticket`,
          requestBody,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        let counterNumber = response.data.counterNo;
        if (!counterNumber || counterNumber === 'ADMIN_PANEL') {
          const ticketPrefix = currentTicket.split('-')[0];
          counterNumber = ticketPrefix || 'Counter 1';
        }
        
        const broadcastAdminId = response.data.adminId || adminId || null;
        const userStr = localStorage.getItem('user');
        const currentUser = userStr ? JSON.parse(userStr) : null;
        
        const ticketData = {
          ticket: currentTicket,
          counter: counterNumber,
          adminId: broadcastAdminId,
          caller: currentUser?.username || 'Unknown',
          timestamp: new Date().getTime()
        };
        
        localStorage.setItem('latest_ticket_call', JSON.stringify(ticketData));
        
        const channel = new BroadcastChannel('ticket-calls');
        channel.postMessage(ticketData);
        channel.close();
        
      } catch (error) {
        console.error('[UserDashboard] Error calling ticket:', error);
        
        if (error.response?.data?.no_counter && !isSuperAdminMode) {
          alert(error.response.data.message);
          router.push('/login');
        } else if (error.response?.data?.no_counter && isSuperAdminMode) {
          alert('Note: Counter validation skipped in Super Admin mode. Ticket called successfully.');
        } else {
          alert(`❌ Failed to call ticket: ${error.response?.data?.message || error.message}`);
        }
      } finally {
        setTimeout(() => setIsCalling(false), 2000);
      }
    }
  }, [noPermissions, isSuperAdminMode, currentTicket, isCalling, apiUrl, adminId, router]);

  const handleAccept = useCallback(async () => {
    if (noPermissions && !isSuperAdminMode) return;
    const token = getToken();
    if (!token) return;
    
    try {
      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;
      
      const requestBody = isSuperAdminMode
        ? { lock: true, user_id: currentUser?.id, adminId: adminId }
        : { lock: true, user_id: currentUser?.id };
      
      await axios.post(
        `${apiUrl}/tickets/${currentTicket}/lock`,
        requestBody,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const lockChannel = new BroadcastChannel('ticket-locks');
      lockChannel.postMessage({
        ticketNumber: currentTicket,
        locked: true,
        userId: currentUser?.id
      });
      lockChannel.close();
      
      setIsAccepted(true);
      setTimer(0);
      
      const interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
      setTimerInterval(interval);
      
    } catch (error) {
      console.error('Error locking ticket:', error);
      
      if (error.response?.status === 409) {
        alert('This ticket has already been accepted by another user.');
      } else {
        alert('Failed to accept ticket. Please try again.');
      }
      
      await fetchAssignedTickets(false);
    }
  }, [noPermissions, isSuperAdminMode, currentTicket, apiUrl, adminId, fetchAssignedTickets]);

  const handleSolved = useCallback(async () => {
    if (noPermissions && !isSuperAdminMode) return;
    const token = getToken();
    if (!token) return;
    
    try {
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
      
      const unlockBody = isSuperAdminMode ? { lock: false, adminId: adminId } : { lock: false };
      await axios.post(
        `${apiUrl}/tickets/${currentTicket}/lock`,
        unlockBody,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const updateBody = isSuperAdminMode 
        ? { status: 'Solved', serviceTimeSeconds: timer, adminId: adminId }
        : { status: 'Solved', serviceTimeSeconds: timer };
      
      await axios.put(
        `${apiUrl}/tickets/${currentTicket}`,
        updateBody,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const solvedTicket = currentTicket;
      
      const lockChannel = new BroadcastChannel('ticket-locks');
      lockChannel.postMessage({
        ticketNumber: solvedTicket,
        locked: false
      });
      lockChannel.close();
      
      setIsAccepted(false);
      setTimer(0);
      setCurrentTicket('');
      
      await fetchAssignedTickets(false);
      
    } catch (error) {
      console.error('Error marking ticket as solved:', error);
    }
  }, [noPermissions, isSuperAdminMode, currentTicket, timer, timerInterval, apiUrl, adminId, fetchAssignedTickets]);

  const formatTimer = useCallback((seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, []);

  // Additional handlers
  const handleNext = useCallback(() => {
    if (noPermissions && !isSuperAdminMode) return;
    setShowNextConfirmModal(true);
  }, [noPermissions, isSuperAdminMode]);

  const handleNextConfirm = useCallback(async () => {
    if (noPermissions && !isSuperAdminMode) return;
    const token = getToken();
    if (!token) return;
    
    setIsNextProcessing(true);
    
    try {
      const requestBody = isSuperAdminMode
        ? { status: 'Unattended', adminId: adminId }
        : { status: 'Unattended' };
      
      await axios.put(
        `${apiUrl}/tickets/${currentTicket}`,
        requestBody,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setCurrentTicket('');
      await fetchAssignedTickets(false);
      setShowNextConfirmModal(false);
      setIsNextProcessing(false);
    } catch (error) {
      console.error('Error marking ticket as unattended:', error);
      setShowNextConfirmModal(false);
      setIsNextProcessing(false);
    }
  }, [noPermissions, isSuperAdminMode, currentTicket, apiUrl, adminId, fetchAssignedTickets]);

  const handleNotSolved = useCallback(() => {
    if (noPermissions && !isSuperAdminMode) return;
    setShowReasonModal(true);
  }, [noPermissions, isSuperAdminMode]);

  const handleNotSolvedSubmit = useCallback(async () => {
    if (noPermissions && !isSuperAdminMode) return;
    const token = getToken();
    if (!token) return;
    
    setIsNotSolvedProcessing(true);
    
    try {
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
      
      const unlockBody = isSuperAdminMode ? { lock: false, adminId: adminId } : { lock: false };
      await axios.post(
        `${apiUrl}/tickets/${currentTicket}/lock`,
        unlockBody,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const updateBody = isSuperAdminMode
        ? { status: 'Not Solved', reason: notSolvedReason, serviceTimeSeconds: timer, adminId: adminId }
        : { status: 'Not Solved', reason: notSolvedReason, serviceTimeSeconds: timer };
      
      await axios.put(
        `${apiUrl}/tickets/${currentTicket}`,
        updateBody,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const notSolvedTicket = currentTicket;
      
      const lockChannel = new BroadcastChannel('ticket-locks');
      lockChannel.postMessage({
        ticketNumber: notSolvedTicket,
        locked: false
      });
      lockChannel.close();
      
      setIsAccepted(false);
      setTimer(0);
      setNotSolvedReason('');
      setCurrentTicket('');
      
      await fetchAssignedTickets(false);
      
      setShowReasonModal(false);
      setIsNotSolvedProcessing(false);
      
    } catch (error) {
      console.error('Error marking ticket as not solved:', error);
      setIsNotSolvedProcessing(false);
    }
  }, [noPermissions, isSuperAdminMode, currentTicket, timer, timerInterval, notSolvedReason, apiUrl, adminId, fetchAssignedTickets]);

  const handleTransfer = useCallback(async () => {
    if (noPermissions && !isSuperAdminMode) return;
    const token = getToken();
    if (!token) return;
    
    try {
      const endpoint = isSuperAdminMode
        ? `${apiUrl}/user/all?adminId=${adminId}`
        : `${apiUrl}/user/all`;
      
      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        setAvailableUsers(res.data.users || res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setAvailableUsers([]);
    }
    
    setShowTransferModal(true);
  }, [noPermissions, isSuperAdminMode, apiUrl, adminId]);

  const handleTransferSubmit = useCallback(async () => {
    if (noPermissions && !isSuperAdminMode) return;
    const token = getToken();
    if (!token || !transferUsername.trim()) return;
    
    setIsTransferProcessing(true);
    
    try {
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
      
      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;
      
      if (!currentUser || !currentUser.username) {
        alert('Error: Unable to identify current user. Please refresh and try again.');
        setIsTransferProcessing(false);
        return;
      }
      
      const targetUser = availableUsers.find(u => u.username === transferUsername.trim());
      
      if (!targetUser) {
        alert(`Error: User "${transferUsername}" not found. Please select a valid user from the list.`);
        setIsTransferProcessing(false);
        return;
      }
      
      if (currentUser?.admin_id && targetUser?.admin_id && currentUser.admin_id !== targetUser.admin_id) {
        alert(`Error: User "${transferUsername}" is not under the same admin. You can only transfer tickets to users within your admin group.`);
        setIsTransferProcessing(false);
        return;
      }
      
      const transferByUsername = currentUser.username;
      
      const unlockBody = isSuperAdminMode ? { lock: false, adminId: adminId } : { lock: false };
      await axios.post(
        `${apiUrl}/tickets/${currentTicket}/lock`,
        unlockBody,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const transferBody = isSuperAdminMode
        ? { transferred_to: transferUsername, reason: `Transferred to ${transferUsername}`, transfer_by: transferByUsername, adminId: adminId }
        : { transferred_to: transferUsername, reason: `Transferred to ${transferUsername}`, transfer_by: transferByUsername };
      
      await axios.post(
        `${apiUrl}/tickets/${currentTicket}/transfer`,
        transferBody,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const transferredTicket = currentTicket;
      
      setIsAccepted(false);
      setIsCalling(false);
      setTimer(0);
      setTransferUsername('');
      setCurrentTicket('');
      
      const lockChannel = new BroadcastChannel('ticket-locks');
      lockChannel.postMessage({
        ticketNumber: transferredTicket,
        locked: false
      });
      lockChannel.close();
      
      const transferChannel = new BroadcastChannel('ticket-transfers');
      transferChannel.postMessage({
        ticketNumber: transferredTicket,
        transferredTo: transferUsername,
        transferredBy: currentUser?.username || ''
      });
      transferChannel.close();
      
      await fetchAssignedTickets(false);
      
      setShowTransferModal(false);
      setIsTransferProcessing(false);
      
      alert(`Ticket successfully transferred to ${transferUsername}`);
      
    } catch (error) {
      console.error('Error transferring ticket:', error);
      alert('Failed to transfer ticket. Please try again.');
      setIsTransferProcessing(false);
    }
  }, [noPermissions, isSuperAdminMode, currentTicket, timer, timerInterval, transferUsername, availableUsers, apiUrl, adminId, fetchAssignedTickets]);

  const loadMoreTickets = useCallback(() => {
    if (noPermissions && !isSuperAdminMode) return;
    fetchAssignedTickets(false);
  }, [noPermissions, isSuperAdminMode, fetchAssignedTickets]);

  // Permission check effect
  useEffect(() => {
    const checkPermissions = async () => {
      const token = getToken();
      const user = getUser();
      
      if (!token || !user) {
        router.push('/login');
        return;
      }

      let permissions = user.permissions;
      if (typeof permissions === 'string') {
        try {
          permissions = JSON.parse(permissions);
        } catch (e) {
          permissions = null;
        }
      }

      if (user.role !== 'admin' && user.role !== 'super_admin' && (!permissions || !permissions.canCallTickets)) {
        setNoPermissions(true);
        return;
      }

      setNoPermissions(false);
    };

    checkPermissions();
    
    const permissionRefreshInterval = setInterval(() => {
      refreshUserPermissions();
    }, 30000); // 30 seconds instead of 5 for better performance

    return () => {
      clearInterval(permissionRefreshInterval);
    };
  }, [router, refreshUserPermissions]);

  // Counter check effect
  useEffect(() => {
    const checkUserCounter = async () => {
      if (isSuperAdminMode) {
        setUserCounter('SUPER_ADMIN');
        return;
      }
      
      const token = getToken();
      const user = getUser();
      
      if (!token || !user) {
        router.push('/login');
        return;
      }

      try {
        const response = await axios.get(`${apiUrl}/user/session/counter`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success && response.data.counter_no) {
          setUserCounter(response.data.counter_no);
        } else if (user.counter_no) {
          setUserCounter(user.counter_no);
        }
      } catch (error) {
        if (user.counter_no) {
          setUserCounter(user.counter_no);
        }
      }
    };

    checkUserCounter();
  }, [router, apiUrl, isSuperAdminMode]);

  // Fetch button settings
  useEffect(() => {
    const fetchButtonSettings = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const response = await axios.get(`${apiUrl}/button-settings`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setShowNextButton(response.data.settings.showNextButton);
          setShowTransferButton(response.data.settings.showTransferButton);
        }
      } catch (error) {
        setShowNextButton(true);
        setShowTransferButton(true);
      }
    };

    fetchButtonSettings();
  }, [apiUrl]);

  // Initial fetch
  useEffect(() => {
    fetchAssignedTickets();
    fetchAvailableUsers();
  }, [fetchAssignedTickets, fetchAvailableUsers]);

  // Broadcast channel listeners
  useEffect(() => {
    lockChannelRef.current = new BroadcastChannel('ticket-locks');
    transferChannelRef.current = new BroadcastChannel('ticket-transfers');
    callChannelRef.current = new BroadcastChannel('ticket-calls');

    lockChannelRef.current.onmessage = (event) => {
      const { ticketNumber, locked, userId } = event.data;
      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;
      
      if (locked && userId !== currentUser?.id) {
        setUnassignedTickets(prev => prev.filter(t => t.ticketNumber !== ticketNumber));
        setCurrentTicket(prev => {
          if (prev === ticketNumber) {
            fetchAssignedTickets(false);
            return '';
          }
          return prev;
        });
        setTotalPending(prev => Math.max(0, prev - 1));
      }
      
      if (!locked) {
        fetchAssignedTickets(false);
      }
    };

    transferChannelRef.current.onmessage = (event) => {
      const { transferredTo } = event.data;
      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;
      
      if (currentUser && transferredTo === currentUser.username) {
        fetchAssignedTickets(false);
      }
    };

    callChannelRef.current.onmessage = (event) => {
      const { ticket, caller } = event.data;
      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;
      
      if (currentUser && caller && caller !== currentUser.username) {
        setUnassignedTickets(prev => prev.filter(t => t.ticketNumber !== ticket));
        setTotalPending(prev => Math.max(0, prev - 1));
        setCurrentTicket(prev => {
          if (prev === ticket) {
            setTimeout(() => fetchAssignedTickets(false), 100);
            return '';
          }
          return prev;
        });
      }
    };

    return () => {
      lockChannelRef.current?.close();
      transferChannelRef.current?.close();
      callChannelRef.current?.close();
    };
  }, [fetchAssignedTickets]);

  // Polling effect - reduced frequency for better performance
  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchAssignedTickets(false);
    }, 3000); // 3 seconds instead of 1 for better performance

    return () => clearInterval(pollInterval);
  }, [fetchAssignedTickets]);

  // Timer cleanup
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  // Memoized callbacks for child components
  const handleSelectTicket = useCallback((ticketNumber) => {
    if (isAccepted) {
      alert('Please complete or cancel the current ticket before selecting a transferred ticket.');
      return;
    }
    setCurrentTicket(ticketNumber);
  }, [isAccepted]);

  const handleShowMoreTickets = useCallback(() => {
    if (noPermissions && !isSuperAdminMode) return;
    setVisibleTickets(prev => prev + 5);
  }, [noPermissions, isSuperAdminMode]);

  const handleShowCalledTickets = useCallback(() => {
    if (noPermissions && !isSuperAdminMode) return;
    fetchCalledTickets();
    setShowCalledDrawer(true);
  }, [noPermissions, isSuperAdminMode, fetchCalledTickets]);

  // Memoized filtered users
  const filteredAvailableUsers = useMemo(() => {
    const currentUserStr = localStorage.getItem('user');
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
    return availableUsers.filter(user => 
      user.role === 'user' && 
      user.admin_id === currentUser?.admin_id && 
      user.id !== currentUser?.id
    );
  }, [availableUsers]);

  // Memoized visible unassigned tickets
  const visibleUnassignedTickets = useMemo(() => {
    return unassignedTickets.slice(0, visibleTickets);
  }, [unassignedTickets, visibleTickets]);

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading tickets...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* No Permissions Error UI */}
        {noPermissions ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 max-w-md text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-800 mb-3">No Permissions Assigned</h2>
              <p className="text-gray-700 text-base mb-6">
                You do not have any permissions assigned to your account. Please contact your administrator to grant you the necessary permissions.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Top Section */}
            <div className="flex ml-2 gap-3 mb-6">
              <div className="w-45 rounded-lg">
                <button
                  onClick={() => fetchAssignedTickets(false)}
                  disabled={noPermissions}
                  className={`w-full px-6 py-2.5 rounded-lg text-base font-medium transition-colors mb-3 ${noPermissions ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                >
                  Load More Tickets
                </button>
                <div className="bg-white rounded-lg shadow-md px-2 py-2 text-center">
                  <p className="text-[15px] leading-[22.95px] text-gray-600 text-center">Total Pending Tickets</p>
                  <p className="text-2xl font-bold mt-2 text-gray-800">{totalPending}</p>
                </div>
              </div>

              <div className="flex-1 bg-white rounded-lg shadow-md py-8 px-6 flex items-center justify-center">
                <div className="flex items-center gap-4">
                  <h1 className="text-[38px] font-semibold text-gray-700">
                    Current Ticket ID:
                  </h1>
                  <p className="text-[38px] uppercase font-bold text-gray-900">{currentTicket}</p>
                </div>
              </div>

              <div className="flex text-[15px] leading-[22.95px] items-start justify-end width-[180px]">
                <button 
                  onClick={handleShowCalledTickets}
                  disabled={noPermissions}
                  className={`px-8 py-2.5 rounded-lg text-base font-medium transition-colors ${noPermissions ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                >
                  Show Called Tickets
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            {!isAccepted ? (
              <div className="flex justify-center gap-3 mb-6">
                <button
                  onClick={handleCall}
                  disabled={isCalling || noPermissions}
                  className={`px-10 py-3 rounded-lg text-lg font-medium transition-colors ${
                    isCalling || noPermissions
                      ? 'bg-gray-400 cursor-not-allowed text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {isCalling ? 'Calling...' : 'Call'}
                </button>
                {showNextButton && (
                  <button
                    onClick={() => setShowNextConfirmModal(true)}
                    disabled={noPermissions}
                    className={`px-10 py-3 rounded-lg text-lg font-medium transition-colors ${noPermissions ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                  >
                    Next
                  </button>
                )}
                <button
                  onClick={handleAccept}
                  disabled={noPermissions}
                  className={`px-10 py-3 rounded-lg text-lg font-medium transition-colors ${noPermissions ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                >
                  Accept
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-6">
                  <div className="text-4xl font-bold text-gray-700">
                    {formatTimer(timer)}
                  </div>
                </div>
                
                <div className="flex justify-center gap-3 mb-6">
                  <button
                    onClick={handleSolved}
                    disabled={noPermissions}
                    className={`px-10 py-3 rounded-lg text-lg font-medium transition-colors ${noPermissions ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                  >
                    Solved
                  </button>
                  <button
                    onClick={() => setShowReasonModal(true)}
                    disabled={noPermissions}
                    className={`px-10 py-3 rounded-lg text-lg font-medium transition-colors ${noPermissions ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                  >
                    Not Solved
                  </button>
                  {showTransferButton && (
                    <button
                      onClick={() => setShowTransferModal(true)}
                      disabled={noPermissions}
                      className={`px-10 py-3 rounded-lg text-lg font-medium transition-colors ${noPermissions ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
                    >
                      Transfer
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Manual Ticket Entry */}
            <div className="flex justify-center gap-3 mb-6">
              <input
                type="text"
                value={manualTicketId}
                onChange={(e) => !noPermissions && setManualTicketId(e.target.value)}
                placeholder="Enter Manual Ticket ID"
                disabled={noPermissions}
                className={`px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-72 text-base ${noPermissions ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
              />
              <button
                onClick={() => {
                  if (!manualTicketId.trim()) {
                    alert('Please enter a ticket ID');
                    return;
                  }
                  if (isAccepted) {
                    alert('Please resolve the current ticket first before selecting a new ticket');
                    return;
                  }
                  const searchTicketId = manualTicketId.trim().toUpperCase();
                  const foundInUnassigned = unassignedTickets.find(t => t.ticketNumber?.toString().toUpperCase() === searchTicketId);
                  const foundInTransferred = transferredTickets.find(t => t.ticketNumber?.toString().toUpperCase() === searchTicketId);
                  
                  if (foundInUnassigned || foundInTransferred) {
                    setCurrentTicket((foundInUnassigned || foundInTransferred).ticketNumber);
                    setManualTicketId('');
                  } else {
                    alert(`Ticket "${searchTicketId}" not found in your assigned tickets`);
                    setManualTicketId('');
                  }
                }}
                disabled={noPermissions}
                className={`px-10 py-3 rounded-lg text-base font-medium transition-colors ${noPermissions ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
              >
                Select
              </button>
            </div>

            {/* Transferred Tickets Table */}
            {transferredTickets.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
                  <h2 className="text-xl font-semibold text-blue-800">Transferred Tickets</h2>
                  <p className="text-sm text-blue-600 mt-1">Click on any ticket to set it as current ticket</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transferred By</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transferredTickets.map((ticket) => (
                        <TicketCard
                          key={ticket.id}
                          ticket={ticket}
                          isCurrentTicket={currentTicket === ticket.ticketNumber}
                          onSelect={handleSelectTicket}
                          isAccepted={isAccepted}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Unassigned Tickets Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Unassigned Tickets</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submission Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submission Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {visibleUnassignedTickets.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                          No pending tickets found for your assigned services.
                        </td>
                      </tr>
                    ) : (
                      visibleUnassignedTickets.map((ticket) => (
                        <UnassignedTicketRow key={ticket.id} ticket={ticket} />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {unassignedTickets.length > visibleTickets && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <button
                    onClick={handleShowMoreTickets}
                    disabled={noPermissions}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${noPermissions ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                  >
                    Show More
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Not Solved Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Reason for Not Solved</h3>
            <textarea
              value={notSolvedReason}
              onChange={(e) => setNotSolvedReason(e.target.value)}
              placeholder="Enter reason why ticket was not solved..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none transition-all"
              rows="4"
            />
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => {
                  setShowReasonModal(false);
                  setNotSolvedReason('');
                }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleNotSolvedSubmit}
                disabled={!notSolvedReason.trim() || isNotSolvedProcessing}
                className={`flex-1 px-6 py-3 rounded-lg transition-all font-semibold ${
                  notSolvedReason.trim() && !isNotSolvedProcessing
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isNotSolvedProcessing ? 'Processing...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Transfer Ticket</h3>
            <p className="text-sm text-gray-600 mb-4">Select a username to transfer this ticket to:</p>
            <select
              value={transferUsername}
              onChange={(e) => setTransferUsername(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 mb-6 transition-all bg-white text-gray-900"
            >
              <option value="">-- Select User --</option>
              {filteredAvailableUsers.map((user) => (
                <option key={user.id} value={user.username}>
                  {user.username} {user.counter_no ? `(Counter ${user.counter_no})` : ''}
                </option>
              ))}
            </select>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowTransferModal(false);
                  setTransferUsername('');
                }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleTransferSubmit}
                disabled={!transferUsername.trim() || isTransferProcessing}
                className={`flex-1 px-6 py-3 rounded-lg transition-all font-semibold ${
                  transferUsername.trim() && !isTransferProcessing
                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isTransferProcessing ? 'Processing...' : 'Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Next Confirmation Modal */}
      {showNextConfirmModal && (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Confirm Next</h3>
            <p className="text-base text-gray-600 mb-8">
             Are you sure you want to proceed? This will delete the current ticket.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowNextConfirmModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold"
              >
                No
              </button>
              <button
                onClick={handleNextConfirm}
                disabled={isNextProcessing}
                className={`flex-1 px-6 py-3 rounded-lg transition-all font-semibold shadow-lg ${
                  isNextProcessing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 text-white hover:shadow-xl'
                }`}
              >
                {isNextProcessing ? 'Processing...' : 'Yes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Called Tickets Drawer */}
      {showCalledDrawer && (
        <>
          <div 
            className="fixed inset-0 bg-opacity-50 z-40 transition-opacity"
            onClick={() => setShowCalledDrawer(false)}
          />
          
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 animate-slide-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-green-50">
              <h2 className="text-xl font-bold text-green-800">Called Tickets Today</h2>
              <button
                onClick={() => setShowCalledDrawer(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto h-[calc(100%-73px)] p-6">
              {calledTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-lg font-medium">No tickets called today</p>
                  <p className="text-sm mt-2">Start calling tickets to see them here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {calledTickets.map((ticket, index) => (
                    <div 
                      key={ticket.ticket_id || index}
                      className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-bold text-green-700">
                              {ticket.ticket_number}
                            </span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                              Counter {ticket.counter_no || 'N/A'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Service:</span> {ticket.service_name || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">
                            <span className="font-medium">Called at:</span> {ticket.call_time ? new Date(ticket.call_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A'}
                          </p>
                        </div>
                      </div>
                      {ticket.status && (
                        <div className="mt-2 pt-2 border-t border-green-100">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            ticket.status === 'Solved' ? 'bg-green-100 text-green-700' :
                            ticket.status === 'Not Solved' ? 'bg-red-100 text-red-700' :
                            ticket.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {ticket.status}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
