"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { AuthLogin } from "@/components/AuthLogin";
import { ChatMode } from "@/components/ChatMode";
import { SearchMode } from "@/components/SearchMode";
import { Bot, Search, LogOut, Loader2, Menu, X } from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";

export default function Home() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<"chat" | "search">("chat");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#ffffff] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-du-purple)]" />
      </div>
    );
  }

  // Temporarily bypass authentication check
  // if (status === "unauthenticated" || !session) {
  //   return <AuthLogin />;
  // }

  return (
    <div className="flex h-[100dvh] bg-gradient-to-br from-[#fff6fb] via-[#f4f2fc] to-[#e4e8f8] text-[#111111] overflow-hidden relative w-full p-0 md:p-3 lg:p-4 gap-0 md:gap-4">
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <nav className={`fixed md:relative z-50 h-full w-[260px] flex flex-col bg-white/60 backdrop-blur-2xl border-r md:border border-white/80 md:rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] shrink-0 py-4 px-3 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        
        <div className="flex items-center justify-between px-3 py-2 mb-6">
          <div className="w-full">
            <Image
              src="/du-logo.png"
              alt="DU Logo"
              width={340}
              height={84}
              className="w-full h-auto object-contain"
            />
          </div>
          <button 
            className="md:hidden p-1 text-[#888] hover:text-[#111] rounded-md"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <p className="px-3 text-[11px] font-bold text-[#888888] mb-1.5 uppercase tracking-wider">Workspace</p>
          <button 
            onClick={() => {
              setActiveTab("chat");
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-sm font-medium
              ${activeTab === "chat" ? "bg-white/80 shadow-sm text-[var(--color-du-purple)] border border-white/60" : "text-[#555] hover:bg-white/50 hover:text-[#111]"}`}
          >
            <Bot className="w-[18px] h-[18px]" />
            <span>AI Assistant</span>
          </button>

          <button 
            onClick={() => {
              setActiveTab("search");
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-sm font-medium
              ${activeTab === "search" ? "bg-white/80 shadow-sm text-[var(--color-du-purple)] border border-white/60" : "text-[#555] hover:bg-white/50 hover:text-[#111]"}`}
          >
            <Search className="w-[18px] h-[18px]" />
            <span>Explore Roles</span>
          </button>
        </div>
        
        <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-white/40">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl transition-all">
            {session?.user?.image ? (
              <img src={session.user.image} alt={session.user.name || "User"} className="w-[32px] h-[32px] rounded-full shadow-sm" />
            ) : (
              <div className="w-[32px] h-[32px] rounded-full bg-[var(--color-du-gold)] flex flex-shrink-0 items-center justify-center text-xs font-bold text-white shadow-sm">U</div>
            )}
            <div className="overflow-hidden">
              <p className="text-[13px] font-bold tracking-tight truncate leading-tight text-[#111]">{session?.user?.name || "Guest Student"}</p>
              <p className="text-[11px] font-medium text-[#777] truncate w-full leading-tight">{session?.user?.email || "guest@dtu.ac.in"}</p>
            </div>
          </div>
          <button 
            onClick={() => signOut()}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl transition-all text-[13px] font-semibold text-[#666] hover:bg-white/60 hover:text-[#111] hover:shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 h-full relative bg-white/70 backdrop-blur-2xl md:rounded-2xl border-none md:border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex flex-col w-full min-w-0 overflow-hidden">
        
        {/* Mobile Header Bar */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/60 bg-white/40 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-3">
             <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 text-[#555] rounded-xl hover:bg-white/60 shadow-sm border border-white/40"
              >
                <Menu className="w-5 h-5" />
              </button>
             <span className="font-bold tracking-tight text-[16px] text-[#111]">{activeTab === "chat" ? "AI Assistant" : "Explore Roles"}</span>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative">
          {activeTab === "chat" ? <ChatMode /> : <SearchMode />}
        </div>
      </main>
      
    </div>
  );
}
