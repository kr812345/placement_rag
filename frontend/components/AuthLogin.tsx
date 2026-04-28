import { signIn } from "next-auth/react";
import Image from "next/image";

export function AuthLogin() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-white">
      {/* Dual Shade Background Split */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* The "Dual Shade" - Light Grey/Purple split */}
        <div className="absolute inset-0 bg-[#fdfdff]" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-purple-50/50 skew-x-[-12deg] origin-top translate-x-20" />
      </div>

      {/* Abstract Tech Graphic */}
      <div className="absolute inset-0 z-0 opacity-[0.6] pointer-events-none">
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 1000 1000" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover"
        >
          <g fill="none" stroke="currentColor" strokeWidth="0.5" className="text-purple-200">
            <circle cx="900" cy="100" r="200" />
            <circle cx="100" cy="900" r="300" />
            <path d="M0,500 Q250,400 500,500 T1000,500" strokeWidth="2" opacity="0.3" />
          </g>
        </svg>
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-[440px]">
        {/* Soft glow for the card */}
        <div className="absolute -inset-4 bg-purple-100/40 blur-3xl rounded-full" />
        
        <div className="relative bg-white border border-gray-100 rounded-[2.5rem] p-12 shadow-[0_40px_80px_-16px_rgba(0,0,0,0.06)] space-y-10">
          {/* Logo Section */}
          <div className="flex flex-col items-center space-y-6">
            <div className="relative group">
              <div className="absolute -inset-2 bg-purple-100 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-24 h-24 p-3 bg-white rounded-2xl shadow-sm border border-gray-50">
                <Image 
                  src="/du_logo.svg" 
                  alt="University of Delhi" 
                  width={80} 
                  height={80} 
                  className="object-contain"
                />
              </div>
            </div>
            
            <div className="text-center">
              <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2">
                Placement<span className="text-purple-600 italic">RAG</span>
              </h1>
              <div className="flex items-center justify-center gap-2">
                <span className="h-px w-4 bg-purple-200" />
                <p className="text-[10px] font-black text-purple-900/40 uppercase tracking-[0.4em]">
                  Faculty of Technology
                </p>
                <span className="h-px w-4 bg-purple-200" />
              </div>
            </div>
          </div>

          <div className="space-y-4 text-center px-2">
            <p className="text-gray-500 text-sm leading-relaxed font-medium">
              Empowering University of Delhi students with AI-driven placement tracking and career guidance.
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={() => signIn("google")}
            className="group relative w-full flex items-center justify-center gap-4 bg-gray-900 text-white font-bold py-5 px-8 rounded-2xl transition-all duration-300 hover:bg-black active:scale-[0.98] shadow-2xl hover:shadow-purple-200"
          >
            <svg className="w-5 h-5 bg-white p-0.5 rounded-sm" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="tracking-tight">Sign in with Google</span>
          </button>

          <div className="flex flex-col items-center pt-2">
            <p className="text-[9px] text-gray-300 font-bold uppercase tracking-widest">
              Secure Entrance &bull; 2026
            </p>
          </div>
        </div>

        {/* Brand Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-300 text-[11px] font-black uppercase tracking-[0.5em] opacity-50">
            University of Delhi
          </p>
        </div>
      </div>
    </div>
  );
}
