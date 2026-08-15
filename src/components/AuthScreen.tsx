import React, { useState } from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { BookOpen } from 'lucide-react';

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F4F6F8] text-slate-800 px-4 py-12 relative overflow-y-auto font-sans">
      <div id="clerk-captcha"></div>
      <div className="absolute top-1/4 left-1/4 w-[380px] h-[380px] bg-[#FF5A36]/5 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[380px] h-[380px] bg-orange-600/5 rounded-full blur-[130px] pointer-events-none"></div>

      <div className="w-full max-w-2xl relative z-10 flex flex-col gap-6">
        {/* Brand */}
        <div className="flex flex-col items-center justify-center gap-3.5 mb-2">
          <img
            src="/KRIORA_LOGO_2.png"
            alt="Kriora Logo"
            className="w-16 h-16 rounded-full object-cover shadow-xl shadow-orange-500/20 border-2 border-white ring-2 ring-[#FF5A36]/30"
          />
          <div className="text-center">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              KRIORA <span className="text-[#FF5A36]">LMS</span>
            </h1>
            <p className="text-[10px] text-[#FF5A36] font-mono tracking-widest font-black uppercase mt-1">
              Professional Cloud & AI Academy
            </p>
          </div>
        </div>

        {/* Clerk UI */}
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xl overflow-hidden">
          {isSignUp ? (
            <SignUp
              routing="hash"
              signInUrl="/"
              afterSignUpUrl="/"
            />
          ) : (
            <SignIn
              routing="hash"
              signUpUrl="/"
              afterSignInUrl="/"
            />
          )}
        </div>

        {/* Toggle link */}
        <p className="text-center text-xs text-slate-500">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[#FF5A36] font-bold hover:underline"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}
