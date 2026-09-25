import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { UserPlus, Mail, Lock, Phone, ArrowLeft, Upload, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Register({ onSwitchToLogin, onBackToHome, onRegistrationComplete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false); // Shows message to wait for approval

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');

  const [phone, setPhone] = useState('');
  const [purok, setPurok] = useState('Purok 1');
  const role = 'resident';
  
  const [idFront, setIdFront] = useState(null);
  const [idBack, setIdBack] = useState(null);
  const [idFrontPreview, setIdFrontPreview] = useState('');
  const [idBackPreview, setIdBackPreview] = useState('');

  const handleImageChange = (e, side) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size must be less than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (side === 'front') {
          setIdFront(file);
          setIdFrontPreview(reader.result);
        } else {
          setIdBack(file);
          setIdBackPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!idFrontPreview || !idBackPreview) {
      setError('Please upload both the Front and Back pictures of your Valid ID.');
      return;
    }
    setShowConfirmModal(true);
  };

  const executeRegistration = async () => {
    setShowConfirmModal(false);
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const fullName = `${firstName.trim()} ${middleName ? middleName.trim() + ' ' : ''}${lastName.trim()}`;

      const userData = {
        uid: user.uid,
        firstName: firstName.trim(),
        middleName: middleName.trim(),
        lastName: lastName.trim(),
        fullName,
        email,
        phone,
        purok,
        role,
        status: 'pending', // <--- KEY: Account starts as pending approval
        idFrontUrl: idFrontPreview,
        idBackUrl: idBackPreview,
        barangay: 'Barangay Tubod',
        city: 'Toledo City',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      
      // Sign them out immediately so they cannot enter the dashboard while pending
      await signOut(auth);

      // Show success modal informing them to wait for barangay approval
      setSuccessModal(true);
    } catch (err) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters long.');
      } else {
        setError('Registration failed. Please check your details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-100 via-sky-100 to-blue-200 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[10%] left-[15%] w-72 h-72 bg-sky-300/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[15%] w-80 h-80 bg-blue-400/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-lg w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white overflow-hidden relative z-10 my-8">
        
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
            Create Resident Account & Verify ID
          </p>
        </div>

        {error && (
          <div className="mx-6 mt-6 p-3 bg-red-500/10 border-l-4 border-red-500 text-red-700 text-xs rounded-xl backdrop-blur-md font-medium flex items-center gap-2 shadow-sm">
            <AlertCircle size={16} className="shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto no-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 uppercase">
                  First Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Juan"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-600 focus:outline-none transition shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 uppercase">
                  Middle Name <span className="text-[10px] text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Tamayo"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-600 focus:outline-none transition shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 uppercase">
                  Last Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Dela Cruz"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-600 focus:outline-none transition shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 uppercase">
                  Contact Number <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-3 text-sky-700 z-10" />
                  <input
                    type="tel"
                    required
                    placeholder="09123456789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-2 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-600 focus:outline-none transition shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 uppercase">
                  Purok <span className="text-red-600">*</span>
                </label>
                <select
                  value={purok}
                  onChange={(e) => setPurok(e.target.value)}
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-600 focus:outline-none shadow-sm"
                >
                  <option>Purok 1</option>
                  <option>Purok 2</option>
                  <option>Purok 3</option>
                  <option>Purok 4</option>
                  <option>Purok 5</option>
                  <option>Purok 6</option>
                </select>
              </div>
            </div>

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

            {/* Valid ID Upload */}
            <div className="bg-sky-50 p-4 rounded-2xl border border-sky-200 space-y-3 shadow-inner">
              <div>
                <h3 className="text-xs font-black text-sky-950 uppercase tracking-wide">
                  Valid ID Verification <span className="text-red-600">*</span>
                </h3>
                <p className="text-[11px] text-sky-900/80 font-medium">Please upload clear pictures of your valid government ID (Front & Back).</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-slate-800 uppercase">1. ID (Front) <span className="text-red-600">*</span></label>
                  <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-sky-400 rounded-xl cursor-pointer bg-white hover:bg-sky-50 transition relative overflow-hidden shadow-sm">
                    {idFrontPreview ? (
                      <img src={idFrontPreview} alt="Front" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center p-2 text-center">
                        <Upload size={18} className="text-sky-700 mb-1" />
                        <span className="text-[10px] font-bold text-sky-950">Upload Front</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'front')} className="hidden" />
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-slate-800 uppercase">2. ID (Back) <span className="text-red-600">*</span></label>
                  <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-sky-400 rounded-xl cursor-pointer bg-white hover:bg-sky-50 transition relative overflow-hidden shadow-sm">
                    {idBackPreview ? (
                      <img src={idBackPreview} alt="Back" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center p-2 text-center">
                        <Upload size={18} className="text-sky-700 mb-1" />
                        <span className="text-[10px] font-bold text-sky-950">Upload Back</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'back')} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white font-bold py-3 rounded-xl transition flex items-center justify-center space-x-2 text-sm shadow-lg shadow-sky-600/20"
            >
              <UserPlus size={18} />
              <span>{loading ? 'Processing...' : 'Register Account'}</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-200 text-center space-y-2">
            <p className="text-xs text-slate-700 font-medium">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="font-extrabold text-sky-800 hover:underline ml-1"
              >
                Sign In
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

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-sky-100 text-center space-y-4">
            <div className="w-14 h-14 bg-sky-100 text-sky-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">Review Your Details</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Please make sure your details and uploaded ID are correct before submitting for barangay verification.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Edit Details
              </button>
              <button
                type="button"
                onClick={executeRegistration}
                className="py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 text-white font-bold rounded-xl text-xs transition shadow-md"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success / Pending Approval Notice Modal */}
      {successModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-emerald-100 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <UserPlus size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">Registration Successful!</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your account has been created and is currently <span className="font-bold text-amber-600">Pending Approval</span> by the Barangay Tubod officials. You will be able to log in once your account is verified.
              </p>
            </div>
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="w-full py-3 bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold rounded-xl text-xs transition shadow-md"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      )}
    </div>
  );
}