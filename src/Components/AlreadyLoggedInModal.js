"use client";

import React from 'react';

export default function AlreadyLoggedInModal({
  isOpen,
  onClose,
  onLoginThere,
  onLoginHere,
  deviceInfo
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all border border-green-200">
        
        {/* Header - Green theme, no X button, clean single warning header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2 font-bold text-lg">
            <span>Warning</span>
          </div>
        </div>

        {/* Body - Clean English text */}
        <div className="p-6 text-center space-y-4">
          <h3 className="text-xl font-bold text-gray-800">
            Already Logged In!
          </h3>

          <p className="text-gray-600 text-sm leading-relaxed">
            Your account is currently logged in on another device.
            <br />
            <span className="font-semibold text-green-700 mt-1 block">
              Do you want to log in on this device?
            </span>
          </p>

          {deviceInfo && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-500 truncate">
              📍 Current Active Device: <span className="font-medium text-gray-700">{deviceInfo}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t flex flex-col sm:flex-row gap-2.5 justify-end">
          {/* Button 1: Login There */}
          <button
            onClick={onLoginThere}
            className="w-full sm:w-auto px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg text-xs md:text-sm transition-all text-center"
          >
            🔒 Login There
          </button>

          {/* Button 2: Login Here (Theme Green) */}
          <button
            onClick={onLoginHere}
            className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-lg text-xs md:text-sm shadow-md hover:shadow-lg transition-all text-center"
          >
            🚀 Login Here
          </button>

          {/* Button 3: Cancel */}
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 hover:bg-gray-100 text-gray-600 font-semibold rounded-lg text-xs md:text-sm transition-all text-center"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
