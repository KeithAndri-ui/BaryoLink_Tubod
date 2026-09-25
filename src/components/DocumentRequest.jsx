import React, { useState } from 'react';
import { FileText, Send, CheckCircle2 } from 'lucide-react';

export default function DocumentRequest({ user, onRequestSubmitted }) {
  const [documentType, setDocumentType] = useState('Barangay Clearance');
  const [purpose, setPurpose] = useState('');
  const [copies, setCopies] = useState(1);
  const [successMessage, setSuccessMessage] = useState(false);

  // Automatically get name and registered purok from user profile
  const residentName = user?.fullName || user?.name || user?.email || 'Registered Resident';
  const residentPurok = user?.purok || user?.purokName || 'Not Specified';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!purpose.trim()) return;

    const newRequest = {
      type: 'Document',
      title: documentType,
      purpose: purpose,
      copies: copies,
      fullName: residentName,
      purok: residentPurok,
      status: 'Pending',
      dateStr: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    onRequestSubmitted(newRequest);
    setSuccessMessage(true);
    setPurpose('');
    setCopies(1);

    setTimeout(() => {
      setSuccessMessage(false);
    }, 4000);
  };

  return (
    <div className="relative bg-gradient-to-br from-white/85 via-sky-100/70 to-blue-200/60 backdrop-blur-xl border border-white/90 shadow-2xl shadow-sky-900/15 rounded-3xl p-6 sm:p-8 overflow-hidden space-y-6">
      {/* Glassy Ambient Glow Orbs */}
      <div className="absolute -top-20 -right-20 w-56 h-56 bg-sky-400/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-blue-500/25 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center space-x-3.5 border-b border-sky-200/70 pb-5">
        <div className="p-3 bg-gradient-to-br from-sky-400/30 to-blue-500/20 text-sky-900 rounded-2xl border border-sky-300/60 shadow-inner backdrop-blur-md">
          <FileText size={26} className="text-sky-700" />
        </div>
        <div>
          <h2 className="text-xl font-black text-sky-950">Request Barangay Document</h2>
          <p className="text-xs text-sky-800/90 font-medium">Official requests will be processed under your registered profile.</p>
        </div>
      </div>

      {successMessage && (
        <div className="relative z-10 p-4 bg-emerald-500/15 border border-emerald-300 text-emerald-900 rounded-2xl backdrop-blur-md flex items-center space-x-3 animate-in fade-in">
          <CheckCircle2 size={20} className="text-emerald-700 shrink-0" />
          <p className="text-xs font-bold">Document request submitted successfully! You can monitor its progress in the tracker tab.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
        
        {/* Read-Only Account Profile Preview (Name & Registered Purok) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-sky-200/80 shadow-inner">
          <div>
            <label className="block text-[11px] font-extrabold text-sky-900 uppercase tracking-wider mb-1">Registered Full Name</label>
            <div className="text-xs font-black text-slate-900 bg-white/80 px-3 py-2.5 rounded-xl border border-sky-200/80 truncate">
              {residentName}
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-extrabold text-sky-900 uppercase tracking-wider mb-1">Registered Purok</label>
            <div className="text-xs font-black text-slate-900 bg-white/80 px-3 py-2.5 rounded-xl border border-sky-200/80 truncate">
              {residentPurok}
            </div>
          </div>
        </div>

        {/* Document Type Selection */}
        <div>
          <label className="block text-xs font-extrabold text-sky-950 uppercase tracking-wider mb-2">Document Type</label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full bg-white/70 backdrop-blur-md border border-sky-200/80 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
          >
            <option value="Barangay Clearance">Barangay Clearance</option>
            <option value="Certificate of Residency">Certificate of Residency</option>
            <option value="Certificate of Indigency">Certificate of Indigency</option>
            <option value="Business Permit Clearance">Business Permit Clearance</option>
          </select>
        </div>

        {/* Purpose */}
        <div>
          <label className="block text-xs font-extrabold text-sky-950 uppercase tracking-wider mb-2">Purpose of Request</label>
          <textarea
            rows="3"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="State the specific reason (e.g. Employment Application, Scholarship, Postal ID)"
            className="w-full bg-white/70 backdrop-blur-md border border-sky-200/80 rounded-2xl p-4 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition resize-none"
            required
          />
        </div>

        {/* Copies */}
        <div>
          <label className="block text-xs font-extrabold text-sky-950 uppercase tracking-wider mb-2">Number of Copies</label>
          <input
            type="number"
            min="1"
            max="5"
            value={copies}
            onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
            className="w-full bg-white/70 backdrop-blur-md border border-sky-200/80 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-sky-600/25 transition flex items-center justify-center space-x-2 text-xs tracking-wider uppercase backdrop-blur-md"
        >
          <Send size={16} />
          <span>Submit Document Request</span>
        </button>

      </form>
    </div>
  );
}