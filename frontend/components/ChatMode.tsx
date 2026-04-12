import { useState } from "react";
import { Send, Bot, Sparkles, Building, Briefcase, Loader2, X, Banknote, GraduationCap, Code2, ClipboardList, CheckCircle2, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import Image from "next/image";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const DEFAULT_CARDS = [
  { id: 1, role_id: "amazon_software_development_engineer_sde_intern_internship", company: "Amazon", role: "SDE Intern", package: "1.2L/month", type: "Internship", accent: "from-[#FF9900]/20 to-[#FF9900]/5", letter_bg: "bg-[#FF9900]/10 text-[#b86e00]" },
  { id: 2, role_id: "flipkart_sde_1_full_time", company: "Flipkart", role: "SDE 1", package: "32 LPA", type: "Full-Time", accent: "from-[#2874F0]/20 to-[#2874F0]/5", letter_bg: "bg-[#2874F0]/10 text-[#1a55b8]" },
  { id: 3, role_id: "tata_consultancy_services_tcs_ninja_digital_profile_full_time", company: "TCS", role: "Digital/Ninja", package: "7 LPA / 3.36 LPA", type: "Full-Time", accent: "from-[#5c2079]/20 to-[#5c2079]/5", letter_bg: "bg-[#5c2079]/10 text-[#5c2079]" },
];

export function ChatMode() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [packageFilter, setPackageFilter] = useState("Any");
  const [isLoading, setIsLoading] = useState(false);

  // Detail modal state
  const [selectedRole, setSelectedRole] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const handleCardClick = async (roleId: string) => {
    setIsModalOpen(true);
    setIsModalLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/search/${roleId}`);
      if (res.ok) setSelectedRole(await res.json());
      else setSelectedRole(null);
    } catch { setSelectedRole(null); }
    finally { setIsModalLoading(false); }
  };

  const suggestedPrompts = [
    "SDE (8+ LPA)",
    "Data Science Intern",
    "Dream Companies",
    "Non-DSA roles",
  ];

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    let filterContext = "";
    if (packageFilter !== "Any") {
      filterContext = ` [Filter applied: ${packageFilter} Package]`;
    }

    const queryText = input + filterContext;
    const newUserMsg: Message = { id: Date.now().toString(), role: "user", content: queryText };
    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/ask/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryText })
      });
      
      const data = await res.json();
      
      const responseMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer || "I'm sorry, I couldn't generate a response.",
      };
      setMessages((prev) => [...prev, responseMsg]);
    } catch (error) {
       const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Error: Could not connect to the backend API. Please ensure the server is running on port 8000.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };


  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="flex flex-col h-full bg-transparent relative">
      
      {/* Messages / Welcome Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-12 md:px-24 pt-12 pb-44">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-start h-full pt-10 text-center pb-20 max-w-4xl mx-auto">
            
            <h1 className="text-[26px] md:text-[34px] font-bold tracking-tight text-[#111111] mb-8">
              Find your ideal placement role
            </h1>

            {/* Default Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              {DEFAULT_CARDS.map((card) => (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card.role_id)}
                  className={`p-5 rounded-2xl bg-gradient-to-br ${card.accent} border border-white/70 backdrop-blur-sm flex flex-col text-left hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer`}
                >
                  <div className={`w-10 h-10 rounded-xl ${card.letter_bg} flex items-center justify-center text-[15px] font-extrabold mb-4`}>
                    {card.company[0]}
                  </div>
                  <h3 className="font-semibold text-[15px] text-[#111111] leading-tight">{card.company} – {card.role}</h3>
                  <div className="mt-3 space-y-1.5">
                    <p className="text-[13px] text-[#737373] flex items-center gap-2">
                      <Briefcase className="w-[14px] h-[14px]" /> {card.type}
                    </p>
                    <p className="text-[13px] font-medium text-[var(--color-du-gold)] flex items-center gap-2">
                      <Building className="w-[14px] h-[14px]" /> {card.package}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-8">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded shrink-0 flex items-center justify-center border border-[var(--color-du-purple)] bg-[#fafafa] mt-1 shadow-sm text-[var(--color-du-purple)]">
                      <Sparkles className="w-[16px] h-[16px]" />
                    </div>
                  )}
                  <div className={`max-w-[85%] text-[15px] leading-[1.6] ${
                    msg.role === "user" 
                      ? "bg-[#f4f4f5] text-[#111111] px-5 py-3 rounded-3xl" 
                      : "text-[#111111] pt-1"
                  }`}>
                    <div className="prose prose-sm max-w-none prose-p:leading-[1.6] prose-pre:bg-[#f4f4f5] prose-pre:text-[#111] prose-strong:text-[#111] prose-li:my-0.5">
                      <ReactMarkdown>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4 justify-start"
                >
                  <div className="w-8 h-8 rounded shrink-0 flex items-center justify-center border border-[var(--color-du-purple)] bg-[#fafafa] mt-1 shadow-sm text-[var(--color-du-purple)]">
                    <Loader2 className="w-[16px] h-[16px] animate-spin" />
                  </div>
                  <div className="max-w-[85%] text-[15px] text-[#111111] pt-2.5">
                     <span className="flex items-center gap-1 opacity-70">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#111] animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#111] animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#111] animate-bounce" style={{ animationDelay: '300ms' }} />
                     </span>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 inset-x-0 p-4 md:p-8 bg-gradient-to-t from-white via-white/80 to-transparent pt-12 md:rounded-b-2xl">
        <div className="max-w-3xl mx-auto w-full relative">
          
          <div className="relative flex flex-col bg-white/70 backdrop-blur-2xl border border-white/60 rounded-[24px] shadow-[0_8px_40px_rgba(92,32,121,0.12),0_2px_12px_rgba(0,0,0,0.06)] focus-within:shadow-[0_12px_48px_rgba(92,32,121,0.18),0_2px_12px_rgba(0,0,0,0.08)] focus-within:border-[var(--color-du-purple-light)] transition-all mx-auto overflow-hidden">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="e.g. SDE roles >10 LPA, DSA based companies"
              className="w-full bg-transparent border-none pt-4 pb-14 px-5 focus:outline-none text-[15px] text-[#111111] placeholder:text-[#a3a3a3] resize-none h-[110px]"
            />
            
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <button 
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2 rounded-full bg-[var(--color-du-purple)] text-white disabled:opacity-30 disabled:bg-[#f0f0f0] disabled:text-[#a3a3a3] transition-colors"
              >
                <Send className="w-[18px] h-[18px]" />
              </button>
            </div>
            
            {/* Minimal Package Filter */}
            <div className="absolute bottom-3 left-4 flex items-center gap-2">
              <select
                value={packageFilter}
                onChange={(e) => setPackageFilter(e.target.value)}
                className="text-[13px] bg-[#fdfdfd] border border-[#e0e0e0] text-[#555] rounded-lg px-2.5 py-1.5 outline-none focus:border-[var(--color-du-purple-light)] transition-colors appearance-none cursor-pointer"
              >
                <option value="Any">Any Package</option>
                <option value="internship">Internship Only</option>
                <option value="5+ LPA">5+ LPA</option>
                <option value="10+ LPA">10+ LPA</option>
                <option value="20+ LPA">20+ LPA</option>
              </select>
            </div>
          </div>
          
          {/* Quick Suggestion Chips — below input with clear separation */}
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {suggestedPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handlePromptClick(p)}
                  className="text-[12px] px-3 py-1 rounded-full text-[#555] border border-white/80 bg-white/70 backdrop-blur-sm hover:bg-white hover:text-[var(--color-du-purple)] hover:border-[var(--color-du-purple-light)] shadow-sm transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          )}
          
        </div>
      </div>
      
      {/* Role Detail Popup Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 md:pb-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white/95 backdrop-blur-3xl rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.1)] border border-white flex flex-col max-h-[85vh] overflow-hidden"
            >
              {isModalLoading ? (
                <div className="flex flex-col items-center justify-center p-20">
                  <Loader2 className="w-8 h-8 text-[var(--color-du-purple)] animate-spin" />
                  <p className="mt-4 text-[#777] text-[14px]">Fetching role details...</p>
                </div>
              ) : selectedRole ? (
                <>
                  <div className="flex justify-between items-start p-6 md:p-8 border-b border-[#ececec] shrink-0 bg-white">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-[14px] bg-[#fafafa] border border-[#f0f0f0] flex items-center justify-center text-[20px] font-bold text-[var(--color-du-purple)] shadow-sm shrink-0">
                        {selectedRole.company?.name?.[0]}
                      </div>
                      <div>
                        <h2 className="text-[18px] md:text-[20px] font-bold text-[#111] leading-tight mb-1 pr-4">{selectedRole.role?.title}</h2>
                        <p className="text-[14px] text-[#555]">{selectedRole.company?.name}</p>
                      </div>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 bg-[#f4f4f5] hover:bg-[#eaeaea] rounded-full text-[#555] transition-colors shrink-0">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-[#fafbfc]">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-white p-4 rounded-xl border border-[#ececec] shadow-sm">
                        <Briefcase className="w-5 h-5 text-[#888] mb-2" />
                        <p className="text-[11px] font-bold text-[#888] uppercase tracking-wider mb-0.5">Role Type</p>
                        <p className="text-[14px] font-semibold text-[#111]">{selectedRole.role?.type}</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-[#ececec] shadow-sm">
                        <MapPin className="w-5 h-5 text-[#888] mb-2" />
                        <p className="text-[11px] font-bold text-[#888] uppercase tracking-wider mb-0.5">Location</p>
                        <p className="text-[14px] font-semibold text-[#111] truncate">{selectedRole.role?.location?.[0]}</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-[#ececec] shadow-sm">
                        <Banknote className="w-5 h-5 text-[#888] mb-2" />
                        <p className="text-[11px] font-bold text-[#888] uppercase tracking-wider mb-0.5">Salary</p>
                        <p className="text-[14px] font-semibold text-[#111]">
                          {selectedRole.salary?.min ? `${(selectedRole.salary.min/100000).toFixed(1)}L–${(selectedRole.salary.max/100000).toFixed(1)}L` : "N/A"}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-[#ececec] shadow-sm">
                        <CheckCircle2 className="w-5 h-5 text-[#888] mb-2" />
                        <p className="text-[11px] font-bold text-[#888] uppercase tracking-wider mb-0.5">Difficulty</p>
                        <p className="text-[14px] font-semibold text-[#111]">{selectedRole.difficulty}</p>
                      </div>
                    </div>
                    {selectedRole.eligibility && (
                      <div className="bg-white p-5 rounded-2xl border border-[#ececec]">
                        <h3 className="flex items-center gap-2 font-bold text-[16px] text-[#111] mb-4 pb-2 border-b border-[#f4f4f5]">
                          <GraduationCap className="w-5 h-5 text-[var(--color-du-purple)]" /> Eligibility
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><p className="text-[11px] font-bold text-[#888] uppercase tracking-wider mb-1">Degrees</p><p className="text-[14px] text-[#222] font-medium">{selectedRole.eligibility.degrees?.join(", ")}</p></div>
                          <div><p className="text-[11px] font-bold text-[#888] uppercase tracking-wider mb-1">Year</p><p className="text-[14px] text-[#222] font-medium">{selectedRole.eligibility.year?.join(", ")}</p></div>
                          <div className="md:col-span-2"><p className="text-[11px] font-bold text-[#888] uppercase tracking-wider mb-1">Branches</p><p className="text-[14px] text-[#222] font-medium">{selectedRole.eligibility.branches?.join(", ")}</p></div>
                        </div>
                      </div>
                    )}
                    {selectedRole.skills?.must_have?.length > 0 && (
                      <div>
                        <h3 className="flex items-center gap-2 font-bold text-[16px] text-[#111] mb-3">
                          <Code2 className="w-5 h-5 text-[var(--color-du-gold)]" /> Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedRole.skills.must_have.map((s: string, i: number) => <span key={i} className="bg-white border border-[#dcdcdc] shadow-sm px-3 py-1.5 rounded-lg text-[13px] font-semibold text-[#111]">{s}</span>)}
                          {selectedRole.skills.good_to_have?.map((s: string, i: number) => <span key={i} className="bg-[#f0f0f0] px-3 py-1.5 rounded-lg text-[13px] font-medium text-[#555]">+ {s}</span>)}
                        </div>
                      </div>
                    )}
                    {selectedRole.selection_process?.length > 0 && (
                      <div>
                        <h3 className="flex items-center gap-2 font-bold text-[16px] text-[#111] mb-4">
                          <ClipboardList className="w-5 h-5 text-[var(--color-du-purple)]" /> Selection Process
                        </h3>
                        <div className="space-y-3">
                          {selectedRole.selection_process.map((step: string, i: number) => (
                            <div key={i} className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-[var(--color-du-purple)] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
                              <div className="bg-white p-3 rounded-xl border border-[#ececec] shadow-sm flex-1">
                                <p className="text-[14px] font-medium text-[#222]">{step}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-20 text-[#777]">
                  <X className="w-8 h-8 mb-2 text-[#ccc]" />
                  <p>Failed to load role details.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
