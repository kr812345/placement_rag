import { useState, useEffect } from "react";
import { Search, MapPin, Briefcase, Filter, Loader2, X, Banknote, GraduationCap, Code2, ClipboardList, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Role = {
  id: string;
  title: string;
  company: string;
  type: string;
  location: string;
  match: string;
};

export function SearchMode() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal detailed states
  const [selectedRole, setSelectedRole] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const handleRoleClick = async (roleId: string) => {
    setIsModalOpen(true);
    setIsModalLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${baseUrl}/search/${roleId}`, {
        headers: { "ngrok-skip-browser-warning": "true" }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedRole(data);
      } else {
        setSelectedRole(null);
      }
    } catch (e) {
      console.error(e);
      setSelectedRole(null);
    } finally {
      setIsModalLoading(false);
    }
  };


  const filters = ["All", "Internship", "Full-Time", "Remote"];

  // Fetch roles with a 300ms debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      const fetchRoles = async () => {
        setIsLoading(true);
        try {
          // If query is empty, it will drop the query parameter appropriately on backend
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
          const url = query.trim() 
            ? `${baseUrl}/search/?query=${encodeURIComponent(query)}`
            : `${baseUrl}/search/`;
            
          const res = await fetch(url, {
            headers: { "ngrok-skip-browser-warning": "true" }
          });
          const data = await res.json();
          setRoles(data || []);
        } catch (error) {
          console.error("Error fetching roles:", error);
          setRoles([]); // fail safe
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchRoles();
    }, 300);
    
    return () => clearTimeout(handler);
  }, [query]);

  // Apply tab filter on top of vector-fetched roles
  const filteredRoles = roles.filter(role => {
    return activeFilter === "All" || 
          (activeFilter === "Remote" ? role.location === "Remote" : role.type === activeFilter);
  });

  return (
    <div className="flex flex-col h-full bg-transparent relative">
      
      {/* Header & Search */}
      <div className="px-6 md:px-12 py-8 border-b border-white/50 shrink-0 space-y-5 z-10 sticky top-0 bg-white/40 backdrop-blur-2xl shadow-[0_4px_20px_rgba(0,0,0,0.01)] rounded-t-2xl">
        <div>
          <h2 className="text-[22px] font-bold text-[#111111] tracking-tight">Explore Opportunities</h2>
          <p className="text-[14px] text-[#777777] mt-1">Browse roles curated for your profile.</p>
        </div>

        <div className="flex gap-3 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#a3a3a3]" />
            <input 
              type="text" 
              placeholder="Search roles, companies, or skills..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white/60 border border-white/80 shadow-sm rounded-[12px] py-2.5 pl-[42px] pr-4 focus:outline-none focus:bg-white/90 focus:border-[var(--color-du-purple-light)] transition-all text-[14px] text-[#111111]"
            />
          </div>
          <button className="p-2.5 bg-[#f4f4f5] rounded-[12px] hover:bg-[#e5e5e5] text-[#111] transition-all flex items-center justify-center w-11 h-11 shrink-0 md:hidden">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar max-w-2xl">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all border shadow-sm ${
                activeFilter === f 
                  ? "bg-[var(--color-du-purple)] text-white border-[var(--color-du-purple)] shadow-md" 
                  : "bg-white/70 border-white/80 text-[#555] hover:text-[#111] hover:bg-white/90"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto p-6 md:p-12 pb-32 bg-transparent z-0 relative">
        <AnimatePresence>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="w-8 h-8 text-[var(--color-du-purple)] animate-spin" />
              <p className="text-[14px] text-[#777] font-medium animate-pulse">Scanning role vectors...</p>
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="text-center py-32">
              <div className="w-16 h-16 bg-[#fafafa] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#eee]">
                <Search className="w-6 h-6 text-[#a3a3a3]" />
              </div>
              <p className="text-[15px] font-semibold text-[#111]">No matches found</p>
              <p className="text-[13px] text-[#737373] mt-1">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 max-w-7xl">
              {filteredRoles.map(role => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  key={role.id}
                  onClick={() => handleRoleClick(role.id)}
                  className="bg-white/60 backdrop-blur-lg border border-white/70 rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:border-white transition-all cursor-pointer group flex flex-col relative"
                >
                  <div className="flex justify-between items-start mb-5">
                    <div className="w-12 h-12 rounded-[12px] bg-white border border-white/80 flex items-center justify-center text-[18px] font-bold text-[var(--color-du-purple)] shadow-sm">
                      {role.company[0]}
                    </div>
                    <span className="text-[11px] font-bold bg-[#fcfcfc] text-[var(--color-du-gold)] tracking-wider px-2.5 py-1 rounded border border-[#ececec]">
                      {role.match} MATCH
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-[16px] leading-snug text-[#111111] group-hover:text-[var(--color-du-purple)] transition-colors line-clamp-2">
                    {role.title}
                  </h3>
                  <p className="text-[14px] text-[#737373] mb-5 mt-1">{role.company}</p>
                  
                  <div className="mt-auto space-y-2">
                    <div className="flex items-center text-[13px] text-[#737373] gap-2.5">
                      <Briefcase className="w-[15px] h-[15px] text-[#a3a3a3]" /> {role.type}
                    </div>
                    <div className="flex items-center text-[13px] text-[#737373] gap-2.5">
                      <MapPin className="w-[15px] h-[15px] text-[#a3a3a3]" /> {role.location}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Role Details Center Popup Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 md:pb-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#000000]/40 backdrop-blur-sm"
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
                  {/* Modal Header */}
                  <div className="flex justify-between items-start p-6 md:p-8 border-b border-[#ececec] shrink-0 bg-white">
                    <div className="flex gap-4 md:gap-5 items-center">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-[14px] bg-[#fafafa] border border-[#f0f0f0] flex items-center justify-center text-[20px] md:text-[22px] font-bold text-[var(--color-du-purple)] shadow-sm shrink-0">
                        {selectedRole.company?.name?.[0] || selectedRole.role?.title?.[0]}
                      </div>
                      <div>
                        <h2 className="text-[18px] md:text-[20px] font-bold text-[#111] leading-tight mb-1 pr-4">{selectedRole.role?.title}</h2>
                        <p className="text-[14px] md:text-[15px] text-[#555]">{selectedRole.company?.name}</p>
                      </div>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 bg-[#f4f4f5] hover:bg-[#eaeaea] rounded-full text-[#555] transition-colors shrink-0">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Modal Body */}
                  <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-[#fafbfc]">
                    
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                      <div className="bg-[#ffffff] p-4 rounded-xl border border-[#ececec] shadow-sm">
                        <Briefcase className="w-5 h-5 text-[#888] mb-2" />
                        <p className="text-[11px] font-bold text-[#888] uppercase tracking-wider mb-0.5">Role Type</p>
                        <p className="text-[14px] font-semibold text-[#111]">{selectedRole.role?.type || "Full-Time"}</p>
                      </div>
                      <div className="bg-[#ffffff] p-4 rounded-xl border border-[#ececec] shadow-sm">
                        <MapPin className="w-5 h-5 text-[#888] mb-2" />
                        <p className="text-[11px] font-bold text-[#888] uppercase tracking-wider mb-0.5">Location</p>
                        <p className="text-[14px] font-semibold text-[#111] truncate">{selectedRole.role?.location?.[0] || "Remote"}</p>
                      </div>
                      <div className="bg-[#ffffff] p-4 rounded-xl border border-[#ececec] shadow-sm">
                        <Banknote className="w-5 h-5 text-[#888] mb-2" />
                        <p className="text-[11px] font-bold text-[#888] uppercase tracking-wider mb-0.5">Salary Range</p>
                        <p className="text-[14px] font-semibold text-[#111]">
                          {selectedRole.salary?.min ? `${(selectedRole.salary.min/100000).toFixed(1)}L - ${(selectedRole.salary.max/100000).toFixed(1)}L` : "Disclosed later"}
                        </p>
                      </div>
                      <div className="bg-[#ffffff] p-4 rounded-xl border border-[#ececec] shadow-sm">
                        <CheckCircle2 className="w-5 h-5 text-[#888] mb-2" />
                        <p className="text-[11px] font-bold text-[#888] uppercase tracking-wider mb-0.5">Difficulty</p>
                        <p className="text-[14px] font-semibold text-[#111]">{selectedRole.difficulty || "Medium"}</p>
                      </div>
                    </div>

                    {/* Eligibility Section */}
                    {selectedRole.eligibility && (
                      <div className="bg-white p-5 rounded-2xl border border-[#ececec] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                        <h3 className="flex items-center gap-2 font-bold text-[16px] text-[#111] mb-4 pb-2 border-b border-[#f4f4f5]">
                          <GraduationCap className="w-5 h-5 text-[var(--color-du-purple)]" /> 
                          Eligibility Criteria
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                          <div>
                            <p className="text-[12px] font-bold text-[#888] uppercase tracking-wider mb-1">Target Degrees</p>
                            <p className="text-[14.5px] text-[#222] font-medium">{selectedRole.eligibility.degrees?.join(", ") || "Any"}</p>
                          </div>
                          <div>
                            <p className="text-[12px] font-bold text-[#888] uppercase tracking-wider mb-1">Target Year</p>
                            <p className="text-[14.5px] text-[#222] font-medium">{selectedRole.eligibility.year?.join(", ") || "Any"}</p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-[12px] font-bold text-[#888] uppercase tracking-wider mb-1">Eligible Branches</p>
                            <p className="text-[14.5px] text-[#222] font-medium">{selectedRole.eligibility.branches?.join(", ") || "Any engineering branch"}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Skills Section */}
                    {selectedRole.skills?.must_have?.length > 0 && (
                      <div>
                        <h3 className="flex items-center gap-2 font-bold text-[16px] text-[#111] mb-3">
                          <Code2 className="w-5 h-5 text-[var(--color-du-gold)]" /> 
                          Required Skills Matrix
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedRole.skills.must_have.map((skill: string, idx: number) => (
                            <span key={`must-${idx}`} className="bg-[#ffffff] border border-[#dcdcdc] shadow-sm px-3.5 py-1.5 rounded-lg text-[13px] font-semibold text-[#111]">
                              {skill}
                            </span>
                          ))}
                          {selectedRole.skills.good_to_have?.map((skill: string, idx: number) => (
                            <span key={`good-${idx}`} className="bg-[#f0f0f0] border border-transparent px-3.5 py-1.5 rounded-lg text-[13px] font-medium text-[#555]">
                              + {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Selection Process Section */}
                    {selectedRole.selection_process?.length > 0 && (
                      <div className="pt-2">
                        <h3 className="flex items-center gap-2 font-bold text-[16px] text-[#111] mb-5">
                          <ClipboardList className="w-5 h-5 text-[var(--color-du-purple)]" /> 
                          Selection Process
                        </h3>
                        <div className="space-y-5 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#e5e5e5] before:to-transparent">
                          {selectedRole.selection_process.map((step: string, idx: number) => (
                            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-[var(--color-du-purple)] text-white text-[11px] font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                {idx + 1}
                              </div>
                              <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] bg-white p-4 rounded-xl border border-[#ececec] shadow-sm">
                                <p className="text-[14px] font-medium text-[#222]">
                                  {step}
                                </p>
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
