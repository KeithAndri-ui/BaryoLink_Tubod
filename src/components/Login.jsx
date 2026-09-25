import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { LogIn, Mail, Lock, ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login({ onLoginSuccess, onSwitchToRegister, onBackToHome }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Authenticate with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Fetch user document from Firestore to check status and role
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Check if account is pending approval (skip check if they are an admin/official)
        if (userData.role === 'resident' && userData.status === 'pending') {
          setError('Your account is still pending approval from Barangay Tubod officials. Please wait for confirmation.');
          await signOut(auth); // Log them out immediately
          setLoading(false);
          return;
        }

        if (userData.role === 'resident' && userData.status === 'rejected') {
          setError('Your account registration was declined by the barangay office.');
          await signOut(auth);
          setLoading(false);
          return;
        }

        onLoginSuccess(userData);
      } else {
        // Fallback if user doc doesn't exist yet
        onLoginSuccess({
          uid: user.uid,
          email: user.email,
          role: 'resident',
          fullName: user.email.split('@')[0]
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else {
        setError('Authentication failed. Please check your network and details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-100 via-sky-100 to-blue-200 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[10%] left-[15%] w-72 h-72 bg-sky-300/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[15%] w-80 h-80 bg-blue-400/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white overflow-hidden relative z-10 my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-800 to-blue-900 text-white p-6 text-center relative border-b border-white/10">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="absolute left-4 top-4 p-2 text-sky-200 hover:text-white hover:bg-white/10 rounded-xl transition flex items-center gap-1 text-xs backdrop-blur-md"
              type="button"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Home</span>
            </button>
          )}

          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md text-white font-extrabold flex items-center justify-center text-2xl border border-white/30 mx-auto mb-3 shadow-inner">
            BT
          </div>
          <h1 className="text-2xl font-black tracking-wide text-white">BaryoLink</h1>
          <p className="text-xs text-sky-200 mt-1">Barangay Tubod • Toledo City, Cebu</p>
          <p className="text-xs font-bold text-sky-300 mt-2 uppercase tracking-wider">
            Barangay Portal Login
          </p>
        </div>

        {error && (
          <div className="mx-6 mt-6 p-3 bg-red-500/10 border-l-4 border-red-500 text-red-700 text-xs rounded-xl backdrop-blur-md font-medium flex items-center gap-2 shadow-sm">
            <AlertCircle size={16} className="shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-6 sm:p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 uppercase">
                Email Address <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-3 text-sky-700 z-10" />
                <input
                  type="email"
                  required
                  placeholder="resident@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-sky-600 focus:outline-none transition shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 uppercase">
                Password <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3 text-sky-700 z-10" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-sky-600 focus:outline-none transition shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-sky-800 transition z-10"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white font-bold py-3 rounded-xl transition flex items-center justify-center space-x-2 text-sm shadow-lg shadow-sky-600/20"
            >
              <LogIn size={18} />
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-200 text-center space-y-2">
            <p className="text-xs text-slate-700 font-medium">
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="font-extrabold text-sky-800 hover:underline ml-1"
              >
                Register Here
              </button>
            </p>

            {onBackToHome && (
              <div>
                <button
                  type="button"
                  onClick={onBackToHome}
                  className="text-xs text-slate-500 hover:text-slate-800 transition font-semibold hover:underline"
                >
                  ← Back to Landing Page
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
