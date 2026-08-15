import React, { useState } from 'react';
import { ArrowRight, User, Loader2, AlertCircle, FileText, Briefcase, GraduationCap, Megaphone, Link2, BookOpen } from 'lucide-react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: clerkName || '',
    email: clerkEmail,
    phone: '',
    collegeName: '',
    university: '',
    branch: '',
    currentYear: '',
    graduationYear: '',
    linkedinProfile: '',
    githubProfile: '',
    preferredCourse: 'python-mastery',
    experience: '',
    learningGoals: '',
    hearAboutUs: '',
  });

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const registerStudent = useMutation(api.lms.registerStudent);

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'A valid email address is required';
    }
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    if (!form.collegeName.trim()) errs.collegeName = 'College name is required';
    if (!form.branch.trim()) errs.branch = 'Branch / department is required';
    if (!form.currentYear.trim()) errs.currentYear = 'Current year is required';
    if (!form.graduationYear.trim()) errs.graduationYear = 'Pass out year is required';
    if (!form.preferredCourse.trim()) errs.preferredCourse = 'Please select a course track';
    if (!form.experience.trim()) errs.experience = 'Experience level is required';
    if (!form.learningGoals.trim()) errs.learningGoals = 'Learning goals are required';

    // LinkedIn Validation (REQUIRED)
    const linkedin = form.linkedinProfile.trim();
    if (!linkedin) {
      errs.linkedinProfile = 'LinkedIn profile URL is required';
    } else if (!/^https?:\/\/(www\.)?linkedin\.com\/.*$/i.test(linkedin)) {
      errs.linkedinProfile = 'Please enter a valid LinkedIn URL (e.g. https://www.linkedin.com/in/username)';
    }

    // GitHub Validation (OPTIONAL - only validate format if entered)
    const github = form.githubProfile.trim();
    if (github && !/^https?:\/\/(www\.)?github\.com\/.*$/i.test(github)) {
      errs.githubProfile = 'Please enter a valid GitHub URL (e.g. https://github.com/username)';
    }

    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setError('Please fill all required fields with valid information.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const result = await registerStudent({
        actorEmail,
        fullName: form.name.trim(),
        email: clerkEmail.trim().toLowerCase(),
        phone: form.phone.trim(),
        collegeName: form.collegeName.trim(),
        university: form.university.trim(),
        degree: '',
        branch: form.branch.trim(),
        currentYear: form.currentYear,
        graduationYear: form.graduationYear.trim(),
        city: '',
        state: '',
        linkedinProfile: form.linkedinProfile.trim(),
        githubProfile: form.githubProfile.trim(),
        skills: '',
        preferredCourse: form.preferredCourse.trim() || 'python-mastery',
        reasonForJoining: [form.experience, form.learningGoals, form.hearAboutUs].filter(Boolean).join(' — '),
      });
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.message || 'Registration failed. Please try again.');
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
            src="/KRIORA_LOGO_2.png"
            alt="Kriora Logo"
            className="w-16 h-16 rounded-full object-cover mx-auto shadow-xl shadow-emerald-500/20 border-2 border-white ring-2 ring-emerald-500/30"
          />
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Application Submitted!</h2>
            <p className="text-sm text-slate-500 mt-2">Your enrollment request is pending admin approval. You will get access once validated.</p>
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

      <div className="w-full max-w-xl relative z-10 space-y-6 my-8">
        {/* Header */}
        <div className="flex flex-col items-center justify-center gap-3 mb-2 text-center">
          <img
            src="/KRIORA_LOGO_2.png"
            alt="Kriora Logo"
            className="w-16 h-16 rounded-full object-cover shadow-xl shadow-orange-500/20 border-2 border-white ring-2 ring-[#FF5A36]/30"
          />
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome to KRIORA</h1>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest mt-1">Student Admissions & Enrollment</p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex gap-2.5 items-center shadow-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* MANUAL FORM */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-[#FF5A36]" />
              <span>Enrollment Details</span>
            </h2>
            <p className="text-[10px] text-slate-400 mt-1 font-mono uppercase tracking-widest">
              Please provide your academic background and profile
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* Course Track Selection (REQUIRED) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <span>Learning Track / Course *</span>
                <span className="text-red-500 font-bold">*</span>
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={form.preferredCourse}
                  onChange={(e) => updateField('preferredCourse', e.target.value)}
                  className={`w-full bg-slate-50 border ${fieldErrors.preferredCourse ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'} rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#FF5A36] focus:border-transparent font-medium`}
                  required
                >
                  <option value="python-mastery">Python Mastery (40-Day Curriculum & Daily Labs)</option>
                </select>
              </div>
              {fieldErrors.preferredCourse && <p className="text-[10px] text-red-500 font-medium">{fieldErrors.preferredCourse}</p>}
            </div>

            {/* Name (REQUIRED) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">
                Full Name <span className="text-red-500 font-bold">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Your full legal name"
                  className={`w-full bg-slate-50 border ${fieldErrors.name ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'} rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#FF5A36] focus:border-transparent`}
                  required
                />
              </div>
              {fieldErrors.name && <p className="text-[10px] text-red-500 font-medium">{fieldErrors.name}</p>}
            </div>

            {/* Email (REQUIRED - Pre-filled from Clerk) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">
                Email Address <span className="text-red-500 font-bold">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">@</span>
                <Input
                  type="email"
                  value={form.email}
                  readOnly
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-600 cursor-not-allowed font-mono"
                />
              </div>
            </div>

            {/* Phone (REQUIRED) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">
                Phone Number <span className="text-red-500 font-bold">*</span>
              </label>
              <Input
                type="tel"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+91 98765 43210"
                className={`w-full bg-slate-50 border ${fieldErrors.phone ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'} rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#FF5A36] focus:border-transparent`}
                required
              />
              {fieldErrors.phone && <p className="text-[10px] text-red-500 font-medium">{fieldErrors.phone}</p>}
            </div>

            {/* LinkedIn Profile (REQUIRED) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>LinkedIn Profile URL <span className="text-red-500 font-bold">*</span></span>
                <span className="text-[9px] text-[#FF5A36] font-mono font-bold uppercase">Required</span>
              </label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="url"
                  value={form.linkedinProfile}
                  onChange={(e) => updateField('linkedinProfile', e.target.value)}
                  placeholder="https://www.linkedin.com/in/yourprofile"
                  className={`w-full bg-slate-50 border ${fieldErrors.linkedinProfile ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'} rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#FF5A36] focus:border-transparent`}
                  required
                />
              </div>
              {fieldErrors.linkedinProfile && <p className="text-[10px] text-red-500 font-medium">{fieldErrors.linkedinProfile}</p>}
            </div>

            {/* GitHub Profile (OPTIONAL) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>GitHub Profile URL</span>
                <span className="text-[9px] text-slate-400 font-mono uppercase">Optional</span>
              </label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="url"
                  value={form.githubProfile}
                  onChange={(e) => updateField('githubProfile', e.target.value)}
                  placeholder="https://github.com/yourusername"
                  className={`w-full bg-slate-50 border ${fieldErrors.githubProfile ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'} rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#FF5A36] focus:border-transparent`}
                />
              </div>
              {fieldErrors.githubProfile && <p className="text-[10px] text-red-500 font-medium">{fieldErrors.githubProfile}</p>}
            </div>

            {/* College Name (REQUIRED) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">
                College / Institute Name <span className="text-red-500 font-bold">*</span>
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  value={form.collegeName}
                  onChange={(e) => updateField('collegeName', e.target.value)}
                  placeholder="e.g. JNTU Hyderabad"
                  className={`w-full bg-slate-50 border ${fieldErrors.collegeName ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'} rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#FF5A36] focus:border-transparent`}
                  required
                />
              </div>
              {fieldErrors.collegeName && <p className="text-[10px] text-red-500 font-medium">{fieldErrors.collegeName}</p>}
            </div>

            {/* Branch (REQUIRED) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">
                Branch / Department <span className="text-red-500 font-bold">*</span>
              </label>
              <Input
                type="text"
                value={form.branch}
                onChange={(e) => updateField('branch', e.target.value)}
                placeholder="e.g. Computer Science and Engineering"
                className={`w-full bg-slate-50 border ${fieldErrors.branch ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'} rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#FF5A36] focus:border-transparent`}
                required
              />
              {fieldErrors.branch && <p className="text-[10px] text-red-500 font-medium">{fieldErrors.branch}</p>}
            </div>

            {/* Current Year & Pass Out Year (REQUIRED) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">
                  Current Year <span className="text-red-500 font-bold">*</span>
                </label>
                <select
                  value={form.currentYear}
                  onChange={(e) => updateField('currentYear', e.target.value)}
                  className={`w-full bg-slate-50 border ${fieldErrors.currentYear ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'} rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#FF5A36] focus:border-transparent`}
                  required
                >
                  <option value="">Select current year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Graduated">Graduated</option>
                </select>
                {fieldErrors.currentYear && <p className="text-[10px] text-red-500 font-medium">{fieldErrors.currentYear}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">
                  Pass Out Year <span className="text-red-500 font-bold">*</span>
                </label>
                <Input
                  type="text"
                  value={form.graduationYear}
                  onChange={(e) => updateField('graduationYear', e.target.value)}
                  placeholder="e.g. 2026"
                  className={`w-full bg-slate-50 border ${fieldErrors.graduationYear ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'} rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#FF5A36] focus:border-transparent`}
                  required
                />
                {fieldErrors.graduationYear && <p className="text-[10px] text-red-500 font-medium">{fieldErrors.graduationYear}</p>}
              </div>
            </div>

            {/* Experience Level (REQUIRED) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">
                Programming Experience <span className="text-red-500 font-bold">*</span>
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={form.experience}
                  onChange={(e) => updateField('experience', e.target.value)}
                  className={`w-full bg-slate-50 border ${fieldErrors.experience ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'} rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#FF5A36] focus:border-transparent`}
                  required
                >
                  <option value="">Select experience level</option>
                  <option value="Beginner">Beginner (Little to no Python experience)</option>
                  <option value="Intermediate">Intermediate (Basic syntax & loops understood)</option>
                  <option value="Advanced">Advanced (OOP, algorithms, and projects built)</option>
                </select>
              </div>
              {fieldErrors.experience && <p className="text-[10px] text-red-500 font-medium">{fieldErrors.experience}</p>}
            </div>

            {/* Learning Goals (REQUIRED) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">
                Learning Goals & Statement <span className="text-red-500 font-bold">*</span>
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <textarea
                  value={form.learningGoals}
                  onChange={(e) => updateField('learningGoals', e.target.value)}
                  placeholder="What are your goals for mastering Python in this course?"
                  rows={3}
                  className={`w-full bg-slate-50 border ${fieldErrors.learningGoals ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'} rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#FF5A36] focus:border-transparent resize-none`}
                  required
                />
              </div>
              {fieldErrors.learningGoals && <p className="text-[10px] text-red-500 font-medium">{fieldErrors.learningGoals}</p>}
            </div>

            {/* Hear About Us (OPTIONAL) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>How did you hear about us?</span>
                <span className="text-[9px] text-slate-400 font-mono uppercase">Optional</span>
              </label>
              <div className="relative">
                <Megaphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  value={form.hearAboutUs}
                  onChange={(e) => updateField('hearAboutUs', e.target.value)}
                  placeholder="e.g. College campus, LinkedIn, Friend"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#FF5A36] focus:border-transparent"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#FF5A36] hover:bg-[#e04523] disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow-md uppercase tracking-wider transition-all"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Application...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>Submit Enrollment Application</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={onLogout}
            className="text-xs text-slate-400 hover:text-red-500 font-mono underline transition-colors"
          >
            Sign out of session
          </button>
        </div>
      </div>
    </div>
  );
}
