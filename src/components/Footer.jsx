import React from 'react';
import { ShieldCheck, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-r from-sky-900 to-blue-950 text-slate-300 py-8 px-4 mt-16 border-t border-sky-800/50 shadow-inner">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        
        {/* Branding & Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-white font-black text-sm tracking-wider">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-200">
              BT
            </div>
            <span>BaryoLink</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Official digital barangay service and resident portal for efficient community governance and transparent public requests.
          </p>
        </div>

        {/* Contact Info */}
        <div className="space-y-2">
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-sky-300">Barangay Hall Contact</h4>
          <div className="flex items-start gap-2 text-slate-300">
            <MapPin size={14} className="text-sky-400 mt-0.5 shrink-0" />
            <span>Barangay Tubod Hall, Toledo City, Cebu, 6038</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Phone size={14} className="text-sky-400 shrink-0" />
            <span>(032) 123-4567 / 0912-345-6789</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Mail size={14} className="text-sky-400 shrink-0" />
            <span>support@baryolink.tubod.gov.ph</span>
          </div>
        </div>

        {/* Security / System Info */}
        <div className="space-y-2 md:text-right flex flex-col md:items-end justify-between">
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-sky-300">Security & Compliance</h4>
            <p className="text-slate-400 flex items-center gap-1 md:justify-end mt-1">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Verified Resident Portal</span>
            </p>
          </div>
          <div className="text-[10px] text-slate-500 pt-4 md:pt-0">
            © {new Date().getFullYear()} BaryoLink. All rights reserved.
          </div>
        </div>

      </div>
    </footer>
  );
}