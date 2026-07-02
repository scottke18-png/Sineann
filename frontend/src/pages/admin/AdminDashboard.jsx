import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ASSETS } from "@/lib/assets";
import WinesManager from "@/pages/admin/WinesManager";
import PostsManager from "@/pages/admin/PostsManager";
import PagesManager from "@/pages/admin/PagesManager";
import SubmissionsManager from "@/pages/admin/SubmissionsManager";
import NewsletterManager from "@/pages/admin/NewsletterManager";
import MediaManager from "@/pages/admin/MediaManager";
import { Wine, Newspaper, FileText, Inbox, Mail, Image, LogOut, ExternalLink } from "lucide-react";

const TABS = [
  { key: "wines", label: "Wines", icon: Wine, C: WinesManager },
  { key: "posts", label: "News", icon: Newspaper, C: PostsManager },
  { key: "pages", label: "Page Content", icon: FileText, C: PagesManager },
  { key: "submissions", label: "Inquiries", icon: Inbox, C: SubmissionsManager },
  { key: "newsletter", label: "Newsletter", icon: Mail, C: NewsletterManager },
  { key: "media", label: "Media", icon: Image, C: MediaManager },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState("wines");
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const Active = TABS.find((t) => t.key === tab).C;

  const doLogout = () => { logout(); nav("/admin/login"); };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F0] flex flex-col lg:flex-row" data-testid="admin-dashboard">
      <aside className="lg:w-64 lg:min-h-screen border-b lg:border-b-0 lg:border-r border-white/10 bg-[#0d0d0d] flex flex-col">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <img src={ASSETS.logo} alt="Sineann" className="h-9 w-9 object-contain" />
          <div>
            <p className="font-heading text-lg tracking-[0.2em]">SINEANN</p>
            <p className="text-[#6b6560] text-[0.6rem] tracking-[0.16em] uppercase">Content Studio</p>
          </div>
        </div>
        <nav className="flex lg:flex-col p-3 gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              data-testid={`admin-tab-${t.key}`}
              className={`flex items-center gap-3 px-4 py-3 text-sm whitespace-nowrap transition-colors ${tab === t.key ? "bg-wine text-[#F5F5F0]" : "text-[#A8A39D] hover:text-[#F5F5F0] hover:bg-white/5"}`}
            >
              <t.icon size={17} /> {t.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto p-4 border-t border-white/10 hidden lg:block">
          <p className="text-secondary text-xs mb-3 truncate">{user?.email}</p>
          <Link to="/" target="_blank" className="flex items-center gap-2 text-[#A8A39D] hover:text-[#F5F5F0] text-xs mb-3"><ExternalLink size={14} /> View Site</Link>
          <button onClick={doLogout} className="flex items-center gap-2 text-[#A8A39D] hover:text-red-400 text-xs" data-testid="admin-logout"><LogOut size={14} /> Sign Out</button>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-10 max-w-[1200px]">
        <div className="lg:hidden flex justify-end mb-4">
          <button onClick={doLogout} className="text-[#A8A39D] hover:text-red-400 text-xs flex items-center gap-1"><LogOut size={14} /> Sign Out</button>
        </div>
        <Active />
      </main>
    </div>
  );
}
