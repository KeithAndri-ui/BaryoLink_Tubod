import React, { useState } from 'react';
import { AlertTriangle, Upload, X, Send, MapPin, FileText } from 'lucide-react';

export default function ComplaintSubmission({ onSubmitComplaint }) {
  const [complaintType, setComplaintType] = useState('Noise Disturbance');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [purok, setPurok] = useState('Purok 1');
  
  // Optional Evidence Photo State
  const [evidenceImage, setEvidenceImage] = useState(null);
  const [evidencePreview, setEvidencePreview] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setError('Evidence image size must be less than 3MB.');
        return;
      }
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvidenceImage(file);
        setEvidencePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setEvidenceImage(null);
    setEvidencePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !details.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const newComplaint = {
        type: 'Complaint',
        complaintType,
        title: title.trim(),
        details: details.trim(),
        purok,
        evidenceUrl: evidencePreview || null,
        status: 'In Review',
        dateStr: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        createdAt: new Date().toISOString()
      };

      if (onSubmitComplaint) {
        await onSubmitComplaint(newComplaint);
      }

      setSuccess(true);
      setTitle('');
      setDetails('');
      setEvidenceImage(null);
      setEvidencePreview('');
      
      setTimeout(() => {
        setSuccess(false);
      }, 4000);
    } catch (err) {
      console.error('Submission error:', err);
      setError('Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-white/85 via-sky-100/70 to-blue-200/60 backdrop-blur-xl border border-white/90 shadow-2xl shadow-sky-900/15 rounded-3xl p-6 sm:p-8 space-y-6 overflow-hidden">
      
      {/* Glassy Ambient Glow Orbs */}
      <div className="absolute -top-20 -right-20 w-56 h-56 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center space-x-3.5 border-b border-sky-200/70 pb-5">
        <div className="p-3 bg-gradient-to-br from-amber-400/30 to-orange-500/20 text-amber-900 rounded-2xl border border-amber-300/60 shadow-inner backdrop-blur-md">
          <AlertTriangle size={26} className="text-amber-700" />
        </div>
        <div>
          <h2 className="text-xl font-black text-sky-950">File a Complaint</h2>
          <p className="text-xs text-sky-800/90 font-medium">Report community concerns securely to barangay officials</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border-l-4 border-red-500 text-red-700 text-xs rounded-xl backdrop-blur-md font-medium relative z-10">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-500/10 border-l-4 border-emerald-500 text-emerald-800 text-xs rounded-xl backdrop-blur-md font-medium relative z-10">
          Complaint submitted successfully! You can track its status in the Progress Tracker.
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
        
        {/* Complaint Type & Purok Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 uppercase">
              Complaint Type <span className="text-red-600">*</span>
            </label>
            <select
              value={complaintType}
              onChange={(e) => setComplaintType(e.target.value)}
              className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-600 focus:outline-none shadow-sm"
            >
              <option value="Noise Disturbance">Noise Disturbance</option>
              <option value="Property Dispute">Property Dispute</option>
              <option value="Public Safety Hazard">Public Safety Hazard</option>
              <option value="Garbage / Sanitation">Garbage / Sanitation</option>
              <option value="Streetlight Issue">Streetlight Issue</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 uppercase">
              Location / Purok <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-3 text-sky-700 z-10" />
              <select
                value={purok}
                onChange={(e) => setPurok(e.target.value)}
                className="w-full py-2.5 pl-9 pr-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-600 focus:outline-none shadow-sm"
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
        </div>

        {/* Complaint Title */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1 uppercase">
            Issue Title / Subject <span className="text-red-600">*</span>
          </label>
          <div className="relative">
            <FileText size={16} className="absolute left-3 top-3 text-sky-700 z-10" />
            <input
              type="text"
              required
              placeholder="e.g., Loud karaoke past midnight on Purok 2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-600 focus:outline-none transition shadow-sm"
            />
          </div>
        </div>

        {/* Detailed Description */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1 uppercase">
            Incident Details & Description <span className="text-red-600">*</span>
          </label>
          <textarea
            required
            rows={4}
            placeholder="Provide a clear description of the incident, including date, time, and involved parties if applicable..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-600 focus:outline-none transition shadow-sm resize-none"
          />
        </div>

        {/* Optional Picture Evidence Upload */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800 uppercase">
            Photo Evidence <span className="text-slate-400 font-normal lowercase">(optional)</span>
          </label>
          <p className="text-[11px] text-slate-600 font-medium">Attach a photo or screenshot to support your report for faster action.</p>
          
          {!evidencePreview ? (
            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-sky-300 rounded-2xl cursor-pointer bg-white/70 hover:bg-white transition relative overflow-hidden shadow-sm">
              <div className="flex flex-col items-center p-3 text-center">
                <div className="p-2 bg-sky-100 text-sky-800 rounded-xl mb-1.5">
                  <Upload size={20} />
                </div>
                <span className="text-xs font-extrabold text-sky-950">Click to upload evidence photo</span>
                <span className="text-[10px] text-slate-500 mt-0.5">PNG, JPG up to 3MB</span>
              </div>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          ) : (
            <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-sky-300 shadow-md bg-black">
              <img src={evidencePreview} alt="Evidence Preview" className="w-full h-full object-contain" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-xl backdrop-blur-md transition shadow-lg"
                title="Remove Image"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center space-x-2 text-sm shadow-lg shadow-amber-600/20 mt-2"
        >
          <Send size={16} />
          <span>{loading ? 'Submitting Report...' : 'Submit Complaint'}</span>
        </button>

      </form>
    </div>
  );
}