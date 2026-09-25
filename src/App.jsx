import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';

import LandingPage from './components/LandingPage';
import AboutPage from './components/AboutPage';   
import Login from './components/Login';         
import Register from './components/Register';   
import Header from './components/Header';
import Navigation from './components/Navigation';
import DocumentRequest from './components/DocumentRequest';
import ComplaintSubmission from './components/ComplaintSubmission';
import ProgressTracker from './components/ProgressTracker';
import Announcements from './components/Announcements';
import Footer from './components/Footer';
import StaffDashboard from './components/StaffDashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const [currentView, setCurrentView] = useState('landing'); 
  const [authView, setAuthView] = useState('login'); 
  const [activeTab, setActiveTab] = useState('request');
  const [trackedItems, setTrackedItems] = useState([]);

  // Monitor Firebase Auth session state & listen to both requests & complaints in real-time
  useEffect(() => {
    let unsubRequests = null;
    let unsubComplaints = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        let userData = { uid: currentUser.uid, email: currentUser.email, role: 'resident' };
        
        if (userDoc.exists()) {
          userData = userDoc.data();
        }
        setUser(userData);
        setShowLanding(false);
        setCurrentView('landing');

        // If resident, listen directly to `requests` and `complaints` collections
        if (userData.role !== 'staff' && userData.role !== 'admin') {
          const reqQuery = query(collection(db, 'requests'), where('userId', '==', currentUser.uid));
          const compQuery = query(collection(db, 'complaints'), where('userId', '==', currentUser.uid));

          let requestsList = [];
          let complaintsList = [];

          const updateTrackedItems = () => {
            const combined = [...requestsList, ...complaintsList].sort((a, b) => 
              new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
            );
            setTrackedItems(combined);
          };

          unsubRequests = onSnapshot(reqQuery, (snapshot) => {
            requestsList = snapshot.docs.map(docSnap => ({ id: docSnap.id, type: 'Document', ...docSnap.data() }));
            updateTrackedItems();
          });

          unsubComplaints = onSnapshot(compQuery, (snapshot) => {
            complaintsList = snapshot.docs.map(docSnap => ({ id: docSnap.id, type: 'Complaint', ...docSnap.data() }));
            updateTrackedItems();
          });
        }

      } else {
        setUser(null);
        setTrackedItems([]);
        if (unsubRequests) unsubRequests();
        if (unsubComplaints) unsubComplaints();
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubRequests) unsubRequests();
      if (unsubComplaints) unsubComplaints();
    };
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
    setTrackedItems([]);
    setShowLanding(true);
    setCurrentView('landing');
  };

  const handleNewSubmission = async (item) => {
    if (!user) return;

    const submissionData = {
      ...item,
      userId: user.uid,
      fullName: user.fullName || user.email,
      purok: user.purok || 'Purok 1',
      status: item.type === 'Complaint' ? 'In Review' : 'Pending',
      createdAt: new Date().toISOString(),
      dateStr: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    try {
      const targetCollection = item.type === 'Complaint' ? 'complaints' : 'requests';
      await addDoc(collection(db, targetCollection), submissionData);
    } catch (err) {
      console.error("Error saving submission:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-sm font-semibold text-sky-800 animate-pulse">
          Loading BaryoLink...
        </p>
      </div>
    );
  }

  // Handle unauthenticated views (Landing Page vs About Page vs Auth Flow)
  if (!user && showLanding) {
    if (currentView === 'about') {
      return <AboutPage onBack={() => setCurrentView('landing')} />;
    }

    return (
      <LandingPage 
        onGetStarted={() => { setAuthView('login'); setShowLanding(false); }} 
        onOpenAbout={() => setCurrentView('about')} 
      />
    );
  }

  if (!user && !showLanding) {
    if (authView === 'login') {
      return (
        <Login 
          onLoginSuccess={(userData) => setUser(userData)} 
          onSwitchToRegister={() => setAuthView('register')}
          onBackToHome={() => { setShowLanding(true); setCurrentView('landing'); }}
        />
      );
    } else {
      return (
        <Register 
          onSwitchToLogin={() => setAuthView('login')}
          onBackToHome={() => { setShowLanding(true); setCurrentView('landing'); }}
          onRegistrationComplete={() => {
            setAuthView('login');
          }}
        />
      );
    }
  }

  if (user && (user.role === 'staff' || user.role === 'admin')) {
    return <StaffDashboard user={user} onLogout={handleSignOut} />;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-100 via-sky-50 to-blue-100 font-sans text-slate-800 flex flex-col justify-between">
      <div>
        <Header user={user} onSignOut={handleSignOut} items={trackedItems} />
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="max-w-4xl mx-auto px-4 py-8">
          {activeTab === 'request' && (
            <DocumentRequest user={user} onRequestSubmitted={handleNewSubmission} />
          )}
          {activeTab === 'complaint' && (
            <ComplaintSubmission onSubmitComplaint={handleNewSubmission} />
          )}
          {activeTab === 'tracker' && (
            <ProgressTracker items={trackedItems} />
          )}
          {activeTab === 'announcements' && (
            <Announcements />
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}