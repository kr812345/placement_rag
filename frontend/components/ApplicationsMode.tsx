"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Send, Mail, Building2, UserCircle, Briefcase, RefreshCw, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";

export function ApplicationsMode() {
  const { data: session } = useSession();
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  
  // Form state
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);

  const fetchApplications = async () => {
    if (!session?.user?.email) return;
    setIsLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${baseUrl}/applications/?user_email=${session.user.email}`, {
        headers: { "ngrok-skip-browser-warning": "true" }
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error("Failed to fetch applications", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableRoles = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${baseUrl}/search/`, {
        headers: { "ngrok-skip-browser-warning": "true" }
      });
      if (res.ok) {
        const data = await res.json();
        setAvailableRoles(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch roles", err);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchAvailableRoles();
  }, [session]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken || !session?.refreshToken) {
      alert("Missing Google API tokens. Please sign out and sign in again to grant permissions.");
      return;
    }
    
    setIsSending(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${baseUrl}/applications/send`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({
          user_id: session.user.email,
          company,
          role,
          to_email: toEmail,
          subject,
          body,
          access_token: session.accessToken,
          refresh_token: session.refreshToken
        })
      });
      
      if (res.ok) {
        alert("Application sent and tracking started!");
        setCompany(""); setRole(""); setToEmail(""); setSubject(""); setBody("");
        fetchApplications();
      } else {
        const err = await res.json();
        alert(`Failed to send: ${err.detail}`);
      }
    } catch (err) {
      console.error("Send error", err);
    } finally {
      setIsSending(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "selected": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "rejected": return <XCircle className="w-4 h-4 text-red-500" />;
      case "interview": return <Briefcase className="w-4 h-4 text-blue-500" />;
      case "online assessment": return <CheckCircle2 className="w-4 h-4 text-purple-500" />;
      case "unclear": return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="h-full w-full flex flex-col md:flex-row overflow-hidden bg-white/40">
      {/* Tracker Sidebar */}
      <div className="w-full md:w-1/3 h-full border-r border-white/60 flex flex-col bg-white/20">
        <div className="p-4 border-b border-white/60 flex justify-between items-center bg-white/40">
          <h2 className="font-bold text-[#111] flex items-center gap-2">
            <Mail className="w-5 h-5 text-[var(--color-du-purple)]" />
            Tracked Applications
          </h2>
          <button onClick={fetchApplications} className="p-1.5 hover:bg-white/60 rounded-lg text-gray-500 transition-colors">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {applications.length === 0 && !isLoading && (
            <p className="text-sm text-gray-500 text-center mt-10">No applications tracked yet.</p>
          )}
          {applications.map(app => (
            <div key={app.id} className="p-3 bg-white/60 border border-white/80 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-sm text-[#111]">{app.company}</h3>
                <div className="flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded-full shadow-sm">
                  {getStatusIcon(app.status)}
                  <span className="text-[10px] font-medium uppercase tracking-wider text-gray-600">{app.status}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 font-medium">{app.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <div className="flex-1 h-full overflow-y-auto p-4 md:p-8">
        <div className="max-w-2xl mx-auto bg-white/60 border border-white/80 rounded-2xl shadow-sm p-6 backdrop-blur-md">
          <h2 className="text-xl font-bold mb-6 text-[#111]">Send New Application</h2>
          <form onSubmit={handleSend} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 uppercase">Company</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input 
                    list="company-list"
                    type="text" 
                    required 
                    value={company} 
                    onChange={e => {
                      setCompany(e.target.value);
                      // Clear role if company changes to something not in the list
                      if (!availableRoles.some(r => r.company === e.target.value)) {
                        setRole("");
                      }
                    }} 
                    className="w-full pl-9 pr-3 py-2 bg-white/80 border border-white shadow-sm rounded-xl text-sm focus:ring-2 focus:ring-[var(--color-du-purple)] outline-none" 
                    placeholder="Select or type..." 
                  />
                  <datalist id="company-list">
                    {Array.from(new Set(
                      availableRoles
                        .filter(r => !role || r.title === role)
                        .map(r => r.company)
                    )).map(c => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 uppercase">Role</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input 
                    list="role-list"
                    type="text" 
                    required 
                    value={role} 
                    onChange={e => {
                      setRole(e.target.value);
                      if (e.target.value && !subject) {
                        setSubject(`Application for ${e.target.value} - ${session?.user?.name || ''}`);
                      }
                    }} 
                    className="w-full pl-9 pr-3 py-2 bg-white/80 border border-white shadow-sm rounded-xl text-sm focus:ring-2 focus:ring-[var(--color-du-purple)] outline-none" 
                    placeholder="Select or type..." 
                  />
                  <datalist id="role-list">
                    {availableRoles
                      .filter(r => !company || r.company === company)
                      .map(r => (
                        <option key={r.id} value={r.title} />
                      ))}
                  </datalist>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase">Recruiter Email</label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input type="email" required value={toEmail} onChange={e => setToEmail(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-white/80 border border-white shadow-sm rounded-xl text-sm focus:ring-2 focus:ring-[var(--color-du-purple)] outline-none" placeholder="hr@company.com" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase">Subject</label>
              <input type="text" required value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-3 py-2 bg-white/80 border border-white shadow-sm rounded-xl text-sm focus:ring-2 focus:ring-[var(--color-du-purple)] outline-none" placeholder="Application for SDE - Your Name" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase">Email Body</label>
              <textarea required value={body} onChange={e => setBody(e.target.value)} rows={6} className="w-full px-3 py-2 bg-white/80 border border-white shadow-sm rounded-xl text-sm focus:ring-2 focus:ring-[var(--color-du-purple)] outline-none resize-none" placeholder="Dear Hiring Manager..." />
            </div>

            <button type="submit" disabled={isSending} className="w-full py-2.5 bg-gradient-to-r from-[var(--color-du-purple)] to-blue-600 hover:opacity-90 text-white font-semibold rounded-xl shadow-md transition-all flex justify-center items-center gap-2">
              {isSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {isSending ? 'Sending & Tracking...' : 'Send Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
