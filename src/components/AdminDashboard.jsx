import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase'; 
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut as secondarySignOut } from 'firebase/auth';
import { ShieldCheck, UserPlus, Users, Clock, CheckCircle2, AlertCircle, Mail, Lock, User, Briefcase, LogOut, FileText, AlertTriangle, BarChart2, XCircle } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS modules
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function AdminDashboard({ currentUser, onLogout }) {
  const [stats, setStats] = useState({
    totalResidents: 0,
    approvedResidents: 0,
    pendingUsers: 0,
    rejectedResidents: 0,
    totalStaff: 0,
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0
  });
  
  const [staffForm, setStaffForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Fetch metrics and stats on load
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      let residents = 0;
      let approvedRes = 0;
      let pendingRes = 0;
      let rejectedRes = 0;
      let staff = 0;

      usersSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const role = (data.role || '').toLowerCase();
        const status = (data.status || '').trim().toLowerCase();

        if (role === 'staff' || role === 'admin') {
          staff++;
        } else {
          residents++;
          if (status === 'approved') {
            approvedRes++;
          } else if (status === 'rejected') {
            rejectedRes++;
          } else {
            pendingRes++; // defaults or 'pending'
          }
        }
      });

      let reqs = [];
      try {
        const reqSnapshot = await getDocs(collection(db, 'requests'));
        reqs = reqSnapshot.docs.map(d => d.data());
      } catch (e) {}

      let pendingReq = 0;
      let approvedReq = 0;
      let rejectedReq = 0;

      reqs.forEach(r => {
        const s = (r.status || '').trim().toLowerCase();
        if (s === 'approved' || s === 'ready for pickup') {
          approvedReq++;
        } else if (s === 'rejected') {
          rejectedReq++;
        } else {
          pendingReq++;
        }
      });

      let comps = [];
      try {
        const compSnapshot = await getDocs(collection(db, 'complaints'));
        comps = compSnapshot.docs.map(d => d.data());
      } catch (e) {}

      let pendingComp = 0;
      let resolvedComp = 0;

      comps.forEach(c => {
        const s = (c.status || '').trim().toLowerCase();
        if (s === 'resolved') {
          resolvedComp++;
        } else {
          pendingComp++;
        }
      });

      setStats({
        totalResidents: residents,
        approvedResidents: approvedRes,
        pendingUsers: pendingRes,
        rejectedResidents: rejectedRes,
        totalStaff: staff,
        totalRequests: reqs.length,
        pendingRequests: pendingReq,
        approvedRequests: approvedReq,
        rejectedRequests: rejectedReq,
        totalComplaints: comps.length,
        pendingComplaints: pendingComp,
        resolvedComplaints: resolvedComp
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: '', message: '' });

    if (staffForm.password !== staffForm.confirmPassword) {
      setFeedback({ type: 'error', message: 'Passwords do not match. Please check and try again.' });
      setLoading(false);
      return;
    }

    try {
      const fullName = `${staffForm.firstName.trim()} ${staffForm.lastName.trim()}`;
      
      const secondaryApp = initializeApp(auth.app.options, "SecondaryApp_" + Date.now());
      const secondaryAuth = getAuth(secondaryApp);

      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, staffForm.email.trim(), staffForm.password);
      const uid = userCredential.user.uid;

      await secondarySignOut(secondaryAuth);

      await setDoc(doc(db, 'users', uid), {
        firstName: staffForm.firstName.trim(),
        lastName: staffForm.lastName.trim(),
        fullName: fullName,
        email: staffForm.email.trim(),
        role: 'staff',
        status: 'Approved',
        createdAt: new Date().toISOString()
      });

      setFeedback({ 
        type: 'success', 
        message: `Staff account for ${fullName} successfully created and pre-approved!` 
      });
      
      setStaffForm({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
      fetchDashboardStats(); 
    } catch (error) {
      console.error("Error creating staff:", error);
      let errorMessage = 'Failed to create staff account.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered in Firebase Auth.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      }
      setFeedback({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Chart configurations
  const barChartData = {
    labels: ['Requests (Total)', 'Approved Reqs', 'Pending Reqs', 'Rejected Reqs', 'Complaints (Total)', 'Resolved Comps'],
    datasets: [
      {
        label: 'Transaction Breakdown',
        data: [stats.totalRequests, stats.approvedRequests, stats.pendingRequests, stats.rejectedRequests, stats.totalComplaints, stats.resolvedComplaints],
        backgroundColor: ['#0284c7', '#059669', '#d97706', '#dc2626', '#6366f1', '#10b981'],
        borderRadius: 10,
      },
    ],
  };

  const doughnutChartData = {
    labels: ['Approved Residents', 'Pending Residents', 'Rejected Residents', 'Staff Accounts'],
    datasets: [
      {
        data: [stats.approvedResidents, stats.pendingUsers, stats.rejectedResidents, stats.totalStaff],
        backgroundColor: ['#059669', '#d97706', '#dc2626', '#2563eb'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-blue-100 text-slate-800 pb-12 relative overflow-x-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-20 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar Header */}
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
                  Admin Dashboard
                </span>
              </div>
              <p className="text-[11px] text-sky-100 font-medium">Barangay Tubod • Toledo City, Cebu</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="text-right hidden md:block mr-2">
              <p className="text-xs font-bold text-white">{currentUser?.fullName || currentUser?.email || 'Administrator'}</p>
              <p className="text-[10px] text-sky-100">Master Control</p>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-3 py-2 bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-red-400/30 shadow-sm"
                title="Sign Out"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 mt-8 space-y-6 relative z-10">

        {/* Statistics Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="relative bg-gradient-to-br from-white/85 via-sky-100/70 to-blue-200/60 backdrop-blur-xl border border-white/95 rounded-2xl p-5 shadow-xl shadow-sky-900/10 flex items-center justify-between overflow-hidden">
            <div className="space-y-1">
              <p className="text-[11px] font-extrabold text-sky-900 uppercase tracking-wider">Approved Accounts</p>
              <h3 className="text-2xl font-black text-emerald-700">{stats.approvedResidents}</h3>
              <p className="text-[10px] text-emerald-800 font-medium">Active residents</p>
            </div>
            <div className="w-12 h-12 bg-emerald-400/30 border border-emerald-300/60 text-emerald-900 rounded-2xl flex items-center justify-center shadow-inner backdrop-blur-md">
              <CheckCircle2 size={22} className="text-emerald-700" />
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-white/85 via-sky-100/70 to-blue-200/60 backdrop-blur-xl border border-white/95 rounded-2xl p-5 shadow-xl shadow-sky-900/10 flex items-center justify-between overflow-hidden">
            <div className="space-y-1">
              <p className="text-[11px] font-extrabold text-sky-900 uppercase tracking-wider">Pending Approvals</p>
              <h3 className="text-2xl font-black text-amber-700">{stats.pendingUsers}</h3>
              <p className="text-[10px] text-amber-800 font-medium">Awaiting review</p>
            </div>
            <div className="w-12 h-12 bg-amber-400/30 border border-amber-300/60 text-amber-900 rounded-2xl flex items-center justify-center shadow-inner backdrop-blur-md">
              <Clock size={22} className="text-amber-700" />
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-white/85 via-sky-100/70 to-blue-200/60 backdrop-blur-xl border border-white/95 rounded-2xl p-5 shadow-xl shadow-sky-900/10 flex items-center justify-between overflow-hidden">
            <div className="space-y-1">
              <p className="text-[11px] font-extrabold text-sky-900 uppercase tracking-wider">Rejected Accounts</p>
              <h3 className="text-2xl font-black text-red-600">{stats.rejectedResidents}</h3>
              <p className="text-[10px] text-red-700 font-medium">Declined profiles</p>
            </div>
            <div className="w-12 h-12 bg-red-400/30 border border-red-300/60 text-red-900 rounded-2xl flex items-center justify-center shadow-inner backdrop-blur-md">
              <XCircle size={22} className="text-red-700" />
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-white/85 via-sky-100/70 to-blue-200/60 backdrop-blur-xl border border-white/95 rounded-2xl p-5 shadow-xl shadow-sky-900/10 flex items-center justify-between overflow-hidden">
            <div className="space-y-1">
              <p className="text-[11px] font-extrabold text-sky-900 uppercase tracking-wider">Requests & Complaints</p>
              <h3 className="text-2xl font-black text-indigo-700">{stats.totalRequests + stats.totalComplaints}</h3>
              <p className="text-[10px] text-indigo-800 font-medium">{stats.totalRequests} reqs • {stats.totalComplaints} comps</p>
            </div>
            <div className="w-12 h-12 bg-indigo-400/30 border border-indigo-300/60 text-indigo-900 rounded-2xl flex items-center justify-center shadow-inner backdrop-blur-md">
              <FileText size={22} className="text-indigo-800" />
            </div>
          </div>

        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Bar Chart Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-white/85 via-sky-100/70 to-blue-200/60 backdrop-blur-xl border border-white/95 shadow-2xl shadow-sky-900/15 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-sky-200/80 pb-3">
              <BarChart2 size={18} className="text-sky-700" />
              <h2 className="text-sm font-black text-sky-950 uppercase tracking-wide">Request & Complaint Status Breakdown</h2>
            </div>
            <div className="h-64 flex items-center justify-center p-2">
              <Bar data={barChartData} options={chartOptions} />
            </div>
          </div>

          {/* Doughnut Chart Card */}
          <div className="bg-gradient-to-br from-white/85 via-sky-100/70 to-blue-200/60 backdrop-blur-xl border border-white/95 shadow-2xl shadow-sky-900/15 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
            <div className="flex items-center gap-2 border-b border-sky-200/80 pb-3">
              <Users size={18} className="text-sky-700" />
              <h2 className="text-sm font-black text-sky-950 uppercase tracking-wide">Account Status Distribution</h2>
            </div>
            <div className="h-56 flex items-center justify-center p-2">
              <Doughnut data={doughnutChartData} options={chartOptions} />
            </div>
          </div>

        </div>

        {/* Staff Account Creator Form Section */}
        <div className="bg-gradient-to-br from-white/85 via-sky-100/70 to-blue-200/60 backdrop-blur-xl border border-white/95 shadow-2xl shadow-sky-900/15 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center space-x-3 border-b border-sky-200/80 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-sky-400/30 border border-sky-300/60 text-sky-900 flex items-center justify-center shadow-inner">
              <UserPlus size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-sky-950">Create New Staff Account</h3>
              <p className="text-xs text-sky-900/90 font-medium">Accounts created here are automatically flagged as <b>Approved</b> for instant staff portal access.</p>
            </div>
          </div>

          {feedback.message && (
            <div className={`p-4 rounded-2xl text-xs font-bold flex items-center space-x-2 ${
              feedback.type === 'success' ? 'bg-emerald-500/20 text-emerald-900 border border-emerald-400/40' : 'bg-red-500/20 text-red-900 border border-red-400/40'
            }`}>
              {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handleCreateStaff} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-sky-900 mb-1">First Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-3.5 text-sky-700" />
                  <input 
                    type="text" 
                    required
                    value={staffForm.firstName}
                    onChange={(e) => setStaffForm({...staffForm, firstName: e.target.value})}
                    placeholder="e.g. Juan"
                    className="w-full bg-white/70 backdrop-blur-md border border-sky-200/90 rounded-2xl py-3 pl-10 pr-4 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-sky-900 mb-1">Last Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-3.5 text-sky-700" />
                  <input 
                    type="text" 
                    required
                    value={staffForm.lastName}
                    onChange={(e) => setStaffForm({...staffForm, lastName: e.target.value})}
                    placeholder="e.g. dela Cruz"
                    className="w-full bg-white/70 backdrop-blur-md border border-sky-200/90 rounded-2xl py-3 pl-10 pr-4 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-inner"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-sky-900 mb-1">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3.5 text-sky-700" />
                <input 
                  type="email" 
                  required
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({...staffForm, email: e.target.value})}
                  placeholder="staff@baryolink.com"
                  className="w-full bg-white/70 backdrop-blur-md border border-sky-200/90 rounded-2xl py-3 pl-10 pr-4 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-inner"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-sky-900 mb-1">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3.5 text-sky-700" />
                  <input 
                    type="password" 
                    required
                    minLength={6}
                    value={staffForm.password}
                    onChange={(e) => setStaffForm({...staffForm, password: e.target.value})}
                    placeholder="At least 6 characters"
                    className="w-full bg-white/70 backdrop-blur-md border border-sky-200/90 rounded-2xl py-3 pl-10 pr-4 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-sky-900 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3.5 text-sky-700" />
                  <input 
                    type="password" 
                    required
                    minLength={6}
                    value={staffForm.confirmPassword}
                    onChange={(e) => setStaffForm({...staffForm, confirmPassword: e.target.value})}
                    placeholder="Re-enter password"
                    className="w-full bg-white/70 backdrop-blur-md border border-sky-200/90 rounded-2xl py-3 pl-10 pr-4 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-inner"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg shadow-sky-600/25 transition text-xs tracking-wider uppercase flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <UserPlus size={16} />
                <span>{loading ? 'Creating Account...' : 'Provision Staff Account'}</span>
              </button>
            </div>
          </form>
        </div>

      </main>

    </div>
  );
}