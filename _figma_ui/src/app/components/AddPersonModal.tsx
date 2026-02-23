import { useState } from 'react';
import { X, Link, Mail, Building2, Sparkles, Loader2 } from 'lucide-react';

interface AddPersonModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddPersonModal({ open, onClose }: AddPersonModalProps) {
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [autoEnrich, setAutoEnrich] = useState(true);
  const [enriching, setEnriching] = useState(false);

  const handleEnrich = () => {
    if (!linkedinUrl) return;
    setEnriching(true);
    setTimeout(() => {
      setName('Jane Doe');
      setTitle('VP of Engineering');
      setCompany('Acme Corp');
      setEmail('jane.doe@acme.com');
      setEnriching(false);
    }, 1500);
  };

  const handleSave = () => {
    onClose();
    setLinkedinUrl('');
    setEmail('');
    setCompany('');
    setName('');
    setTitle('');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[480px] rounded-2xl border border-gray-200 bg-white shadow-[0_25px_60px_rgba(0,0,0,0.15)] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h3 className="text-gray-900">Add Person</h3>
            <p className="text-xs text-gray-500 mt-0.5">Paste a LinkedIn URL for instant enrichment</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4 p-5">
          {/* LinkedIn URL */}
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">LinkedIn URL</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="linkedin.com/in/..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-colors"
                />
              </div>
              <button
                onClick={handleEnrich}
                disabled={!linkedinUrl || enriching}
                className="flex items-center gap-1.5 rounded-xl bg-[#FFD600] px-3.5 py-2.5 text-sm text-gray-900 transition-all hover:bg-[#E5C100] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {enriching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Enrich
              </button>
            </div>
          </div>

          {/* Name + Title row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. VP of Engineering"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-colors"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@company.com"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-colors"
              />
            </div>
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Company</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company name"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-colors"
              />
            </div>
          </div>

          {/* Auto-enrich toggle */}
          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm text-gray-700">Auto-enrich</p>
              <p className="text-xs text-gray-400">Pull data from LinkedIn automatically</p>
            </div>
            <button
              onClick={() => setAutoEnrich(!autoEnrich)}
              className={`relative h-6 w-11 rounded-full transition-colors ${autoEnrich ? 'bg-[#2563EB]' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${autoEnrich ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4">
          <p className="text-xs text-gray-400">A "first touch" task will be auto-created</p>
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm text-white hover:bg-[#1D4ED8] transition-colors">
              Save Person
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
