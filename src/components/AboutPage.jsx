import React from 'react';
import { ArrowLeft, ShieldCheck, Building2, Users, MapPin, Mail, Phone, Info, Award } from 'lucide-react';

export default function AboutPage({ onBack }) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white via-sky-50 to-blue-100 font-sans text-slate-800 flex flex-col justify-between relative overflow-x-hidden">
      
      {/* Background Ambient Glass Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-20 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-lg shadow-sky-600/20 py-4 px-6 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 text-white font-black flex items-center justify-center text-lg shadow-inner backdrop-blur-md">
              BT
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wide text-white">BaryoLink</h1>
              <p className="text-[11px] text-sky-100">Barangay Tubod • Toledo City, Cebu</p>
            </div>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="bg-white/20 hover:bg-white/30 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm transition shadow-sm border border-white/30 backdrop-blur-md flex items-center space-x-1.5"
            >
              <ArrowLeft size={16} />
              <span>Back to Home</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="py-16 px-6 max-w-5xl mx-auto w-full relative z-10 space-y-8 flex-grow">
        
        {/* Hero Card */}
        <div className="bg-gradient-to-br from-white/90 via-sky-100/80 to-blue-200/70 backdrop-blur-2xl border border-white/95 shadow-2xl shadow-sky-900/15 rounded-3xl p-8 sm:p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-sky-600/30">
            <Info size={32} />
          </div>
          <span className="inline-block bg-sky-400/20 backdrop-blur-md text-sky-900 text-xs font-extrabold px-4 py-1.5 rounded-full border border-sky-300/60 uppercase tracking-widest shadow-inner">
            SYSTEM OVERVIEW
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-sky-950 tracking-tight">About Barangay Tubod & BaryoLink</h2>
          <p className="text-sm sm:text-base text-sky-900/90 font-medium max-w-2xl mx-auto leading-relaxed">
            BaryoLink is the official digital transformation platform for Barangay Tubod, Toledo City, Cebu, designed to bring transparent, paperless, and fast public governance right to your fingertips.
          </p>
        </div>

        {/* Mission & Vision Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-white/85 via-sky-100/70 to-blue-200/60 backdrop-blur-xl border border-white/95 shadow-xl rounded-3xl p-6 space-y-3">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-sky-200/80 pb-3">
              <Award size={20} className="text-sky-600" />
              <span>Our Mission</span>
            </h3>
            <p className="text-xs sm:text-sm text-sky-950/90 leading-relaxed font-medium">
              To streamline essential community services—such as document clearances, public incident reports, and government announcements—into a unified, secure, and user-friendly portal accessible to all residents.
            </p>
          </div>

          <div className="bg-gradient-to-br from-white/85 via-sky-100/70 to-blue-200/60 backdrop-blur-xl border border-white/95 shadow-xl rounded-3xl p-6 space-y-3">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-sky-200/80 pb-3">
              <Users size={20} className="text-sky-600" />
              <span>Community Commitment</span>
            </h3>
            <p className="text-xs sm:text-sm text-sky-950/90 leading-relaxed font-medium">
              Bridging the communication gap between constituents and local barangay leaders. We guarantee timely feedback handling, enhanced response efficiency, and strict protection of resident privacy records.
            </p>
          </div>
        </div>

        {/* Contact Details Card */}
        <div className="bg-gradient-to-br from-white/85 via-sky-100/70 to-blue-200/60 backdrop-blur-xl border border-white/95 shadow-xl rounded-3xl p-6 sm:p-8 space-y-6">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-sky-200/80 pb-3">
            <MapPin size={20} className="text-sky-600" />
            <span>Barangay Hall Information & Support</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white/70 backdrop-blur-md rounded-2xl border border-sky-200/80 flex items-center gap-3 shadow-sm">
              <MapPin size={24} className="text-sky-600 shrink-0" />
              <div>
                <p className="font-bold text-slate-900 text-xs">Location</p>
                <p className="text-[11px] text-sky-900">Barangay Hall, Tubod, Toledo City, Cebu</p>
              </div>
            </div>
            <div className="p-4 bg-white/70 backdrop-blur-md rounded-2xl border border-sky-200/80 flex items-center gap-3 shadow-sm">
              <Mail size={24} className="text-sky-600 shrink-0" />
              <div>
                <p className="font-bold text-slate-900 text-xs">Official Email</p>
                <p className="text-[11px] text-sky-900">support@baryolink.tubod.gov</p>
              </div>
            </div>
            <div className="p-4 bg-white/70 backdrop-blur-md rounded-2xl border border-sky-200/80 flex items-center gap-3 shadow-sm">
              <Phone size={24} className="text-sky-600 shrink-0" />
              <div>
                <p className="font-bold text-slate-900 text-xs">Hotline Support</p>
                <p className="text-[11px] text-sky-900">(032) 555-tubod</p>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 px-6 text-center relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© {new Date().getFullYear()} BaryoLink • Barangay Tubod, Toledo City, Cebu.</p>
          {onBack && (
            <button 
              onClick={onBack}
              className="text-sky-400 hover:underline font-semibold"
            >
              Return to Home Page
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}