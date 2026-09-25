import React, { useState, useRef, useEffect } from 'react';
import { Bell, User, LogOut, FileText, AlertTriangle, X, Shield, MapPin, Mail, Calendar } from 'lucide-react';

export default function Header({ user, onSignOut, items = [] }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(items.length);
  const dropdownRef = useRef(null);

  // Update unread badge when items change
  useEffect(() => {
    setUnreadCount(items.length);
  }, [items]);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setUnreadCount(0);
    }
  };

  // Helper to extract only the first name for the badge
  const getFirstName = () => {
    if (!user) return 'Resident';
    const fullName = user.fullName || user.name || user.email || '';
    const identifier = fullName.includes('@') ? fullName.split('@')[0] : fullName;
    const firstName = identifier.trim().split(' ')[0];
    return firstName.charAt(0).toUpperCase() + firstName.slice(1);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-gradient-to-r from-sky-600/95 via-blue-600/95 to-sky-700/95 backdrop-blur-xl text-white shadow-lg shadow-sky-900/15 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md text-white font-black flex items-center justify-center text-lg border border-white/40 shadow-inner">
              BT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-wide text-white drop-shadow-sm">BaryoLink</h1>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 border border-white/30 px-2 py-0.5 rounded-full backdrop-blur-md">
                  Resident Dashboard
                </span>
              </div>
              <p className="text-xs text-sky-100 font-medium">
                Barangay Tubod • Toledo City, Cebu
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 relative" ref={dropdownRef}>
            
            {/* Notifications Bell Button */}
            <div className="relative">
              <button 
                onClick={handleToggleNotifications}
                className="p-2.5 text-sky-100 hover:text-white hover:bg-white/15 rounded-xl transition border border-transparent hover:border-white/20 backdrop-blur-md relative"
                title="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white font-black text-[10px] rounded-full flex items-center justify-center shadow-md border-2 border-sky-600 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-sky-200 text-slate-900 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 bg-gradient-to-r from-sky-900 to-blue-900 text-white flex items-center justify-between border-b border-white/10">
                    <div className="flex items-center space-x-2">
                      <Bell size={16} className="text-sky-300" />
                      <h3 className="text-xs font-black uppercase tracking-wider">Activity & Submissions</h3>
                    </div>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                      {items.length} Total
                    </span>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1.5 no-scrollbar">
                    {items.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <Bell size={28} className="mx-auto mb-2 opacity-40 text-sky-600" />
                        <p className="text-xs font-semibold">No requests or complaints submitted yet.</p>
                      </div>
                    ) : (
                      items.map((item, idx) => (
                        <div key={item.id || idx} className="p-3 bg-slate-50/80 hover:bg-sky-50/80 rounded-xl transition flex items-start space-x-3 border border-slate-200/60">
                          <div className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                            item.type === 'Document' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.type === 'Document' ? <FileText size={16} /> : <AlertTriangle size={16} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-slate-900 truncate">{item.title}</h4>
                              <span className="text-[10px] font-extrabold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md ml-1 shrink-0">
                                {item.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 truncate mt-0.5">{item.purpose || item.details}</p>
                            <p className="text-[9px] text-slate-400 mt-1 font-medium">{item.dateStr || 'Recently'}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-100 border-t border-slate-200 text-center">
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-[11px] font-bold text-sky-800 hover:underline"
                    >
                      Close Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Clickable User Profile Badge */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center space-x-2.5 bg-white/15 hover:bg-white/25 transition backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/30 shadow-inner cursor-pointer"
              title="View Registered Details"
            >
              <User size={16} className="text-sky-200" />
              <span className="text-xs font-bold text-white tracking-wide">
                {getFirstName()}
              </span>
            </button>

            {user && (
              <button 
                onClick={onSignOut}
                title="Sign Out"
                className="p-2.5 text-sky-100 hover:text-red-200 hover:bg-red-500/20 rounded-xl transition border border-transparent hover:border-red-300/30 backdrop-blur-md"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Registered Profile Details Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-gradient-to-br from-white/95 via-sky-50/90 to-blue-100/90 backdrop-blur-2xl border border-white/90 shadow-2xl rounded-3xl p-6 sm:p-8 space-y-6 overflow-hidden">
            
            {/* Ambient Glow Orbs */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-sky-400/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-500/25 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="relative z-10 flex items-center justify-between border-b border-sky-200/70 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-sky-400/30 to-blue-500/20 text-sky-900 rounded-2xl border border-sky-300/60 shadow-inner">
                  <User size={22} className="text-sky-700" />
                </div>
                <div>
                  <h3 className="text-base font-black text-sky-950">Resident Profile</h3>
                  <p className="text-[11px] text-sky-800/80 font-medium">Registered account information</p>
                </div>
              </div>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="p-2 rounded-xl bg-white/60 hover:bg-white text-slate-700 transition border border-sky-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Details List */}
            <div className="relative z-10 space-y-3.5 text-xs">
              <div className="p-3.5 bg-white/70 backdrop-blur-md rounded-2xl border border-sky-200/80 space-y-1 shadow-sm">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-800 flex items-center gap-1.5">
                  <User size={13} className="text-sky-600" /> Full Name
                </span>
                <p className="font-black text-slate-900 text-sm">{user?.fullName || user?.name || 'Not Specified'}</p>
              </div>

              <div className="p-3.5 bg-white/70 backdrop-blur-md rounded-2xl border border-sky-200/80 space-y-1 shadow-sm">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-800 flex items-center gap-1.5">
                  <Mail size={13} className="text-sky-600" /> Email Address
                </span>
                <p className="font-bold text-slate-900">{user?.email || 'Not Specified'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-white/70 backdrop-blur-md rounded-2xl border border-sky-200/80 space-y-1 shadow-sm">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-800 flex items-center gap-1.5">
                    <MapPin size={13} className="text-sky-600" /> Purok
                  </span>
                  <p className="font-bold text-slate-900">{user?.purok || user?.purokName || 'Not Specified'}</p>
                </div>

                <div className="p-3.5 bg-white/70 backdrop-blur-md rounded-2xl border border-sky-200/80 space-y-1 shadow-sm">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-800 flex items-center gap-1.5">
                    <Shield size={13} className="text-sky-600" /> Account Role
                  </span>
                  <p className="font-bold text-slate-900 capitalize">{user?.role || 'Resident'}</p>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="relative z-10 pt-2">
              <button
                onClick={() => setShowProfileModal(false)}
                className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-sky-600/25 transition text-xs tracking-wider uppercase"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}