'use client';
import React, { useState } from 'react';
import { DEFAULT_THEME_COLORS, THEME_PRESETS } from '@/utils/themeColors';
import axios from '@/utils/axiosInstance';
import { toast } from 'react-toastify';

export default function ScreenColorCustomizerModal({
  isOpen,
  onClose,
  currentColors,
  onColorsChange,
  adminId,
  apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  token
}) {
  const [colors, setColors] = useState(() => ({
    ...DEFAULT_THEME_COLORS,
    ...(currentColors || {})
  }));
  const [activeTab, setActiveTab] = useState('presets'); // 'presets' or 'custom'
  const [isSaving, setIsSaving] = useState(false);

  // Sync state if currentColors changes while open
  React.useEffect(() => {
    if (currentColors) {
      setColors(prev => ({
        ...prev,
        ...currentColors
      }));
    }
  }, [currentColors]);

  if (!isOpen) return null;

  const handleColorChange = (key, value) => {
    const updated = { ...colors, [key]: value };
    setColors(updated);
    if (onColorsChange) {
      onColorsChange(updated);
    }
  };

  const handleApplyPreset = (preset) => {
    const updated = {
      ...colors,
      ...preset.colors
    };
    setColors(updated);
    if (onColorsChange) {
      onColorsChange(updated);
    }
  };

  const handleResetToDefault = () => {
    setColors({ ...DEFAULT_THEME_COLORS });
    if (onColorsChange) {
      onColorsChange({ ...DEFAULT_THEME_COLORS });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const endpoint = `${apiUrl}/counter-display/theme-colors`;

      const response = await axios.post(
        endpoint,
        {
          theme_colors: colors,
          admin_id: adminId
        },
        { headers }
      );

      if (response.data.success) {
        // 🔔 Broadcast theme color update in real-time to active ticket screens
        try {
          const displayChannel = new BroadcastChannel('display-config-update');
          displayChannel.postMessage({ updated: true, theme_colors: colors, admin_id: adminId });
          displayChannel.close();
        } catch (e) {
          console.warn('Could not broadcast color update:', e);
        }

        if (typeof toast !== 'undefined' && toast.success) {
          toast.success('🎨 Ticket Info Screen colors saved successfully!');
        } else {
          alert('Screen colors saved successfully!');
        }
        if (onColorsChange) {
          onColorsChange(colors);
        }
        onClose();
      } else {
        throw new Error(response.data.message || 'Failed to save colors');
      }
    } catch (err) {
      console.error('Error saving theme colors:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to save colors';
      if (typeof toast !== 'undefined' && toast.error) {
        toast.error(`❌ ${errMsg}`);
      } else {
        alert(`Error: ${errMsg}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-gray-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-teal-600 via-cyan-700 to-indigo-700 text-white">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎨</span>
            <div>
              <h2 className="text-lg font-bold">Ticket Info Screen Colors & Theme</h2>
              <p className="text-xs text-teal-100">Customize the appearance of Ticket Info screens for your license</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 text-xl font-bold leading-none"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6 pt-3 gap-3">
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-2.5 px-4 font-semibold text-sm transition-all border-b-2 ${
              activeTab === 'presets'
                ? 'border-teal-600 text-teal-700 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            ⚡ Quick Theme Presets
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-2.5 px-4 font-semibold text-sm transition-all border-b-2 ${
              activeTab === 'custom'
                ? 'border-teal-600 text-teal-700 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            🎛️ Detailed Color Customizer
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Live Mini Preview Box */}
          <div className="border border-gray-300 rounded-xl p-4 bg-gray-100 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600">📺 Live Screen Preview</span>
              <span className="text-xs text-gray-500">Live preview of current color scheme</span>
            </div>
            
            {/* Mock Screen */}
            <div
              className="rounded-lg overflow-hidden border border-gray-300 shadow-md transition-all duration-300"
              style={{ backgroundColor: colors.screenBg || '#ffffff' }}
            >
              {/* Mock Header */}
              <div
                className="p-2.5 flex items-center justify-between border-b border-gray-300 text-center"
                style={{ backgroundColor: colors.headerBg || '#ffffff' }}
              >
                <div className="text-[11px] font-bold text-gray-400">LOGO</div>
                <div className="text-center">
                  <div className="text-xs font-bold" style={{ color: colors.nowCallingColor || '#dc2626' }}>
                    Now Calling
                  </div>
                  <div className="text-sm font-extrabold" style={{ color: colors.nowCallingTextColor || '#000000' }}>
                    A-101 — Counter 2
                  </div>
                </div>
                <div className="text-[11px] font-bold text-gray-400">LOGO</div>
              </div>

              {/* Mock Table */}
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ backgroundColor: colors.tableHeaderBg, color: colors.tableHeaderColor }}>
                    <th className="py-1.5 px-3 font-bold text-center">Ticket</th>
                    <th className="py-1.5 px-3 font-bold text-center">Counter</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Highlight Row */}
                  <tr
                    className="border-b animate-pulse"
                    style={{
                      backgroundColor: colors.activeTicketBg,
                      color: colors.activeTicketColor,
                      borderColor: colors.tableBorderColor || '#e6e9ec'
                    }}
                  >
                    <td className="py-1.5 px-3 text-center font-bold">A-101 (Now Calling)</td>
                    <td className="py-1.5 px-3 text-center font-bold">Counter 2</td>
                  </tr>
                  {/* Normal Rows */}
                  <tr
                    className="border-b"
                    style={{
                      backgroundColor: colors.tableRowBg,
                      color: colors.tableRowColor,
                      borderColor: colors.tableBorderColor || '#e6e9ec'
                    }}
                  >
                    <td className="py-1 px-3 text-center font-medium">B-204</td>
                    <td className="py-1 px-3 text-center font-medium">Counter 1</td>
                  </tr>
                  <tr
                    className="border-b"
                    style={{
                      backgroundColor: colors.tableRowBg,
                      color: colors.tableRowColor,
                      borderColor: colors.tableBorderColor || '#e6e9ec'
                    }}
                  >
                    <td className="py-1 px-3 text-center font-medium">C-305</td>
                    <td className="py-1 px-3 text-center font-medium">Counter 4</td>
                  </tr>
                </tbody>
              </table>

              {/* Mock Ticker */}
              <div
                className="py-1 px-3 text-center text-[10px] font-bold"
                style={{ backgroundColor: colors.tickerBg, color: colors.tickerColor }}
              >
                Welcome to Customer Care Services • Please wait for your number
              </div>
            </div>
          </div>

          {/* TAB 1: Presets */}
          {activeTab === 'presets' && (
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">Choose a Pre-designed Color Palette:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {THEME_PRESETS.map((preset) => {
                  const isSelected =
                    colors.tableHeaderBg === preset.colors.tableHeaderBg &&
                    colors.activeTicketBg === preset.colors.activeTicketBg;

                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/50 shadow-md ring-2 ring-teal-500'
                          : 'border-gray-200 bg-white hover:border-teal-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-gray-800">{preset.name}</span>
                        {isSelected && (
                          <span className="bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mb-3">{preset.description}</p>
                      
                      {/* Color Palette Swatches */}
                      <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100">
                        <span
                          className="w-5 h-5 rounded-md shadow-sm border border-black/10"
                          style={{ backgroundColor: preset.colors.tableHeaderBg }}
                          title="Table Header"
                        />
                        <span
                          className="w-5 h-5 rounded-md shadow-sm border border-black/10"
                          style={{ backgroundColor: preset.colors.activeTicketBg }}
                          title="Active Ticket Highlight"
                        />
                        <span
                          className="w-5 h-5 rounded-md shadow-sm border border-black/10"
                          style={{ backgroundColor: preset.colors.nowCallingColor }}
                          title="Now Calling Label"
                        />
                        <span
                          className="w-5 h-5 rounded-md shadow-sm border border-black/10"
                          style={{ backgroundColor: preset.colors.tickerBg }}
                          title="News Ticker"
                        />
                        <span
                          className="w-5 h-5 rounded-md shadow-sm border border-black/10"
                          style={{ backgroundColor: preset.colors.tableRowBg }}
                          title="Table Rows"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Custom Colors */}
          {activeTab === 'custom' && (
            <div className="space-y-6">
              
              {/* Section 1: Table Colors */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-3 flex items-center gap-2">
                  <span>📊</span> Queue Table Colors
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Table Header Background */}
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Table Header Background
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colors.tableHeaderBg || '#16909B'}
                        onChange={(e) => handleColorChange('tableHeaderBg', e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border border-gray-300 p-0.5"
                      />
                      <input
                        type="text"
                        value={colors.tableHeaderBg || ''}
                        onChange={(e) => handleColorChange('tableHeaderBg', e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1.5 font-mono border rounded uppercase text-gray-800"
                        placeholder="#16909B"
                      />
                    </div>
                  </div>

                  {/* Table Header Text Color */}
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Table Header Text Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colors.tableHeaderColor || '#FFFFFF'}
                        onChange={(e) => handleColorChange('tableHeaderColor', e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border border-gray-300 p-0.5"
                      />
                      <input
                        type="text"
                        value={colors.tableHeaderColor || ''}
                        onChange={(e) => handleColorChange('tableHeaderColor', e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1.5 font-mono border rounded uppercase text-gray-800"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>

                  {/* Table Row Background */}
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Normal Row Background
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colors.tableRowBg || '#FFFFFF'}
                        onChange={(e) => handleColorChange('tableRowBg', e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border border-gray-300 p-0.5"
                      />
                      <input
                        type="text"
                        value={colors.tableRowBg || ''}
                        onChange={(e) => handleColorChange('tableRowBg', e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1.5 font-mono border rounded uppercase text-gray-800"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>

                  {/* Table Row Text Color */}
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Normal Row Text Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colors.tableRowColor || '#000000'}
                        onChange={(e) => handleColorChange('tableRowColor', e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border border-gray-300 p-0.5"
                      />
                      <input
                        type="text"
                        value={colors.tableRowColor || ''}
                        onChange={(e) => handleColorChange('tableRowColor', e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1.5 font-mono border rounded uppercase text-gray-800"
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  {/* Active / Calling Ticket Highlight */}
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <label className="block text-xs font-semibold text-yellow-900 mb-1.5">
                      ⭐ Calling Ticket Highlight Background
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colors.activeTicketBg || '#FEF08A'}
                        onChange={(e) => handleColorChange('activeTicketBg', e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border border-gray-300 p-0.5"
                      />
                      <input
                        type="text"
                        value={colors.activeTicketBg || ''}
                        onChange={(e) => handleColorChange('activeTicketBg', e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1.5 font-mono border rounded uppercase text-gray-800"
                        placeholder="#FEF08A"
                      />
                    </div>
                  </div>

                  {/* Active Ticket Text Color */}
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <label className="block text-xs font-semibold text-yellow-900 mb-1.5">
                      ⭐ Calling Ticket Text Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colors.activeTicketColor || '#000000'}
                        onChange={(e) => handleColorChange('activeTicketColor', e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border border-gray-300 p-0.5"
                      />
                      <input
                        type="text"
                        value={colors.activeTicketColor || ''}
                        onChange={(e) => handleColorChange('activeTicketColor', e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1.5 font-mono border rounded uppercase text-gray-800"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Header & Calling Box */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-3 flex items-center gap-2">
                  <span>📢</span> Header & "Now Calling" Box
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Header Background */}
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Header Section Background
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colors.headerBg || '#FFFFFF'}
                        onChange={(e) => handleColorChange('headerBg', e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border border-gray-300 p-0.5"
                      />
                      <input
                        type="text"
                        value={colors.headerBg || ''}
                        onChange={(e) => handleColorChange('headerBg', e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1.5 font-mono border rounded uppercase text-gray-800"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>

                  {/* Now Calling Label Color */}
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      "Now Calling" Label Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colors.nowCallingColor || '#DC2626'}
                        onChange={(e) => handleColorChange('nowCallingColor', e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border border-gray-300 p-0.5"
                      />
                      <input
                        type="text"
                        value={colors.nowCallingColor || ''}
                        onChange={(e) => handleColorChange('nowCallingColor', e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1.5 font-mono border rounded uppercase text-gray-800"
                        placeholder="#DC2626"
                      />
                    </div>
                  </div>

                  {/* Now Calling Text Color */}
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Now Calling Numbers Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colors.nowCallingTextColor || '#000000'}
                        onChange={(e) => handleColorChange('nowCallingTextColor', e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border border-gray-300 p-0.5"
                      />
                      <input
                        type="text"
                        value={colors.nowCallingTextColor || ''}
                        onChange={(e) => handleColorChange('nowCallingTextColor', e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1.5 font-mono border rounded uppercase text-gray-800"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: News Ticker & Overall Screen */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-3 flex items-center gap-2">
                  <span>📰</span> News Ticker & Screen Background
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Ticker Background */}
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      News Ticker Background
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colors.tickerBg || '#333333'}
                        onChange={(e) => handleColorChange('tickerBg', e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border border-gray-300 p-0.5"
                      />
                      <input
                        type="text"
                        value={colors.tickerBg || ''}
                        onChange={(e) => handleColorChange('tickerBg', e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1.5 font-mono border rounded uppercase text-gray-800"
                        placeholder="#333333"
                      />
                    </div>
                  </div>

                  {/* Ticker Text Color */}
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      News Ticker Text Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colors.tickerColor || '#FFFFFF'}
                        onChange={(e) => handleColorChange('tickerColor', e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border border-gray-300 p-0.5"
                      />
                      <input
                        type="text"
                        value={colors.tickerColor || ''}
                        onChange={(e) => handleColorChange('tickerColor', e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1.5 font-mono border rounded uppercase text-gray-800"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>

                  {/* Screen Background */}
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Overall Screen Background
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colors.screenBg || '#FFFFFF'}
                        onChange={(e) => handleColorChange('screenBg', e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border border-gray-300 p-0.5"
                      />
                      <input
                        type="text"
                        value={colors.screenBg || ''}
                        onChange={(e) => handleColorChange('screenBg', e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1.5 font-mono border rounded uppercase text-gray-800"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition shadow-sm"
          >
            ↺ Reset to Default Colors
          </button>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 rounded-lg shadow-md transition disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? '💾 Saving...' : '💾 Save Colors for License'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
