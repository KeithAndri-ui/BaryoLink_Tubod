import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, query, where } from 'firebase/firestore';
import { 
  FileText, AlertTriangle, Megaphone, CheckCircle, Clock, XCircle, 
  Plus, Trash2, LogOut, ShieldAlert, CheckSquare, RefreshCcw, Users, X, User,
  ClipboardList, AlertCircle, ArrowUpDown, Calendar
} from 'lucide-react';

export default function StaffDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sorting State
  const [requestSort, setRequestSort] = useState('newest'); // 'newest' | 'oldest' | 'alpha'
  const [complaintSort, setComplaintSort] = useState('newest'); // 'newest' | 'oldest' | 'alpha'

  // Filtered lists and metrics (excluding admins/staff from residents count)
  const residentsList = usersList.filter(u => u.role !== 'staff' && u.role !== 'admin');
  const totalResidents = residentsList.length;
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(r => !r.status || r.status === 'Pending' || r.status === 'In Review').length;
  const totalComplaints = complaints.length;
  const pendingComplaints = complaints.filter(c => !c.status || c.status === 'Pending' || c.status === 'In Review').length;

  // Modal State for Registered Residents
  const [showUsersModal, setShowUsersModal] = useState(false);

  // New Announcement Form State
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState('General');

  // Helper to safely extract milliseconds from Firestore Timestamps, ISO strings, or numbers
  const parseTimestampToMs = (val) => {
    if (!val) return 0;
    if (typeof val === 'object' && typeof val.seconds === 'number') {
      return val.seconds * 1000;
    }
    if (typeof val.toMillis === 'function') {
      return val.toMillis();
    }
    if (val instanceof Date) {
      return val.getTime();
    }
    const parsed = new Date(val).getTime();
    return isNaN(parsed) ? 0 : parsed;
  };

  // Fetch all data on load
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch Document Requests
      const reqSnap = await getDocs(collection(db, 'requests'));
      const reqList = reqSnap.docs.map(doc => {
        const data = doc.data();
        const rawTime = data.createdAt || data.timestamp;
        return { 
          id: doc.id, 
          ...data,
          createdAtMs: parseTimestampToMs(rawTime)
        };
      });
      setRequests(reqList);

      // Fetch Complaints
      const compSnap = await getDocs(collection(db, 'complaints'));
      const compList = compSnap.docs.map(doc => {
        const data = doc.data();
        const rawTime = data.createdAt || data.timestamp || data.dateStr;
        return { 
          id: doc.id, 
          ...data,
          createdAtMs: parseTimestampToMs(rawTime)
        };
      });
      setComplaints(compList);

      // Fetch Announcements
      const annSnap = await getDocs(collection(db, 'announcements'));
      const annList = annSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAnnouncements(annList);

      // Fetch Registered Users
      const usersSnap = await getDocs(collection(db, 'users'));
      const fetchedUsers = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsersList(fetchedUsers);
    } catch (err) {
      console.error('Error fetching staff data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sorting Helper Functions
  const getSortedRequests = () => {
    let sorted = [...requests];
    if (requestSort === 'newest') {
      sorted.sort((a, b) => b.createdAtMs - a.createdAtMs);
    } else if (requestSort === 'oldest') {
      sorted.sort((a, b) => a.createdAtMs - b.createdAtMs);
    } else if (requestSort === 'alpha') {
      sorted.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
    }
    return sorted;
  };

  const getSortedComplaints = () => {
    let sorted = [...complaints];
    if (complaintSort === 'newest') {
      sorted.sort((a, b) => b.createdAtMs - a.createdAtMs);
    } else if (complaintSort === 'oldest') {
      sorted.sort((a, b) => a.createdAtMs - b.createdAtMs);
    } else if (complaintSort === 'alpha') {
      sorted.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
    }
    return sorted;
  };

  // Format timestamp helper for display
  const formatDateTime = (timestampVal) => {
    const ms = parseTimestampToMs(timestampVal);
    if (!ms) return 'Date not specified';
    try {
      const date = new Date(ms);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Update Request Status
  const handleUpdateReqStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'requests', id), { status: newStatus });
      const subQuery = query(collection(db, 'submissions'), where('__name__', '==', id));
      const subSnap = await getDocs(subQuery);
      if (!subSnap.empty) {
        await updateDoc(doc(db, 'submissions', subSnap.docs[0].id), { status: newStatus });
      } else {
        try {
          await updateDoc(doc(db, 'submissions', id), { status: newStatus });
        } catch (e) {}
      }
      setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (err) {
      console.error('Error updating request status:', err);
    }
  };

  // Update Complaint Status
  const handleUpdateComplaintStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'complaints', id), { status: newStatus });
      const subQuery = query(collection(db, 'submissions'), where('__name__', '==', id));
      const subSnap = await getDocs(subQuery);
      if (!subSnap.empty) {
        await updateDoc(doc(db, 'submissions', subSnap.docs[0].id), { status: newStatus });
      } else {
        try {
          await updateDoc(doc(db, 'submissions', id), { status: newStatus });
        } catch (e) {}
      }
      setComplaints(complaints.map(c => c.id === id ? { ...c, status: newStatus } : c));
    } catch (err) {
      console.error('Error updating complaint status:', err);
    }
  };

  // Post Announcement
  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    try {
      const newAnn = {
        title: annTitle,
        content: annContent,
        category: annCategory,
        dateStr: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'announcements'), newAnn);
      setAnnouncements([{ id: docRef.id, ...newAnn }, ...announcements]);
      setAnnTitle('');
      setAnnContent('');
    } catch (err) {
      console.error('Error posting announcement:', err);
    }
  };

  // Delete Announcement
  const handleDeleteAnnouncement = async (id) => {
    try {
      await deleteDoc(doc(db, 'announcements', id));
      setAnnouncements(announcements.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error deleting announcement:', err);
    }
  };

  // Reusable frosted glass styles matched precisely with the DocumentRequest component colorway
  const glassContainerStyle = "relative bg-gradient-to-br from-white/85 via-sky-100/70 to-blue-200/60 backdrop-blur-xl border border-white/95 shadow-2xl shadow-sky-900/15 rounded-3xl p-6 space-y-4 overflow-hidden";
  const glassCardStyle = "p-4 bg-white/70 backdrop-blur-md rounded-2xl border border-sky-200/90 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition hover:bg-white/90";
  const glassInputStyle = "w-full px-3.5 py-2.5 bg-white/70 backdrop-blur-md border border-sky-200/90 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none shadow-inner text-slate-900 placeholder:text-slate-500";

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-blue-100 text-slate-800 pb-12 relative overflow-x-hidden">
      
      {/* Ambient Background Glow Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-20 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-lg shadow-sky-600/20 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center font-black text-white text-sm shadow-inner backdrop-blur-md">
              BT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-white">BaryoLink</h1>
                <span className="px-2.5 py-0.5 bg-white/20 border border-white/30 text-[9px] font-black uppercase tracking-wider rounded-full text-white backdrop-blur-md">
                  Staff Dashboard
                </span>
              </div>
              <p className="text-[11px] text-sky-100 font-medium">Barangay Tubod • Toledo City, Cebu</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="text-right hidden md:block mr-2">
              <p className="text-xs font-bold text-white">{user?.fullName || user?.email}</p>
              <p className="text-[10px] text-sky-100">Staff Official</p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-white/30 shadow-sm backdrop-blur-md"
              title="Refresh Data"
            >
              <RefreshCcw size={13} />
              <span>Refresh</span>
            </button>
            <button
              onClick={onLogout}
              className="px-3 py-2 bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-red-400/30 shadow-sm"
              title="Sign Out"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 mt-8 space-y-6 relative z-10">

        {/* Analytics Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="relative bg-gradient-to-br from-white/85 via-sky-100/70 to-blue-200/60 backdrop-blur-xl border border-white/95 rounded-2xl p-5 shadow-xl shadow-sky-900/10 flex items-center justify-between overflow-hidden">
            <div className="space-y-1">
              <p className="text-[11px] font-extrabold text-sky-900 uppercase tracking-wider">Total Requests</p>
              <h3 className="text-2xl font-black text-slate-900">{totalRequests}</h3>
              <p className="text-[10px] text-sky-800 font-medium">All-time submitted</p>
            </div>
            <div className="w-12 h-12 bg-sky-400/30 border border-sky-300/60 text-sky-900 rounded-2xl flex items-center justify-center shadow-inner backdrop-blur-md">
              <ClipboardList size={22} className="text-sky-800" />
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-white/85 via-sky-100/70 to-blue-200/60 backdrop-blur-xl border border-white/95 rounded-2xl p-5 shadow-xl shadow-sky-900/10 flex items-center justify-between overflow-hidden">
            <div className="space-y-1">
              <p className="text-[11px] font-extrabold text-sky-900 uppercase tracking-wider">Pending Requests</p>
              <h3 className="text-2xl font-black text-amber-700">{pendingRequests}</h3>
              <p className="text-[10px] text-amber-800 font-medium">Awaiting action</p>
            </div>
            <div className="w-12 h-12 bg-amber-400/30 border border-amber-300/60 text-amber-900 rounded-2xl flex items-center justify-center shadow-inner backdrop-blur-md">
              <Clock size={22} className="text-amber-700" />
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-white/85 via-sky-100/70 to-blue-200/60 backdrop-blur-xl border border-white/95 rounded-2xl p-5 shadow-xl shadow-sky-900/10 flex items-center justify-between overflow-hidden">
            <div className="space-y-1">
              <p className="text-[11px] font-extrabold text-sky-900 uppercase tracking-wider">Total Complaints</p>
              <h3 className="text-2xl font-black text-slate-900">{totalComplaints}</h3>
              <p className="text-[10px] text-sky-800 font-medium">All-time filed</p>
            </div>
            <div className="w-12 h-12 bg-indigo-400/30 border border-indigo-300/60 text-indigo-900 rounded-2xl flex items-center justify-center shadow-inner backdrop-blur-md">
              <AlertTriangle size={22} className="text-indigo-800" />
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-white/85 via-sky-100/70 to-blue-200/60 backdrop-blur-xl border border-white/95 rounded-2xl p-5 shadow-xl shadow-sky-900/10 flex items-center justify-between overflow-hidden">
            <div className="space-y-1">
              <p className="text-[11px] font-extrabold text-sky-900 uppercase tracking-wider">Pending Issues</p>
              <h3 className="text-2xl font-black text-red-600">{pendingComplaints}</h3>
              <p className="text-[10px] text-red-700 font-medium">Needs review</p>
            </div>
            <div className="w-12 h-12 bg-red-400/30 border border-red-300/60 text-red-900 rounded-2xl flex items-center justify-center shadow-inner backdrop-blur-md">
              <AlertCircle size={22} className="text-red-700" />
            </div>
          </div>

        </div>

        {/* Navigation & Separate Residents Action Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
          
          {/* Main Navigation Tabs */}
          <div className="flex flex-wrap bg-gradient-to-br from-white/85 via-sky-100/70 to-blue-200/60 backdrop-blur-xl p-1.5 rounded-2xl border border-white/95 shadow-xl shadow-sky-900/10">
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-2.5 px-5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'requests' ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-sky-600/30' : 'text-sky-950 hover:bg-white/60'
              }`}
            >
              <FileText size={16} />
              <span>Document Requests ({requests.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('complaints')}
              className={`py-2.5 px-5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'complaints' ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-sky-600/30' : 'text-sky-950 hover:bg-white/60'
              }`}
            >
              <AlertTriangle size={16} />
              <span>Complaints ({complaints.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`py-2.5 px-5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'announcements' ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-sky-600/30' : 'text-sky-950 hover:bg-white/60'
              }`}
            >
              <Megaphone size={16} />
              <span>Announcements</span>
            </button>
          </div>

          {/* Separated Registered Residents Button */}
          <button
            onClick={() => setShowUsersModal(true)}
            className="py-3 px-5 bg-gradient-to-br from-white/85 via-sky-100/70 to-blue-200/60 hover:from-white hover:to-sky-100 text-sky-950 border border-white/95 shadow-xl shadow-sky-900/10 rounded-2xl text-xs font-extrabold transition flex items-center justify-center gap-2.5 backdrop-blur-xl group"
          >
            <div className="w-7 h-7 rounded-xl bg-sky-400/30 group-hover:bg-sky-600 group-hover:text-white text-sky-900 flex items-center justify-center transition shadow-inner">
              <Users size={15} />
            </div>
            <span>Registered Residents ({totalResidents})</span>
          </button>

        </div>

        {loading ? (
          <div className="text-center py-20 text-sky-900 font-semibold text-sm">Loading records from Firebase...</div>
        ) : (
          <>
            {/* TAB 1: DOCUMENT REQUESTS */}
            {activeTab === 'requests' && (
              <div className={glassContainerStyle}>
                
                {/* Header & Sorting Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-sky-200/80">
                  <div>
                    <h2 className="text-base font-black text-sky-950">Resident Document Requests</h2>
                    <p className="text-xs text-sky-900/90 font-medium">Review, sort, and update status for clearances, residency, and certificates.</p>
                  </div>
                  
                  {/* Filter / Sort Control */}
                  <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md border border-sky-200/90 px-3.5 py-2 rounded-xl shadow-inner">
                    <ArrowUpDown size={14} className="text-sky-700" />
                    <span className="text-[11px] font-bold text-sky-900">Sort by:</span>
                    <select
                      value={requestSort}
                      onChange={(e) => setRequestSort(e.target.value)}
                      className="bg-transparent text-xs font-extrabold text-slate-900 focus:outline-none cursor-pointer"
                    >
                      <option value="newest">Newest Time</option>
                      <option value="oldest">Oldest Time</option>
                      <option value="alpha">Alphabetical (A–Z Name)</option>
                    </select>
                  </div>
                </div>

                {requests.length === 0 ? (
                  <p className="text-center py-10 text-xs text-sky-900/80 font-medium">No document requests submitted yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/50 text-sky-950 uppercase font-extrabold tracking-wider border-b border-sky-200/80">
                        <tr>
                          <th className="p-3">Resident & Location</th>
                          <th className="p-3">Document Type</th>
                          <th className="p-3">Purpose</th>
                          <th className="p-3">Submitted At</th>
                          <th className="p-3">Copies</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sky-200/60 font-medium">
                        {getSortedRequests().map(req => (
                          <tr key={req.id} className="hover:bg-white/60 transition">
                            <td className="p-3">
                              <div className="font-bold text-slate-900">{req.fullName || 'Unknown Resident'}</div>
                              <div className="text-[11px] text-sky-900 font-semibold">{req.purok || 'Purok N/A'}</div>
                            </td>
                            <td className="p-3 font-semibold text-slate-900">{req.title}</td>
                            <td className="p-3 text-sky-950 max-w-xs truncate">{req.purpose}</td>
                            <td className="p-3 text-sky-900 whitespace-nowrap">
                              <div className="flex items-center gap-1 font-semibold">
                                <Clock size={12} className="text-sky-700 shrink-0" />
                                <span>{formatDateTime(req.createdAt || req.timestamp)}</span>
                              </div>
                            </td>
                            <td className="p-3 text-slate-900 font-bold">{req.copies || 1}</td>
                            <td className="p-3">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block ${
                                req.status === 'Approved' || req.status === 'Ready for Pickup' ? 'bg-emerald-500/20 text-emerald-900 border border-emerald-400/40' :
                                req.status === 'Rejected' ? 'bg-red-500/20 text-red-900 border border-red-400/40' : 'bg-amber-500/20 text-amber-900 border border-amber-400/40'
                              }`}>
                                {req.status || 'Pending'}
                              </span>
                            </td>
                            <td className="p-3 text-right space-x-1 whitespace-nowrap">
                              <button
                                onClick={() => handleUpdateReqStatus(req.id, 'Ready for Pickup')}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] transition shadow-sm"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateReqStatus(req.id, 'Rejected')}
                                className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-[10px] transition shadow-sm"
                              >
                                Reject
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: COMPLAINTS */}
            {activeTab === 'complaints' && (
              <div className={glassContainerStyle}>
                
                {/* Header & Sorting Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-sky-200/80">
                  <div>
                    <h2 className="text-base font-black text-sky-950">Resident Blotter & Complaints</h2>
                    <p className="text-xs text-sky-900/90 font-medium">Live reports filed by residents with submission time sorting and alphabetical filtering.</p>
                  </div>

                  {/* Filter / Sort Control */}
                  <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md border border-sky-200/90 px-3.5 py-2 rounded-xl shadow-inner">
                    <ArrowUpDown size={14} className="text-sky-700" />
                    <span className="text-[11px] font-bold text-sky-900">Sort by:</span>
                    <select
                      value={complaintSort}
                      onChange={(e) => setComplaintSort(e.target.value)}
                      className="bg-transparent text-xs font-extrabold text-slate-900 focus:outline-none cursor-pointer"
                    >
                      <option value="newest">Newest Time</option>
                      <option value="oldest">Oldest Time</option>
                      <option value="alpha">Alphabetical (A–Z Name)</option>
                    </select>
                  </div>
                </div>

                {complaints.length === 0 ? (
                  <p className="text-center py-10 text-xs text-sky-900/80 font-medium">No complaints filed yet.</p>
                ) : (
                  <div className="space-y-3">
                    {getSortedComplaints().map(comp => (
                      <div key={comp.id} className={glassCardStyle}>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 bg-amber-400/30 border border-amber-300/60 text-amber-900 rounded-md text-[10px] font-black uppercase">
                              {comp.complaintType || 'General Issue'}
                            </span>
                            <span className="font-bold text-xs text-slate-900">{comp.title}</span>
                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                              comp.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-900 border-emerald-400/40' : 'bg-amber-500/20 text-amber-900 border-amber-400/40'
                            }`}>
                              {comp.status || 'In Review'}
                            </span>
                          </div>
                          <p className="text-xs text-sky-950">{comp.details || comp.description}</p>
                          <div className="text-[10px] text-sky-900/90 flex items-center gap-2 flex-wrap font-medium">
                            <span>Filed by: <strong className="text-slate-900">{comp.fullName || 'Resident'}</strong></span>
                            <span>• Location: <strong className="text-sky-950">{comp.purok || 'N/A'}</strong></span>
                            <span className="flex items-center gap-1 text-sky-900 font-semibold">
                              <Clock size={11} className="text-sky-700" />
                              Submitted: {formatDateTime(comp.createdAt || comp.timestamp || comp.dateStr)}
                            </span>
                          </div>
                          {comp.evidenceUrl && (
                            <div className="mt-2">
                              <a href={comp.evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-sky-700 hover:underline flex items-center gap-1">
                                📎 View Attached Evidence Image
                              </a>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleUpdateComplaintStatus(comp.id, 'In Progress')}
                            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-[11px] transition shadow-sm"
                          >
                            In Progress
                          </button>
                          <button
                            onClick={() => handleUpdateComplaintStatus(comp.id, 'Resolved')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] transition shadow-sm"
                          >
                            Resolve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ANNOUNCEMENTS */}
            {activeTab === 'announcements' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Create Announcement Form */}
                <div className={`${glassContainerStyle} lg:col-span-1`}>
                  <h3 className="text-sm font-black text-sky-950 flex items-center gap-2">
                    <Plus size={16} className="text-sky-700" />
                    <span>Post New Announcement</span>
                  </h3>
                  <form onSubmit={handlePostAnnouncement} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-extrabold text-sky-900 uppercase tracking-wider mb-1">Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Free Vaccination Drive"
                        value={annTitle}
                        onChange={(e) => setAnnTitle(e.target.value)}
                        className={glassInputStyle}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-sky-900 uppercase tracking-wider mb-1">Category</label>
                      <select
                        value={annCategory}
                        onChange={(e) => setAnnCategory(e.target.value)}
                        className={glassInputStyle}
                      >
                        <option value="General">General</option>
                        <option value="Health">Health</option>
                        <option value="Event">Event</option>
                        <option value="Emergency">Emergency</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-sky-900 uppercase tracking-wider mb-1">Content / Details</label>
                      <textarea
                        rows="4"
                        required
                        placeholder="Enter full announcement details here..."
                        value={annContent}
                        onChange={(e) => setAnnContent(e.target.value)}
                        className={`${glassInputStyle} resize-none`}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-lg shadow-sky-600/25 transition uppercase tracking-wider"
                    >
                      Publish Announcement
                    </button>
                  </form>
                </div>

                {/* Announcement List */}
                <div className={`${glassContainerStyle} lg:col-span-2`}>
                  <h3 className="text-sm font-black text-sky-950">Active Barangay Announcements</h3>
                  
                  {announcements.length === 0 ? (
                    <p className="text-center py-10 text-xs text-sky-900/80 font-medium">No announcements posted yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {announcements.map(ann => (
                        <div key={ann.id} className={glassCardStyle}>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 bg-sky-400/30 border border-sky-300/60 text-sky-900 rounded-md text-[10px] font-black uppercase">{ann.category || 'General'}</span>
                              <span className="text-[11px] text-sky-900 font-medium">{ann.dateStr}</span>
                            </div>
                            <h4 className="font-bold text-slate-900 text-xs">{ann.title}</h4>
                            <p className="text-xs text-sky-950 leading-relaxed">{ann.content}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteAnnouncement(ann.id)}
                            className="p-2 text-red-600 hover:bg-red-500/20 rounded-xl transition shrink-0"
                            title="Delete Announcement"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </>
        )}

      </main>

      {/* REGISTERED RESIDENTS MODAL */}
      {showUsersModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-gradient-to-br from-white/95 via-sky-100/90 to-blue-200/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/95 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-sky-600 to-blue-600 text-white flex justify-between items-center border-b border-white/20">
              <div className="flex items-center space-x-2.5">
                <Users size={20} className="text-sky-100" />
                <h2 className="text-sm font-black tracking-wide">Registered Residents Directory ({residentsList.length})</h2>
              </div>
              <button 
                onClick={() => setShowUsersModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition text-white backdrop-blur-md"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content / Users Table */}
            <div className="p-6 overflow-y-auto flex-1">
              {residentsList.length === 0 ? (
                <p className="text-center py-12 text-xs text-sky-900/80 font-medium">No registered residents found in database.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/60 text-sky-950 uppercase font-extrabold tracking-wider border-b border-sky-200/80">
                      <tr>
                        <th className="p-3">Full Name</th>
                        <th className="p-3">Email Address</th>
                        <th className="p-3">Purok / Location</th>
                        <th className="p-3">Role / Type</th>
                        <th className="p-3">User ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sky-200/60 font-medium">
                      {residentsList.map(u => (
                        <tr key={u.id} className="hover:bg-white/60 transition">
                          <td className="p-3">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <User size={14} className="text-sky-700" />
                              <span>{u.fullName || u.name || 'Unnamed Resident'}</span>
                            </div>
                          </td>
                          <td className="p-3 text-sky-950">{u.email || 'No email provided'}</td>
                          <td className="p-3 text-sky-950 font-semibold">{u.purok || 'N/A'}</td>
                          <td className="p-3">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 border border-emerald-400/40 text-emerald-900">
                              {u.role || 'Resident'}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[10px] text-sky-900/80">{u.id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-white/50 border-t border-sky-200/85 flex justify-end">
              <button
                onClick={() => setShowUsersModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition shadow-sm"
              >
                Close Directory
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}