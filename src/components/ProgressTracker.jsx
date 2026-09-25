import React from 'react';
import { Clock, FileText, AlertTriangle, CheckCircle2, Hourglass, Layers, XCircle } from 'lucide-react';

export default function ProgressTracker({ items = [] }) {
  // Calculate summary metrics
  const totalCount = items.length;
  const approvedCount = items.filter(item => 
    ['Approved', 'Ready for Pickup', 'Resolved'].includes(item.status)
  ).length;
  const rejectedCount = items.filter(item => 
    ['Rejected', 'Declined'].includes(item.status)
  ).length;
  const pendingCount = totalCount - approvedCount - rejectedCount;

  const getBadge = (status) => {
    switch (status) {
      case 'Approved':
      case 'Ready for Pickup':
      case 'Resolved':
        return 'bg-emerald-500/20 text-emerald-950 border-emerald-300/80 backdrop-blur-md';
      case 'Rejected':
      case 'Declined':
        return 'bg-rose-500/20 text-rose-950 border-rose-300/80 backdrop-blur-md';
      case 'In Review':
        return 'bg-sky-500/20 text-sky-950 border-sky-300/80 backdrop-blur-md';
      default:
        return 'bg-amber-500/20 text-amber-950 border-amber-300/80 backdrop-blur-md';
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-white/85 via-sky-100/70 to-blue-200/60 backdrop-blur-xl border border-white/90 shadow-2xl shadow-sky-900/15 rounded-3xl p-6 sm:p-8 space-y-6 overflow-hidden">
      {/* Glassy Ambient Glow Orbs */}
      <div className="absolute -top-20 -right-20 w-56 h-56 bg-sky-400/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-blue-500/25 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center space-x-3.5 border-b border-sky-200/70 pb-5">
        <div className="p-3 bg-gradient-to-br from-sky-400/30 to-blue-500/20 text-sky-900 rounded-2xl border border-sky-300/60 shadow-inner backdrop-blur-md">
          <Clock size={26} className="text-sky-700" />
        </div>
        <div>
          <h2 className="text-xl font-black text-sky-950">Progress Tracker</h2>
          <p className="text-xs text-sky-800/90 font-medium">Track real-time status of your submissions</p>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Requests */}
        <div className="p-3.5 bg-white/70 backdrop-blur-md border border-sky-200/80 rounded-2xl shadow-sm flex items-center space-x-3">
          <div className="p-2 bg-sky-500/20 text-sky-800 rounded-xl border border-sky-300/60">
            <Layers size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total</p>
            <p className="text-lg font-black text-slate-900">{totalCount}</p>
          </div>
        </div>

        {/* Approved / Completed */}
        <div className="p-3.5 bg-white/70 backdrop-blur-md border border-emerald-200/80 rounded-2xl shadow-sm flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-800 rounded-xl border border-emerald-300/60">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Approved</p>
            <p className="text-lg font-black text-emerald-950">{approvedCount}</p>
          </div>
        </div>

        {/* Pending / In Review */}
        <div className="p-3.5 bg-white/70 backdrop-blur-md border border-amber-200/80 rounded-2xl shadow-sm flex items-center space-x-3">
          <div className="p-2 bg-amber-500/20 text-amber-800 rounded-xl border border-amber-300/60">
            <Hourglass size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Pending</p>
            <p className="text-lg font-black text-amber-950">{pendingCount}</p>
          </div>
        </div>

        {/* Rejected */}
        <div className="p-3.5 bg-white/70 backdrop-blur-md border border-rose-200/80 rounded-2xl shadow-sm flex items-center space-x-3">
          <div className="p-2 bg-rose-500/20 text-rose-800 rounded-xl border border-rose-300/60">
            <XCircle size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Rejected</p>
            <p className="text-lg font-black text-rose-950">{rejectedCount}</p>
          </div>
        </div>
      </div>

      {/* Content List */}
      <div className="relative z-10">
        {items.length === 0 ? (
          <div className="text-center py-12 text-sky-800/70 bg-white/40 backdrop-blur-md rounded-2xl border border-sky-200/60">
            <Clock size={42} className="mx-auto mb-3 opacity-60 text-sky-600" />
            <p className="text-xs font-bold">No recent document requests or complaints submitted yet.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {items.map((item, idx) => (
              <div 
                key={item.id || idx} 
                className="p-4 bg-white/70 backdrop-blur-md border border-sky-200/80 rounded-2xl flex items-start justify-between shadow-sm hover:bg-white/90 transition-all duration-300"
              >
                <div className="flex items-start space-x-3.5">
                  <div className={`p-2.5 rounded-xl mt-0.5 border backdrop-blur-md ${
                    item.type === 'Document' 
                      ? 'bg-sky-400/20 text-sky-900 border-sky-300/60' 
                      : 'bg-amber-400/20 text-amber-900 border-amber-300/60'
                  }`}>
                    {item.type === 'Document' ? <FileText size={18} /> : <AlertTriangle size={18} />}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5 font-medium">{item.purpose || item.details}</p>
                    <p className="text-[10px] text-sky-800/80 font-bold mt-1.5">Submitted: {item.dateStr || 'Just now'}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-xl text-xs font-extrabold border shadow-sm shrink-0 ml-2 ${getBadge(item.status)}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}