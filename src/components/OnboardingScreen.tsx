import React, { useState, useRef } from 'react';
import { BookOpen, Upload, ArrowRight, User, Loader2, AlertCircle, FileText, Briefcase, GraduationCap, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface OnboardingScreenProps {
  actorEmail: string;
  clerkEmail: string;
  clerkName: string;
  onLogout: () => void;
}

export default function OnboardingScreen({ actorEmail, clerkEmail, clerkName, onLogout }: OnboardingScreenProps) {
  const [mode, setMode] = useState<'choose' | 'resume' | 'manual'>('choose');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: clerkName || '',
    email: clerkEmail,
    phone: '',
    collegeName: '',
    branch: '',
    currentYear: '',
    graduationYear: '',
    experience: '',
    learningGoals: '',
    hearAboutUs: '',
  });

  const updateField = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const registerStudent = useMutation(api.lms.registerStudent);

  // Resume upload + AI auto-fill
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await fetch('/api/lms/parse-resume', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success && data.fields) {
        const f = data.fields;
        setForm(prev => ({
          ...prev,
          name: f.name || prev.name,
          phone: f.phone || prev.phone,
          collegeName: f.collegeName || prev.collegeName,
          branch: f.branch || prev.branch,
          experience: f.experience || prev.experience,
          learningGoals: f.learningGoals || prev.learningGoals,
          hearAboutUs: f.hearAboutUs || prev.hearAboutUs,
        }));
        setMode('manual');
      } else {
        setError(data.error || 'Failed to parse resume. Please fill manually.');
        setMode('manual');
      }
    } catch {
      setError('Upload failed. Please fill the form manually.');
      setMode('manual');
    } finally {
      setIsUploading(false);
    }
  };

  // Submit enrollment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.collegeName.trim() || !form.branch.trim() || !form.currentYear.trim() || !form.graduationYear.trim() || !form.experience.trim() || !form.learningGoals.trim()) {
      setError('Please fill all required fields.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await registerStudent({
        actorEmail,
        fullName: form.name,
        email: clerkEmail,
        phone: form.phone,
        collegeName: form.collegeName,
        university: '',
        degree: '',
        branch: form.branch,
        currentYear: form.currentYear,
        graduationYear: form.graduationYear,
        city: '',
        state: '',
        skills: '',
        preferredCourse: 'python-mastery',
        reasonForJoining: [form.experience, form.learningGoals].filter(Boolean).join(' — '),
      });
      if (result.success) {
        setSuccess(true);
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] text-slate-800 font-sans flex items-center justify-center p-4 relative overflow-y-auto">
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-emerald-100/50 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-green-100/50 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="w-full max-w-md relative z-10 bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl text-center space-y-6">
          <img
            src="/KRIORA_LOGO.png"
            alt="Kriora Logo"
            className="w-16 h-16 rounded-full object-cover mx-auto shadow-xl shadow-emerald-500/20 border-2 border-white ring-2 ring-emerald-500/30"
          />
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Application Submitted!</h2>
            <p className="text-sm text-slate-500 mt-2">Your enrollment request is pending admin approval. You'll get access once approved.</p>
          </div>
          <Button onClick={onLogout} variant="outline" className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs rounded-xl">
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 font-sans flex items-center justify-center p-4 relative overflow-y-auto">
      <div className="absolute top-1/4 left-1/4 w-[380px] h-[380px] bg-[#FF5A36]/5 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[380px] h-[380px] bg-orange-600/5 rounded-full blur-[130px] pointer-events-none"></div>

      <div className="w-full max-w-lg relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center justify-center gap-3 mb-2">
          <img
            src="/KRIORA_LOGO.png"
            alt="Kriora Logo"
            className="w-16 h-16 rounded-full object-cover shadow-xl shadow-orange-500/20 border-2 border-white ring-2 ring-[#FF5A36]/30"
          />
          <div className="text-center">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome to KRIORA</h1>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest mt-1">Complete your enrollment to get started</p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-600 flex gap-2.5 items-center">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* CHOOSE MODE */}
        {mode === 'choose' && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 text-center mb-4">How would you like to enroll?</h2>

            {/* Resume upload */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full p-5 border-2 border-dashed border-slate-200 hover:border-[#FF5A36] rounded-2xl transition-all text-left group disabled:opacity-50"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleResumeUpload}
                className="hidden"
              />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-[#FF5A36] transition-colors">
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 text-[#FF5A36] group-hover:text-white animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6 text-[#FF5A36] group-hover:text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {isUploading ? 'Analyzing Resume...' : 'Upload Resume (PDF)'}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">AI will auto-fill your details</p>
                </div>
              </div>
            </button>

            <div className="text-center text-[10px] text-slate-400 font-mono uppercase tracking-widest">— OR —</div>

            {/* Manual form */}
            <button
              onClick={() => setMode('manual')}
              className="w-full p-5 border-2 border-slate-200 hover:border-[#FF5A36] rounded-2xl transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-[#FF5A36] transition-colors">
                  <User className="w-6 h-6 text-slate-500 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Fill Form Manually</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Enter your details step by step</p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* MANUAL FORM */}
        {mode === 'manual' && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl space-y-5">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-[#FF5A36]" />
                <span>Enrollment Details</span>
              </h2>
              <p className="text-[10px] text-slate-400 mt-1 font-mono uppercase tracking-widest">FILL YOUR INFORMATION BELOW</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="text"
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Your full name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#FF5A36] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Email (readonly) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Email</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">@</span>
                  <Input
                    type="email"
                    value={form.email}
                    readOnly
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Phone Number *</label>
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#FF5A36] focus:border-transparent"
                  required
                />
              </div>

              {/* College Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">College / University Name *</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="text"
                    value={form.collegeName}
                    onChange={(e) => updateField('collegeName', e.target.value)}
                    placeholder="e.g. JNTU Hyderabad"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#FF5A36] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Branch */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Branch / Specialization *</label>
                <Input
                  type="text"
                  value={form.branch}
                  onChange={(e) => updateField('branch', e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#FF5A36] focus:border-transparent"
                  required
                />
              </div>

              {/* Current Year & Pass Out Year */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Current Year *</label>
                  <select
                    value={form.currentYear}
                    onChange={(e) => updateField('currentYear', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#FF5A36] focus:border-transparent appearance-none"
                    required
                  >
                    <option value="">Select</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Graduated">Graduated</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Pass Out Year *</label>
                  <Input
                    type="text"
                    value={form.graduationYear}
                    onChange={(e) => updateField('graduationYear', e.target.value)}
                    placeholder="e.g. 2027"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#FF5A36] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Experience */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Experience Level *</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={form.experience}
                    onChange={(e) => updateField('experience', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#FF5A36] focus:border-transparent appearance-none"
                    required
                  >
                    <option value="">Select level</option>
                    <option value="Beginner">Beginner (0-1 years)</option>
                    <option value="Intermediate">Intermediate (1-3 years)</option>
                    <option value="Advanced">Advanced (3+ years)</option>
                  </select>
                </div>
              </div>

              {/* Learning Goals */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Learning Goals *</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    value={form.learningGoals}
                    onChange={(e) => updateField('learningGoals', e.target.value)}
                    placeholder="What do you want to learn?"
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#FF5A36] focus:border-transparent resize-none"
                    required
                  />
                </div>
              </div>

              {/* Hear About Us */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">How did you hear about us?</label>
                <div className="relative">
                  <Megaphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="text"
                    value={form.hearAboutUs}
                    onChange={(e) => updateField('hearAboutUs', e.target.value)}
                    placeholder="Social media, friend, etc."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#FF5A36] focus:border-transparent"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !form.name.trim() || !form.phone.trim() || !form.collegeName.trim() || !form.branch.trim() || !form.currentYear.trim() || !form.graduationYear.trim() || !form.experience.trim() || !form.learningGoals.trim()}
                className="w-full py-3 bg-[#FF5A36] hover:bg-[#e04523] disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow-md uppercase tracking-wider"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Submit Application</span><ArrowRight className="w-4 h-4" /></>}
              </Button>
            </form>

            <button onClick={() => setMode('choose')} className="w-full text-center text-[10px] text-slate-400 hover:text-[#FF5A36] font-mono uppercase tracking-widest transition-colors">
              ← Back to options
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
