import VoiceAgent from "../components/VoiceAgent";
import { ArrowLeft, Mic, Shield, History } from "lucide-react";
import Link from "next/link";

export default function VoiceChatPage() {
    return (
        <main className="min-h-screen relative flex flex-col items-center p-6 md:p-12 overflow-hidden premium-bg">
            {/* Dynamic Animated Background */}
            <div className="fixed inset-0 -z-10 bg-slate-50">
                <div className="animated-blob top-[-10%] right-[-10%] bg-blue-400 opacity-5" />
                <div className="animated-blob bottom-[-10%] left-[-10%] bg-indigo-400 opacity-5" style={{ animationDelay: '5s' }} />
            </div>

            {/* Header / Nav */}
            <header className="w-full max-w-7xl flex justify-between items-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                <Link
                    href="/"
                    className="group flex items-center gap-3 px-5 py-2.5 rounded-2xl glass border border-white hover:bg-white/80 transition-all active:scale-95"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold tracking-tight text-slate-700">Back to Home</span>
                </Link>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-100 shadow-sm">
                        <Shield size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Secure Channel</span>
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-slate-200">
                        {/* Profile dummy */}
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600" />
                    </div>
                </div>
            </header>

            {/* Main UI Container */}
            <section className="w-full max-w-6xl flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-1000">
                <VoiceAgent />
            </section>

            {/* Quick Tips / Status */}
            <footer className="mt-12 flex flex-wrap justify-center gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="flex items-center gap-3 text-slate-400">
                    <Mic size={16} />
                    <span className="text-xs font-medium">Automatic Voice Detection</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                    <History size={16} />
                    <span className="text-xs font-medium">Session History Persistence</span>
                </div>
            </footer>
        </main>
    );
}
