import React from 'react';
import { 
  FileText, 
  AlertTriangle, 
  Clock, 
  Megaphone, 
  ArrowRight, 
  ShieldCheck, 
  Building2, 
  Users 
} from 'lucide-react';

export default function LandingPage({ onGetStarted }) {
  const features = [
    {
      icon: FileText,
      title: 'Online Document Request',
      description: 'Request official barangay clearances, certificates of indigency, and residency without waiting in long queues at the barangay hall.',
      color: 'bg-sky-400/30 text-sky-900 border border-sky-300/60'
    },
    {
      icon: AlertTriangle,
      title: 'Direct Complaint Filing',
      description: 'Submit community grievances, safety concerns, or noise complaints securely with the option for anonymous reporting.',
      color: 'bg-amber-400/30 text-amber-900 border border-amber-300/60'
    },
    {
      icon: Clock,
      title: 'Real-Time Progress Tracker',
      description: 'Monitor the live status of your requested documents and filed complaints step-by-step from pending to pickup.',
      color: 'bg-indigo-400/30 text-indigo-900 border border-indigo-300/60'
    },
    {
      icon: Megaphone,
      title: 'Official Barangay Announcements',
      description: 'Stay informed with direct updates, health advisories, upcoming community assemblies, and local emergency hotlines.',
      color: 'bg-blue-400/30 text-blue-900 border border-blue-300/60'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white via-sky-50 to-blue-100 font-sans text-slate-800 flex flex-col justify-between relative overflow-x-hidden">
      
      {/* Background Ambient Glass Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-20 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner Header */}
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
          <button
            onClick={onGetStarted}
            className="bg-white/20 hover:bg-white/30 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm transition shadow-sm border border-white/30 backdrop-blur-md flex items-center space-x-1"
          >
            <span>Portal Access</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-6 relative z-10 flex flex-col items-center justify-center text-center w-full">
        <div className="max-w-4xl w-full mx-auto flex flex-col items-center justify-center text-center space-y-6">
          
          {/* Badge */}
          <span className="inline-block bg-sky-400/20 backdrop-blur-md text-sky-900 text-xs font-extrabold px-4 py-1.5 rounded-full border border-sky-300/60 uppercase tracking-widest shadow-inner text-center">
            OFFICIAL E-GOVERNANCE PORTAL
          </span>

          {/* Main Heading */}
          <h2 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight text-slate-900 text-center w-full">
            Seamless Barangay Services for{' '}
            <span className="block sm:inline text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-700">
              Barangay Tubod
            </span>
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base text-sky-950/90 max-w-2xl mx-auto text-center leading-relaxed font-medium">
            BaryoLink bridges the gap between residents and local barangay governance. Easily request documents, log concerns, and track approvals anytime, anywhere.
          </p>

          {/* CTA Button */}
          <div className="pt-2 flex justify-center w-full">
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-extrabold px-8 py-3.5 rounded-2xl text-base transition shadow-lg shadow-sky-600/25 inline-flex items-center space-x-2 transform hover:-translate-y-0.5 border border-white/20"
            >
              <span>Get Started Now</span>
              <ArrowRight size={20} />
            </button>
          </div>

        </div>
      </section>

      {/* Features Showcase Section */}
      <section className="py-12 px-6 max-w-6xl mx-auto w-full relative z-10">
        <div className="text-center mb-10">
          <h3 className="text-2xl font-black text-sky-950">What BaryoLink Offers</h3>
          <p className="text-xs sm:text-sm text-sky-900/80 mt-1 font-medium">Four core services designed for speed, transparency, and accessibility.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                className="relative bg-gradient-to-br from-white/85 via-sky-100/70 to-blue-200/60 backdrop-blur-xl rounded-3xl p-6 border border-white/95 shadow-xl shadow-sky-900/10 hover:shadow-2xl transition flex items-start space-x-4 overflow-hidden"
              >
                <div className={`p-3.5 rounded-2xl shrink-0 backdrop-blur-md shadow-inner ${feature.color}`}>
                  <Icon size={26} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-lg mb-1">{feature.title}</h4>
                  <p className="text-xs sm:text-sm text-sky-950/90 leading-relaxed font-medium">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Glass Badges */}
      <section className="bg-white/40 backdrop-blur-xl border-y border-white/80 py-10 px-6 relative z-10">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <ShieldCheck className="text-sky-600 mb-2" size={28} />
            <h5 className="font-bold text-slate-900 text-sm">Secure & Private</h5>
            <p className="text-xs text-sky-900/80 mt-0.5 font-medium">Encrypted resident record protection</p>
          </div>
          <div className="flex flex-col items-center">
            <Building2 className="text-sky-600 mb-2" size={28} />
            <h5 className="font-bold text-slate-900 text-sm">Barangay Tubod Unified</h5>
            <p className="text-xs text-sky-900/80 mt-0.5 font-medium">Directly connected to barangay staff</p>
          </div>
          <div className="flex flex-col items-center">
            <Users className="text-sky-600 mb-2" size={28} />
            <h5 className="font-bold text-slate-900 text-sm">Community Driven</h5>
            <p className="text-xs text-sky-900/80 mt-0.5 font-medium">Empowering Toledo City residents</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 px-6 text-center relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© {new Date().getFullYear()} BaryoLink • Barangay Tubod, Toledo City, Cebu.</p>
          <button 
            onClick={onGetStarted}
            className="text-sky-400 hover:underline font-semibold"
          >
            Resident Sign In / Register
          </button>
        </div>
      </footer>
    </div>
  );
}