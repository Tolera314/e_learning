"use client";

import { 
  Search, 
  HelpCircle, 
  PlayCircle, 
  MessageCircle, 
  Mail, 
  ChevronRight,
  ShieldAlert,
  BookOpen,
  Plus,
  Clock,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import SlidePanel from "@/components/SlidePanel";
import api from "@/lib/api";

const FAQS = [
  { q: "Can I learn on my mobile phone?", a: "Yes! Ethio-Digital-Academy is fully mobile-responsive. We recommend using a modern browser on Android or iOS." },
  { q: "Which payment methods do you support?", a: "We support Telebirr, CBE Birr, and standard bank transfers within Ethiopia for course purchases and subscriptions." },
  { q: "How do I access my live class?", a: "Navigate to the 'Live Classes' page from your dashboard. A 'Join Now' button will appear 5 minutes before the scheduled start time." },
  { q: "Can I download lessons for offline viewing?", a: "Some course resources like PDFs and slides are downloadable, but video files remain on the platform to protect copyright." },
];

const HELP_CATEGORIES = [
  { title: "Getting Started", icon: PlayCircle, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20", items: ["How to enroll in a course", "Using the mobile app", "Taking your first quiz"] },
  { title: "Learning Guide", icon: BookOpen, color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20", items: ["Joining live classes", "Downloading resources", "Contacting your instructor"] },
  { title: "Account & Billing", icon: ShieldAlert, color: "text-amber-500 bg-amber-50 dark:bg-amber-900/20", items: ["Managing your plan", "Telebirr payment guide", "Certificate verification"] },
];

export default function StudentSupport() {
  const [isTicketPanelOpen, setIsTicketPanelOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [ticketForm, setTicketForm] = useState({ subject: "", category: "technical", description: "" });
  const [submitted, setSubmitted] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  const fetchTickets = async () => {
    try {
      const { data } = await api.get("/student/support/tickets");
      setTickets(data);
    } catch (e) {
      console.error("Failed to fetch tickets:", e);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmitTicket = async () => {
    if (!ticketForm.subject || !ticketForm.description) return alert("Please fill all fields.");
    try {
      await api.post("/student/support/ticket", ticketForm);
      setSubmitted(true);
      fetchTickets(); // Refresh the list
      setTimeout(() => {
        setIsTicketPanelOpen(false);
        setSubmitted(false);
        setTicketForm({ subject: "", category: "technical", description: "" });
      }, 1500);
    } catch (e) {
      alert("Failed to submit ticket.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-14">
      {/* HEADER */}
      <header className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white font-outfit mb-4">How can we help you learn?</h1>
        <p className="text-gray-500 max-w-xl mx-auto">Search our knowledge base or reach out to our student success team.</p>
        <div className="max-w-2xl mx-auto relative mt-8">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search guides, tutorials, or FAQs..." className="w-full pl-14 pr-6 py-4 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-lg outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white" />
        </div>
      </header>

      {/* FAQ */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"><HelpCircle size={20} className="text-emerald-500" /> Frequently Asked Questions</h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                <span className="font-bold text-gray-900 dark:text-white">{faq.q}</span>
                <ChevronRight size={16} className={`text-gray-400 transition-transform shrink-0 ${openFaq === i ? 'rotate-90' : ''}`} />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-50 dark:border-gray-800 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {HELP_CATEGORIES.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <div key={i} className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-5 ${cat.color}`}>
                <Icon size={18} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">{cat.title}</h3>
              <ul className="space-y-3">
                {cat.items.map((item, j) => (
                  <li key={j}>
                    <a href="#" className="flex items-center justify-between text-sm text-gray-500 hover:text-emerald-600 font-medium group transition-colors">
                      {item} <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* CONTACT / TICKETS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-emerald-600 p-8 rounded-3xl text-white shadow-xl shadow-emerald-500/20">
          <MessageCircle size={32} className="mb-4 text-emerald-200" />
          <h3 className="text-2xl font-bold mb-2 font-outfit">Can't find your answer?</h3>
          <p className="text-emerald-100 text-sm mb-8 leading-relaxed">Our support team is here to assist you with any technical or account issues. Reach out to us directly!</p>
          <button onClick={() => setIsTicketPanelOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 rounded-xl font-bold hover:bg-emerald-50 transition-colors">
            <Plus size={16} /> Open Support Ticket
          </button>
        </div>

        <div className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Clock size={18} className="text-blue-500" /> Recent Tickets</h3>
          <div className="space-y-3">
            {loadingTickets ? (
              <div className="flex flex-col items-center justify-center py-10 opacity-50">
                <Loader2 size={24} className="animate-spin mb-2" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Updating tickets...</p>
              </div>
            ) : tickets.length === 0 ? (
               <div className="text-center py-10 border-2 border-dashed border-gray-50 dark:border-gray-800 rounded-2xl">
                  <Mail className="mx-auto text-gray-200 mb-3" size={32} />
                  <p className="text-xs text-gray-400 font-bold">No support tickets found.</p>
               </div>
            ) : (
              tickets.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{t.subject}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{t.id.slice(0, 8)} · {t.date}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-1 rounded-lg uppercase tracking-widest ${t.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20'}`}>
                    {t.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* TICKET SLIDE PANEL */}
      <SlidePanel isOpen={isTicketPanelOpen} onClose={() => setIsTicketPanelOpen(false)} title="Submit a Ticket">
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
              <Mail size={32} className="text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ticket Submitted!</h3>
            <p className="text-gray-500 text-sm">Our support team will respond within 24 hours.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Issue Summary *</label>
              <input type="text" value={ticketForm.subject} onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })} placeholder="Brief description of the problem" className="w-full p-4 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <select value={ticketForm.category} onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })} className="w-full p-4 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500">
                {["technical", "payments", "course-content", "account", "other"].map(c => <option key={c} value={c} className="capitalize">{c.replace("-", " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description *</label>
              <textarea rows={6} value={ticketForm.description} onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })} placeholder="Describe the issue in detail..." className="w-full p-4 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white resize-none" />
            </div>
            <button onClick={handleSubmitTicket} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-colors">
              Submit Ticket
            </button>
          </div>
        )}
      </SlidePanel>
    </div>
  );
}
