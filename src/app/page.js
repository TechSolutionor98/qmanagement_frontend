'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [showRecentTickets, setShowRecentTickets] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    number: ''
  });
  const [activeField, setActiveField] = useState('name');
  const [recentTickets] = useState([
    { id: 1, ticketNumber: 'A001', service: 'Service 1', time: '10:30 AM' },
    { id: 2, ticketNumber: 'A002', service: 'Service 1', time: '10:45 AM' },
    { id: 3, ticketNumber: 'B001', service: 'Service 2', time: '11:00 AM' },
    { id: 4, ticketNumber: 'B002', service: 'Service 2', time: '11:15 AM' },
    { id: 5, ticketNumber: 'C001', service: 'Service 3', time: '11:30 AM' },
  ]);

  const [reportTickets] = useState([
    { 
      id: 1, 
      ticketNumber: 'A001', 
      dateTime: '2024-11-25 10:30 AM',
      service: 'General Inquiry', 
      user: 'John Doe',
      customerName: 'Ahmad Ali',
      status: 'Completed'
    },
    { 
      id: 2, 
      ticketNumber: 'A002', 
      dateTime: '2024-11-25 10:45 AM',
      service: 'Customer Support', 
      user: 'Jane Smith',
      customerName: 'Muhammad Hassan',
      status: 'Pending'
    },
    { 
      id: 3, 
      ticketNumber: 'B001', 
      dateTime: '2024-11-25 11:00 AM',
      service: 'Technical Support', 
      user: 'Mike Johnson',
      customerName: 'Fatima Khan',
      status: 'Completed'
    },
    { 
      id: 4, 
      ticketNumber: 'B002', 
      dateTime: '2024-11-25 11:15 AM',
      service: 'Billing', 
      user: 'Sarah Williams',
      customerName: 'Ali Raza',
      status: 'In Progress'
    },
    { 
      id: 5, 
      ticketNumber: 'C001', 
      dateTime: '2024-11-25 11:30 AM',
      service: 'General Inquiry', 
      user: 'David Brown',
      customerName: 'Sara Ahmed',
      status: 'Completed'
    },
  ]);

  const handleReprint = (ticketNumber) => {
    console.log('Reprinting ticket:', ticketNumber);
    alert(`Reprinting ticket: ${ticketNumber}`);
  };

  const handleView = (ticket) => {
    console.log('Viewing ticket:', ticket);
    alert(`Viewing ticket: ${ticket.ticketNumber}\nService: ${ticket.service}\nUser: ${ticket.user}`);
  };

  const handleKeyPress = (key) => {
    if (key === 'Space') {
      setCustomerDetails(prev => ({
        ...prev,
        [activeField]: prev[activeField] + ' '
      }));
    } else if (key === 'Remove') {
      setCustomerDetails(prev => ({
        ...prev,
        [activeField]: prev[activeField].slice(0, -1)
      }));
    } else {
      setCustomerDetails(prev => ({
        ...prev,
        [activeField]: prev[activeField] + key
      }));
    }
  };

  const handleSkip = () => {
    setShowDetailsModal(false);
    // Print ticket without customer details
    printTicket(selectedService, { name: '', email: '', number: '' });
    setCustomerDetails({ name: '', email: '', number: '' });
  };

  const handleSubmit = (serviceName = 'General Service') => {
    console.log('Customer Details:', customerDetails);
    // Save the details here
    setShowDetailsModal(false);
    
    // Print ticket
    printTicket(serviceName, customerDetails);
    
    // Reset form
    setCustomerDetails({ name: '', email: '', number: '' });
  };

  const printTicket = (serviceName, customerData) => {
    // Generate ticket number
    const ticketPrefix = serviceName.charAt(0).toUpperCase();
    const ticketNumber = `${ticketPrefix}-${Math.floor(Math.random() * 900) + 100}`;
    
    // Get current date and time
    const now = new Date();
    const date = now.toLocaleDateString('en-GB');
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    // Create print window
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    
    const ticketHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ticket - ${ticketNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: Arial, sans-serif;
            background: white;
            margin: 0;
            padding: 0;
          }
          .ticket {
            width: 80mm;
            background: white;
            margin: 0 auto;
          }
          .ticket-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 8px;
            text-align: center;
          }
          .logo-container {
            background: white;
            padding: 6px 10px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 14px;
            color: #667eea;
            display: inline-block;
          }
          .ticket-details {
            padding: 12px 15px;
            text-align: center;
          }
          .company-name {
            font-size: 13px;
            font-weight: bold;
            color: #333;
            margin-bottom: 8px;
            line-height: 1.3;
          }
          .service-type {
            font-size: 11px;
            color: #666;
            margin-bottom: 8px;
          }
          .service-type strong {
            color: #667eea;
          }
          .customer-info {
            font-size: 10px;
            color: #666;
            margin-bottom: 8px;
            padding: 6px;
            background: #f9f9f9;
            border-radius: 3px;
          }
          .customer-info p {
            margin: 3px 0;
          }
          .ticket-title {
            font-size: 11px;
            color: #666;
            margin-bottom: 3px;
          }
          .ticket-number {
            font-size: 36px;
            font-weight: bold;
            color: #667eea;
            margin: 5px 0;
            letter-spacing: 1px;
          }
          .waiting-message {
            font-size: 11px;
            color: #666;
            margin: 8px 0;
            font-style: italic;
          }
          .date-time {
            font-size: 10px;
            color: #666;
            margin: 8px 0;
            padding: 6px;
            background: #f9f9f9;
            border-radius: 3px;
          }
          .date-time strong {
            color: #333;
          }
          .thank-you-text {
            font-size: 11px;
            color: #667eea;
            margin: 8px 0;
            font-weight: bold;
          }
          .company-sponser {
            font-size: 9px;
            color: #999;
            margin-top: 8px;
            padding-top: 6px;
            border-top: 1px dashed #ddd;
          }
          @media print {
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
            }
            .ticket {
              margin: 0;
              width: 80mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="ticket-header">
            <div class="logo-container">LOGO</div>
          </div>
          <div class="ticket-details">
            <h2 class="company-name">Emirates Professional Businessmen Services</h2>
            <p class="service-type">Service Type: <strong>${serviceName}</strong></p>
            ${customerData.name || customerData.email || customerData.number ? `
              <div class="customer-info">
                ${customerData.name ? `<p><strong>Name:</strong> ${customerData.name}</p>` : ''}
                ${customerData.email ? `<p><strong>Email:</strong> ${customerData.email}</p>` : ''}
                ${customerData.number ? `<p><strong>Number:</strong> ${customerData.number}</p>` : ''}
              </div>
            ` : ''}
            <p class="ticket-title">Ticket No</p>
            <h1 class="ticket-number">${ticketNumber}</h1>
            <p class="waiting-message">Please wait. We will serve you shortly.</p>
            <div class="date-time">
              <p>Date: <strong>${date}</strong> | Time: <strong>${time}</strong></p>
            </div>
            <p class="thank-you-text">Thank you for your service!</p>
            <p class="company-sponser">Designed by techsolutionor.com</p>
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 100);
            }, 500);
          };
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(ticketHTML);
    printWindow.document.close();
  };

  useEffect(() => {
    if (showReportsModal || showDetailsModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showReportsModal, showDetailsModal]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Title and Action Buttons */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            Select Service
          </h1>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            {/* Reports Button */}
            <button
              onClick={() => setShowReportsModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-semibold">Reports</span>
            </button>

            {/* Recent Tickets Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRecentTickets(!showRecentTickets)}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-lg hover:shadow-xl hover:from-green-700 hover:to-green-800 transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">Recent Tickets</span>
                <svg className={`w-4 h-4 transition-transform ${showRecentTickets ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showRecentTickets && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-semibold text-gray-800">Recent Tickets</h3>
                  </div>
                  <div className="py-2">
                    {recentTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-bold rounded">
                                {ticket.ticketNumber}
                              </span>
                              <span className="text-xs text-gray-500">{ticket.time}</span>
                            </div>
                            <p className="text-sm text-gray-600">{ticket.service}</p>
                          </div>
                          <button
                            onClick={() => handleReprint(ticket.ticketNumber)}
                            className="ml-3 px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-1.5 shadow-md hover:shadow-lg"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Reprint
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Service Grid - Sample Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Service Card 1 */}
          <div 
            onClick={() => {
              setSelectedService('General Inquiry');
              setShowDetailsModal(true);
            }}
            className="bg-purple-600 rounded-lg shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <div className="p-8 flex flex-col items-center justify-center text-white">
              <div className="w-24 h-24 mb-4 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h5 className="text-xl font-semibold text-center mb-1">General Inquiry</h5>
              <h6 className="text-sm text-center opacity-90">استفسار عام</h6>
            </div>
          </div>

          {/* Service Card 2 */}
          <div 
            onClick={() => {
              setSelectedService('Customer Support');
              setShowDetailsModal(true);
            }}
            className="bg-blue-600 rounded-lg shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <div className="p-8 flex flex-column items-center justify-center text-white">
              <div className="w-24 h-24 mb-4 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h5 className="text-xl font-semibold text-center mb-1">Customer Support</h5>
              <h6 className="text-sm text-center opacity-90">دعم العملاء</h6>
            </div>
          </div>

          {/* Service Card 3 */}
          <div 
            onClick={() => {
              setSelectedService('Technical Support');
              setShowDetailsModal(true);
            }}
            className="bg-green-600 rounded-lg shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <div className="p-8 flex flex-col items-center justify-center text-white">
              <div className="w-24 h-24 mb-4 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h5 className="text-xl font-semibold text-center mb-1">Technical Support</h5>
              <h6 className="text-sm text-center opacity-90">الدعم الفني</h6>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 py-6 border-t border-gray-200">
          <div className="py-4 px-8 text-gray-600">
            © {new Date().getFullYear()}, Developed By{' '}
            <a 
              href="https://techsolutionor.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-bold text-green-600 hover:text-blue-700"
            >
              TechSolutionor
            </a>
          </div>
        </footer>
      </div>

      {/* Customer Details Modal */}
      {showDetailsModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailsModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-purple-700">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white">Enter Your Details</h2>
                <p className="text-sm text-purple-100 mt-1">Optional - You can skip if you prefer</p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Side - Input Fields */}
                <div className="space-y-4">
                  {/* Name Field */}
                  <div>
                    <input
                      type="text"
                      placeholder="Name"
                      value={customerDetails.name}
                      onFocus={() => setActiveField('name')}
                      onChange={(e) => setCustomerDetails(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-4 py-3 text-base border-2 rounded-lg transition-all ${
                        activeField === 'name' 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-300 bg-white'
                      } focus:outline-none focus:border-purple-500 focus:bg-purple-50`}
                    />
                  </div>

                  {/* Email Field */}
                  <div>
                    <input
                      type="text"
                      placeholder="Email"
                      value={customerDetails.email}
                      onFocus={() => setActiveField('email')}
                      onChange={(e) => setCustomerDetails(prev => ({ ...prev, email: e.target.value }))}
                      className={`w-full px-4 py-3 text-base border-2 rounded-lg transition-all ${
                        activeField === 'email' 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-300 bg-white'
                      } focus:outline-none focus:border-purple-500 focus:bg-purple-50`}
                    />
                  </div>

                  {/* Number Field */}
                  <div>
                    <input
                      type="text"
                      placeholder="Number"
                      value={customerDetails.number}
                      onFocus={() => setActiveField('number')}
                      onChange={(e) => setCustomerDetails(prev => ({ ...prev, number: e.target.value }))}
                      className={`w-full px-4 py-3 text-base border-2 rounded-lg transition-all ${
                        activeField === 'number' 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-300 bg-white'
                      } focus:outline-none focus:border-purple-500 focus:bg-purple-50`}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSkip}
                      className="flex-1 px-5 py-2.5 text-base font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
                    >
                      Skip
                    </button>
                    <button
                      onClick={() => handleSubmit(selectedService)}
                      className="flex-1 px-5 py-2.5 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all shadow-lg"
                    >
                      Submit
                    </button>
                  </div>
                </div>

                {/* Right Side - On-Screen Keyboard */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-6 gap-1.5">
                    {/* Row 1 */}
                    {['Q', 'W', 'E', 'R', 'T', 'Y'].map((key) => (
                      <button
                        key={key}
                        onClick={() => handleKeyPress(key)}
                        className="px-3 py-2.5 text-base font-semibold text-blue-600 bg-white border-2 border-blue-500 rounded-md hover:bg-blue-50 transition-all shadow-sm"
                      >
                        {key}
                      </button>
                    ))}
                    
                    {/* Row 2 */}
                    {['U', 'I', 'O', 'P', 'A', 'S'].map((key) => (
                      <button
                        key={key}
                        onClick={() => handleKeyPress(key)}
                        className="px-3 py-2.5 text-base font-semibold text-blue-600 bg-white border-2 border-blue-500 rounded-md hover:bg-blue-50 transition-all shadow-sm"
                      >
                        {key}
                      </button>
                    ))}
                    
                    {/* Row 3 */}
                    {['D', 'F', 'G', 'H', 'J', 'K'].map((key) => (
                      <button
                        key={key}
                        onClick={() => handleKeyPress(key)}
                        className="px-3 py-2.5 text-base font-semibold text-blue-600 bg-white border-2 border-blue-500 rounded-md hover:bg-blue-50 transition-all shadow-sm"
                      >
                        {key}
                      </button>
                    ))}
                    
                    {/* Row 4 */}
                    {['L', 'Z', 'X', 'C', 'V', 'B'].map((key) => (
                      <button
                        key={key}
                        onClick={() => handleKeyPress(key)}
                        className="px-3 py-2.5 text-base font-semibold text-blue-600 bg-white border-2 border-blue-500 rounded-md hover:bg-blue-50 transition-all shadow-sm"
                      >
                        {key}
                      </button>
                    ))}
                    
                    {/* Row 5 */}
                    {['N', 'M', '1', '2', '3', '4'].map((key) => (
                      <button
                        key={key}
                        onClick={() => handleKeyPress(key)}
                        className="px-3 py-2.5 text-base font-semibold text-blue-600 bg-white border-2 border-blue-500 rounded-md hover:bg-blue-50 transition-all shadow-sm"
                      >
                        {key}
                      </button>
                    ))}
                    
                    {/* Row 6 */}
                    {['5', '6', '7', '8', '9', '0'].map((key) => (
                      <button
                        key={key}
                        onClick={() => handleKeyPress(key)}
                        className="px-3 py-2.5 text-base font-semibold text-blue-600 bg-white border-2 border-blue-500 rounded-md hover:bg-blue-50 transition-all shadow-sm"
                      >
                        {key}
                      </button>
                    ))}
                    
                    {/* Row 7 - Special Keys */}
                    <button
                      onClick={() => handleKeyPress('-')}
                      className="px-3 py-2.5 text-base font-semibold text-blue-600 bg-white border-2 border-blue-500 rounded-md hover:bg-blue-50 transition-all shadow-sm"
                    >
                      -
                    </button>
                    <button
                      onClick={() => handleKeyPress('_')}
                      className="px-3 py-2.5 text-base font-semibold text-blue-600 bg-white border-2 border-blue-500 rounded-md hover:bg-blue-50 transition-all shadow-sm"
                    >
                      _
                    </button>
                    <button
                      onClick={() => handleKeyPress('@')}
                      className="px-3 py-2.5 text-base font-semibold text-blue-600 bg-white border-2 border-blue-500 rounded-md hover:bg-blue-50 transition-all shadow-sm"
                    >
                      @
                    </button>
                    <button
                      onClick={() => handleKeyPress('.')}
                      className="px-3 py-2.5 text-base font-semibold text-blue-600 bg-white border-2 border-blue-500 rounded-md hover:bg-blue-50 transition-all shadow-sm"
                    >
                      .
                    </button>
                    <button
                      onClick={() => handleKeyPress('Space')}
                      className="px-3 py-2.5 text-sm font-semibold text-blue-600 bg-white border-2 border-blue-500 rounded-md hover:bg-blue-50 transition-all shadow-sm"
                    >
                      Space
                    </button>
                    <button
                      onClick={() => handleKeyPress('Remove')}
                      className="px-3 py-2.5 text-sm font-semibold text-red-600 bg-white border-2 border-red-500 rounded-md hover:bg-red-50 transition-all shadow-sm"
                    >
                      ←
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports Modal */}
      {showReportsModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowReportsModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Tickets Report</h2>
                  <p className="text-sm text-blue-100 mt-0.5">View all ticket details and status</p>
                </div>
              </div>
              <button
                onClick={() => setShowReportsModal(false)}
                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="p-6">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date & Time</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ticket Number</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Service Type</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer Name</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportTickets.map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-700">{ticket.dateTime}</td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-bold rounded">
                              {ticket.ticketNumber}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">{ticket.service}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 font-medium">{ticket.customerName}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{ticket.user}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              ticket.status === 'Completed' 
                                ? 'bg-green-100 text-green-800' 
                                : ticket.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {ticket.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              {/* View Button */}
                              <button
                                onClick={() => handleView(ticket)}
                                className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1.5 shadow-md hover:shadow-lg"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View
                              </button>

                              {/* Reprint Button */}
                              <button
                                onClick={() => handleReprint(ticket.ticketNumber)}
                                className="px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-1.5 shadow-md hover:shadow-lg"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Reprint
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
              <p className="text-sm text-gray-600">Total Tickets: <span className="font-semibold">{reportTickets.length}</span></p>
              <button
                onClick={() => setShowReportsModal(false)}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

