import React, { useState, useEffect } from 'react';
import { FileText, AlertTriangle, Clock, Megaphone } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function Navigation({ activeTab, setActiveTab }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const checkUnread = () => {
      const unsub = onSnapshot(collection(db, 'announcements'), (snapshot) => {
        let viewed = [];
        try {
          viewed = JSON.parse(localStorage.getItem('viewed_announcement_ids') || '[]');
        } catch {
          viewed = [];
        }

        let count = 0;
        snapshot.forEach((docSnap) => {
          if (!viewed.includes(docSnap.id)) {
            count++;
          }
        });
        setUnreadCount(count);
      });
      return unsub;
    };

    const unsub = checkUnread();

    const handleCustomEvent = () => {
      checkUnread();
    };

    window.addEventListener('announcements_viewed', handleCustomEvent);
    window.addEventListener('storage', handleCustomEvent);

    return () => {
      if (unsub) unsub();
      window.removeEventListener('announcements_viewed', handleCustomEvent);
      window.removeEventListener('storage', handleCustomEvent);
    };
  }, []);

  const tabs = [
    { id: 'request', label: 'Document Request', icon: FileText },
    { id: 'complaint', label: 'Submit Complaint', icon: AlertTriangle },
    { id: 'tracker', label: 'Progress Tracker', icon: Clock },
    { id: 'announcements', label: 'Announcements', icon: Megaphone, badge: unreadCount },
  ];

  return (
    <nav className="sticky top-16 z-30 bg-white/70 backdrop-blur-xl border-b border-sky-200/60 shadow-lg shadow-sky-900/5 transition-all">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-start md:justify-center space-x-2 md:space-x-4 overflow-x-auto py-3 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center space-x-2.5 px-5 py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm transition-all duration-300 whitespace-nowrap border ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30 border-sky-400/50 scale-[1.02]'
                    : 'bg-white/50 text-sky-900/80 hover:bg-sky-400/20 hover:text-sky-950 border-sky-200/60 backdrop-blur-md'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-sky-700'} />
                <span>{tab.label}</span>
                
                {tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 px-2 py-0.5 bg-rose-500 text-white font-black text-[10px] rounded-full shadow-md border-2 border-white animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}