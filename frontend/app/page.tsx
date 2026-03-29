import Link from "next/link";
import { Calendar, Shield, ArrowRight, Sparkles, MessageSquare } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden premium-bg">
      {/* Dynamic Animated Background */}
      <div className="fixed inset-0 -z-10 bg-slate-50">
        <div className="animated-blob top-[-10%] left-[-10%] bg-blue-400" />
        <div className="animated-blob bottom-[-10%] right-[-10%] bg-indigo-400" style={{ animationDelay: '5s' }} />
        <div className="animated-blob top-[40%] right-[20%] bg-purple-400 w-[300px] h-[300px]" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-5xl relative z-10 flex flex-col items-center text-center gap-12">
        {/* Hero Content */}
        <div className="flex flex-col items-center gap-10 max-w-3xl">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* <div className="flex -space-x-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-slate-200" />
              ))}
            </div> */}
            {/* <span className="text-[11px] uppercase font-bold tracking-[0.15em] text-slate-600">Join 1,000+ businesses automating bookings</span> */}
          </div>

          <div className="space-y-8">
            <h1 className="text-7xl md:text-9xl font-black tracking-tight text-slate-900 leading-[0.85] animate-in fade-in slide-in-from-bottom-8 duration-700">
              Voice <br />
              <span className="gradient-text">Receptionist</span> <br />
              v1.0
            </h1>

            <p className="text-slate-500 text-xl md:text-2xl font-medium leading-relaxed max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000">
              The world's most human-like AI agent for seamless appointment management.
              Talk naturally, book instantly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-center animate-in fade-in slide-in-from-bottom-16 duration-1000">
            <Link
              href="/voice"
              className="px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg tracking-tight flex items-center gap-3 btn-premium shadow-2xl shadow-slate-300 hover:scale-105 transition-all"
            >
              Start Conversation <MessageSquare size={22} />
            </Link>
            <div className="flex items-center gap-2 text-slate-400 font-bold text-sm tracking-widest">
              <Sparkles size={16} className="text-yellow-500" />
              FREE BETA ACCESS
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl animate-in fade-in zoom-in-95 duration-1000">
          <div className="glass-card rounded-[2.5rem] p-8 flex items-start gap-6 text-left group hover:-translate-y-2 transition-all duration-500">
            <div className="w-14 h-14 shrink-0 rounded-[1.5rem] bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Calendar size={28} />
            </div>
            <div className="space-y-2">
              <h4 className="text-slate-900 font-black text-xl tracking-tight">Real-time Sync</h4>
              <p className="text-slate-500 leading-relaxed font-medium">Automatically detects availability and manages your calendar without human intervention.</p>
            </div>
          </div>

          <div className="glass-card rounded-[2.5rem] p-8 flex items-start gap-6 text-left group hover:-translate-y-2 transition-all duration-500">
            <div className="w-14 h-14 shrink-0 rounded-[1.5rem] bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Shield size={28} />
            </div>
            <div className="space-y-2">
              <h4 className="text-slate-900 font-black text-xl tracking-tight">Privacy First</h4>
              <p className="text-slate-500 leading-relaxed font-medium">Enterprise-grade security for every voice interaction and user data point.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="fixed bottom-10 flex items-center gap-4">
        <div className="flex items-center gap-2 px-6 py-2 rounded-full glass border border-white shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-400">AutoBook System Active</span>
        </div>
      </footer>
    </main>
  );
}


