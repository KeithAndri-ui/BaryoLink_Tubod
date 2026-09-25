import React, { useState, useEffect } from 'react';
import { Megaphone, Calendar, Phone, BellOff, Sparkles } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewedIds, setViewedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('viewed_announcement_ids') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const q = query(collection(db, 'announcements'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        let timestamp = Date.now();
        if (data.createdAt) {
          timestamp = typeof data.createdAt.toMillis === 'function' 
            ? data.createdAt.toMillis() 
            : new Date(data.createdAt).getTime();
        } else if (data.date) {
          timestamp = new Date(data.date).getTime();
        }
        
        items.push({ id: docSnap.id, ...data, timestamp });
      });

      items.sort((a, b) => b.timestamp - a.timestamp);
      setAnnouncements(items);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching announcements:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handler to mark a specific announcement as read when clicked
  const handleAnnouncementClick = (id) => {
    if (!viewedIds.includes(id)) {
      const updated = [...viewedIds, id];
      setViewedIds(updated);
      localStorage.setItem('viewed_announcement_ids', JSON.stringify(updated));
      // Notify navigation component to update its count
      window.dispatchEvent(new Event('announcements_viewed'));
    }
  };

  const unreadCount = announcements.filter(item => !viewedIds.includes(item.id)).length;

  return (
    <div className="space-y-6">
      {/* Red Notification Alert Banner */}
      {!loading && unreadCount > 0 && (
        <div className="relative bg-gradient-to-r from-rose-500/20 via-red-500/15 to-rose-600/20 backdrop-blur-xl border border-rose-300/80 shadow-lg shadow-rose-900/10 rounded-2xl p-4 flex items-center justify-between text-rose-950 animate-in fade-in">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-rose-500 text-white rounded-xl shadow-md animate-pulse">
              <Megaphone size={18} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider">New Barangay Updates Available!</h4>
              <p className="text-[11px] text-rose-900/90 font-medium">You have {unreadCount} unread announcement{unreadCount > 1 ? 's' : ''}. Click any item to mark it as read.</p>
            </div>
          </div>
        </div>
      )}

      {/* Announcements Card */}
      <div className="relative bg-gradient-to-br from-white/85 via-sky-100/70 to-blue-200/60 backdrop-blur-xl border border-white/90 shadow-2xl shadow-sky-900/15 rounded-3xl p-6 sm:p-8 space-y-6 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-sky-400/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-blue-500/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center space-x-3.5 border-b border-sky-200/70 pb-5">
          <div className="p-3 bg-gradient-to-br from-sky-400/30 to-blue-500/20 text-sky-900 rounded-2xl border border-sky-300/60 shadow-inner backdrop-blur-md">
            <Megaphone size={26} className="text-sky-700" />
          </div>
          <div>
            <h2 className="text-xl font-black text-sky-950">Barangay Updates & Announcements</h2>
            <p className="text-xs text-sky-800/90 font-medium">Official news and advisory board for Barangay Tubod</p>
          </div>
        </div>

        <div className="relative z-10 space-y-4">
          {loading ? (
            <div className="text-center py-10 text-sky-800/70 text-xs font-bold animate-pulse">
              Loading announcements...
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-12 text-sky-800/70 bg-white/40 backdrop-blur-md rounded-2xl border border-sky-200/60 space-y-2">
              <BellOff size={36} className="mx-auto text-sky-600 opacity-60" />
              <p className="text-xs font-bold">No active announcements at the moment.</p>
            </div>
          ) : (
            announcements.map((item) => {
              const isUnread = !viewedIds.includes(item.id);

              return (
                <div 
                  key={item.id} 
                  onClick={() => handleAnnouncementClick(item.id)}
                  className={`relative p-4.5 bg-white/70 backdrop-blur-md border rounded-2xl shadow-sm hover:bg-white/95 transition-all duration-300 space-y-2 cursor-pointer ${
                    isUnread ? 'border-rose-300 shadow-rose-900/5 bg-rose-50/30' : 'border-sky-200/80'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-900 bg-sky-400/20 border border-sky-300/60 px-2.5 py-1 rounded-lg backdrop-blur-md">
                        {item.category || 'General'}
                      </span>
                      {isUnread && (
                        <span className="text-[9px] font-black uppercase tracking-wider bg-rose-500 text-white px-2 py-0.5 rounded-md shadow-sm animate-pulse flex items-center gap-1">
                          <Sparkles size={10} /> New
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-sky-800/80 font-bold flex items-center gap-1.5">
                      <Calendar size={13} className="text-sky-600" /> 
                      {new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.content || item.details}</p>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="relative bg-gradient-to-br from-sky-500/15 via-sky-200/60 to-blue-300/50 backdrop-blur-xl border border-sky-300/80 shadow-xl shadow-sky-900/10 rounded-3xl p-6 overflow-hidden">
        <h3 className="text-xs font-extrabold text-sky-950 uppercase tracking-wider flex items-center space-x-2 mb-2">
          <Phone size={16} className="text-sky-700" />
          <span>Barangay Tubod Emergency Hotlines</span>
        </h3>
        <p className="text-xs text-sky-900/80 font-medium mb-3">Toledo City Emergency Responders & Barangay Patrol:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-sky-950 font-bold bg-white/60 backdrop-blur-md p-3.5 rounded-2xl border border-sky-200/80 shadow-inner">
          <div>• Barangay Hall: (032) 123-4567</div>
          <div>• Toledo Disaster Office: 911</div>
        </div>
      </div>
    </div>
  );
}