import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../convex/_generated/api';

import AuthScreen from './components/AuthScreen';
import OnboardingScreen from './components/OnboardingScreen';
import StudentPortal from './components/StudentPortal';
import AdminPortal from './components/AdminPortal';
import TutorDrawer from './components/TutorDrawer';
import type { Student } from './types';
import { Button } from '@/components/ui/button';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

const DEFAULT_ADMIN_EMAILS = [
  'reddysantosh1310@gmail.com',
  'suchandramanne@gmail.com',
];

const ADMIN_EMAILS = Array.from(
  new Set([
    ...DEFAULT_ADMIN_EMAILS,
    ...(
      import.meta.env.VITE_ADMIN_EMAILS ||
      import.meta.env.VITE_ADMIN_EMAIL ||
      ''
    )
      .split(',')
      .map((e: string) => e.trim().toLowerCase())
      .filter(Boolean),
  ])
);

export default function App() {
  const { isLoaded: isAuthLoaded, isSignedIn, signOut } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();

  const isAuthReady = isAuthLoaded && isUserLoaded;

  // --- Determine admin status from Clerk email ---
  const clerkEmail = isAuthReady ? (user?.emailAddresses?.[0]?.emailAddress || '') : '';
  const isAdmin = ADMIN_EMAILS.includes(clerkEmail.trim().toLowerCase());

  // --- Convex Reactive Queries & Mutations ---
  const bindClerkIdentity = useMutation(api.lms.bindClerkIdentity);
  const studentTutorChatAction = useAction(api.lms.studentTutorChat);
  const courseMetadataRes = useQuery(
    api.lms.getCourseMetadata,
    clerkEmail ? { courseId: "python-mastery", actorEmail: clerkEmail } : { courseId: "python-mastery" }
  );
  
  // Student context query (only active if signed in and not admin)
  const studentCtx = useQuery(
    api.lms.getMyStudentContext,
    isAuthReady && isSignedIn && !isAdmin ? { actorEmail: clerkEmail } : "skip"
  );

  // Admin dashboard query (only active if signed in and is admin)
  const adminData = useQuery(
    api.lms.getAdminDashboardData,
    isAuthReady && isSignedIn && isAdmin ? { actorEmail: clerkEmail } : "skip"
  );

  // Bind Clerk identity on first login/mount if signed in
  useEffect(() => {
    if (isAuthReady && isSignedIn) {
      bindClerkIdentity({ actorEmail: clerkEmail }).catch(() => {});
    }
  }, [isAuthReady, isSignedIn, bindClerkIdentity, clerkEmail]);

  // --- AI Tutor Session States ---
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: "Hello! I am your AI Study Companion for Python Mastery. Ask me any Python programming questions — syntax, debugging, data structures, or best practices!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [userInputMessage, setUserInputMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  // --- Handle Logout ---
  const handleLogout = () => {
    setIsTutorOpen(false);
    signOut();
  };

  // --- AI Tutor Interaction Controller (External AI endpoint stays in server.ts) ---
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInputMessage.trim()) return;

    const userText = userInputMessage;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: userText,
      timestamp
    };

    setChatMessages(prev => [...prev, userMsg]);
    setUserInputMessage('');
    setIsAiTyping(true);

    try {
      const dbStudent = studentCtx?.student;
      const systemPrompt = `You are Kriora's student learning assistant. Help the student understand the current course material. Prefer explanation and hints over directly completing graded assessments. Use the provided lesson context as the primary source. Do not invent curriculum content.
The student using the platform is "${dbStudent?.fullName || user?.firstName || 'Student'}".

Your GOALS:
1. Explain Python programming concepts clearly.
2. Explain concepts in simpler language and give hints rather than immediately giving answers.
3. Explain errors in student's Python code and generate small code examples.
4. Help students understand case studies and explain why an answer is wrong.
5. Provide step-by-step guidance while staying focused on the current course.

Your RESTRICTIONS:
1. Do NOT solve active graded case study assessments directly. Provide conceptual hints and syntax explanations instead.
2. Do NOT assist with administrative tasks, user approvals, or course management.`;

      let tutorReply = "";

      // 1. Primary: Direct Convex Cloud Serverless Action
      try {
        const convexRes = await studentTutorChatAction({
          message: userText,
          systemInstruction: systemPrompt,
          history: chatMessages.slice(-6).map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          }))
        });
        if (convexRes?.text) {
          tutorReply = convexRes.text;
        }
      } catch (convexErr) {
        console.warn("[Student Tutor] Convex action fallback to Gateway:", convexErr);
      }

      // 2. Secondary: Backend Gateway API
      if (!tutorReply) {
        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: userText,
              systemInstruction: systemPrompt,
              history: chatMessages.slice(-6).map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text,
              }))
            })
          });

          if (response.ok) {
            const data = await response.json();
            if (data.text) tutorReply = data.text;
          }
        } catch (backendErr) {
          console.warn("[Student Tutor] Backend unreachable, using direct AI fallback:", backendErr);
        }
      }

      // 2. Direct Fallback: Client-side Gemini Call
      if (!tutorReply) {
        const geminiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
        if (!geminiKey) {
          throw new Error("AI tutor temporarily unavailable. Please ensure backend server is running.");
        }
        const contents = [
          ...chatMessages.slice(-6).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }],
          })),
          { role: 'user', parts: [{ text: userText }] },
        ];

        const models = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-3.7-flash"];
        for (const model of models) {
          try {
            const geminiRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents,
                  systemInstruction: { parts: [{ text: systemPrompt }] },
                  generationConfig: { temperature: 0.7 },
                }),
              }
            );
            if (geminiRes.ok) {
              const data = await geminiRes.json();
              const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                tutorReply = text;
                break;
              }
            }
          } catch (e) {
            console.warn(`[Student Tutor] Direct fallback with ${model} failed:`, e);
          }
        }
      }

      if (!tutorReply) {
        throw new Error("Unable to reach AI tutor. Please check your network connection.");
      }

      setChatMessages(prev => [
        ...prev,
        {
          id: 'ai-' + Date.now(),
          sender: 'ai',
          text: tutorReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      setChatMessages(prev => [
        ...prev,
        {
          id: 'ai-err-' + Date.now(),
          sender: 'ai',
          text: err.message || "AI Study Companion is temporarily unavailable. Your code and lesson notes are fully functional.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // --- Loading state until Convex reactive query returns ---
  const isDataLoading = !isAuthReady || !courseMetadataRes || (isSignedIn && !isAdmin && studentCtx === undefined) || (isSignedIn && isAdmin && adminData === undefined);

  if (isDataLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center font-mono text-xs text-slate-500 gap-4">
        <div className="relative flex items-center justify-center">
          <img
            src="/KRIORA_LOGO_2.png"
            alt="Kriora Logo"
            className="w-16 h-16 rounded-full object-cover shadow-lg border-2 border-orange-100 ring-4 ring-orange-500/10"
          />
          <div className="absolute -inset-1.5 rounded-full border-2 border-[#FF5A36] border-t-transparent animate-spin" />
        </div>
        <span className="uppercase tracking-widest text-[11px] font-bold animate-pulse text-slate-700">Connecting to Kriora Serverless Backend...</span>
      </div>
    );
  }

  const courses = courseMetadataRes?.course ? [courseMetadataRes.course] : [];

  // --- GATE 0: NOT SIGNED IN ---
  if (!isSignedIn) {
    return <AuthScreen />;
  }

  // --- GATE 0.5: ADMIN PORTAL VIEW ---
  if (isAdmin && adminData) {
    return (
      <AdminPortal 
        actorEmail={clerkEmail}
        courses={courses as any}
        students={adminData.students as any}
        announcements={adminData.announcements as any}
        auditLogs={adminData.auditLogs as any}
        config={adminData.config as any}
        batches={adminData.batches as any}
        dayAccess={adminData.dayAccess as any}
        testSubmissions={adminData.testSubmissions as any}
        onLogout={handleLogout}
        onRefreshState={() => {}}
      />
    );
  }

  const dbStudent = studentCtx?.student as Student | null;

  // --- GATE 1: NEW STUDENT - NO DB RECORD YET → ONBOARDING ---
  if (isSignedIn && !dbStudent) {
    return (
      <OnboardingScreen 
        actorEmail={clerkEmail}
        clerkEmail={clerkEmail}
        clerkName={user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : ''}
        onLogout={handleLogout}
      />
    );
  }

  // --- GATE 2: PENDING / SUSPENDED STUDENT ---
  if (dbStudent && dbStudent.status !== 'Approved') {
    return (
      <div className="min-h-screen bg-[#F8F9FA] text-slate-800 font-sans flex items-center justify-center p-4 relative overflow-y-auto">
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-pink-100/50 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-indigo-100/50 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6 relative z-10">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div className="flex items-center gap-3.5">
              <img
                src="/KRIORA_LOGO_2.png"
                alt="Kriora Logo"
                className="w-12 h-12 rounded-full object-cover shrink-0 border border-orange-200 shadow-md ring-2 ring-orange-500/20"
              />
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-pink-500 uppercase tracking-widest block font-bold">Identity Gate Evaluation</span>
                <h1 className="text-xl font-extrabold text-slate-900">Enrollment Application Pending</h1>
                <p className="text-xs text-slate-500 font-mono">{dbStudent.fullName} • {dbStudent.email}</p>
              </div>
            </div>

            <div className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold border uppercase tracking-wider ${
              dbStudent.status === 'Pending' ? 'bg-yellow-50 border-yellow-200 text-yellow-700 animate-pulse' :
              dbStudent.status === 'Suspended' ? 'bg-amber-50 border-amber-200 text-amber-700' :
              'bg-red-50 border-red-200 text-red-600'
            }`}>
              Status: {dbStudent.status}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Evaluating Academic Credentials</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Welcome to the Kriora Academy. To preserve learning resources, all registrations undergo administrative vetting. 
              Our team checks your LinkedIn, GitHub, and statement of purpose. You will receive an email upon validation.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Authorization Sequence</span>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[10px] text-emerald-600 font-bold">✓</div>
                <div className="text-xs">
                  <span className="text-slate-900 font-bold block">1. Form Submission Received</span>
                  <span className="text-slate-500 font-mono text-[10px]">{new Date(dbStudent.registeredAt || Date.now()).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[10px] text-emerald-600 font-bold">✓</div>
                <div className="text-xs">
                  <span className="text-slate-900 font-bold block">2. Clerk Identity Verification</span>
                  <span className="text-slate-500 font-mono text-[10px]">Pre-verified email: {dbStudent.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  dbStudent.status === 'Rejected' ? 'bg-red-50 border border-red-200 text-red-600' :
                  dbStudent.status === 'Suspended' ? 'bg-amber-50 border border-amber-200 text-amber-600' :
                  'bg-yellow-50 border border-yellow-200 text-yellow-600'
                }`}>
                  {dbStudent.status === 'Rejected' ? '✗' : dbStudent.status === 'Suspended' ? '!' : '●'}
                </div>
                <div className="text-xs">
                  <span className="text-slate-900 font-bold block">3. Administrative Authority Audit</span>
                  <span className="text-slate-500 font-mono text-[10px]">
                    {dbStudent.status === 'Pending' && 'Evaluating linkedin profile & statement of intent...'}
                    {dbStudent.status === 'Rejected' && 'Application declined. Contact support.'}
                    {dbStudent.status === 'Suspended' && 'Access privileges suspended by administration.'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 text-[9px] uppercase block">College Name</span>
              <span className="text-slate-900 font-bold block">{dbStudent.collegeName || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[9px] uppercase block">University Board</span>
              <span className="text-slate-900 font-bold block">{dbStudent.university || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[9px] uppercase block">LinkedIn Profile</span>
              {dbStudent.linkedinProfile ? (
                <a href={dbStudent.linkedinProfile} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline block truncate font-bold">{dbStudent.linkedinProfile}</a>
              ) : (
                <span className="text-slate-500 block">Not specified</span>
              )}
            </div>
            <div>
              <span className="text-slate-500 text-[9px] uppercase block">GitHub Handle</span>
              {dbStudent.githubProfile ? (
                <a href={dbStudent.githubProfile} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline block truncate font-bold">{dbStudent.githubProfile}</a>
              ) : (
                <span className="text-slate-500 block">Not specified</span>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4 flex-wrap">
            <Button 
              onClick={handleLogout}
              className="py-2 px-4 border border-slate-200 hover:border-red-300 text-slate-600 hover:text-red-600 bg-white text-xs font-bold rounded-lg"
            >
              Sign Out Session
            </Button>
          </div>

        </div>
      </div>
    );
  }

  // --- GATE 3: APPROVED STUDENT PORTAL VIEW ---
  if (dbStudent && studentCtx) {
    return (
      <div className="min-h-screen w-full relative">
        <StudentPortal 
          actorEmail={clerkEmail}
          student={dbStudent}
          courses={courses as any}
          announcements={studentCtx.announcements as any}
          notifications={[]}
          config={studentCtx.config as any}
          batches={studentCtx.batches as any}
          dayAccess={studentCtx.dayAccessGrants as any}
          testSubmissions={studentCtx.submissions as any}
          onLogout={handleLogout}
          onRefreshState={() => {}}
        />

        <Button 
          onClick={() => setIsTutorOpen(true)}
          title="Ask Kriora AI Python Tutor"
          className="fixed bottom-6 right-6 p-4 rounded-full bg-[#FF5A36] hover:bg-orange-600 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-150 z-40 ring-4 ring-orange-500/20"
        >
          <Sparkles className="w-5 h-5 text-white" />
        </Button>

        <TutorDrawer 
          isOpen={isTutorOpen}
          onClose={() => setIsTutorOpen(false)}
          courseTitle={courses[0]?.title || 'Python Mastery'}
          lessonTitle=""
          chatMessages={chatMessages}
          userInputMessage={userInputMessage}
          setUserInputMessage={setUserInputMessage}
          onSendMessage={handleSendMessage}
          isAiTyping={isAiTyping}
        />
      </div>
    );
  }

  return null;
}
